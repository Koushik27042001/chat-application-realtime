import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const RAIN_MOUNT_ID = "chat-rain-root";

/**
 * Full-viewport rain layer rendered into #chat-rain-root (below #root in index.html).
 * Styles: chatPageStyles → #chat-rain-root .chat-page-rain
 */
export default function ChatPageRain() {
  const [mount, setMount] = useState(null);

  useEffect(() => {
    setMount(document.getElementById(RAIN_MOUNT_ID));
  }, []);

  if (!mount) {
    return null;
  }

  return createPortal(<div className="chat-page-rain" aria-hidden="true" />, mount);
}
