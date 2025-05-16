'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
} from '@chakra-ui/react';
import { ProjectCreateData } from '@/types';
import { createProject } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import styles from './CreateProjectModal.module.css'; // To be created
// import commonFormStyles from '@/components/forms/CommonFormStyles.module.css'; // If we have one

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onSubmit will be handled internally by calling createProject and then fetchProjects
}

interface ProjectFormData {
    name: string;
    description?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>();
    const toast = useToast();
    const fetchProjects = useProjectStore(state => state.fetchProjects);

    const onSubmitHandler: SubmitHandler<ProjectFormData> = async (data) => {
        const projectData: ProjectCreateData = {
            name: data.name,
            description: data.description || undefined,
        };
        try {
            await createProject(projectData);
            toast({
                title: 'Project created',
                description: `Project "${data.name}" has been successfully created.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            fetchProjects(); // Refresh the project list
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create project:', error);
            toast({
                title: 'Error creating project',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(3px)" />
            <ModalContent 
                // bg="bg.modal" -- Will be handled by shared modal styles or theme
                // color="text.primary" 
                // borderColor="border.modal" 
                // borderWidth="1px"
                className={styles.modalContent} // For overall modal specific styles
            >
                <ModalHeader 
                    // color="text.heading"
                    // borderBottomWidth="1px"
                    // borderColor="border.divider"
                    className={styles.modalHeader}
                >
                    Create New Project
                </ModalHeader>
                <ModalCloseButton 
                    // color="text.secondary" 
                    // _hover={{ bg: "button.hover.secondary", color: "text.primary" }} 
                />
                <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <ModalBody 
                        // pb={6} pt={3} 
                        className={styles.modalBody}
                    >
                        <div className={styles.formField}>
                            <label htmlFor="projectName" className={styles.formLabel}>Project Name</label>
                            <input
                                id="projectName"
                                {...register('name', { required: 'Project name is required' })}
                                className={styles.formInput}
                                placeholder="Enter project name"
                                aria-invalid={errors.name ? "true" : "false"}
                            />
                            {errors.name && <p className={styles.formError}>{errors.name.message}</p>}
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="projectDescription" className={styles.formLabel}>Description (Optional)</label>
                            <textarea
                                id="projectDescription"
                                {...register('description')}
                                className={styles.formTextarea}
                                placeholder="Enter a brief description of the project"
                                rows={4}
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter 
                        // borderTopWidth="1px" 
                        // borderColor="border.divider" 
                        className={styles.modalFooter}
                    >
                        <Button 
                            variant="ghost" 
                            onClick={handleClose} 
                            // color="text.secondary" 
                            // _hover={{bg: "button.hover.secondarySubtle"}}
                            className={styles.cancelButton}
                            mr={3}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            // bg="button.primary.default"
                            // color="text.button.primary"
                            // _hover={{ bg: "button.primary.hover" }}
                            // _active={{bg: "button.primary.active"}}
                            className={styles.submitButton}
                        >
                            Create Project
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default CreateProjectModal; 