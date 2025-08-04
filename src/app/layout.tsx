import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Temp File Share",
  description: "Temporary file sharing service",
  icons: {
    icon: "https://yamamojuan.vercel.app/favicon.ico",
    shortcut: "https://yamamojuan.vercel.app/favicon.ico",
    apple: "https://yamamojuan.vercel.app/favicon.ico",
  },
  // Optional: tambah metadata lain
  openGraph: {
    title: "Temp File Share",
    description: "Temporary file sharing service",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Temp File Share",
    description: "Temporary file sharing service",
  },
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
      >
        {children}
      </body>
    </html>
  );
}