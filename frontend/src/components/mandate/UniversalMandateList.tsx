'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useUniversalMandateStore } from '@/store/universalMandateStore';
import type {
  UniversalMandate,
  UniversalMandateCreateData,
  UniversalMandateUpdateData,
} from '@/types/rules';

interface MandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: UniversalMandateCreateData | UniversalMandateUpdateData
  ) => Promise<void>;
  initial?: Partial<UniversalMandate>;
}

const MandateModal: React.FC<MandateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initial,
}) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(
    initial?.content || initial?.description || ''
  );
  const [priority, setPriority] = useState(initial?.priority ?? 5);

  useEffect(() => {
    setTitle(initial?.title || '');
    setDescription(initial?.content || initial?.description || '');
    setPriority(initial?.priority ?? 5);
  }, [initial]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initial ? 'Edit Mandate' : 'Add Mandate'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3} isRequired>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Priority</FormLabel>
            <Input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={async () => {
              await onSubmit({
                title,
                content: description,
                priority,
                is_active: true,
              });
              onClose();
            }}
            isDisabled={!title.trim() || !description.trim()}
          >
            {initial ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const UniversalMandateList: React.FC = () => {
  const mandates = useUniversalMandateStore((s) => s.mandates);
  const fetchMandates = useUniversalMandateStore((s) => s.fetchMandates);
  const addMandate = useUniversalMandateStore((s) => s.addMandate);
  const updateMandate = useUniversalMandateStore((s) => s.updateMandate);
  const removeMandate = useUniversalMandateStore((s) => s.removeMandate);
  const toast = useToast();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [editing, setEditing] = useState<UniversalMandate | null>(null);

  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  const handleDelete = async (id: string) => {
    try {
      await removeMandate(id);
      toast({ title: 'Mandate deleted', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error deleting mandate',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleAdd = async (data: UniversalMandateCreateData) => {
    try {
      await addMandate(data);
      toast({ title: 'Mandate created', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error creating mandate',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUpdate = async (data: UniversalMandateUpdateData) => {
    if (!editing) return;
    try {
      await updateMandate(editing.id, data);
      toast({ title: 'Mandate updated', status: 'success', duration: 3000 });
    } catch (err) {
      toast({
        title: 'Error updating mandate',
        description: err instanceof Error ? err.message : String(err),
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box p="4">
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Universal Mandates</Heading>
        <Button
          leftIcon={<AddIcon />}
          onClick={onAddOpen}
          size="sm"
          colorScheme="blue"
        >
          Add Mandate
        </Button>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Priority</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mandates.map((m) => (
            <Tr key={m.id} data-testid="mandate-row">
              <Td>{m.title}</Td>
              <Td>{(m as any).description || (m as any).content}</Td>
              <Td>{m.priority}</Td>
              <Td>
                <IconButton
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  mr="2"
                  onClick={() => {
                    setEditing(m);
                    onEditOpen();
                  }}
                />
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(m.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <MandateModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSubmit={handleAdd}
      />
      <MandateModal
        isOpen={isEditOpen}
        onClose={() => {
          setEditing(null);
          onEditClose();
        }}
        onSubmit={handleUpdate}
        initial={editing || undefined}
      />
    </Box>
  );
};

export default UniversalMandateList;
