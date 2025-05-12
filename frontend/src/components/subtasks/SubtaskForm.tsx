import React, { useState, useEffect } from 'react';
import { Subtask, subtaskCreateSchema, subtaskUpdateSchema, SubtaskCreateData, SubtaskUpdateData } from '@/types';
import { ZodError } from 'zod';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Textarea, VStack, HStack, Button } from '@chakra-ui/react';

interface SubtaskFormProps {
  isOpen: boolean;
  subtask?: Subtask; // For editing
  parentTaskId: string; // For creation, to associate with parent task
  onSubmit: (data: SubtaskCreateData | SubtaskUpdateData, subtaskId?: string) => void;
  onClose: () => void;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  isOpen,
  subtask,
  parentTaskId,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const isEditMode = !!subtask;

  useEffect(() => {
    if (isEditMode && subtask) {
      setTitle(subtask.title || '');
      setDescription(subtask.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setErrors({});
  }, [isEditMode, subtask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    console.log('SubtaskForm: handleSubmit called', { title, description });

    const formData = {
      title,
      description: description || null,
      ...(isEditMode && subtask ? { completed: subtask.completed } : { completed: false }),
    };

    try {
      if (isEditMode && subtask) {
        const validatedData = subtaskUpdateSchema.parse(formData) as SubtaskUpdateData;
        onSubmit(validatedData, subtask.id);
      } else {
        const createPayload: SubtaskCreateData = {
            title: formData.title,
            description: formData.description,
        };
        const validatedData = subtaskCreateSchema.parse(createPayload) as SubtaskCreateData;
        onSubmit(validatedData);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(error.flatten().fieldErrors);
      } else {
        console.error('Submission error:', error);
        setErrors({ form: ['An unexpected error occurred.'] });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px" p={4}>
        <ModalHeader borderBottomWidth="1px" borderColor="gray.700">{subtask ? 'Edit Subtask' : 'Add a New Subtask'}</ModalHeader>
        <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="gray.100">Title</FormLabel>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter subtask title"
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.100">Description (Optional)</FormLabel>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter subtask description"
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>
              {errors.form && (
                <Text color="red.300" fontSize="sm">{errors.form.join(', ')}</Text>
              )}
              <HStack spacing={4} width="100%" justify="flex-end" pt={2} mt={2}>
                <Button onClick={onClose} variant="outline" colorScheme="gray" borderColor="gray.600" color="gray.100" _hover={{ bg: "gray.700" }}>Cancel</Button>
                <Button colorScheme="blue" type="submit" _hover={{ bg: "blue.500" }} _active={{ bg: "blue.600" }}>{subtask ? 'Save Changes' : 'Add Subtask'}</Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubtaskForm; 