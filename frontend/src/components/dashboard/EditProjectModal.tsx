'use client';

import React, { useEffect } from 'react';
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
import { ProjectUpdateData, ProjectWithTasks } from '@/types';
import { updateProject } from '@/services/api';
import { useProjectStore } from '@/store/projectStore';
import styles from './EditProjectModal.module.css'; // To be created

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectData: ProjectWithTasks; // Used to pre-fill the form and for the update call
}

interface ProjectFormData {
    name: string;
    description?: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, projectData }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>();
    const toast = useToast();
    const fetchProjects = useProjectStore(state => state.fetchProjects);

    useEffect(() => {
        if (projectData) {
            setValue('name', projectData.name);
            setValue('description', projectData.description || '');
        }
    }, [projectData, setValue]);

    const onSubmitHandler: SubmitHandler<ProjectFormData> = async (data) => {
        const projectUpdatePayload: ProjectUpdateData = {
            name: data.name,
            description: data.description || null, // Send null if empty to clear it
        };
        try {
            await updateProject(projectData.id, projectUpdatePayload);
            toast({
                title: 'Project updated',
                description: `Project "${data.name}" has been successfully updated.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            fetchProjects(); // Refresh the project list
            onClose(); // Close modal after successful submission
        } catch (error) {
            console.error('Failed to update project:', error);
            toast({
                title: 'Error updating project',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };
    
    // Reset form when modal is closed or projectData changes (to ensure clean state for next open)
    useEffect(() => {
        if (!isOpen) {
            reset({ name: '', description: '' });
        }
    }, [isOpen, reset]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(3px)" />
            <ModalContent className={styles.modalContent}>
                <ModalHeader className={styles.modalHeader}>
                    Edit Project: {projectData.name}
                </ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <ModalBody className={styles.modalBody}>
                        <div className={styles.formField}>
                            <label htmlFor={`editProjectName-${projectData.id}`} className={styles.formLabel}>Project Name</label>
                            <input
                                id={`editProjectName-${projectData.id}`}
                                {...register('name', { required: 'Project name is required' })}
                                className={styles.formInput}
                                placeholder="Enter project name"
                                aria-invalid={errors.name ? "true" : "false"}
                            />
                            {errors.name && <p className={styles.formError}>{errors.name.message}</p>}
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor={`editProjectDescription-${projectData.id}`} className={styles.formLabel}>Description (Optional)</label>
                            <textarea
                                id={`editProjectDescription-${projectData.id}`}
                                {...register('description')}
                                className={styles.formTextarea}
                                placeholder="Enter a brief description of the project"
                                rows={4}
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter className={styles.modalFooter}>
                        <Button 
                            variant="ghost" 
                            onClick={onClose} 
                            className={styles.cancelButton}
                            mr={3}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className={styles.submitButton}
                        >
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default EditProjectModal; 