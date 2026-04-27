import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomato Tracker",
  description: "トマトの開花数・結実数・収穫記録を一覧で管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
