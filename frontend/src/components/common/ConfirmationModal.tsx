import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useColorModeValue,
} from '@chakra-ui/react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    bodyText?: string; // Optional body text
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColorScheme?: string;
    isLoading?: boolean; // To show loading state on confirm button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    bodyText,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    confirmButtonColorScheme = 'red',
    isLoading = false,
}) => {
    const modalBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent bg={modalBg}>
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody className={styles.modalBody}>
                    {bodyText && <p className={styles.bodyText}>{bodyText}</p>}
                    {!bodyText && <p className={styles.bodyText}>Are you sure you want to proceed with this action?</p>}
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                    <Button variant="ghost" onClick={onClose} mr={3} isDisabled={isLoading}>
                        {cancelButtonText}
                    </Button>
                    <Button 
                        colorScheme={confirmButtonColorScheme} 
                        onClick={onConfirm} 
                        isLoading={isLoading}
                    >
                        {confirmButtonText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmationModal; 