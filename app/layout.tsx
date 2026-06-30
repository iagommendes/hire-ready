import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hire-ready · Tailor CV",
  description:
    "Privacy-first, zero-cost tool to tailor your resume to a job description. Runs locally in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
