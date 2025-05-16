'use client';

import React, { useState } from 'react';
import {
    Button,
    FormControl,
    Input,
    useToast,
} from '@chakra-ui/react';
import styles from './AddAgentForm.module.css';

interface AddAgentFormProps {
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>; // Parent (AgentList) provides this
    initialData?: { name: string }; // Made initialData optional
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onClose, onSubmit, initialData }) => {
    const [name, setName] = useState(initialData?.name || ''); // Ensure initialData.name is optional
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({
                title: 'Agent name cannot be empty.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setIsLoading(true);
        try {
            await onSubmit(name.trim()); 
            onClose(); 
        } catch (error) {
            toast({
                title: 'Error registering agent',
                description: error instanceof Error ? error.message : 'Could not register agent.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={styles.addAgentFormContainer}
        >
            <div className={styles.formVStack}>
                <FormControl isRequired>
                    <label htmlFor="newAgentName" className={styles.formLabel}>Agent Name</label>
                    <Input
                        id="newAgentName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter unique agent name"
                        className={styles.formInput}
                    />
                </FormControl>

                <Button
                    type="submit"
                    className={styles.submitButton}
                    isLoading={isLoading}
                >
                    Register Agent
                </Button>
            </div>
        </form>
    );
};

export default AddAgentForm; 