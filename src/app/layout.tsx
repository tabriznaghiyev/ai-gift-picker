import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "US Gift Finder — AI-Personalized Recommendations",
  description: "Answer a short quiz and get 3 personalized gift ideas + 3 alternatives from our catalog.",
};

import { InteractiveMascot } from "@/components/InteractiveMascot";
import { SystemVisualizer } from "@/components/SystemVisualizer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        {children}
        <InteractiveMascot />
        <SystemVisualizer />
      </body>
    </html>
  );
}
