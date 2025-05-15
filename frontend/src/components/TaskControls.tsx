import React from 'react';
import {
    Button,
    Select,
    Flex,
    HStack,
    Text,
    Spinner,
    Input,
    InputGroup,
    InputLeftElement,
    FormControl,
    FormLabel,
    Box,
    VStack,
    Switch,
    Heading,
    SimpleGrid,
    Divider,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Checkbox,
    useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon, ViewOffIcon, SearchIcon, DeleteIcon, SettingsIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { GroupByType, ViewMode, TaskFilters, TaskSortOptions, TaskSortField } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { shallow } from 'zustand/shallow';
import { formatDisplayName } from '@/lib/utils';
import * as statusUtils from '@/lib/statusUtils';
import ConfirmationModal from './common/ConfirmationModal';

interface TaskControlsProps {
    groupBy: GroupByType;
    setGroupBy: (value: GroupByType) => void;
    viewMode: ViewMode;
    setViewMode: (value: ViewMode) => void;
    onAddTask: () => void;
    hideGroupBy?: boolean;
    isPolling?: boolean;
    allFilterableTaskIds: string[];
}

const TaskControls: React.FC<TaskControlsProps> = ({
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    onAddTask,
    hideGroupBy = false,
    isPolling = false,
    allFilterableTaskIds,
}) => {
    const currentFilters = useTaskStore(state => state.filters, shallow);
    const setFilters = useTaskStore(state => state.setFilters);
    const sortOptions = useTaskStore(state => state.sortOptions, shallow);
    const setSortOptions = useTaskStore(state => state.setSortOptions);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const selectedTaskIds = useTaskStore(state => state.selectedTaskIds);
    const selectAllTasks = useTaskStore(state => state.selectAllTasks);
    const deselectAllTasks = useTaskStore(state => state.deselectAllTasks);
    const bulkDeleteTasks = useTaskStore(state => state.bulkDeleteTasks);
    const bulkSetStatusTasks = useTaskStore(state => state.bulkSetStatusTasks);
    const taskStoreLoading = useTaskStore(state => state.loading);

    const {
        isOpen: isDeleteConfirmOpen,
        onOpen: onDeleteConfirmOpen,
        onClose: onDeleteConfirmClose,
    } = useDisclosure();

    const uniqueAgentsForDropdown = React.useMemo(() => {
        const seenDisplayNames = new Set<string>();
        const unique: { display: string; value: string }[] = [];
        (agents || []).forEach(agent => {
            const displayName = formatDisplayName(agent.name);
            if (!seenDisplayNames.has(displayName)) {
                seenDisplayNames.add(displayName);
                unique.push({ display: displayName, value: agent.name });
            }
        });
        return unique.sort((a, b) => a.display.localeCompare(b.display));
    }, [agents]);

    const handleFilterChange = (field: keyof TaskFilters, value: string | number | null) => {
        let processedValue: string | number | null = value;
        if (field === 'projectId') {
            processedValue = (value === '' || value === null || value === undefined) ? null : Number(value);
        } else {
            processedValue = (value === '') ? null : value;
        }
        setFilters({ ...currentFilters, [field]: processedValue });
    };
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...currentFilters, search: event.target.value });
    };

    const handleSortChange = (field: TaskSortOptions['field'] | null, direction: TaskSortOptions['direction'] | null) => {
        setSortOptions({
            field: field || sortOptions.field,
            direction: direction || sortOptions.direction
        });
    };

    const handleToggleShowCompleted = () => {
        setFilters({ ...currentFilters, hideCompleted: !currentFilters.hideCompleted });
    };

    const handleClearFilters = () => {
        setFilters({
            status: 'all',
            projectId: null,
            agentId: null,
            search: '',
            top_level_only: currentFilters.top_level_only,
            hideCompleted: false,
        });
    };
    
    const commonSelectProps = {
        size: "sm",
        bg: "bg.input",
        borderColor: "border.input",
        color: "text.primary",
        _hover: { borderColor: "border.input.hover" },
        sx: { option: { bg: 'bg.input', color: 'text.primary' } },
        borderRadius: "md",
    };

    const areAllTasksSelected = React.useMemo(() => {
        if (allFilterableTaskIds.length === 0) return false;
        return allFilterableTaskIds.every(id => selectedTaskIds.includes(id));
    }, [selectedTaskIds, allFilterableTaskIds]);

    const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            selectAllTasks(allFilterableTaskIds);
        } else {
            deselectAllTasks();
        }
    };

    const availableStatusesForBulkUpdate = React.useMemo(() => {
        return statusUtils.getAllStatusIds().filter(id => {
            const attrs = statusUtils.getStatusAttributes(id);
            return !attrs.isTerminal && !attrs.isDynamic;
        });
    }, []);

    const handleBulkDeleteConfirm = async () => {
        await bulkDeleteTasks();
        onDeleteConfirmClose();
    };

    return (
        <VStack spacing={5} mb={6} bg="bg.surface" p={4} borderRadius="lg" align="stretch" borderWidth="1px" borderColor="border.discreet">
            
            {/* Section: Filters */}
            <Box>
                <HStack mb={3} spacing={3} align="center">
                    <SettingsIcon color="icon.secondary" />
                    <Heading size="sm" color="text.secondary" fontWeight="medium">Filters</Heading>
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={handleClearFilters}
                        aria-label="Clear all filters"
                        leftIcon={<DeleteIcon />}
                        borderColor="border.base"
                        color="text.secondary"
                        ml="auto"
                    >
                        Clear
                    </Button>
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={3}>
                    <FormControl id="task-search">
                        <FormLabel srOnly>Search Tasks</FormLabel>
                        <InputGroup size="sm">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="icon.secondary" />
                            </InputLeftElement>
                            <Input
                                {...commonSelectProps}
                                value={currentFilters.search || ''}
                                onChange={handleSearchChange}
                                placeholder="Search tasks..."
                            />
                        </InputGroup>
                    </FormControl>

                    <FormControl id="task-status-filter">
                        <FormLabel srOnly>Filter by Status</FormLabel>
                        <Select 
                            {...commonSelectProps}
                            aria-label="Filter by status"
                            value={currentFilters.status || 'all'}
                            onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? null : e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </Select>
                    </FormControl>

                    <FormControl id="task-project-filter" isDisabled={!projects || projects.length === 0}>
                        <FormLabel srOnly>Filter by Project</FormLabel>
                        <Select
                            {...commonSelectProps}
                            aria-label="Filter by project"
                            value={currentFilters.projectId || ''}
                            onChange={(e) => handleFilterChange('projectId', e.target.value)}
                            placeholder="All Projects"
                        >
                            <option value="">All Projects</option>
                            {(projects || []).map(project => (
                                <option key={project.id} value={project.id}>
                                    {formatDisplayName(project.name)}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl id="task-agent-filter" isDisabled={!uniqueAgentsForDropdown || uniqueAgentsForDropdown.length === 0}>
                        <FormLabel srOnly>Filter by Agent</FormLabel>
                        <Select
                            {...commonSelectProps}
                            aria-label="Filter by agent"
                            value={currentFilters.agentId || ''}
                            onChange={(e) => handleFilterChange('agentId', e.target.value)}
                            placeholder="All Agents"
                        >
                            <option value="">All Agents</option>
                            {uniqueAgentsForDropdown.map(agentEntry => (
                                <option key={agentEntry.value} value={agentEntry.value}>
                                    {agentEntry.display}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Section: Bulk Actions & Select All - Appears above View Options if items are selected */}
            {(selectedTaskIds.length > 0 || allFilterableTaskIds.length > 0) && (
                <>
                    <Divider borderColor="border.divider" mt={selectedTaskIds.length > 0 ? 0 : 4} mb={4}/>
                    <Flex 
                        justifyContent="space-between" 
                        alignItems="center" 
                        flexWrap="wrap" 
                        gap={3}
                        mb={selectedTaskIds.length > 0 ? 0 : -2} // Reduce bottom margin if only select all is visible
                    >
                        <HStack spacing={3} align="center">
                            <Checkbox
                                isChecked={areAllTasksSelected}
                                onChange={handleSelectAllToggle}
                                isDisabled={allFilterableTaskIds.length === 0}
                                colorScheme="brand"
                                size="sm"
                            >
                                Select All ({allFilterableTaskIds.length})
                            </Checkbox>
                            {selectedTaskIds.length > 0 && (
                                <Text fontSize="sm" color="text.secondary">
                                    {selectedTaskIds.length} selected
                                </Text>
                            )}
                        </HStack>

                        {selectedTaskIds.length > 0 && (
                            <Menu>
                                <MenuButton as={Button} size="sm" variant="outline" colorScheme="brand" rightIcon={<ChevronDownIcon />}>
                                    Bulk Actions
                                </MenuButton>
                                <MenuList zIndex="popover">
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={onDeleteConfirmOpen}
                                        color="red.500"
                                        isDisabled={taskStoreLoading}
                                    >
                                        Delete Selected ({selectedTaskIds.length})
                                    </MenuItem>
                                    <MenuDivider />
                                    <MenuItem isDisabled>Set Status to...</MenuItem>
                                    {availableStatusesForBulkUpdate.map(statusId => {
                                        const statusAttrs = statusUtils.getStatusAttributes(statusId);
                                        return (
                                            <MenuItem 
                                                key={statusId} 
                                                onClick={() => bulkSetStatusTasks(statusId)} 
                                                pl={8} /* Indent for sub-option feel */
                                            >
                                                {statusAttrs.displayName}
                                            </MenuItem>
                                        );
                                    })}
                                </MenuList>
                            </Menu>
                        )}
                    </Flex>
                </>
            )}

            <Divider borderColor="border.divider" />

            {/* Section: View Options & Actions */}
            <Flex 
                justifyContent="space-between" 
                alignItems={{base: "stretch", md: "center"}}
                flexDirection={{ base: 'column', md: 'row' }}
                gap={{base:3, md:4}}
                flexWrap="wrap"
            >
                <HStack spacing={{base:2, md:3}} w={{ base: '100%', md: 'auto' }} flexWrap="wrap" gap={{base: 2, md: 2}} alignItems="center">
                    {isPolling && <Spinner size="sm" color="brand.500" />}
                    {!hideGroupBy && (
                        <FormControl id="task-group-by">
                            <HStack spacing={1.5} align="center">
                                <FormLabel htmlFor="task-group-by-select" mb="0" fontSize="sm" color="text.secondary" whiteSpace="nowrap">Group:</FormLabel>
                                <Select 
                                    id="task-group-by-select"
                                    {...commonSelectProps}
                                    aria-label="Group by"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                                    w={{ base: 'auto', md: '130px' }}
                                >
                                    <option value="status">Status</option>
                                    <option value="project">Project</option>
                                    <option value="agent">Agent</option>
                                </Select>
                            </HStack>
                        </FormControl>
                    )}
                    
                    <FormControl id="task-sort-field">
                        <HStack spacing={1.5} align="center">
                            <FormLabel htmlFor="task-sort-field-select" mb="0" fontSize="sm" color="text.secondary" whiteSpace="nowrap">Sort:</FormLabel>
                            <Select
                                id="task-sort-field-select"
                                {...commonSelectProps}
                                aria-label="Sort by field"
                                value={sortOptions.field || 'created_at'}
                                onChange={(e) => handleSortChange(e.target.value as TaskSortField, null)}
                                w={{ base: 'auto', md: '140px' }}
                            >
                                <option value="created_at">Created Date</option>
                                <option value="status">Status</option>
                                <option value="agent">Agent Name</option> {/* Ensure TaskSortField includes 'agent' */}
                            </Select>
                            <Select
                                {...commonSelectProps}
                                aria-label="Sort direction"
                                value={sortOptions.direction || 'desc'}
                                onChange={(e) => handleSortChange(null, e.target.value as TaskSortOptions['direction'])}
                                w={{ base: 'auto', md: '90px' }}
                            >
                                <option value="asc">Asc</option>
                                <option value="desc">Desc</option>
                            </Select>
                        </HStack>
                    </FormControl>

                    <FormControl id="hide-completed-switch" display="flex" alignItems="center">
                        <FormLabel htmlFor="hide-completed-switch-input" mb="0" fontSize="sm" color="text.secondary" whiteSpace="nowrap" mr={1.5}>
                            Hide Done:
                        </FormLabel>
                        <Switch 
                            id="hide-completed-switch-input"
                            isChecked={currentFilters.hideCompleted} 
                            onChange={handleToggleShowCompleted} 
                            colorScheme="primaryScheme"
                            size="sm"
                        />
                    </FormControl>
                </HStack>

                <HStack spacing={{base:2, md:3}} w={{ base: '100%', md: 'auto' }} justify={{base: "space-between", md: "flex-end"}} flexWrap="nowrap">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                        aria-label={viewMode === 'kanban' ? 'Switch to List View' : 'Switch to Kanban View'}
                        leftIcon={viewMode === 'kanban' ? <ViewOffIcon /> : <ViewIcon />}
                        borderColor="border.base"
                        color="text.primary"
                        flexShrink={0}
                    >
                        {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
                    </Button>
                    <Button 
                        size="sm"
                        leftIcon={<AddIcon />}
                        bg="bg.button.primary" 
                        color="text.button.primary"
                        _hover={{ bg: 'brand.600' }}
                        onClick={onAddTask}
                        flexShrink={0}
                    >
                        Add Task
                    </Button>
                </HStack>
            </Flex>

            {/* Confirmation Modal for Bulk Delete */}
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={onDeleteConfirmClose}
                onConfirm={handleBulkDeleteConfirm}
                title="Confirm Bulk Delete"
                bodyText={`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`}
                confirmButtonText="Delete Tasks"
                confirmButtonColorScheme="red"
                isLoading={taskStoreLoading}
            />
        </VStack>
    );
};

export default TaskControls; 