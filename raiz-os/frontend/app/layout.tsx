import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAIZ OS — AI Coding Mentor",
  description: "Adaptive AI-powered coding mentor operating system",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary antialiased overflow-hidden h-screen">
        {children}
      </body>
    </html>
  );
}
