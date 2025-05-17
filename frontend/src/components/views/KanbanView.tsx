import React, { useRef, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  useToken,
  Spinner,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import TaskItem from "../TaskItem"; // Assuming TaskItem can be used here
import { Task } from "@/types"; // Removed StatusID, KanbanColumns
import { useTaskStore, TaskState } from "@/store/taskStore"; // Added TaskState import
import { motion } from "framer-motion"; // AnimatePresence is unused
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils"; // Added StatusID here
import { mapStatusToStatusID } from "@/lib/utils"; // Import the new utility function
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable"; // Will be used for individual items
import { CSS } from "@dnd-kit/utilities"; // For styling draggable items
import { sizing, colorPrimitives } from "../../tokens"; // Added sizing and colorPrimitives

// Define the set of statuses that will actually be rendered as columns
const KANBAN_COLUMN_RENDER_IDS: readonly StatusID[] = [
  "TO_DO",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
];
// Type for a single Kanban column object
interface KanbanColumn {
  id: (typeof KANBAN_COLUMN_RENDER_IDS)[number]; // ID must be one of the renderable statuses
  title: string;
  tasks: Task[];
}

// The KanbanColumns type is now a record using only the statuses we intend to render
export type KanbanColumns = Record<
  (typeof KANBAN_COLUMN_RENDER_IDS)[number],
  KanbanColumn
>;

interface KanbanViewProps {
  filteredTasks: Task[];
  // onOpenModal: (task: Task | null, parentId?: string | null) => void; // If needed for column-level add
  compactView?: boolean; // Derived from isCompact in original TaskList
}

const KanbanView: React.FC<KanbanViewProps> = ({
  filteredTasks,
  // onOpenModal,
  compactView = false,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // Split into individual selectors to ensure re-renders only when specific primitives change
  const isPolling = useTaskStore((state: TaskState) => state.isPolling);
  const pollingError = useTaskStore((state: TaskState) => state.pollingError);
  const clearPollingError = useTaskStore(
    (state: TaskState) => state.clearPollingError,
  );
  const updateTask = useTaskStore((state: TaskState) => state.updateTask);
  const deleteTaskFromStore = useTaskStore(
    (state: TaskState) => state.deleteTask,
  );

  const toast = useToast();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null); // For DND
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  // Use semantic tokens that are expected to be in chakra-theme.ts and mapped from TypeScript token files
  const cardBg = useToken("colors", "surface");
  const cardBorderPrimary = useToken("colors", "borderDecorative");
  const defaultThemeBg = useToken("colors", "background"); // Changed from bgCanvas
  const columnHeaderBg = useToken("colors", "surfaceElevated");
  const columnBg = useToken("colors", "surface");

  React.useEffect(() => {
    if (pollingError) {
      toast({
        title: "Error polling tasks",
        description: pollingError,
        status: "error",
        duration: 5000,
        isClosable: true,
        onCloseComplete: clearPollingError,
      });
    }
  }, [pollingError, toast, clearPollingError]);

  // Log received filteredTasks
  // useEffect(() => { // REMOVE
  //     if (typeof console !== 'undefined') {
  //         console.log('[KanbanView.tsx] Received filteredTasks:', filteredTasks.length, filteredTasks);
  //     }
  // }, [filteredTasks]);

  const kanbanColumns = useMemo(() => {
    // Initialize columns based on KANBAN_COLUMN_RENDER_IDS
    const columns = {} as KanbanColumns; // Assert type here

    KANBAN_COLUMN_RENDER_IDS.forEach((id) => {
      const displayableStatus = getDisplayableStatus(id);
      columns[id] = {
        id: id,
        title:
          displayableStatus?.displayName ||
          id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), // Fallback title formatting
        tasks: [],
      };
    });

    filteredTasks.forEach((task) => {
      const statusID = mapStatusToStatusID(task.status);
      // Only add tasks to columns that are defined in KANBAN_COLUMN_RENDER_IDS
      if (columns[statusID as (typeof KANBAN_COLUMN_RENDER_IDS)[number]]) {
        // Type assertion for safety
        columns[
          statusID as (typeof KANBAN_COLUMN_RENDER_IDS)[number]
        ].tasks.push(task);
      } else {
        // Optional: Log tasks that don't map to a visible column, or handle them differently
        // console.warn(`Task ${task.id} with status ${statusID} does not map to a visible Kanban column.`);
      }
    });
    return columns;
  }, [filteredTasks]);

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return filteredTasks.find((task) => task.id === activeId);
  }, [activeId, filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log("[KanbanView.tsx] handleDragEnd event:", event);
    console.log("[KanbanView.tsx] Active item:", active);
    console.log("[KanbanView.tsx] Over item/container:", over);

    if (over && active.id !== over.id) {
      const sourceTask = filteredTasks.find(
        (t) => t.id === (active.id as string),
      );
      if (!sourceTask) {
        console.error("[KanbanView.tsx] Dragged task not found:", active.id);
        return;
      }

      const targetColumnId =
        over.data?.current?.sortable?.containerId || over.id;
      console.log(
        `[KanbanView.tsx] Drag End: Task ID: ${active.id}, Original Status: ${sourceTask.status}, Target Column ID Attempt: ${targetColumnId}`,
      );

      const isValidStatusId = KANBAN_COLUMN_RENDER_IDS.includes(
        targetColumnId as (typeof KANBAN_COLUMN_RENDER_IDS)[number],
      );
      console.log(
        `[KanbanView.tsx] Is target a valid column (StatusID)? ${isValidStatusId}`,
      );

      if (
        isValidStatusId &&
        mapStatusToStatusID(sourceTask.status) !== targetColumnId
      ) {
        const newStatus =
          targetColumnId as (typeof KANBAN_COLUMN_RENDER_IDS)[number];
        console.log(
          `[KanbanView.tsx] Attempting to update task ${active.id} to new status: ${newStatus}`,
        );
        try {
          await updateTask(active.id as string, { status: newStatus });
          toast({
            title: `Task "${sourceTask.title}" moved to ${kanbanColumns[newStatus]?.title || newStatus}.`,
            status: "success",
            duration: 2000,
            isClosable: true,
          });
          console.log(
            `[KanbanView.tsx] Task ${active.id} status update API call successful.`,
          );
        } catch (error) {
          console.error(
            "[KanbanView.tsx] Failed to update task status after drag:",
            error,
          );
          toast({
            title: "Error updating task",
            description: "Failed to change task status.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else if (
        isValidStatusId &&
        mapStatusToStatusID(sourceTask.status) === targetColumnId
      ) {
        console.log(
          `[KanbanView.tsx] Task ${active.id} dropped into the same column. No status change.`,
        );
      } else if (!isValidStatusId) {
        console.log(
          `[KanbanView.tsx] Drag ended over non-column or invalid target. Target ID: ${targetColumnId}`,
        );
      }
    } else {
      console.log(
        "[KanbanView.tsx] Drag ended with no valid 'over' target or active.id === over.id.",
      );
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDeleteInitiateInKanban = (task: Task) => {
    setTaskToDelete(task);
    onAlertOpen();
  };

  const handleDeleteConfirmInKanban = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTaskFromStore(taskToDelete.id);
      toast({
        title: taskToDelete.is_archived
          ? "Archived task permanently deleted"
          : "Task deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setTaskToDelete(null);
    onAlertClose();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        w="100%"
        overflowX="auto"
        py={4}
        px={{ base: 2, md: 4 }}
        ref={boardRef}
        bg="surface"
        position="relative"
      >
        {isPolling && (
          <Flex
            position="absolute"
            top="2"
            right="2"
            zIndex="overlay"
            p="2"
            bg="surface"
            borderRadius="md"
            boxShadow="md"
          >
            <Spinner size="sm" color="primary" />
            <Text ml={2} fontSize="xs" color="textSecondary">
              Updating...
            </Text>
          </Flex>
        )}
        <Flex
          direction="row"
          gap={{ base: 4, md: 6 }}
          w="max-content"
          minW="100%"
          px={1}
        >
          {Object.values(kanbanColumns).map((column) => (
            <KanbanColumnContent
              key={column.id}
              column={column}
              compactView={compactView}
              onDeleteInitiate={handleDeleteInitiateInKanban}
              defaultThemeBg={defaultThemeBg}
              cardBg={cardBg}
              cardBorderPrimary={cardBorderPrimary}
              columnHeaderBg={columnHeaderBg}
              columnBg={columnBg}
            />
          ))}
        </Flex>
        <DragOverlay>
          {activeTask ? (
            <Box
              bg={cardBg}
              borderRadius="lg"
              boxShadow="xl"
              borderColor={cardBorderPrimary}
              borderWidth="DEFAULT"
              py={2}
              px={4}
              opacity={0.9}
              transform="scale(1.05)"
            >
              <TaskItem
                task={activeTask}
                compact={compactView}
                onDeleteInitiate={() => {}}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </Box>
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg="surface"
            color="textPrimary"
            borderWidth="DEFAULT"
            borderColor="borderDecorative"
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              borderBottomWidth="DEFAULT"
              borderColor="borderDecorative"
            >
              Delete Task
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              {taskToDelete?.is_archived
                ? "Are you sure you want to permanently delete this archived task? This action cannot be undone."
                : "Are you sure you want to delete this task?"}
            </AlertDialogBody>

            <AlertDialogFooter
              borderTopWidth="1px"
              borderColor="borderDecorative"
            >
              <Button ref={cancelRef} onClick={onAlertClose} variant="ghost">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirmInKanban}
                ml={3}
                bg="error"
                color="onError"
                _hover={{ bg: colorPrimitives.red[600] }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </DndContext>
  );
};

// Define KanbanColumnContent component here
interface KanbanColumnContentProps {
  column: KanbanColumn;
  compactView: boolean;
  onDeleteInitiate: (task: Task) => void;
  defaultThemeBg: string;
  cardBg: string;
  cardBorderPrimary: string;
  columnHeaderBg: string;
  columnBg: string;
}

const KanbanColumnContent: React.FC<KanbanColumnContentProps> = ({
  column,
  compactView,
  onDeleteInitiate,
  defaultThemeBg,
  cardBg,
  cardBorderPrimary,
  columnHeaderBg,
  columnBg,
}) => {
  return (
    <VStack
      key={column.id}
      alignItems="stretch"
      p={compactView ? 1 : 2}
      bg={columnBg}
      borderRadius="lg"
      boxShadow="md"
      w={{ base: "kanbanColMobile", md: "xs" }}
      minW={{ base: "kanbanColMobile", md: "xs" }}
      maxW={{ base: "kanbanColMobile", md: "xs" }}
      spacing={compactView ? 2 : 3}
      height="100%"
      data-status-key={column.id}
      className={`kanban-column-${column.id}`}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pb={compactView ? 1 : 2}
        borderBottomWidth="DEFAULT"
        borderColor={cardBorderPrimary}
        px={compactView ? 1 : 2}
        pt={compactView ? 1 : 0}
        bg={columnHeaderBg}
        borderTopRadius="lg"
        mx={compactView ? -1 : -2}
        mt={compactView ? -1 : -2}
      >
        <Heading
          size={compactView ? "xs" : "sm"}
          color={"textPrimary"}
          textTransform="uppercase"
          letterSpacing="wide"
        >
          {column.title}
        </Heading>
        <Text
          fontSize={compactView ? "xs" : "sm"}
          color={"textSecondary"}
          fontWeight="bold"
        >
          {column.tasks.length}
        </Text>
      </Flex>

      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <VStack
          spacing={compactView ? 2 : 3}
          flexGrow={1}
          overflowY="auto"
          width="100%"
          px={compactView ? 0.5 : 0}
          className="kanban-column-task-list"
          css={{
            "&::-webkit-scrollbar": {
              width: sizing.spacing["2"],
            },
            "&::-webkit-scrollbar-track": {
              background: defaultThemeBg,
            },
            "&::-webkit-scrollbar-thumb": {
              background: cardBorderPrimary,
              borderRadius: "lg",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: cardBg,
            },
          }}
        >
          {column.tasks.length === 0 && (
            <Text fontSize="sm" color="textSecondary" textAlign="center" pt={4}>
              No tasks here.
            </Text>
          )}
          {column.tasks.map((task) => (
            <DraggableTaskItem
              key={task.id}
              task={task}
              compactView={compactView}
              onDeleteInitiate={onDeleteInitiate}
            />
          ))}
        </VStack>
      </SortableContext>
    </VStack>
  );
};

// New DraggableTaskItem component
interface DraggableTaskItemProps {
  task: Task;
  compactView: boolean;
  onDeleteInitiate: (task: Task) => void;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  compactView,
  onDeleteInitiate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardBgToken = useToken("colors", "surface");
  const cardBorderPrimaryToken = useToken("colors", "borderDecorative");

  // Get status display properties from the utility
  const currentStatus = (task.status || "TO_DO") as StatusID;
  const displayInfo = getDisplayableStatus(currentStatus, task.title);

  // Fallback colorScheme if displayInfo is undefined
  const statusColorScheme = displayInfo?.colorScheme || "gray";

  // Accent bar color by status - using the main color of the scheme
  const taskAccentColor = useToken("colors", [
    `${statusColorScheme}.500`,
    "gray.500",
  ])[0];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.2 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Box
        bg={cardBgToken}
        borderRadius="lg"
        boxShadow="md"
        borderLeftWidth={sizing.borderWidth["2"]}
        borderLeftStyle="solid"
        borderLeftColor={taskAccentColor}
        borderColor={cardBorderPrimaryToken}
        borderWidth="DEFAULT"
        py={2}
        px={4}
        mb={3}
      >
        <TaskItem
          task={task}
          compact={compactView}
          onDeleteInitiate={onDeleteInitiate}
        />
      </Box>
    </motion.div>
  );
};

export default KanbanView;
