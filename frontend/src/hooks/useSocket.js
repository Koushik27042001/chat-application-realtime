import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { SOCKET_URL } from "../services/api";

let socket;

const useSocket = ({
  userId,
  onMessage,
  onNotification,
  onCallIncoming,
  onCallAccepted,
  onCallDeclined,
  onCallEnded,
  onCallIce,
  onCallBusy,
  onCallUnavailable,
} = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const hasAttemptedRef = useRef(false);
  const handlersRef = useRef({
    onMessage,
    onNotification,
    onCallIncoming,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallIce,
    onCallBusy,
    onCallUnavailable,
  });

  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onNotification,
      onCallIncoming,
      onCallAccepted,
      onCallDeclined,
      onCallEnded,
      onCallIce,
      onCallBusy,
      onCallUnavailable,
    };
  }, [
    onMessage,
    onNotification,
    onCallIncoming,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onCallIce,
    onCallBusy,
    onCallUnavailable,
  ]);

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

      socket.on("call:incoming", (payload) => {
        handlersRef.current.onCallIncoming?.(payload);
      });

      socket.on("call:accepted", (payload) => {
        handlersRef.current.onCallAccepted?.(payload);
      });

      socket.on("call:declined", (payload) => {
        handlersRef.current.onCallDeclined?.(payload);
      });

      socket.on("call:ended", (payload) => {
        handlersRef.current.onCallEnded?.(payload);
      });

      socket.on("call:ice", (payload) => {
        handlersRef.current.onCallIce?.(payload);
      });

      socket.on("call:busy", (payload) => {
        handlersRef.current.onCallBusy?.(payload);
      });

      socket.on("call:unavailable", (payload) => {
        handlersRef.current.onCallUnavailable?.(payload);
      });

      socket.on("online-users", (users) => {
        setOnlineUsers(Array.isArray(users) ? users : []);
      });
    } catch (error) {
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
        socket.off("call:incoming");
        socket.off("call:accepted");
        socket.off("call:declined");
        socket.off("call:ended");
        socket.off("call:ice");
        socket.off("call:busy");
        socket.off("call:unavailable");
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
