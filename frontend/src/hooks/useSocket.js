import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { SOCKET_URL } from "../services/api";

let socket;

const useSocket = ({
  userId,
  onMessage,
  onNotification,
  onTyping,
  onStopTyping,
  onConversationRead,
} = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const hasAttemptedRef = useRef(false);
  const handlersRef = useRef({
    onMessage,
    onNotification,
    onTyping,
    onStopTyping,
    onConversationRead,
  });

  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onNotification,
      onTyping,
      onStopTyping,
      onConversationRead,
    };
  }, [onMessage, onNotification, onTyping, onStopTyping, onConversationRead]);

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return undefined;
    }

    hasAttemptedRef.current = true;

    try {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        timeout: 20000,
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

      socket.on("reconnect", () => {
        setIsConnected(true);
        if (userId) {
          socket.emit("join", userId);
        }
      });

      socket.on("receive-message", (message) => {
        handlersRef.current.onMessage?.(message);
      });

      socket.on("notification", (payload) => {
        handlersRef.current.onNotification?.(payload);
      });

      socket.on("typing", (payload) => {
        handlersRef.current.onTyping?.(payload);
      });

      socket.on("stop-typing", (payload) => {
        handlersRef.current.onStopTyping?.(payload);
      });

      socket.on("conversation-read", (payload) => {
        handlersRef.current.onConversationRead?.(payload);
      });

      socket.on("online-users", (users) => {
        setOnlineUsers(Array.isArray(users) ? users : []);
      });
    } catch (_error) {
      setIsConnected(false);
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("reconnect");
        socket.off("receive-message");
        socket.off("notification");
        socket.off("typing");
        socket.off("stop-typing");
        socket.off("conversation-read");
        socket.off("online-users");
        socket.disconnect();
        socket = undefined;
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
