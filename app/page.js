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
      </div>
    </main>
  );
}
