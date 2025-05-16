'use client'; // This needs to be a client component

import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme'; // Import our custom theme

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

export default function ChakraProviderWrapper({ children }: ChakraProviderWrapperProps) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
} 