import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppShellProvider } from "@/components/app-shell";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: "CrewSynx",
  title: {
    default: "CrewSynx — Self-Hosted Workforce Management Platform",
    template: "%s | CrewSynx",
  },
  description:
    "CrewSynx is a self-hosted workforce management platform. Manage projects, track attendance, run team chat, and view analytics — buy a lifetime license and deploy on your own infrastructure.",
  keywords: [
    "self-hosted workforce management",
    "team workspace software",
    "project management platform",
    "attendance tracking software",
    "HR management system",
    "team collaboration tool",
    "kanban board",
    "sprint planning",
    "employee management",
    "lifetime license software",
    "on-premise workforce platform",
    "self-hosted project management",
    "perpetual license HR software",
    "workforce analytics",
    "role-based access control",
    "deploy anywhere software",
  ],
  authors: [{ name: "Butterfly Instruments", url: "https://butterflyinstruments.com" }],
  creator: "Butterfly Instruments",
  publisher: "Butterfly Instruments",
  category: "Business Software",
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "CrewSynx",
    title: "CrewSynx — Self-Hosted Workforce Management Platform",
    description:
      "Buy a lifetime license, deploy on your own infrastructure, and manage your entire workforce — projects, attendance, chat, and analytics — forever.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CrewSynx — Self-Hosted Workforce Management Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@crewsynx",
    creator: "@crewsynx",
    title: "CrewSynx — Self-Hosted Workforce Management Platform",
    description:
      "Buy a lifetime license, deploy anywhere, manage projects, attendance, and your team — no recurring payments.",
    images: [`${BASE_URL}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figtree.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShellProvider>
            {children}
          </AppShellProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
