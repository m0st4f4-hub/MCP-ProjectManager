import React from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
} from '@chakra-ui/react';

interface AddFormBaseProps {
  formTitle: string;
  children: React.ReactNode; // Specific form fields go here
  onSubmit: (e: React.FormEvent) => Promise<void>; // Caller implements the actual add logic
  isLoading: boolean;
  submitButtonText: string;
  submitButtonColorScheme?: string; // e.g., "blue", "green"
}

const AddFormBase: React.FC<AddFormBaseProps> = ({
  formTitle,
  children,
  onSubmit,
  isLoading,
  submitButtonText,
  submitButtonColorScheme = 'blue', // Default color scheme
}) => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    await onSubmit(e); // Call the provided submit handler
  };

  return (
    <Box 
        as="form" 
        onSubmit={handleSubmit} 
        p={4} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor="border.default" 
        bg="bg.surface" 
        mb={6} // Add some margin below the form
    >
      <VStack spacing={4} align="stretch">
        <Heading size="sm" mb={2} color="text.secondary">
          {formTitle}
        </Heading>
        
        {/* Render the specific form fields passed as children */}
        {children}

        <Button
          type="submit"
          colorScheme={submitButtonColorScheme}
          isLoading={isLoading}
          loadingText="Adding..." // Generic loading text, could be customized via prop if needed
          isDisabled={isLoading} // Disable button while loading
        >
          {submitButtonText}
        </Button>
      </VStack>
    </Box>
  );
};

export default AddFormBase; 