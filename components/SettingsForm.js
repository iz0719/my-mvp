"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CALENDAR_SCOPE } from "@/lib/google-calendar";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const NOTIFY_OPTIONS = [5, 10, 15, 30, 60];

export default function SettingsForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [notifyMinutes, setNotifyMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);
      setEmail(user.email || "");

      const { data } = await supabase
        .from("user_settings")
        .select("notify_minutes")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.notify_minutes) {
        setNotifyMinutes(data.notify_minutes);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleNotifyChange(value) {
    const minutes = Number(value);
    setNotifyMinutes(minutes);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_settings").upsert({
      user_id: user.id,
      notify_minutes: minutes,
      updated_at: new Date().toISOString(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleReconnect() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: CALENDAR_SCOPE,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <p className="px-4 py-8 text-center text-sm text-slate-500">読み込み中…</p>
    );
  }

  if (!loggedIn) {
    return (
      <div className="px-4 py-8">
        <p className="mb-4 text-center text-sm text-slate-600">
          ログインが必要です
        </p>
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-slate-100 px-4 py-5">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/today" className="text-sm text-blue-600">
          ← 今日の予定
        </Link>
      </div>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <h2 className="px-4 pb-2 pt-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            アカウント
          </h2>
          <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold">ユーザー</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
              連携済み
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <h2 className="px-4 pb-2 pt-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            通知
          </h2>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5">
            <label htmlFor="notify-before" className="text-[15px] text-slate-700">
              通知タイミング
            </label>
            <select
              id="notify-before"
              value={notifyMinutes}
              onChange={(e) => handleNotifyChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700"
            >
              {NOTIFY_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}分前
                </option>
              ))}
            </select>
          </div>
          {saved && (
            <p className="border-t border-slate-100 px-4 py-2 text-xs text-green-600">
              保存しました
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <h2 className="px-4 pb-2 pt-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            カレンダー
          </h2>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5 text-sm text-slate-700">
            <span>Googleカレンダー</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
              読み取り中
            </span>
          </div>
        </section>

        <button
          type="button"
          onClick={handleReconnect}
          className="w-full rounded-xl border-[1.5px] border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          カレンダーを再連携する
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl py-3 text-sm text-slate-500 hover:text-slate-700"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
