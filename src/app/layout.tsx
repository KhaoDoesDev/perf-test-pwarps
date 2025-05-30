import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PWarps",
  description: "A player warps gallery for Tubbo's performance test Minecraft server at perf-test.play.hosting!", 
};

export default function RootLayout({
  children,
	modal
}: Readonly<{
  children: React.ReactNode;
	modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
				{modal}
        {children}
				<Toaster />
      </body>
    </html>
  );
}
