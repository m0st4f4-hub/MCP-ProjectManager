import type { Metadata } from "next";
import { Geist as _Geist, Geist_Mono as _Geist_Mono } from "next/font/google";
import "./globals.css";
import ChakraProviderWrapper from "@/providers/ChakraProviderWrapper";
import ClientOnly from "@/components/ClientOnly";

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
    <html lang="en" suppressHydrationWarning>
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
