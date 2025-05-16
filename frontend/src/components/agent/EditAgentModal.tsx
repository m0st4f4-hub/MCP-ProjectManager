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
import EditAgentForm from '../forms/EditAgentForm'; // Adjusted path
import { Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import styles from './Modals.module.css'; 

interface EditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (agentId: string, newName: string) => Promise<void>;
    agent: Agent | null;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, onClose, onSubmit, agent }) => {
    if (!agent) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: 'full', md: 'xl' }}>
            <ModalOverlay />
            <ModalContent className={styles.modalContent}>
                <ModalHeader className={styles.modalHeader}>
                    Edit Agent: {formatDisplayName(agent.name)}
                </ModalHeader>
                <ModalCloseButton className={styles.modalCloseButton} />
                <ModalBody className={styles.modalBody}>
                    <EditAgentForm 
                        agent={agent} 
                        onSubmit={onSubmit} 
                        onClose={onClose} 
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default EditAgentModal; 