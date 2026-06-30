import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { events } = await request.json();

  if (!events?.length) {
    return NextResponse.json({ ok: true, cached: 0 });
  }

  const rows = events
    .filter((e) => !e.allDay && e.start)
    .map((e) => ({
      user_id: user.id,
      google_event_id: e.id,
      title: e.title,
      start_time: e.start,
      end_time: e.end,
      all_day: false,
      cached_at: new Date().toISOString(),
    }));

  if (rows.length > 0) {
    await supabase.from("cached_events").upsert(rows, {
      onConflict: "user_id,google_event_id",
    });
  }

  // 今日より古いキャッシュを削除
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await supabase
    .from("cached_events")
    .delete()
    .eq("user_id", user.id)
    .lt("start_time", today.toISOString());

  return NextResponse.json({ ok: true, cached: rows.length });
}
