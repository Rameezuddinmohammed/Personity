import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personity - AI-Powered Conversational Research",
  description: "Conduct adaptive interviews at scale with AI-powered conversations. Achieve 70%+ completion rates and gather interview-depth insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
