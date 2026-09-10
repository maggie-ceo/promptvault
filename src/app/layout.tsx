import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptVault — Find, Customize, Save, and Share Better AI Prompts",
  description: "A curated, community-powered library of practical AI prompts. Discover ready-to-use prompts for writing, coding, marketing, research, productivity, and more.",
  keywords: ["AI prompts", "ChatGPT prompts", "Claude prompts", "AI tools", "prompt engineering", "productivity"],
  authors: [{ name: "PromptVault" }],
  creator: "PromptVault",
  publisher: "PromptVault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://promptvault.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptvault.vercel.app",
    siteName: "PromptVault",
    title: "PromptVault — Find, Customize, Save, and Share Better AI Prompts",
    description: "A curated, community-powered library of practical AI prompts. Discover ready-to-use prompts for writing, coding, marketing, research, productivity, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptVault — Find, Customize, Save, and Share Better AI Prompts",
    description: "A curated, community-powered library of practical AI prompts.",
    creator: "@promptvault",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
          PromptVault — 100% Free & Open Source
        </footer>
      </body>
    </html>
  );
}
