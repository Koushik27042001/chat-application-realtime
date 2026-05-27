import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const stopTracks = (stream) => {
  stream?.getTracks?.().forEach((t) => t.stop());
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

  const [incoming, setIncoming] = useState(null);
  /** @type {{ peerId: string, callType: 'video'|'voice', phase: string, role: string, startedAt: string } | null} */
  const [session, setSession] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [banner, setBanner] = useState(null);

  const setLocalMedia = useCallback((stream) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
  }, []);

  const teardown = useCallback(() => {
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
      : { audio: true, video: { facingMode: "user" } };
    return navigator.mediaDevices.getUserMedia(constraints);
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
          msg: e?.message || "Microphone/camera permission denied.",
        });
        peerIdRef.current = null;
        return;
      }
      setLocalMedia(stream);

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
      } catch (e) {
        setBanner({ type: "error", msg: e?.message || "Could not start call." });
        teardown();
      }
    },
    [socket, localId, acquireMedia, createPc, setLocalMedia, teardown]
  );

  const declineIncoming = useCallback(() => {
    if (!socket || !incoming || !localId) {
      setIncoming(null);
      return;
    }
    socket.emit("call:decline", { to: incoming.from, from: localId });
    setIncoming(null);
  }, [socket, incoming, localId]);

  const acceptIncoming = useCallback(async () => {
    if (!socket || !incoming || !localId) return;
    const { from, offer, callType } = incoming;
    const voice = callType === "audio";
    const sessionType = voice ? "voice" : "video";

    setIncoming(null);

    teardown();
    peerIdRef.current = String(from);
    let stream;
    try {
      stream = await acquireMedia(sessionType);
    } catch (e) {
      setBanner({
        type: "error",
        msg: e?.message || "Microphone/camera permission denied.",
      });
      socket.emit("call:decline", { to: from, from: localId });
      peerIdRef.current = null;
      return;
    }
    setLocalMedia(stream);

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
    },
    [session, incoming, socket, localId]
  );

  const onCallAccepted = useCallback(
    async ({ from, answer }) => {
      const pc = pcRef.current;
      if (!pc || String(from) !== peerIdRef.current) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushIceQueue();
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
    [flushIceQueue, hangUp]
  );

  const onCallDeclined = useCallback(
    ({ from }) => {
      if (peerIdRef.current && String(from) === String(peerIdRef.current)) {
        setBanner({ type: "notice", msg: "Call declined." });
        teardown();
      }
    },
    [teardown]
  );

  const onCallEnded = useCallback(
    ({ from }) => {
      const pid = peerIdRef.current ?? session?.peerId;
      if (pid != null && String(from) === String(pid)) {
        teardown();
      }
    },
    [session?.peerId, teardown]
  );

  const onCallIce = useCallback(
    async ({ from, candidate }) => {
      if (!candidate || String(from) !== peerIdRef.current) return;
      const pc = pcRef.current;
      if (!pc?.remoteDescription) {
        iceQueueRef.current.push(candidate);
        return;
      }
      await safeAddIce(candidate);
    },
    [safeAddIce]
  );

  const onCallBusy = useCallback(
    ({ from }) => {
      if (peerIdRef.current && String(from) === String(peerIdRef.current)) {
        setBanner({ type: "notice", msg: "User is busy." });
        teardown();
      }
    },
    [teardown]
  );

  const onCallUnavailable = useCallback(() => {
    setBanner({ type: "notice", msg: "User is offline." });
    teardown();
  }, [teardown]);

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
    toggleVideoCall,
    toggleVoiceCall,
  };
}
