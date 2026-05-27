import Avatar from "../../components/chat/Avatar";

const formatElapsed = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
};

const ctlBtnStyle = {
  width: 50,
  height: 50,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.15s, background 0.15s, border-color 0.15s",
  flexShrink: 0,
};

export default function ChatCallOverlay({
  rtc,
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  callPeerName,
  callPeerContact,
  callDurationSeconds,
  isIncomingVideo,
  isActiveVideoSession,
}) {
  if (!rtc.incoming && !rtc.session) return null;

  const hasLocalStream = Boolean(rtc.localStream);
  const showVideoStage = isActiveVideoSession || (rtc.incoming && isIncomingVideo);
  const showVoicePanel =
    rtc.session?.callType === "voice" || (rtc.incoming && !isIncomingVideo);

  const showRemotePlaceholder =
    (rtc.incoming && isIncomingVideo) ||
    (!rtc.remoteStream &&
      rtc.session?.role === "caller" &&
      rtc.session?.phase === "ringing" &&
      rtc.session?.callType === "video");

  const showMediaControls = hasLocalStream && !rtc.incoming;
  const showCameraToggle =
    showMediaControls && (rtc.session?.callType === "video" || rtc.localStream?.getVideoTracks?.()?.length > 0);

  return (
    <div
      className="call-overlay-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(10px)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(960px, 100%)",
          maxHeight: "min(88vh, 720px)",
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(160deg,#1e293b 0%, #0f172a 55%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {showVideoStage ? (
          <div
            style={{
              flex: 1,
              minHeight: 240,
              position: "relative",
              background: "#020617",
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                minHeight: 280,
                objectFit: "cover",
                background: "#020617",
                display: "block",
              }}
            />

            {showRemotePlaceholder ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e2e8f0",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  background: "rgba(15,23,42,0.55)",
                  pointerEvents: "none",
                }}
              >
                {rtc.incoming ? "Incoming video call" : "Ringing…"}
              </div>
            ) : null}

            {!rtc.incoming ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 100,
                  width: 140,
                  height: 186,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "2px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
                  background: "#0f172a",
                  zIndex: 12,
                }}
              />
            ) : null}
          </div>
        ) : null}

        {showVoicePanel ? (
          <div
            style={{
              flex: showVideoStage ? "0 1 auto" : 1,
              padding: rtc.incoming ? "3rem 1.5rem 1.75rem" : "2rem 1.5rem 1rem",
              textAlign: "center",
              color: "#e2e8f0",
            }}
          >
            <Avatar name={callPeerName || "Peer"} size={88} src={callPeerContact?.avatar} online />
            <p style={{ marginTop: "0.75rem", fontSize: "1.05rem", fontWeight: 700 }}>
              {callPeerName}
            </p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "#94a3b8" }}>
              {rtc.incoming
                ? `Incoming ${rtc.incoming.callType === "audio" ? "voice" : "video"} call`
                : rtc.session?.callType === "voice"
                  ? "Voice call in progress"
                  : null}
            </p>
            <audio ref={remoteAudioRef} autoPlay playsInline style={{ width: 0, height: 0, opacity: 0 }} />
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            alignItems: "center",
            padding: "14px 16px 18px",
            borderTop:
              showVideoStage || (rtc.incoming && isIncomingVideo)
                ? "1px solid rgba(148,163,184,0.14)"
                : "none",
            background: "rgba(15,23,42,0.35)",
          }}
        >
          {rtc.incoming ? (
            <>
              <button
                type="button"
                onClick={() => rtc.acceptIncoming()}
                style={{
                  padding: "0.65rem 1.35rem",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  background: "linear-gradient(135deg,#22c55e,#15803d)",
                  color: "#fff",
                }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => rtc.declineIncoming()}
                style={{
                  padding: "0.65rem 1.35rem",
                  borderRadius: 999,
                  border: "1px solid rgba(248,113,113,0.5)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  background: "transparent",
                  color: "#fca5a5",
                }}
              >
                Decline
              </button>
            </>
          ) : (
            <>
              <span
                style={{
                  color: "#94a3b8",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  marginRight: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatElapsed(callDurationSeconds)}
              </span>

              {showMediaControls ? (
                <>
                  <button
                    type="button"
                    title={rtc.micEnabled ? "Mute microphone" : "Unmute microphone"}
                    onClick={() => rtc.toggleMicMuted()}
                    style={{
                      ...ctlBtnStyle,
                      background: rtc.micEnabled ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.35)",
                      borderColor: rtc.micEnabled ? "rgba(255,255,255,0.15)" : "rgba(252,165,165,0.5)",
                      color: "#f8fafc",
                    }}
                  >
                    {rtc.micEnabled ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="2" y1="2" x2="22" y2="22" />
                        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-5-2.2" />
                        <path d="M12 18v4M8 22h8" />
                        <path d="M16 10v1a4 4 0 0 1-5.2 3.8" />
                      </svg>
                    )}
                  </button>

                  {showCameraToggle ? (
                    <button
                      type="button"
                      title={rtc.cameraEnabled ? "Turn camera off" : "Turn camera on"}
                      onClick={() => rtc.toggleCameraEnabled()}
                      style={{
                        ...ctlBtnStyle,
                        background: rtc.cameraEnabled ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.35)",
                        borderColor: rtc.cameraEnabled ? "rgba(255,255,255,0.15)" : "rgba(252,165,165,0.5)",
                        color: "#f8fafc",
                      }}
                    >
                      {rtc.cameraEnabled ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14" />
                          <path d="M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 6l21 21" />
                          <path d="M3.6 9H9a4 4 0 0 1 4 4v8" />
                          <path d="M15 10l4.6-2.1A1 1 0 0 1 21 8.87v6.26" />
                        </svg>
                      )}
                    </button>
                  ) : null}
                </>
              ) : null}

              <button
                type="button"
                onClick={() => rtc.hangUp()}
                style={{
                  padding: "0.65rem 1.45rem",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(220,38,38,0.35)",
                }}
              >
                End call
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
