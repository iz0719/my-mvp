"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchTodayEvents,
  formatEventTime,
  minutesUntil,
} from "@/lib/google-calendar";
import EventCard from "@/components/EventCard";
import NotificationManager from "@/components/NotificationManager";
import PushSubscriptionManager from "@/components/PushSubscriptionManager";

function todayLabel() {
  return new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function TodaySchedule() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [memos, setMemos] = useState({});
  const [notifyMinutes, setNotifyMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("ログインが必要です");
      setLoading(false);
      return;
    }

    const token = session.provider_token;
    if (!token) {
      setError(
        "カレンダー連携のトークンがありません。設定から再連携してください。"
      );
      setLoading(false);
      return;
    }

    try {
      const [calendarEvents, settingsRes, memosRes] = await Promise.all([
        fetchTodayEvents(token),
        supabase
          .from("user_settings")
          .select("notify_minutes")
          .eq("user_id", session.user.id)
          .maybeSingle(),
        supabase
          .from("event_memos")
          .select("google_event_id, memo, color")
          .eq("user_id", session.user.id),
      ]);

      const enriched = calendarEvents.map((event) => ({
        ...event,
        timeLabel: formatEventTime(event.start, event.end, event.allDay),
      }));

      setEvents(enriched);
      setNotifyMinutes(settingsRes.data?.notify_minutes ?? 15);

      // バックグラウンド通知用にイベントをキャッシュ
      fetch("/api/push/cache-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: calendarEvents }),
      }).catch(() => {});

      const memoMap = {};
      (memosRes.data || []).forEach((row) => {
        memoMap[row.google_event_id] = {
          memo: row.memo || "",
          color: row.color || "gray",
        };
      });
      setMemos(memoMap);
    } catch (err) {
      setError(err.message || "予定の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveMemo(eventId, memo, color) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("event_memos").upsert(
      {
        user_id: user.id,
        google_event_id: eventId,
        memo,
        color,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,google_event_id" }
    );
  }

  function handleMemoChange(eventId, value) {
    const color = memos[eventId]?.color || "gray";
    setMemos((prev) => ({
      ...prev,
      [eventId]: { memo: value, color },
    }));
  }

  function handleMemoBlur(eventId) {
    const entry = memos[eventId];
    saveMemo(eventId, entry?.memo || "", entry?.color || "gray");
  }

  function handleColorChange(eventId, color) {
    const memo = memos[eventId]?.memo || "";
    setMemos((prev) => ({
      ...prev,
      [eventId]: { memo, color },
    }));
    saveMemo(eventId, memo, color);
  }

  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-slate-100">
      <header className="bg-blue-600 px-5 pb-6 pt-5 text-white">
        <div className="mb-1 flex justify-end">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-lg"
            aria-label="設定"
          >
            ⚙️
          </Link>
        </div>
        <p className="text-[13px] opacity-85">{todayLabel()}</p>
        <h1 className="text-2xl font-bold">今日の予定</h1>
        <p className="mt-1.5 text-[13px] opacity-80">{events.length}件の予定</p>
      </header>

      <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-[13px] text-blue-700">
        <span>🔔</span>
        <span>{notifyMinutes}分前に通知します（設定で変更可）</span>
      </div>

      <PushSubscriptionManager />

      {loading && (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          読み込み中…
        </p>
      )}

      {error && (
        <div className="mx-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          {error.includes("再連携") && (
            <Link href="/settings" className="mt-2 block font-semibold underline">
              設定へ
            </Link>
          )}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          今日の予定はありません
        </p>
      )}

      <div className="flex flex-col gap-3 px-4 pb-8">
        {events.map((event) => {
          const entry = memos[event.id] || { memo: "", color: "gray" };
          const countdown = event.allDay
            ? null
            : minutesUntil(event.start);
          const soon =
            countdown &&
            !event.allDay &&
            new Date(event.start).getTime() - Date.now() < 60 * 60 * 1000;

          return (
            <EventCard
              key={event.id}
              event={event}
              memo={entry.memo}
              color={entry.color}
              countdown={countdown}
              soon={soon}
              onMemoChange={(value) => handleMemoChange(event.id, value)}
              onColorChange={(color) => handleColorChange(event.id, color)}
              onBlur={() => handleMemoBlur(event.id)}
            />
          );
        })}
      </div>

      <NotificationManager events={events} notifyMinutes={notifyMinutes} />
    </div>
  );
}
