"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { rulesApi } from "@/services/api";
import type { UniversalMandate, UniversalMandateUpdateData } from "@/types/rules";
import EditUniversalMandateModal from "./EditUniversalMandateModal";
import ConfirmationModal from "../common/ConfirmationModal";

const UniversalMandateManager: React.FC = () => {
  const [mandates, setMandates] = useState<UniversalMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UniversalMandate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editDisc = useDisclosure();
  const deleteDisc = useDisclosure();
  const toast = useToast();

  const fetchMandates = async () => {
    setLoading(true);
    try {
      const result = await rulesApi.mandates.list();
      setMandates(result.data);
    } catch (err) {
      toast({
        title: "Failed to load mandates",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleUpdate = async (data: UniversalMandateUpdateData) => {
    if (!selected) return;
    try {
      await rulesApi.mandates.update(selected.id, data);
      toast({ title: "Mandate updated", status: "success", duration: 3000, isClosable: true });
      editDisc.onClose();
      await fetchMandates();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    deleteDisc.onOpen();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await rulesApi.mandates.delete(deleteId);
      toast({ title: "Mandate deleted", status: "info", duration: 3000, isClosable: true });
      setDeleteId(null);
      deleteDisc.onClose();
      await fetchMandates();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Priority</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mandates.map((m) => (
              <Tr key={m.id}>
                <Td>{m.title}</Td>
                <Td>{m.priority}</Td>
                <Td>{m.is_active ? "Yes" : "No"}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => {
                      setSelected(m);
                      editDisc.onOpen();
                    }}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmDelete(m.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <EditUniversalMandateModal
        isOpen={editDisc.isOpen}
        onClose={() => {
          setSelected(null);
          editDisc.onClose();
        }}
        mandate={selected}
        onSave={handleUpdate}
        onDelete={selected ? () => confirmDelete(selected.id) : undefined}
      />

      <ConfirmationModal
        isOpen={deleteDisc.isOpen}
        onClose={() => {
          setDeleteId(null);
          deleteDisc.onClose();
        }}
        onConfirm={handleDelete}
        title="Delete Mandate"
        confirmButtonColorScheme="red"
        confirmButtonText="Delete"
      />
    </Box>
  );
};

export default UniversalMandateManager;
