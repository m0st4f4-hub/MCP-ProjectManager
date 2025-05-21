import React from "react";
import { VStack, Flex, Heading, Text, Box } from "@chakra-ui/react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { sizing } from "../../tokens";
import { Task } from "@/types";
import { motion } from "framer-motion";
import TaskItem from "../TaskItem";
import { useToken } from "@chakra-ui/react";
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define KanbanColumn type locally
export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanColumnProps {
  column: KanbanColumn;
  compactView: boolean;
  onDeleteInitiate: (task: Task) => void;
  defaultThemeBg: string;
  cardBg: string;
  cardBorderPrimary: string;
  columnHeaderBg: string;
  columnBg: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
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

  const currentStatus = (task.status || "TO_DO") as StatusID;
  const displayInfo = getDisplayableStatus(currentStatus, task.title);
  const statusColorScheme = displayInfo?.colorScheme || "gray";
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

export default KanbanColumn; 