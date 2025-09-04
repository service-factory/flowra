import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flowra - 팀 업무 관리 플랫폼",
  description: "사이드 프로젝트 팀을 위한 효율적인 업무 관리 및 일정 조율 플랫폼",
  keywords: ["업무관리", "프로젝트관리", "팀워크", "일정관리", "사이드프로젝트"],
  authors: [{ name: "Flowra Team" }],
  creator: "Flowra",
  publisher: "Flowra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
