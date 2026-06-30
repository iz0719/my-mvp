import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/push";
import { NextResponse } from "next/server";

// Vercel Cron から呼ばれるエンドポイント（5分おき）
export async function GET(request) {
  // Cron シークレットで不正アクセスを防ぐ
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // サービスロールキーで全ユーザーのデータにアクセス
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now = new Date();

  // 各ユーザーの通知設定を取得
  const { data: settings } = await supabase
    .from("user_settings")
    .select("user_id, notify_minutes");

  if (!settings?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;

  for (const setting of settings) {
    const notifyMinutes = setting.notify_minutes || 15;
    const windowStart = new Date(now.getTime() + notifyMinutes * 60 * 1000 - 60 * 1000);
    const windowEnd = new Date(now.getTime() + notifyMinutes * 60 * 1000 + 60 * 1000);

    // 通知タイミングの予定を取得
    const { data: events } = await supabase
      .from("cached_events")
      .select("*")
      .eq("user_id", setting.user_id)
      .gte("start_time", windowStart.toISOString())
      .lte("start_time", windowEnd.toISOString());

    if (!events?.length) continue;

    // プッシュ購読を取得
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", setting.user_id);

    if (!subscriptions?.length) continue;

    for (const event of events) {
      for (const sub of subscriptions) {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          {
            title: "予定のリマインド",
            body: `${event.title} — ${notifyMinutes}分後に開始`,
            tag: event.google_event_id,
            url: "/today",
          }
        );

        if (result.ok) {
          sent++;
        } else if (result.status === 410) {
          // 購読が無効になっていたら削除
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
