"use client";

import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  Heading,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Button,
  FormHelperText,
  useToken,
  Text,
  Flex,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons"; // Using CloseIcon directly
import { useTaskStore } from "@/store/taskStore";
import { TaskFilters, TaskSortOptions, TaskSortField } from "@/types";
import { formatDisplayName } from "@/lib/utils";
import { useProjectStore, ProjectState } from "@/store/projectStore";
import { useAgentStore, AgentState } from "@/store/agentStore";
import { sizing, shadows, typography } from '../../tokens';
import AppIcon from './AppIcon'; // Assuming AppIcon is in the same directory

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  const projectsFromStore = useTaskStore((state) => state.projects);
  const agents = useTaskStore((state) => state.agents);
  const statusFilter = useTaskStore((state) => state.filters.status);
  const projectFilter = useTaskStore((state) => state.filters.projectId);
  const agentFilter = useTaskStore((state) => state.filters.agentId);
  const searchTermFilter = useTaskStore((state) => state.filters.search);

  const setFilters = useTaskStore((state) => state.setFilters);
  const sortOptions = useTaskStore((state) => state.sortOptions);
  const setSortOptions = useTaskStore((state) => state.setSortOptions);
  const taskStoreFetchProjectsAndAgents = useTaskStore(
    (state) => state.fetchProjectsAndAgents,
  );

  const setProjectStoreFilters = useProjectStore(
    (state: ProjectState) => state.setFilters,
  );
  const setAgentStoreFilters = useAgentStore(
    (state: AgentState) => state.setFilters,
  );

  const [
    surfaceToken,
    textPrimaryToken,
    textSecondaryToken,
    textPlaceholderToken,
    textLinkToken,
    textLinkHoverToken,
    borderDecorativeToken,
    borderInteractiveToken,
    borderFocusedToken,
    iconPrimaryToken,
    iconAccentToken,
    interactiveNeutralHoverToken,
    interactiveNeutralActiveToken,
    bgSurface, // for panel bg
    overlayZIndex, // for zIndex - this won't actually get a zIndex value here, useToken needs specific categories
  ] = useToken("colors", [
    "surface",
    "textPrimary",
    "textSecondary",
    "textPlaceholder",
    "textLink",
    "textLinkHover",
    "borderDecorative",
    "borderInteractive",
    "borderFocused",
    "iconPrimary",
    "iconAccent",
    "interactiveNeutralHover",
    "interactiveNeutralActive",
    "bgSurface", // MCPDevTools uses bgSurface
    // The following were incorrect attempts to get shadow/border/zIndex via colors
    // "shadows.lg", 
    // "borders.width.DEFAULT", 
  ]);
  
  // Using useToken for zIndex and shadow if they are in the theme
  const panelZIndex = useToken('zIndices', 'overlay');
  const panelShadow = useToken('shadows', 'lg');


  const uniqueAgentsForDropdown = React.useMemo(() => {
    if (!agents) return [];
    const seen = new Set<string>();
    return agents.filter((agent) => {
      if (seen.has(agent.id)) {
        return false;
      }
      seen.add(agent.id);
      return true;
    });
  }, [agents]);

  const projectsForDropdown = React.useMemo(() => {
    if (!projectsFromStore) return [];
    return projectsFromStore;
  }, [projectsFromStore]);

  const handleFilterChange = (
    field: keyof TaskFilters,
    value: string | number | boolean | null,
  ) => {
    setFilters({ [field]: value });
  };

  const handleSortChange = (
    field: TaskSortOptions["field"] | null,
    direction: TaskSortOptions["direction"] | null,
  ) => {
    if (field && direction) {
      setSortOptions({ field, direction });
    } else {
      setSortOptions({ field: "created_at", direction: "desc" });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      projectId: undefined,
      agentId: undefined,
      search: "",
      hideCompleted: false,
      is_archived: false,
    });
    setProjectStoreFilters({
      is_archived: false,
      search: "",
      agentId: undefined,
      status: "all",
    });
    setAgentStoreFilters({ is_archived: false, search: "", status: "all" });
    setSortOptions({ field: "created_at", direction: "desc" });
    taskStoreFetchProjectsAndAgents();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", event.target.value);
  };

  const formLabelStyles = {
    fontFamily: typography.fontFamily.sans.join(", "), 
    fontSize: typography.fontSize.base, 
    fontWeight: typography.fontWeight.medium, 
    color: textSecondaryToken,
    display: "block",
    mb: sizing.spacing["1.5"], 
    lineHeight: typography.lineHeight.regular, 
  };

  const inputBaseStyles = {
    fontFamily: typography.fontFamily.sans.join(", "), 
    fontSize: typography.fontSize.base, 
    h: sizing.height.lg,
    borderRadius: sizing.borderRadius.sm, 
    bg: surfaceToken,
    borderWidth: sizing.borderWidth.DEFAULT, 
    borderStyle: "solid",
    borderColor: borderInteractiveToken,
    color: textPrimaryToken,
    width: "100%",
    boxSizing: "border-box",
    appearance: "none",
    position: "relative",
    transition:
      "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    _placeholder: { color: textPlaceholderToken, fontStyle: "italic" },
    _hover: {
      borderColor: borderInteractiveToken,
      bg: interactiveNeutralHoverToken,
    },
    _focus: {
      borderColor: borderFocusedToken,
      boxShadow: shadows.outline, 
      outline: "none",
      bg: surfaceToken,
    },
  };

  const selectInputStyles = {
    ...inputBaseStyles,
    paddingX: sizing.spacing[3],
    paddingY: sizing.spacing[2],
    lineHeight: typography.lineHeight.regular, 
    iconColor: iconPrimaryToken,
    iconSize: sizing.spacing[4],
    _hover: {
      ...inputBaseStyles._hover,
      "+ .chakra-select__icon-wrapper svg": { color: iconAccentToken },
    },
  };

  const searchInputStyles = {
    ...inputBaseStyles,
    paddingLeft: sizing.spacing[10],
    paddingRight: sizing.spacing[4],
    lineHeight: typography.lineHeight.regular, 
    textAlign: "left",
  };
  
  const panelWidth = useBreakpointValue({ base: "100%", sm: "360px", md: "400px" });

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      bottom={0}
      width={panelWidth}
      bg={bgSurface} // Using token from MCPDevTools
      borderLeftWidth={sizing.borderWidth.DEFAULT} // Similar to MCPDevTools borderTopLeftRadius + border
      borderStyle="solid"
      borderColor={borderDecorativeToken}
      boxShadow={panelShadow} // Using token from MCPDevTools
      zIndex={panelZIndex} // Using token from MCPDevTools
      display="flex"
      flexDirection="column"
      overflow="hidden" // Prevent main box from scrolling
    >
      <Flex
        p={sizing.spacing[3]} // MCPDevTools p="2"
        borderBottomWidth={sizing.borderWidth.DEFAULT}
        borderColor={borderDecorativeToken}
        alignItems="center"
        justifyContent="space-between"
        flexShrink={0} // Prevent header from shrinking
      >
        <Heading size="sm" display="flex" alignItems="center" color={textPrimaryToken}>
          <AppIcon name="settings" boxSize={sizing.spacing[5]} mr={sizing.spacing[2]} /> 
          Filters & Sort
        </Heading>
        <IconButton
          aria-label="Close filters"
          icon={<CloseIcon />} // Using Chakra UI CloseIcon directly
          size="sm"
          variant="ghost"
          onClick={onClose}
          color={iconPrimaryToken}
        />
      </Flex>
      
      <Box flexGrow={1} overflowY="auto" p={sizing.spacing[5]}>
        <VStack
          w="100%"
          // p={sizing.spacing[5]} // Padding moved to the scrollable Box above
          display="flex"
          flexDirection="column"
          gap={sizing.spacing[4]}
        >
          {/* Content from FilterSidebar.tsx's VStack */}
          <Text
            fontWeight="bold"
            textTransform="uppercase"
            fontSize="sm"
            mb={sizing.spacing[1]}
            p={sizing.spacing[1]}
            color={textSecondaryToken}
            alignSelf="flex-start"
          >
            Sort and Filter 
          </Text>

          <FormControl w="100%">
            <FormLabel sx={formLabelStyles}>Search Tasks</FormLabel>
            <InputGroup size="md" position="relative">
              <InputLeftElement
                pointerEvents="none"
                position="absolute"
                left={sizing.spacing[2]}
                top="50%"
                transform="translateY(-50%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="100%"
                color={iconPrimaryToken}
              >
                <SearchIcon
                  sx={{
                    w: sizing.spacing[4],
                    h: sizing.spacing[4],
                  }}
                />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search by title or description"
                value={searchTermFilter || ""}
                onChange={handleSearchChange}
                sx={searchInputStyles} 
              />
            </InputGroup>
            <FormHelperText
              fontFamily={typography.fontFamily.sans.join(", ")}
              fontSize={typography.fontSize.xs}
              color={textSecondaryToken}
              mt={sizing.spacing[1]}
              lineHeight={typography.lineHeight.tight}
            >
              Filters tasks by title or description content.
            </FormHelperText>
          </FormControl>

          <FormControl w="100%">
            <FormLabel sx={formLabelStyles}>Status</FormLabel>
            <Select
              size="md"
              value={statusFilter || ""}
              onChange={(e) =>
                handleFilterChange(
                  "status",
                  e.target.value === ""
                    ? "all"
                    : (e.target.value as TaskFilters["status"]) || null,
                )
              }
              sx={selectInputStyles}
            >
              <option value="">All Statuses</option>
              <option value="active">Active (Not Completed/Failed)</option>
              <option value="completed">Completed (Completed/Failed)</option>
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
            </Select>
          </FormControl>

          <FormControl w="100%">
            <FormLabel sx={formLabelStyles}>Project</FormLabel>
            <Select
              size="md"
              value={projectFilter || ""}
              onChange={(e) =>
                handleFilterChange("projectId", e.target.value || null)
              }
              placeholder="All Projects"
              sx={selectInputStyles}
            >
              {projectsForDropdown?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl w="100%">
            <FormLabel sx={formLabelStyles}>Agent</FormLabel>
            <Select
              size="md"
              value={agentFilter || ""}
              onChange={(e) =>
                handleFilterChange("agentId", e.target.value || null)
              }
              placeholder="All Agents"
              sx={selectInputStyles}
            >
              {uniqueAgentsForDropdown?.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {formatDisplayName(agent.name)}
                </option>
              ))}
            </Select>
          </FormControl>

          <Heading
            fontFamily={typography.fontFamily.heading.join(", ")}
            fontSize={typography.fontSize.md}
            fontWeight={typography.fontWeight.semibold}
            color={textPrimaryToken}
            mt={sizing.spacing[5]}
            mb={sizing.spacing[3]}
            borderTopWidth={sizing.borderWidth.xs}
            borderTopStyle="solid"
            borderTopColor={borderDecorativeToken}
            pt={sizing.spacing[4]}
            w="100%"
            alignSelf="flex-start"
          >
            Sort By
          </Heading>

          <HStack display="flex" gap={sizing.spacing[3]} w="100%">
            <Select
              size="md"
              value={sortOptions.field}
              onChange={(e) =>
                handleSortChange(
                  e.target.value as TaskSortField,
                  sortOptions.direction,
                )
              }
              sx={{...selectInputStyles, flex: 1}}
            >
              <option value="created_at">Created Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="project_id">Project</option>
              <option value="agent_id">Agent</option>
              <option value="updated_at">Last Updated</option>
            </Select>
            <Select
              size="md"
              value={sortOptions.direction}
              onChange={(e) =>
                handleSortChange(
                  sortOptions.field,
                  e.target.value as "asc" | "desc",
                )
              }
              sx={selectInputStyles}
              w={{ base: "120px", md: "140px" }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </HStack>

          <Button
            onClick={handleClearFilters}
            fontFamily={typography.fontFamily.sans.join(", ")}
            fontSize={typography.fontSize.sm}
            fontWeight={typography.fontWeight.medium}
            px={sizing.spacing[3]}
            py="0.5rem"
            h="2.25rem"
            borderRadius={sizing.borderRadius.sm}
            bg="transparent"
            borderWidth={sizing.borderWidth.DEFAULT}
            borderStyle="solid"
            borderColor={borderDecorativeToken}
            color={textLinkToken}
            cursor="pointer"
            w="100%"
            mt={sizing.spacing[6]}
            transition="all 0.2s ease-in-out"
            lineHeight={typography.lineHeight.regular}
            _hover={{
              bg: interactiveNeutralHoverToken,
              borderColor: textLinkHoverToken,
              color: textLinkHoverToken,
            }}
            _active={{
              bg: interactiveNeutralActiveToken,
              borderColor: textLinkHoverToken,
              color: textLinkHoverToken,
              transform: "translateY(1px)",
            }}
            _focusVisible={{
              outline: "none",
              boxShadow: shadows.outline,
            }}
          >
            Clear Filters & Sort
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default FilterPanel; 