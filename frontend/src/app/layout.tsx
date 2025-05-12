import type { Metadata } from "next";
import "./globals.css";
import ChakraProviderWrapper from "@/providers/ChakraProviderWrapper";
import ClientOnly from "@/components/ClientOnly";

// Import Geist and Geist Mono fonts from next/font/google
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Task Manager",
  description: "MCP Task Manager Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <ClientOnly>
          <ChakraProviderWrapper>
            {children}
          </ChakraProviderWrapper>
        </ClientOnly>
      </body>
    </html>
  );
}
