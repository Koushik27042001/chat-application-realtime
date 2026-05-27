import { useCallback, useEffect, useState } from "react";

import { notificationApi } from "../services/api";

/**
 * Loads notification history via REST + merges Socket.io `notification` payloads.
 */
export default function useNotifications(token) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await notificationApi.list(token);
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      /* keep previous */
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ingestFromSocket = useCallback((payload) => {
    if (!payload?._id) return;
    setItems((prev) => {
      const idStr = String(payload._id);
      if (prev.some((x) => String(x._id) === idStr)) return prev;
      return [{ ...payload }, ...prev].slice(0, 40);
    });
    if (!payload.isRead) {
      setUnreadCount((c) => Number(c) + 1);
    }
  }, []);

  const markOneRead = useCallback(
    async (id, wasUnreadBefore) => {
      if (!token || !id) return;
      try {
        await notificationApi.markRead(token, id);
        const unread = Boolean(wasUnreadBefore);
        setItems((prev) =>
          prev.map((x) => (String(x._id) === String(id) ? { ...x, isRead: true } : x))
        );
        if (unread) {
          setUnreadCount((c) => Math.max(0, Number(c) - 1));
        }
      } catch {
        /* ignore */
      }
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationApi.markAllRead(token);
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, [token]);

  return {
    notifications: items,
    unreadCount,
    refreshNotifications: refresh,
    ingestNotificationFromSocket: ingestFromSocket,
    markNotificationRead: markOneRead,
    markAllNotificationsRead: markAllRead,
  };
}
