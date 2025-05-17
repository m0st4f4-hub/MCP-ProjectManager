import React from 'react';
import { Box, Heading, Spinner, Text, VStack, BoxProps } from '@chakra-ui/react';
import { typography, semanticColors, sizing } from '@/tokens';

interface DashboardSectionProps extends BoxProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  // Allow any other BoxProps for flexibility
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, isLoading, error, children, ...rest }) => {
  // Default styling, can be overridden by props passed via ...rest
  const defaultStyles = {
    p: sizing.spacing[4] || '4',
    borderWidth: sizing.borderWidth.sm || '1px',
    borderRadius: sizing.borderRadius.lg || 'lg',
    boxShadow: sizing.shadows.md || 'md',
    bg: semanticColors.surfaceDefault?.DEFAULT || 'transparent', // Ensure a fallback for bg
    borderColor: semanticColors.borderNeutral?.DEFAULT || 'gray.200',
  };

  return (
    <Box {...defaultStyles} {...rest} aria-busy={isLoading}>
      <Heading 
        as="h2" 
        size={typography.fontSizes.h4 || 'lg'} 
        mb={sizing.spacing[3] || '3'} 
        color={semanticColors.textPrimary?.DEFAULT || 'inherit'} 
        fontFamily={typography.fontFamily.heading?.join(',') || 'sans-serif'}
      >
        {title}
      </Heading>
      {isLoading && (
        <VStack justifyContent="center" alignItems="center" minH="100px">
          <Spinner thickness={sizing.borderWidth.md || '4px'} speed="0.65s" color={semanticColors.brandPrimary?.DEFAULT || 'blue.500'} emptyColor={semanticColors.borderNeutral?.DEFAULT || 'gray.200'} size="xl" />
        </VStack>
      )}
      {!isLoading && error && (
        <VStack justifyContent="center" alignItems="center" minH="100px" role="alert">
          <Text color={semanticColors.textError?.DEFAULT || 'red.500'} fontSize={typography.fontSizes.md || 'md'}>Error: {error}</Text>
        </VStack>
      )}
      {!isLoading && !error && children}
    </Box>
  );
};

export default DashboardSection; 