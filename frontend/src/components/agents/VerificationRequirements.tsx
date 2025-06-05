"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  verificationRequirementsApi,
} from "@/services/api";
import type {
  VerificationRequirement,
  VerificationRequirementCreateData,
  VerificationRequirementUpdateData,
} from "@/types/verificationRequirement";

interface Props {
  agentRoleId: string;
}

const VerificationRequirements: React.FC<Props> = ({ agentRoleId }) => {
  const [requirements, setRequirements] = useState<VerificationRequirement[]>([]);
  const [formState, setFormState] = useState<VerificationRequirementCreateData>({
    requirement: "",
    description: "",
    is_mandatory: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const loadRequirements = async () => {
    try {
      const data = await verificationRequirementsApi.list(agentRoleId);
      setRequirements(data);
    } catch (err) {
      toast({
        title: "Failed to load requirements",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [agentRoleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setFormState({ requirement: "", description: "", is_mandatory: true });
    setEditingId(null);
    onOpen();
  };

  const openEdit = (req: VerificationRequirement) => {
    setFormState({
      requirement: req.requirement,
      description: req.description ?? "",
      is_mandatory: req.is_mandatory,
    });
    setEditingId(req.id);
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const updated = await verificationRequirementsApi.update(
          editingId,
          formState as VerificationRequirementUpdateData,
        );
        setRequirements((r) => r.map((x) => (x.id === editingId ? updated : x)));
        toast({ title: "Requirement updated", status: "success", duration: 3000 });
      } else {
        const created = await verificationRequirementsApi.create(agentRoleId, formState);
        setRequirements((r) => [...r, created]);
        toast({ title: "Requirement added", status: "success", duration: 3000 });
      }
      onClose();
    } catch (err) {
      toast({
        title: "Error saving requirement",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await verificationRequirementsApi.remove(id);
      setRequirements((r) => r.filter((req) => req.id !== id));
      toast({ title: "Requirement deleted", status: "success", duration: 3000 });
    } catch (err) {
      toast({
        title: "Error deleting requirement",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Button leftIcon={<AddIcon />} mb={4} onClick={openCreate}>
        Add Requirement
      </Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Requirement</Th>
            <Th>Description</Th>
            <Th>Mandatory</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requirements.map((req) => (
            <Tr key={req.id} data-testid="requirement-row">
              <Td>{req.requirement}</Td>
              <Td>{req.description}</Td>
              <Td>{req.is_mandatory ? "Yes" : "No"}</Td>
              <Td>
                <IconButton
                  aria-label="Edit"
                  icon={<EditIcon />}
                  size="sm"
                  mr={2}
                  onClick={() => openEdit(req)}
                />
                <IconButton
                  aria-label="Delete"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(req.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingId ? "Edit Requirement" : "Add Requirement"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Requirement</FormLabel>
              <Input
                name="requirement"
                value={formState.requirement}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={formState.description || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Mandatory</FormLabel>
              <Switch
                name="is_mandatory"
                isChecked={formState.is_mandatory}
                onChange={handleChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingId ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VerificationRequirements;
