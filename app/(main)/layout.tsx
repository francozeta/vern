import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VERN | Music Discovery & Reviews",
  description: "A social network for music discovery, reviews and community",
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body
        className={`${geistSans.className} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" theme="dark"/>
      </body>
    </html>
  );
}
