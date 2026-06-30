"use client";

import { useEffect, useState } from "react";

export default function PushSubscriptionManager() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      })
      .catch(() => {});
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("通知の許可が必要です。ブラウザの設定から許可してください。");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="mx-4 mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
      <div>
        <p className="font-semibold text-slate-700">バックグラウンド通知</p>
        <p className="text-xs text-slate-400">
          {subscribed ? "ブラウザを閉じても通知が届きます" : "オンにするとブラウザを閉じても通知が届きます"}
        </p>
      </div>
      <button
        type="button"
        onClick={subscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          subscribed
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? "…" : subscribed ? "オフにする" : "オンにする"}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
