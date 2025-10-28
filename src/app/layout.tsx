import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Proposals Dashboard",
    description: "Simple dashboard powered by Proposales API"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <header style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
            <h1 style={{ margin: 0, fontSize: 20 }}>Proposals Dashboard</h1>
        </header>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>{children}</div>
        </body>
        </html>
    );
}