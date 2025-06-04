import React from "react";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ searchTerm, setSearchTerm }) => (
  <InputGroup size="sm" width="100%" data-testid="task-filters">
    <InputLeftElement pointerEvents="none">
      <SearchIcon color="textSecondary" />
    </InputLeftElement>
    <Input
      type="text"
      placeholder="Search tasks..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      bg="surface"
      borderColor="borderInteractive"
      _hover={{ borderColor: "borderFocused" }}
      focusBorderColor="borderFocused"
    />
  </InputGroup>
);

export default TaskFilters;
