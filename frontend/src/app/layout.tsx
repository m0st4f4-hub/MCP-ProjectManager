import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import ChakraProviderWrapper from "@/providers/ChakraProviderWrapper";
import ClientOnly from "@/components/ClientOnly";

// Added Inter font initialization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
