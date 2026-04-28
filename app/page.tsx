import { TrackerApp } from "@/components/tracker-app";
import { listObservationDates, listPlants, listRecords } from "@/lib/db";
import { secretHeaderName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const [plants, dates, records] = await Promise.all([
      listPlants(),
      listObservationDates(),
      listRecords(),
    ]);

    return (
      <TrackerApp
        initialData={{ plants, dates, records }}
        editSecretHeader={secretHeaderName()}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";

    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "24px",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #faf5ee 0%, #f3ecdf 100%)",
          color: "#263122",
          fontFamily: '"Avenir Next", "Hiragino Sans", sans-serif',
        }}
      >
        <section
          style={{
            width: "min(720px, 100%)",
            background: "rgba(255, 250, 242, 0.92)",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 24px 60px rgba(61, 49, 31, 0.1)",
          }}
        >
          <p style={{ margin: 0, color: "#8f3519", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.82rem" }}>
            Tomato Tracker
          </p>
          <h1 style={{ margin: "12px 0 8px", fontSize: "2rem" }}>アプリの初期設定を確認してください</h1>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            ページの読み込み中にサーバー側でエラーが発生しました。多くの場合は Vercel の環境変数か、Supabase の接続設定が原因です。
          </p>
          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "#fffdf8",
              border: "1px solid rgba(68, 87, 59, 0.16)",
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              overflowX: "auto",
            }}
          >
            {message}
          </div>
          <ul style={{ margin: "18px 0 0", paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>`DATABASE_URL` が Vercel の Production / Preview / Development に入っているか確認</li>
            <li>`APP_EDIT_SECRET` が保存されているか確認</li>
            <li>Supabase のパスワードを含む接続文字列が壊れていないか確認</li>
            <li>環境変数を変更した後に Redeploy したか確認</li>
          </ul>
        </section>
      </main>
    );
  }
}
