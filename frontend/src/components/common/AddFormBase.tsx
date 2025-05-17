import React from "react";
import {
  Box,
  Button,
  Heading,
  ModalBody,
  VStack,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import AppIcon from './AppIcon';

interface AddFormBaseProps {
  formTitle: string;
  children?: React.ReactNode; // Made optional to support default input
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  submitButtonText: string;
  submitButtonColorScheme?: string;
  defaultInputLabel?: string; // New prop for default input label
  defaultInputPlaceholder?: string; // New prop for default input placeholder
}

const AddFormBase: React.FC<AddFormBaseProps> = ({
  formTitle,
  children,
  onSubmit,
  isLoading,
  submitButtonText,
  submitButtonColorScheme = "blue",
  defaultInputLabel = "Name",
  defaultInputPlaceholder = "Enter name...",
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="border.default"
      bg="bg.surface"
      p={4}
    >
      <ModalBody p={0}>
        <VStack spacing={4} align="stretch">
          <Heading size="sm" color="text.secondary" display="flex" alignItems="center">
            <AppIcon name="add" boxSize={4} mr={2} />
          {formTitle}
        </Heading>

          {children || (
            <FormControl>
              <FormLabel>{defaultInputLabel}</FormLabel>
              <Input
                placeholder={defaultInputPlaceholder}
                size="md"
                autoFocus
              />
            </FormControl>
          )}

        <Button
          type="submit"
          colorScheme={submitButtonColorScheme}
          isLoading={isLoading}
            loadingText="Adding..."
            isDisabled={isLoading}
            leftIcon={<AppIcon name="add" boxSize={4} />}
            mt={2}
        >
          {submitButtonText}
        </Button>
        </VStack>
      </ModalBody>
    </Box>
  );
};

export default AddFormBase;
