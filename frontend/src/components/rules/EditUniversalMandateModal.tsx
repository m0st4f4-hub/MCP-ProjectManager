"use client";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";
import EditModalBase from "../common/EditModalBase";
import type { UniversalMandate, UniversalMandateUpdateData } from "@/types/rules";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mandate: UniversalMandate | null;
  onSave: (data: UniversalMandateUpdateData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const EditUniversalMandateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mandate,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<UniversalMandateUpdateData>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (mandate) {
      setFormData({
        title: mandate.title,
        content: mandate.content,
        priority: mandate.priority,
        is_active: mandate.is_active,
        category: mandate.category ?? undefined,
      });
    }
  }, [mandate]);

  const handleSave = async () => {
    if (!mandate) return;
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <EditModalBase
      isOpen={isOpen}
      onClose={onClose}
      entityName="Mandate"
      entityData={mandate}
      entityDisplayField="title"
      onSave={handleSave}
      onDelete={onDelete ? handleDelete : undefined}
      isLoadingSave={saving}
      isLoadingDelete={deleting}
    >
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Content</FormLabel>
          <Textarea
            value={formData.content || ""}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>Priority</FormLabel>
          <NumberInput
            min={1}
            max={10}
            value={formData.priority ?? 5}
            onChange={(val) =>
              setFormData({
                ...formData,
                priority: parseInt(val, 10) || 0,
              })
            }
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <Switch
            id="is_active"
            isChecked={formData.is_active ?? true}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            mr={2}
          />
          <FormLabel htmlFor="is_active" mb="0">
            Active
          </FormLabel>
        </FormControl>
      </VStack>
    </EditModalBase>
  );
};

export default EditUniversalMandateModal;
