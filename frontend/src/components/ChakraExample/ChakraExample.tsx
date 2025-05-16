import React from 'react';
import { Box, Button, Heading, Text, VStack, HStack, Input, useColorMode } from '@chakra-ui/react';
import { theme as projectTokens } from '../../styles/theme'; // Moved import to top

const ChakraExample: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box 
      p={projectTokens.spacing[5]} 
      borderWidth="1px" 
      borderRadius={projectTokens.radii.lg} 
      borderColor={projectTokens.colors.borderDecorative} 
      bg={projectTokens.colors.bgSurface}
    >
      <VStack spacing={projectTokens.spacing[4]} align="stretch">
        <Heading size="lg">Chakra UI Components with Custom Theme</Heading>
        <Text>
          These Chakra UI components should now be styled using our project's design tokens.
          The Button below should use our `brandPrimary` color from the theme overrides.
        </Text>

        <HStack spacing={projectTokens.spacing[4]}>
          <Button variant="solid">Solid Button (Primary)</Button>
          <Button variant="outline">Outline Button</Button>
        </HStack>

        <Input placeholder="Custom themed input (styling depends on component theme)" />

        <Text mt={projectTokens.spacing[4]}>Current color mode: {colorMode}</Text>
        <Button onClick={toggleColorMode} variant="ghost">
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
        <Text fontSize="sm" color={projectTokens.colors.textSecondary}>
          (Note: Full dark mode support requires defining dark mode tokens in the theme.)
        </Text>
      </VStack>
    </Box>
  );
};

export default ChakraExample; 