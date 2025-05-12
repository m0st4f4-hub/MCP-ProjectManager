'use client';

import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme';
import ModalProvider from './ModalProvider';

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

export default function ChakraProviderWrapper({ children }: ChakraProviderWrapperProps) {
  return (
    <ChakraProvider theme={theme}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ChakraProvider>
  );
} 