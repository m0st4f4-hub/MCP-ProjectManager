'use client';

import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Button,
    useToast,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { formatDisplayName } from '@/lib/utils';
import styles from './Modals.module.css'; // Using shared modal styles

interface CliPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    cliPromptText: string;
    agentName: string;
}

const CliPromptModal: React.FC<CliPromptModalProps> = ({ isOpen, onClose, cliPromptText, agentName }) => {
    const toast = useToast();

    const handleCopyPrompt = async () => {
        if (cliPromptText) {
            try {
                await navigator.clipboard.writeText(cliPromptText);
                toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
            } catch {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: '2xl' }}>
            <ModalOverlay />
            <ModalContent className={styles.modalContent}>
                <ModalHeader className={`${styles.modalHeader} ${styles.cliModalHeader}`}>
                    CLI Prompt for {formatDisplayName(agentName)}
                </ModalHeader>
                <ModalCloseButton className={styles.modalCloseButton} />
                <ModalBody className={`${styles.modalBody} ${styles.cliModalBody}`}>
                    {cliPromptText}
                </ModalBody>
                <ModalFooter className={styles.modalFooter}>
                    <Button 
                        onClick={handleCopyPrompt} 
                        leftIcon={<CopyIcon />} 
                        className={styles.copyPromptButton}
                    >
                        Copy Prompt
                    </Button>
                    <Button 
                        onClick={onClose}
                        className={styles.actionButton} // You might want a specific style or use Chakra's default
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CliPromptModal; 