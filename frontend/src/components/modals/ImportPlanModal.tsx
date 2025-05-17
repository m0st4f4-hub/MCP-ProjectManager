import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Textarea,
  Button,
  Box,
  Text,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { sizing, typography } from "../../tokens"; // Added sizing and typography

const AI_REVISION_PROMPT = `Based on our preceding discussion detailing the project plan, please convert that plan into the following JSON format. This JSON will be used to import the project and its tasks into my task manager.\\n\\nThe JSON structure MUST be as follows:\\n\\n{\\n  \"projectName\": \"STRING - The name of the project (required)\",\\n  \"projectDescription\": \"STRING - A brief description of the project (optional)\",\\n  \"projectAgentName\": \"STRING - The name of a default agent for all tasks in this project (optional)\",\\n  \"tasks\": [\\n    {\\n      \"title\": \"STRING - The title of the task (required)\",\\n      \"description\": \"STRING - A description for the task (optional)\",\\n      \"agentName\": \"STRING - The name of a specific agent for this task (optional, overrides projectAgentName if provided for this task)\",\\n      \"completed\": BOOLEAN - Whether the task is completed (optional, defaults to false, true/false)\\n    }\\n    // ... more tasks can be added to the array\\n  ]\\n}\\n\\nPlease provide ONLY the JSON output derived from our preceding conversation. Ensure all string values are correctly quoted and boolean values for \'completed\' are strictly \`true\` or \`false\` (not strings).`;

interface ImportedPlanTask {
  title: string;
  description?: string;
  agentName?: string;
  completed?: boolean;
}

interface ImportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void; // Callback to refresh data in page.tsx
}

export const ImportPlanModal: React.FC<ImportPlanModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonPasteContent, setJsonPasteContent] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const toast = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus("Starting import...");
    try {
      JSON.parse(jsonPasteContent); // Removed assignment to unused 'plan'
      // ... (actual import logic would go here)
      setImportStatus("Import placeholder: processing completed.");
      toast({
        title: "Import (Placeholder)",
        description: "Plan processed (no actual data imported in this placeholder).",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      onImportSuccess(); // Call success callback
      // onClose(); // Optionally close modal on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error during import.";
      setImportStatus(`Error during import: ${errorMessage}`);
      toast({
        title: "Import Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" bg="overlayDefault" />
      <ModalContent
        bg="bgModal"
        color="onSurface"
        borderColor="borderDecorative"
        borderWidth={sizing.borderWidth.DEFAULT}
        overflow="hidden" // Ensures child borderRadius is respected
      >
        <ModalHeader
          borderBottomWidth={sizing.borderWidth.DEFAULT}
          borderColor="borderDecorative"
          fontSize={typography.fontSize.lg} // Use token
          fontWeight={typography.fontWeight.semibold} // Use token
        >
          Import Project Plan from JSON
        </ModalHeader>
        <ModalCloseButton
          color="iconPrimary"
          _hover={{ bg: "interactiveNeutralHover", color: "iconAccent" }}
          _active={{ bg: "interactiveNeutralActive" }}
          top="12px" // Adjust for better alignment with header padding
          right="12px"
        />
        <ModalBody pt={6} pb={6}>
          <Text mb={sizing.spacing[2]} fontSize={typography.fontSize.sm} color="textSecondary">
            Paste the JSON content of the project plan below:
          </Text>
          <Textarea
            placeholder="Paste JSON here..."
            value={jsonPasteContent}
            onChange={(e) => setJsonPasteContent(e.target.value)}
            minHeight="200px"
            mb={sizing.spacing[4]}
            bg="bgInput"
            color="textInput"
            borderColor="borderInteractive"
            borderRadius={sizing.borderRadius.md}
            fontSize={typography.fontSize.sm}
            _placeholder={{ color: "textPlaceholder" }}
            _hover={{ borderColor: "borderHover" }}
            _focus={{
              borderColor: "borderFocused",
              boxShadow: `0 0 0 1px ${// Accessing colorPrimitives directly for boxShadow is okay if semantic token not available
                typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--chakra-colors-blue-500').trim() : 'blue.500'
              }`,
            }}
          />
          <Button
            onClick={handleImport}
            isLoading={isImporting}
            mb={sizing.spacing[4]}
            w="full"
            bg="interactivePrimary"
            color="onInteractivePrimary"
            _hover={{ bg: "interactivePrimaryHover" }}
            _active={{ bg: "interactivePrimaryActive" }}
            fontSize={typography.fontSize.sm}
            fontWeight={typography.fontWeight.medium}
            h={sizing.height.md}
          >
            Import Plan
          </Button>
          {importStatus && (
            <Box 
              p={sizing.spacing[3]}
              borderWidth={sizing.borderWidth.DEFAULT} 
              borderRadius={sizing.borderRadius.md} 
              bg={importStatus.startsWith("Error") ? "statusErrorBgSubtle" : "statusSuccessBgSubtle"}
              borderColor={importStatus.startsWith("Error") ? "statusErrorBorder" : "statusSuccessBorder"}
              mb={sizing.spacing[4]}
            >
              <Text 
                fontSize={typography.fontSize.sm} 
                color={importStatus.startsWith("Error") ? "textStatusError" : "textStatusSuccess"}
              >
                {importStatus}
              </Text>
            </Box>
          )}
          <Button
            mt={sizing.spacing[4]}
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(AI_REVISION_PROMPT)}
            rightIcon={<CopyIcon />}
            color="textLink"
            _hover={{ color: "textLinkHover", bg: "interactiveNeutralHover"}}
            _active={{ color: "textLinkActive", bg: "interactiveNeutralActive"}}
            fontSize={typography.fontSize.sm}
            fontWeight={typography.fontWeight.medium}
          >
            Copy AI Revision Prompt for JSON Format
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Removed export default if it's not the main export or if causing issues with named export
// export default ImportPlanModal; // If it was like this, ensure it's consistent

 