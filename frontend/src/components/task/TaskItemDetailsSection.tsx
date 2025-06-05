import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { DeleteIcon } from '@chakra-ui/icons';
import { parseDate } from '@/utils/date';
import TaskStatusTag from "../common/TaskStatusTag";
import TaskProjectTag from "../common/TaskProjectTag";
import TaskAgentTag from "../TaskAgentTag";
import TaskDependencyTag from "../common/TaskDependencyTag";
import { IconMap } from "../common/iconMap";
import {
  Task,
  TaskFileAssociation,
  TaskDependency,
  TaskDependencyCreateData,
} from "@/types/task"; // Assuming Task is ITask or similar, adding new types
import type { Comment } from "@/types/comment";
import { StatusID, StatusAttributeObject } from "@/lib/statusUtils";
import {
  getFilesAssociatedWithTask,
  getTaskPredecessors,
  getTaskSuccessors,
  associateFileWithTask,
  disassociateFileFromTask,
  addTaskDependency,
  removeTaskDependency,
  getTaskComments,
  addTaskComment,
} from "@/services/api/tasks"; // Import new API functions

/**
 * @interface TaskItemDetailsSectionProps
 * @description Props for the TaskItemDetailsSection component.
 * This section is responsible for displaying tags related to a task,
 * such as its status, project, and assigned agent.
 */
interface TaskItemDetailsSectionProps {
  /** The main task object, used here to access agent information. */
  task: Task;
  /** Optional: The name of the project this task belongs to. */
  projectName?: string;
  /** Style object, typically from a custom hook like useTaskItemStyles. */
  styles: Record<string, unknown>; // Consider a more specific type
  /** Optional: Icon mapping used by `TaskStatusTag` for status icons. */
  iconMap?: IconMap;
  /** The current status ID of the task, used by TaskStatusTag. */
  currentStatusId: StatusID;
  /** If true, applies specific styling adjustments, like reduced margin-top. */
  compact?: boolean;
}

/**
 * @module TaskItemDetailsSection
 * @description
 * Renders a section within a TaskItem that displays key details as tags,
 * such as the task's status, associated project, and assigned agent,
 * plus associated files and dependencies fetched from dedicated endpoints.
 *
 * @example
 * <TaskItemDetailsSection
 *   task={currentTask}
 *   projectName="Galaxy Quest"
 *   statusInfo={currentStatusInfoObject}
 *   styles={taskStylingObject}
 *   iconMap={statusIconMapping}
 *   currentStatusId="IN_PROGRESS"
 *   compact={false}
 * />
 */
