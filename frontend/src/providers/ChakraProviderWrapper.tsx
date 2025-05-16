'use client';

import { ChakraProvider } from '@chakra-ui/react';
// import theme from '@/theme'; // Old theme import
import chakraCustomTheme from '../theme/chakra-theme'; // New custom theme import
import ModalProvider from './ModalProvider';

interface ChakraProviderWrapperProps {
  children: React.ReactNode;
}

export default function ChakraProviderWrapper({ children }: ChakraProviderWrapperProps) {
  return (
    <ChakraProvider theme={chakraCustomTheme}> {/* Use the new custom theme */}
      <ModalProvider>
        {children}
      </ModalProvider>
    </ChakraProvider>
  );
} 