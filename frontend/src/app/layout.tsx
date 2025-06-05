import * as React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import ChakraProviderWrapper from "@/providers/ChakraProviderWrapper";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import Geist and Geist Mono fonts from next/font/google
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Project Manager",
  description: "MCP Project Manager Suite",
  icons: [
    {
      rel: "icon",
      url: "/favicon_light_32.png",
      sizes: "32x32",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: "/favicon_dark_32.png",
      sizes: "32x32",
      media: "(prefers-color-scheme: dark)",
    },
    {
      rel: "icon",
      url: "/favicon_light_64.png",
      sizes: "64x64",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: "/favicon_dark_64.png",
      sizes: "64x64",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <ClientOnly>
          <ErrorBoundary>
            <ChakraProviderWrapper>{children}</ChakraProviderWrapper>
          </ErrorBoundary>
        </ClientOnly>
      </body>
    </html>
  );
}
