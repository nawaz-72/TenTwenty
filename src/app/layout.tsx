import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TickTock - Timesheet Management App",
  description: "Introducing TickTock, our cutting-edge timesheet web application designed to track and monitor employee work hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
