import "./globals.css";

export const metadata = {
  title: "今日の予定",
  description: "Googleカレンダー連携の1日スケジュール管理",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
