import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let socket;

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return undefined;
    }

    hasAttemptedRef.current = true;

    try {
      socket = io("http://localhost:5000", {
        autoConnect: true,
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("Connected:", socket.id);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });
    } catch (error) {
      setIsConnected(false);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
};

export default useSocket;
