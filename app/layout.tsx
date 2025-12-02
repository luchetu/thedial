import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/app/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TheDial - Turn every client call into searchable notes",
  description: "Automatically record, transcribe, and organize your business calls using AI. Works seamlessly with iPhone, Android, and VoIP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
