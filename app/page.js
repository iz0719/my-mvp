import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage({ searchParams }) {
  const hasError = searchParams?.error === "auth";

  return (
    <main className="mx-auto flex min-h-screen max-w-[600px] items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 px-6 py-10">
      <div className="w-full rounded-2xl bg-white p-9 text-center shadow-lg shadow-blue-500/10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white">
          📅
        </div>
        <h1 className="mb-2 text-2xl font-bold">今日の予定</h1>
        <p className="mb-7 text-sm leading-relaxed text-slate-500">
          Googleカレンダーと連携して、
          <br />
          今日やることを1画面で整理
        </p>
        <ul className="mb-7 space-y-1.5 text-left text-[13px] text-slate-600">
          {[
            "カレンダーの予定を自動で取り込み",
            "予定ごとにやることをメモ",
            "時間前にブラウザでリマインド",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="font-bold text-blue-600">✓</span>
              {item}
            </li>
          ))}
        </ul>
        {hasError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            ログインに失敗しました。もう一度お試しください。
          </p>
        )}
        <GoogleLoginButton />
        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
          カレンダーの読み取りのみ使用します。
          <br />
          予定の編集はGoogleカレンダー側で行います。
        </p>

        {/* サンプル画面 */}
        <div className="mt-8 text-left">
          <p className="mb-3 text-center text-xs font-semibold text-slate-400">
            ログイン後の画面イメージ
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* ヘッダー */}
            <div className="bg-blue-600 px-4 py-3 text-white">
              <p className="text-[10px] opacity-75">2026年6月27日（土）</p>
              <p className="text-sm font-bold">今日の予定</p>
              <p className="text-[10px] opacity-75">3件の予定</p>
            </div>
            {/* 予定カード */}
            <div className="space-y-2 p-3">
              {[
                { time: "09:00 – 10:00", title: "チームミーティング", memo: "議題の確認", color: "#2563eb", tag: "あと25分" },
                { time: "12:00 – 13:00", title: "ランチ", memo: "", color: "#16a34a", tag: "あと3時間" },
                { time: "14:00 – 15:30", title: "プロジェクトレビュー", memo: "資料を準備", color: "#ea580c", tag: "あと5時間" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg bg-white px-3 py-2 shadow-sm"
                  style={{ borderLeft: `3px solid ${item.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.time}</span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">{item.tag}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">{item.title}</p>
                  {item.memo && (
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.memo}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
