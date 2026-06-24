"use client";

import { createClient } from "@/lib/supabase/client";
import { CALENDAR_SCOPE } from "@/lib/google-calendar";

export default function GoogleLoginButton() {
  async function handleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: CALENDAR_SCOPE,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold shadow-sm transition hover:shadow-md"
    >
      <span
        className="h-5 w-5 rounded-full"
        style={{
          background:
            "conic-gradient(from 45deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)",
        }}
      />
      Googleでログイン
    </button>
  );
}
