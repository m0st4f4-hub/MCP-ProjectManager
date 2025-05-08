import type { Metadata } from "next";
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
