"use client";

import { useEffect, useRef } from "react";

export default function NotificationManager({ events, notifyMinutes }) {
  const timersRef = useRef([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!notifyMinutes || !events.length) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    Notification.requestPermission();

    events.forEach((event) => {
      if (event.allDay || !event.start) return;

      const eventTime = new Date(event.start).getTime();
      const notifyAt = eventTime - notifyMinutes * 60 * 1000;
      const delay = notifyAt - Date.now();

      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

      const timer = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("予定のリマインド", {
            body: `${event.title} — ${notifyMinutes}分後に開始`,
            icon: "/favicon.ico",
          });
        }
      }, delay);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [events, notifyMinutes]);

  return null;
}