const TaskItemDetailsSection: React.FC<Omit<TaskItemDetailsSectionProps, 'statusInfo'>> = ({
  task, // The task object
  projectName, // Name of the project
  styles, // Style object from parent
  iconMap, // Icon mapping for status tags
  currentStatusId, // Current status ID for the status tag
  compact, // Compact mode flag
}) => {
  const [fileAssociations, setFileAssociations] = useState<TaskFileAssociation[]>([]);
  const [predecessors, setPredecessors] = useState<TaskDependency[]>([]);
  const [successors, setSuccessors] = useState<TaskDependency[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]); // State for comments

  // State for File Associations pagination, sorting, and filtering
  const [filePage, setFilePage] = useState(0);
  const [fileLimit, setFileLimit] = useState(10);
  const [fileSortBy, setFileSortBy] = useState<string | undefined>(undefined);
  const [fileSortDirection, setFileSortDirection] = useState<string | undefined>(undefined);
  const [fileFilterFilename, setFileFilterFilename] = useState<string | undefined>(undefined);

  const { isOpen: isFileModalOpen, onOpen: onFileModalOpen, onClose: onFileModalClose } = useDisclosure();
  const [fileIdInput, setFileIdInput] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [addFileError, setAddFileError] = useState<string | null>(null);

  const { isOpen: isDependencyModalOpen, onOpen: onDependencyModalOpen, onClose: onDependencyModalClose } = useDisclosure();
  const [dependentProjectInput, setDependentProjectInput] = useState("");
  const [dependentTaskInput, setDependentTaskInput] = useState("");
  const [dependencyTypeInput, setDependencyTypeInput] = useState("");
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [addDependencyError, setAddDependencyError] = useState<string | null>(null);

  // State for adding new comment
  const [newCommentText, setNewCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [addCommentError, setAddCommentError] = useState<string | null>(null);

  const fetchTaskDetails = async () => {
    setIsLoadingDetails(true);
    setDetailsError(null);
    try {
      // Fetch file associations with pagination, sorting, and filtering
      const files = await getFilesAssociatedWithTask(
        task.project_id,
        task.task_number,
        filePage * fileLimit, // calculate skip
        fileLimit,
        fileSortBy,
        fileSortDirection,
        fileFilterFilename
      );
      setFileAssociations(files);

      // Fetch task predecessors
      const preds = await getTaskPredecessors(task.project_id, task.task_number);
      setPredecessors(preds);

      // Fetch task successors
      const succs = await getTaskSuccessors(task.project_id, task.task_number);
      setSuccessors(succs);

      // Fetch comments
      const taskComments = await getTaskComments(task.project_id, task.task_number);
      setComments(taskComments);

    } catch (err: any) {
      console.error("Failed to fetch task details:", err);
      setDetailsError(
        err.message || "An error occurred while fetching task details."
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (task.project_id && task.task_number !== undefined) {
      fetchTaskDetails();
    }
  }, [task.project_id, task.task_number]); // Re-fetch if task changes

  const handleAssociateFile = async () => {
    if (!fileIdInput) return;

    setIsAddingFile(true);
    setAddFileError(null);

    try {
      await associateFileWithTask(
        task.project_id,
        task.task_number,
        { file_id: fileIdInput }
      );
      fetchTaskDetails();
      setFileIdInput("");
      onFileModalClose();
    } catch (err: any) {
      console.error("Failed to associate file:", err);
      setAddFileError(err.message || "An error occurred while associating file.");
    } finally {
      setIsAddingFile(false);
    }
  };

  const handleDisassociateFile = async (fileId: string) => {
    if (!window.confirm(`Are you sure you want to disassociate file ${fileId} from task ${task.task_number}?`)) {
      return;
    }

    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      await disassociateFileFromTask(task.project_id, task.task_number, fileId);
      // After disassociating, re-fetch file associations with current pagination/sorting/filtering
      fetchTaskDetails(); // This will refetch all details, including files with current settings
    } catch (err: any) {
      console.error("Failed to disassociate file:", err);
      setDetailsError(err.message || "An error occurred while disassociating file.");
      setIsLoadingDetails(false);
    }
  };

  const handleAddDependency = async () => {
    if (!dependentProjectInput || !dependentTaskInput || !dependencyTypeInput) {
      setAddDependencyError("All dependency fields are required.");
      return;
    }

    setIsAddingDependency(true);
    setAddDependencyError(null);

    try {
      const dependencyData: TaskDependencyCreateData = {
        dependent_task_project_id: task.project_id,
        dependent_task_number: task.task_number,
        depends_on_task_project_id: dependentProjectInput,
        depends_on_task_number: parseInt(dependentTaskInput, 10),
        dependency_type: dependencyTypeInput,
      };

      await addTaskDependency(
        task.project_id,
        task.task_number,
        dependencyData
      );
      // After adding, re-fetch task details
      fetchTaskDetails();
      setDependentProjectInput("");
      setDependentTaskInput("");
      setDependencyTypeInput("");
      onDependencyModalClose();
    } catch (err: any) {
      console.error("Failed to add dependency:", err);
      setAddDependencyError(err.message || "An error occurred while adding dependency.");
    } finally {
      setIsAddingDependency(false);
    }
  };

  const handleRemoveDependency = async (dependency: TaskDependency) => {
    if (!window.confirm("Are you sure you want to remove this dependency?")) {
      return;
    }

    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      await removeTaskDependency(
        dependency.dependent_task_project_id,
        dependency.dependent_task_number,
        dependency.depends_on_task_project_id,
        dependency.depends_on_task_number
      );
      // After removing, re-fetch task details
      fetchTaskDetails();
    } catch (err: any) {
      console.error("Failed to remove dependency:", err);
      setDetailsError(err.message || "An error occurred while removing dependency.");
      setIsLoadingDetails(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      setAddCommentError("Comment cannot be empty.");
      return;
    }

    setIsAddingComment(true);
    setAddCommentError(null);

    try {
      await addTaskComment(task.project_id, task.task_number, { content: newCommentText });
      setNewCommentText("");
      fetchTaskDetails(); // Refetch comments after adding a new one
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      setAddCommentError(err.message || "An error occurred while adding the comment.");
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <VStack spacing={compact ? 1 : 2} align="stretch">
      {/* Existing Tags Section */}
      <HStack
        gap="spacing.1"
        mt={compact ? "spacing.1" : "spacing.2"}
        flexWrap="wrap"
      >
    {/* Displays the current status of the task as a tag. */}
    <TaskStatusTag
      statusId={currentStatusId} // The actual status ID to display
      fontWeight={(styles.statusTagStyle as { fontWeight?: string | number })?.fontWeight}
      fontSize={styles.tagFontSize as string | number | undefined}
      iconMap={iconMap || {}} // Pass iconMap for status-specific icons
      // Safely access background and color from styles, providing fallbacks
      bg={(styles.statusTagColors as { bg: string; color: string } | undefined)?.bg || ''}
      color={(styles.statusTagColors as { bg: string; color: string } | undefined)?.color || ''}
    />

    {/* Conditionally render the project tag if projectName is provided. */}
    {projectName && (
      <TaskProjectTag
        projectName={projectName}
        // Safely access project tag styles, providing a default object structure
            projectTagStyle={
              (styles.projectTagStyle as {
                bg: string;
                color: string;
                fontWeight: string | number;
              }) || { bg: '', color: '', fontWeight: 'normal' }
            }
        fontSize={styles.tagFontSize as string | number}
        style={styles.projectTagStyle as React.CSSProperties} // Pass general style object as well
      />
    )}

    {/* Conditionally render the agent tag if agent_name or agent_id is present on the task. */}
    {((task.agent_name || task.agent_id) && (
      <TaskAgentTag
        agentName={(task.agent_name || task.agent_id) ?? ""}
        tagBg={(styles.agentTagStyle as { bg: string }).bg}
        tagColor={(styles.agentTagStyle as { color: string }).color}
        fontWeight={(styles.agentTagStyle as { fontWeight: string | number }).fontWeight}
      />
    ))}
  </HStack>

      {/* Display Loading/Error state for fetched details */}
      {isLoadingDetails && (
        <Box>
          <Spinner size="sm" mr={2} />
          <Text display="inline">Loading task details...</Text>
        </Box>
      )}

      {detailsError && (
        <Box borderWidth={1} borderRadius={8} boxShadow="lg" p={2}>
          <Text color="red.500" fontSize="sm">Error fetching details: {detailsError}</Text>
        </Box>
      )}

      {/* Display File Associations */}
      {!isLoadingDetails && !detailsError && fileAssociations.length > 0 && (
        <Box>
          <HStack justifyContent="space-between">
            <Heading as="h4" size="sm" mt={2}>Associated Files:</Heading>
            <Button size="xs" onClick={onFileModalOpen}>Add File</Button>
          </HStack>
          {fileAssociations.length === 0 ? (
            <Text fontSize="sm" mt={1}>No files associated.</Text>
          ) : (
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>File ID</Th>
                    {/* Add sort controls here later */}
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {fileAssociations.map((assoc) => (
                    <Tr key={assoc.file_id}>
                      <Td>{assoc.file_id}</Td>
                      <Td>
                        <IconButton
                          aria-label={`Disassociate file ${assoc.file_id}`}
                          icon={<DeleteIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDisassociateFile(assoc.file_id)}
                          isLoading={isLoadingDetails}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Display Dependencies (Predecessors) */}
      {!isLoadingDetails && !detailsError && (predecessors.length > 0 || successors.length > 0) && (
        <Box>
          <HStack justifyContent="space-between">
            <Heading as="h4" size="sm" mt={2}>Dependencies / Blocking Tasks:</Heading>
            <Button size="xs" onClick={onDependencyModalOpen}>Add Dependency</Button>
          </HStack>

          {/* Display Predecessors */}
          {predecessors.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" mt={1}>Depends On:</Text>
              <VStack align="stretch" spacing={1} mt={1}>
                {predecessors.map((dependency, index) => (
                  <HStack key={`pred-${index}`} justifyContent="space-between">
                    <TaskDependencyTag 
                      dependency={{
                        project_id: dependency.depends_on_task_project_id,
                        task_number: dependency.depends_on_task_number,
                      }}
                    />
                    <IconButton
                      aria-label={`Remove dependency on task ${dependency.depends_on_task_project_id}/${dependency.depends_on_task_number}`}
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveDependency(dependency)}
                      isLoading={isLoadingDetails}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Display Successors */}
          {successors.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="bold" mt={predecessors.length > 0 ? 2 : 1}>Blocking Tasks:</Text>
              <VStack align="stretch" spacing={1} mt={1}>
                {successors.map((dependency, index) => (
                  <HStack key={`succ-${index}`} justifyContent="space-between">
                    <TaskDependencyTag 
                      dependency={{
                        project_id: dependency.dependent_task_project_id,
                        task_number: dependency.dependent_task_number,
                      }}
                      isSuccessor={true}
                    />
                    <IconButton
                      aria-label={`Remove dependency blocking task ${dependency.dependent_task_project_id}/${dependency.dependent_task_number}`}
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveDependency(dependency)}
                      isLoading={isLoadingDetails}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Display message if no dependencies and not loading/error */}
          {predecessors.length === 0 && successors.length === 0 && (
            <Text fontSize="sm" mt={1}>No dependencies or blocking tasks.</Text>
          )}
        </Box>
      )}

      {/* Display Comments */}
      {!isLoadingDetails && !detailsError && (
         <Box>
           <Heading as="h4" size="sm" mt={2}>Comments:</Heading>
           {comments.length === 0 ? (
             <Text fontSize="sm" mt={1}>No comments yet.</Text>
           ) : (
             <VStack align="stretch" spacing={3} mt={2}>
               {comments.map((comment) => (
                 <Box key={comment.id} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                   <Text fontSize="sm" mb={1}><strong>{comment.user_id || "Unknown User"}:</strong> {comment.content}</Text>
                   <Text fontSize="xs" color="gray.500">{parseDate(comment.created_at).toLocaleString()}</Text>
                 </Box>
               ))}
             </VStack>
           )}

           {/* Add New Comment Form */}
           <VStack align="stretch" spacing={2} mt={4}>
             <Heading as="h5" size="sm">Add a Comment</Heading>
             <FormControl>
               <Textarea
                 placeholder="Write a comment..."
                 value={newCommentText}
                 onChange={(e) => setNewCommentText(e.target.value)}
                 size="sm"
               />
             </FormControl>
             <Button
               colorScheme="blue"
               size="sm"
               onClick={handleAddComment}
               isLoading={isAddingComment}
               alignSelf="flex-end"
             >
               Post Comment
             </Button>
             {addCommentError && <Text color="red.500" fontSize="sm">{addCommentError}</Text>}
           </VStack>
         </Box>
      )}

      {/* Modal for associating a file */}
      <Modal isOpen={isFileModalOpen} onClose={onFileModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Associate File with Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="file-id-input">
                <FormLabel>File ID</FormLabel>
                <Input
                  type="text"
                  value={fileIdInput}
                  onChange={(e) => setFileIdInput(e.target.value)}
                  placeholder="Enter File ID"
                />
              </FormControl>
              {addFileError && <Text color="red.500">{addFileError}</Text>}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFileModalClose} isDisabled={isAddingFile}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAssociateFile} isLoading={isAddingFile}>
              Associate File
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for adding a dependency */}
      <Modal isOpen={isDependencyModalOpen} onClose={onDependencyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Task Dependency</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>This task ({task.project_id}/{task.task_number}) will depend on another task.</Text>
              <FormControl id="dependent-project-input">
                <FormLabel>Depends On - Project ID</FormLabel>
                <Input
                  type="text"
                  value={dependentProjectInput}
                  onChange={(e) => setDependentProjectInput(e.target.value)}
                  placeholder="Enter Project ID"
                />
              </FormControl>
              <FormControl id="dependent-task-input">
                <FormLabel>Depends On - Task Number</FormLabel>
                <Input
                  type="number"
                  value={dependentTaskInput}
                  onChange={(e) => setDependentTaskInput(e.target.value)}
                  placeholder="Enter Task Number"
                />
              </FormControl>
              <FormControl id="dependency-type-input">
                <FormLabel>Dependency Type</FormLabel>
                <Select
                  placeholder="Select dependency type"
                  value={dependencyTypeInput}
                  onChange={(e) => setDependencyTypeInput(e.target.value)}
                >
                  <option value="finishes_before_starts">Finishes Before Starts</option>
                </Select>
              </FormControl>
              {addDependencyError && <Text color="red.500">{addDependencyError}</Text>}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDependencyModalClose} isDisabled={isAddingDependency}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddDependency} isLoading={isAddingDependency}>
              Add Dependency
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TaskItemDetailsSection;