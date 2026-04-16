import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CrewSynx — Team Workspace Platform",
    template: "%s | CrewSynx",
  },
  description:
    "The all-in-one workspace for modern teams. Manage projects, track attendance, handle HR, and collaborate seamlessly — all in one place.",
  keywords: [
    "team workspace",
    "project management",
    "attendance tracking",
    "HR software",
    "team collaboration",
    "task management",
    "sprint planning",
    "employee management",
  ],
  authors: [{ name: "CrewSynx", url: BASE_URL }],
  creator: "CrewSynx",
  publisher: "CrewSynx",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "CrewSynx",
    title: "CrewSynx — Team Workspace Platform",
    description:
      "The all-in-one workspace for modern teams. Manage projects, track attendance, and collaborate seamlessly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CrewSynx — Team Workspace Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CrewSynx — Team Workspace Platform",
    description:
      "The all-in-one workspace for modern teams. Manage projects, track attendance, and collaborate seamlessly.",
    images: ["/og-image.png"],
    creator: "@crewsynx",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
