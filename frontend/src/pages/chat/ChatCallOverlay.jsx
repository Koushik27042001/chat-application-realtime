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
        {(isActiveVideoSession || (rtc.incoming && isIncomingVideo)) && (
          <div
            style={{
              flex: 1,
              minHeight: 220,
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
              }}
            />
            {!rtc.incoming && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 76,
                  width: 132,
                  height: 176,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: "2px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
                  background: "#0f172a",
                }}
              />
            )}
            {(rtc.incoming && isIncomingVideo) ||
            (!rtc.remoteStream &&
              rtc.session?.role === "caller" &&
              rtc.session?.phase === "ringing") ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  background: "rgba(15,23,42,0.42)",
                }}
              >
                {rtc.incoming ? "Incoming video call" : "Ringing…"}
              </div>
            ) : null}
          </div>
        )}

        {(rtc.session?.callType === "voice" || (rtc.incoming && !isIncomingVideo)) && (
          <div
            style={{
              flex: "0 1 auto",
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
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
            padding: "12px 16px 16px",
            borderTop:
              isActiveVideoSession || (rtc.incoming && isIncomingVideo)
                ? "1px solid rgba(148,163,184,0.14)"
                : "none",
          }}
        >
          {rtc.incoming ? (
            <>
              <button
                type="button"
                onClick={() => rtc.acceptIncoming()}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
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
                  padding: "0.6rem 1.25rem",
                  borderRadius: 999,
                  border: "1px solid rgba(248,113,113,0.5)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  background: "transparent",
                  color: "#fca5a5",
                }}
              >
                Decline
              </button>
            </>
          ) : (
            <>
              <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.8rem", marginRight: 6 }}>
                {formatElapsed(callDurationSeconds)}
              </span>
              <button
                type="button"
                onClick={() => rtc.hangUp()}
                style={{
                  padding: "0.6rem 1.35rem",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                  color: "#fff",
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
