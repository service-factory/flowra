import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { ClientOnly } from "@/components/client-only";
import { ToastProvider } from "@/components/toast-provider";

// Discord 스케줄러 자동 초기화 (서버 사이드에서만 실행)
if (typeof window === 'undefined') {
  import('@/lib/services/discord/discordSchedulerInit');
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Flowra – 팀을 위한 업무/일정 협업 플랫폼",
    template: "%s | Flowra"
  },
  description: "Flowra는 팀을 위한 업무 관리, 일정, Discord 알림 연동을 제공하는 협업 플랫폼입니다.",
  keywords: ["Flowra", "플로라", "업무관리", "프로젝트관리", "캘린더", "협업", "팀", "디스코드", "알림", "Kanban", "Dashboard"],
  authors: [{ name: "Flowra Team" }],
  creator: "Flowra",
  publisher: "Flowra",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://flowra.app"),
  openGraph: {
    title: "Flowra – 팀을 위한 업무/일정 협업 플랫폼",
    description: "업무와 일정을 한 곳에서. Discord 알림과 함께 팀의 생산성을 높이세요.",
    url: "/",
    siteName: "Flowra",
    images: [
      { url: "/api/og", width: 1200, height: 630, alt: "Flowra" }
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowra – 팀을 위한 업무/일정 협업 플랫폼",
    description: "업무와 일정을 한 곳에서. Discord 알림과 함께 팀의 생산성을 높이세요.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "/" },
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
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientOnly fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
