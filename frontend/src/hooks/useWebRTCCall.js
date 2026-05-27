import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const stopTracks = (stream) => {
  stream?.getTracks?.().forEach((t) => t.stop());
};

const formatGetUserMediaErrorMessage = (e) => {
  const name = e?.name || "";
  let msg = e?.message || "Microphone/camera permission denied.";
  if (
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "")
  ) {
    msg =
      "Camera/mic need a secure origin. Use https:// or open via http://localhost (not a raw LAN IP over HTTP).";
  } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    msg = "No camera or microphone was found. Check device settings.";
  } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    msg = "Permission blocked — allow camera/mic for this site in the browser.";
  }
  return msg;
};

/**
 * Minimal WebRTC 1:1 calls over Socket.io signaling (see backend/socket/socket.js).
 */
export default function useWebRTCCall(socket, localUserId) {
  const localId = localUserId != null ? String(localUserId) : "";
  const peerIdRef = useRef(null);
  const pcRef = useRef(null);
  const iceQueueRef = useRef([]);
  const localStreamRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const ringAudioCtxRef = useRef(null);

  const [incoming, setIncoming] = useState(null);
  /** @type {{ peerId: string, callType: 'video'|'voice', phase: string, role: string, startedAt: string } | null} */
  const [session, setSession] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [banner, setBanner] = useState(null);
  /** Mirrors actual MediaStreamTrack.enabled for in-call toolbar */
  const [micEnabledUi, setMicEnabledUi] = useState(true);
  const [cameraEnabledUi, setCameraEnabledUi] = useState(true);

  const setLocalMedia = useCallback((stream) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
  }, []);

  const stopRinging = useCallback(() => {
    if (ringIntervalRef.current) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (ringAudioCtxRef.current) {
      ringAudioCtxRef.current.close().catch(() => {});
      ringAudioCtxRef.current = null;
    }
  }, []);

  const ringBeep = useCallback((frequency = 790, durationMs = 190) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!ringAudioCtxRef.current || ringAudioCtxRef.current.state === "closed") {
      ringAudioCtxRef.current = new Ctx();
    }
    const ctx = ringAudioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  }, []);

  const startRinging = useCallback(
    (mode = "outgoing") => {
      stopRinging();
      if (mode === "incoming") {
        ringBeep(910, 240);
        ringIntervalRef.current = window.setInterval(() => ringBeep(910, 240), 900);
        return;
      }
      ringBeep(690, 170);
      ringIntervalRef.current = window.setInterval(() => {
        ringBeep(690, 170);
        window.setTimeout(() => ringBeep(760, 170), 260);
      }, 1700);
    },
    [ringBeep, stopRinging]
  );

  const teardown = useCallback(() => {
    stopRinging();
    stopTracks(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStream(null);
    pcRef.current?.close();
    pcRef.current = null;
    peerIdRef.current = null;
    iceQueueRef.current = [];
    setIncoming(null);
    setSession(null);
    setRemoteStream(null);
    setMicEnabledUi(true);
    setCameraEnabledUi(true);
  }, [stopRinging]);

  const syncMediaUiFromStream = useCallback((stream) => {
    const a = stream?.getAudioTracks?.()?.[0];
    const v = stream?.getVideoTracks?.()?.[0];
    setMicEnabledUi(a ? a.enabled : true);
    setCameraEnabledUi(v ? v.enabled : true);
  }, []);

  const safeAddIce = useCallback(async (candidate) => {
    const pc = pcRef.current;
    if (!pc || !candidate) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      /* ignore */
    }
  }, []);

  const flushIceQueue = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc?.remoteDescription) return;
    const queue = iceQueueRef.current;
    iceQueueRef.current = [];
    for (const c of queue) {
      await safeAddIce(c);
    }
  }, [safeAddIce]);

  const createPc = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;
    pc.onicecandidate = (ev) => {
      const cand = ev.candidate;
      const to = peerIdRef.current;
      if (cand && socket && to && localId) {
        socket.emit("call:ice", { to, from: localId, candidate: cand.toJSON() });
      }
    };
    pc.ontrack = (ev) => {
      const stream = ev.streams?.[0] || new MediaStream([ev.track]);
      setRemoteStream(stream);
    };
    return pc;
  }, [socket, localId]);

  const acquireMedia = useCallback(async (kind) => {
    const audioOnly = kind === "voice" || kind === "audio";
    const constraints = audioOnly
      ? { audio: true, video: false }
      : {
          audio: true,
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e1) {
      if (audioOnly) throw e1;
      return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    }
  }, []);

  const toggleMicMuted = useCallback(() => {
    const stream = localStreamRef.current;
    const track = stream?.getAudioTracks?.()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabledUi(track.enabled);
  }, []);

  const toggleCameraEnabled = useCallback(() => {
    const stream = localStreamRef.current;
    const track = stream?.getVideoTracks?.()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraEnabledUi(track.enabled);
  }, []);

  const hangUp = useCallback(() => {
    const peer =
      peerIdRef.current ||
      session?.peerId ||
      (incoming?.from != null ? String(incoming.from) : null);
    if (socket && localId && peer) {
      socket.emit("call:hangup", { to: String(peer), from: localId });
    }
    teardown();
  }, [socket, localId, session?.peerId, incoming?.from, teardown]);

  const startOutbound = useCallback(
    async (peerId, kind) => {
      if (!socket || !localId || !peerId) {
        setBanner({ type: "error", msg: "Not connected — sign in and wait for Live." });
        return;
      }
      const peer = String(peerId);
      const callType = kind === "voice" ? "voice" : "video";

      teardown();
      peerIdRef.current = peer;
      let stream;
      try {
        stream = await acquireMedia(callType);
      } catch (e) {
        setBanner({
          type: "error",
          msg: formatGetUserMediaErrorMessage(e),
        });
        peerIdRef.current = null;
        return;
      }
      setLocalMedia(stream);
      syncMediaUiFromStream(stream);

      const pc = createPc();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:offer", {
          to: peer,
          from: localId,
          offer: pc.localDescription.toJSON(),
          callType: callType === "voice" ? "audio" : "video",
        });
        const startedAt = new Date().toISOString();
        setSession({
          peerId: peer,
          callType,
          role: "caller",
          phase: "ringing",
          startedAt,
        });
        startRinging("outgoing");
      } catch (e) {
        setBanner({ type: "error", msg: e?.message || "Could not start call." });
        teardown();
      }
    },
    [
      socket,
      localId,
      acquireMedia,
      createPc,
      setLocalMedia,
      teardown,
      syncMediaUiFromStream,
      startRinging,
    ]
  );

  const declineIncoming = useCallback(() => {
    if (!socket || !incoming || !localId) {
      setIncoming(null);
      return;
    }
    socket.emit("call:decline", { to: incoming.from, from: localId });
    stopRinging();
    setIncoming(null);
  }, [socket, incoming, localId, stopRinging]);

  const acceptIncoming = useCallback(async () => {
    if (!socket || !incoming || !localId) return;
    const { from, offer, callType } = incoming;
    const voice = callType === "audio";
    const sessionType = voice ? "voice" : "video";

    stopRinging();
    setIncoming(null);

    teardown();
    peerIdRef.current = String(from);
    let stream;
    try {
      stream = await acquireMedia(sessionType);
    } catch (e) {
      setBanner({
        type: "error",
        msg: formatGetUserMediaErrorMessage(e),
      });
      socket.emit("call:decline", { to: from, from: localId });
      peerIdRef.current = null;
      return;
    }
    setLocalMedia(stream);
    syncMediaUiFromStream(stream);

    const pc = createPc();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushIceQueue();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", {
        to: from,
        from: localId,
        answer: pc.localDescription.toJSON(),
      });
      const startedAt = new Date().toISOString();
      setSession({
        peerId: String(from),
        callType: sessionType,
        role: "callee",
        phase: "active",
        startedAt,
      });
    } catch (e) {
      setBanner({ type: "error", msg: e?.message || "Could not answer call." });
      socket.emit("call:decline", { to: from, from: localId });
      teardown();
    }
  }, [
    socket,
    incoming,
    localId,
    acquireMedia,
    createPc,
    flushIceQueue,
    setLocalMedia,
    teardown,
    syncMediaUiFromStream,
    stopRinging,
  ]);

  const onCallIncoming = useCallback(
    (payload) => {
      if (!payload?.from || !payload?.offer) return;
      if (session || incoming) {
        socket?.emit("call:busy", { to: payload.from, from: localId });
        return;
      }
      setIncoming({
        from: String(payload.from),
        offer: payload.offer,
        callType: payload.callType || "video",
      });
      startRinging("incoming");
    },
    [session, incoming, socket, localId, startRinging]
  );

  const onCallAccepted = useCallback(
    async ({ from, answer }) => {
      const pc = pcRef.current;
      if (!pc || String(from) !== peerIdRef.current) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushIceQueue();
        stopRinging();
        setSession((prev) =>
          prev && prev.peerId === String(from)
            ? { ...prev, phase: "active" }
            : prev
        );
      } catch (e) {
        setBanner({ type: "error", msg: e?.message || "Connection failed." });
        hangUp();
      }
    },
    [flushIceQueue, hangUp, stopRinging]
  );

  const onCallDeclined = useCallback(
    ({ from }) => {
      if (peerIdRef.current && String(from) === String(peerIdRef.current)) {
        stopRinging();
        setBanner({ type: "notice", msg: "Call declined." });
        teardown();
      }
    },
    [teardown, stopRinging]
  );

  const onCallEnded = useCallback(
    ({ from }) => {
      const pid = peerIdRef.current ?? session?.peerId;
      if (pid != null && String(from) === String(pid)) {
        stopRinging();
        teardown();
      }
    },
    [session?.peerId, teardown, stopRinging]
  );

  const onCallIce = useCallback(
    async ({ from, candidate }) => {
      if (!candidate || !from) return;
      const fromId = String(from);
      const currentPeer = peerIdRef.current;
      if (currentPeer && fromId !== currentPeer) return;
      if (!currentPeer && incoming?.from && fromId !== String(incoming.from)) return;
      const pc = pcRef.current;
      if (!pc?.remoteDescription) {
        iceQueueRef.current.push(candidate);
        return;
      }
      await safeAddIce(candidate);
    },
    [safeAddIce, incoming?.from]
  );

  const onCallBusy = useCallback(
    ({ from }) => {
      if (peerIdRef.current && String(from) === String(peerIdRef.current)) {
        stopRinging();
        setBanner({ type: "notice", msg: "User is busy." });
        teardown();
      }
    },
    [teardown, stopRinging]
  );

  const onCallUnavailable = useCallback(() => {
    stopRinging();
    setBanner({ type: "notice", msg: "User is offline." });
    teardown();
  }, [teardown, stopRinging]);

  const toggleVideoCall = useCallback(
    (activeContactId) => {
      if (!activeContactId) return;
      const id = String(activeContactId);
      if (session?.peerId === id && session?.callType === "video") {
        hangUp();
        return;
      }
      if (session?.peerId === id && session?.callType === "voice") {
        hangUp();
        void startOutbound(id, "video");
        return;
      }
      if (session && session.peerId !== id) return;
      void startOutbound(id, "video");
    },
    [session, hangUp, startOutbound]
  );

  const toggleVoiceCall = useCallback(
    (activeContactId) => {
      if (!activeContactId) return;
      const id = String(activeContactId);
      if (session?.peerId === id && session?.callType === "voice") {
        hangUp();
        return;
      }
      if (session?.peerId === id && session?.callType === "video") {
        hangUp();
        void startOutbound(id, "voice");
        return;
      }
      if (session && session.peerId !== id) return;
      void startOutbound(id, "voice");
    },
    [session, hangUp, startOutbound]
  );

  useEffect(() => {
    if (!socket) return undefined;
    socket.on("call:incoming", onCallIncoming);
    socket.on("call:accepted", onCallAccepted);
    socket.on("call:declined", onCallDeclined);
    socket.on("call:ended", onCallEnded);
    socket.on("call:ice", onCallIce);
    socket.on("call:busy", onCallBusy);
    socket.on("call:unavailable", onCallUnavailable);
    return () => {
      socket.off("call:incoming", onCallIncoming);
      socket.off("call:accepted", onCallAccepted);
      socket.off("call:declined", onCallDeclined);
      socket.off("call:ended", onCallEnded);
      socket.off("call:ice", onCallIce);
      socket.off("call:busy", onCallBusy);
      socket.off("call:unavailable", onCallUnavailable);
    };
  }, [
    socket,
    onCallIncoming,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallIce,
    onCallBusy,
    onCallUnavailable,
  ]);

  useEffect(() => () => stopRinging(), [stopRinging]);

  return {
    incoming,
    session,
    localStream,
    remoteStream,
    banner,
    clearBanner: () => setBanner(null),
    startOutbound,
    acceptIncoming,
    declineIncoming,
    hangUp,
    toggleMicMuted,
    toggleCameraEnabled,
    micEnabled: micEnabledUi,
    cameraEnabled: cameraEnabledUi,
    toggleVideoCall,
    toggleVoiceCall,
  };
}
