import React from "react";
import { HStack, Button, Text } from "@chakra-ui/react";

interface TaskPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

const TaskPagination: React.FC<TaskPaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPrevious,
  onNext,
}) => (
  <HStack spacing={4} justifyContent="center" mt={4} data-testid="task-pagination">
    <Button onClick={onPrevious} isDisabled={currentPage === 0}>
      Previous
    </Button>
    <Text>Page {currentPage + 1}</Text>
    <Button
      onClick={onNext}
      isDisabled={(currentPage + 1) * itemsPerPage >= totalItems}
    >
      Next
    </Button>
  </HStack>
);

export default TaskPagination;
