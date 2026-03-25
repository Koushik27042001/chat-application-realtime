import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { SOCKET_URL } from "../services/api";

let socket;

const useSocket = ({ userId, onMessage } = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return undefined;
    }

    hasAttemptedRef.current = true;

    try {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        setIsConnected(true);
        if (userId) {
          socket.emit("join", userId);
        }
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });

      socket.on("receive-message", (message) => {
        if (onMessage) {
          onMessage(message);
        }
      });

      socket.on("online-users", (users) => {
        setOnlineUsers(Array.isArray(users) ? users : []);
      });
    } catch (error) {
      setIsConnected(false);
    }

    return () => {
      if (socket) {
        socket.off("online-users");
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("join", userId);
    }
  }, [userId]);

  return { socket, isConnected, onlineUsers };
};

export default useSocket;
