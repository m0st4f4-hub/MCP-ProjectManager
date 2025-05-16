'use client';

import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import AddAgentForm from '../forms/AddAgentForm'; // Adjusted path
import styles from './Modals.module.css'; // We'll create this CSS module later

interface AddAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose, onSubmit }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'xl' }}>
            <ModalOverlay />
            <ModalContent className={styles.modalContent}>
                <ModalHeader className={styles.modalHeader}>
                    Register New Agent
                </ModalHeader>
                <ModalCloseButton className={styles.modalCloseButton} />
                <ModalBody className={styles.modalBody}>
                    <AddAgentForm 
                        onSubmit={onSubmit} 
                        onClose={onClose} 
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AddAgentModal; 