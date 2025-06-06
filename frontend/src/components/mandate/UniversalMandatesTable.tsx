'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { rulesApi } from '@/services/api/rules';
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
} from '@/types/rules';
import { sizing } from '@/tokens';

const defaultForm: UniversalMandateCreateData = {
  title: '',
  content: '',
  priority: 5,
  is_active: true,
  category: undefined,
};

const UniversalMandatesTable: React.FC = () => {
  const [mandates, setMandates] = useState<UniversalMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UniversalMandateCreateData>(defaultForm);
  const [editing, setEditing] = useState<UniversalMandate | null>(null);
  const [mandateToDelete, setMandateToDelete] = useState<UniversalMandate | null>(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const loadMandates = async () => {
    setLoading(true);
    try {
      const res = await rulesApi.mandates.list();
      setMandates(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mandates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  const handleOpenCreate = () => {
    setEditing(null);
    setFormData(defaultForm);
    onOpen();
  };

  const handleOpenEdit = (m: UniversalMandate) => {
    setEditing(m);
    setFormData({
      title: m.title,
      content: m.content,
      priority: m.priority,
      is_active: m.is_active,
      category: m.category ?? undefined,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const updated = await rulesApi.mandates.update(editing.id, formData as UniversalMandateUpdateData);
        setMandates(mandates.map((m) => (m.id === updated.id ? updated : m)));
        toast({ title: 'Mandate updated', status: 'success' });
      } else {
        const created = await rulesApi.mandates.create(formData);
        setMandates([...mandates, created]);
        toast({ title: 'Mandate created', status: 'success' });
      }
      onClose();
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Error',
        status: 'error',
      });
    }
  };

  const confirmDelete = async () => {
    if (!mandateToDelete) return;
    try {
      await rulesApi.mandates.delete(mandateToDelete.id);
      setMandates(mandates.filter((m) => m.id !== mandateToDelete.id));
      toast({ title: 'Mandate deleted', status: 'info' });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Error',
        status: 'error',
      });
    } finally {
      setMandateToDelete(null);
      onDeleteClose();
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={sizing.spacing[6]}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={sizing.spacing[6]} color="textStatusError">
        {error}
      </Box>
    );
  }

  return (
    <Box p={sizing.spacing[4]}>
      <Heading size="lg" mb={sizing.spacing[4]} color="textPrimary">
        Universal Mandates
      </Heading>

      <Button onClick={handleOpenCreate} mb={sizing.spacing[3]} bg="interactivePrimary" color="onInteractivePrimary">
        New Mandate
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Content</Th>
            <Th>Priority</Th>
            <Th>Active</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {mandates.map((m) => (
            <Tr key={m.id} data-testid="mandate-row">
              <Td>{m.title}</Td>
              <Td>{m.content}</Td>
              <Td>{m.priority}</Td>
              <Td>{m.is_active ? 'Yes' : 'No'}</Td>
              <Td>
                <Button size="sm" mr={2} onClick={() => handleOpenEdit(m)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    setMandateToDelete(m);
                    onDeleteOpen();
                  }}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? 'Edit Mandate' : 'New Mandate'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Priority</FormLabel>
              <NumberInput
                min={1}
                max={10}
                value={formData.priority}
                onChange={(_, valueAsNumber) =>
                  setFormData({ ...formData, priority: valueAsNumber })
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button bg="interactivePrimary" color="onInteractivePrimary" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Mandate
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{mandateToDelete?.title}"?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UniversalMandatesTable;
