import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const RAIN_MOUNT_ID = "chat-rain-root";

/**
 * Full-viewport animated backdrop (rain + floating orbs) in #chat-rain-root.
 * Mouse position drives subtle parallax via CSS vars --mx / --my.
 */
export default function ChatPageRain() {
  const [mount, setMount] = useState(null);

  useEffect(() => {
    setMount(document.getElementById(RAIN_MOUNT_ID));
  }, []);

  useEffect(() => {
    if (!mount) return undefined;

    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      mount.style.setProperty("--mx", `${x}%`);
      mount.style.setProperty("--my", `${y}%`);
    };

    mount.style.setProperty("--mx", "50%");
    mount.style.setProperty("--my", "40%");
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mount]);

  if (!mount) {
    return null;
  }

  return createPortal(
    <div className="chat-page-rain" aria-hidden="true">
      <div className="chat-page-rain__orb chat-page-rain__orb--1" />
      <div className="chat-page-rain__orb chat-page-rain__orb--2" />
      <div className="chat-page-rain__orb chat-page-rain__orb--3" />
      <div className="chat-page-rain__orb chat-page-rain__orb--4" />
      <div className="chat-page-rain__streaks" />
      <div className="chat-page-rain__streaks chat-page-rain__streaks--alt" />
      <div className="chat-page-rain__sparkle-field" />
    </div>,
    mount
  );
}
