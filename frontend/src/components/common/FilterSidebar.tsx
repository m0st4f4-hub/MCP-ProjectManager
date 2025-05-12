'use client';

import React from 'react';
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
    HStack
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTaskStore } from '@/store/taskStore';
import { TaskFilters, TaskSortOptions } from '@/types';
import { formatDisplayName } from '@/lib/utils';

const FilterSidebar: React.FC = () => {
    const filters = useTaskStore(state => state.filters);
    const setFilters = useTaskStore(state => state.setFilters);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);
    const sortOptions = useTaskStore(state => state.sortOptions);
    const setSortOptions = useTaskStore(state => state.setSortOptions);

    React.useEffect(() => {
        // Fetch projects and agents if not already loaded, for dropdowns
        if (!projects.length || !agents.length) {
            fetchProjectsAndAgents();
        }
    }, [projects, agents, fetchProjectsAndAgents]);

    const uniqueAgentsForDropdown = React.useMemo(() => {
        const seenDisplayNames = new Set<string>();
        const unique: { display: string; value: string }[] = [];
        agents.forEach(agent => {
            const displayName = formatDisplayName(agent.name);
            if (!seenDisplayNames.has(displayName)) {
                seenDisplayNames.add(displayName);
                unique.push({ display: displayName, value: agent.name }); // Use raw name for value
            }
        });
        return unique.sort((a, b) => a.display.localeCompare(b.display));
    }, [agents]);

    const handleFilterChange = (field: keyof TaskFilters, value: string | number | null) => {
        let processedValue: string | number | null = value;
        if (field === 'projectId') {
            if (value === '' || value === null || value === undefined) { // Explicitly check for empty string
                processedValue = null;
            } else {
                processedValue = Number(value);
            }
        } else { // For other fields like status or agentName or searchTerm
            if (value === '') {
                processedValue = null;
            }
        }

        setFilters({
            ...filters,
            [field]: processedValue
        });
    };

    const handleSortChange = (field: TaskSortOptions['field'] | null, direction: TaskSortOptions['direction'] | null) => {
        setSortOptions({
            field: field || sortOptions.field,
            direction: direction || sortOptions.direction
        });
    };

    return (
        <VStack spacing={4} align="stretch" w="full">
            <Heading size="sm" color="text.secondary" mb={1} mt={3} borderTopWidth="1px" borderColor="border.divider" pt={3}>
                Filters & Search
            </Heading>
            
            <FormControl>
                <FormLabel color="text.secondary" fontSize="xs" mb={1}>Search</FormLabel>
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="icon.secondary" />
                    </InputLeftElement>
                    <Input
                        value={filters.searchTerm || ''}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        placeholder="Search tasks..."
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        borderRadius="md"
                        fontSize="sm"
                        _hover={{ borderColor: "border.input.hover" }}
                        _focus={{ 
                            borderColor: "border.focus",
                            boxShadow: "outline"
                        }}
                    />
                </InputGroup>
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary" fontSize="xs" mb={1}>Status</FormLabel>
                <Select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? null : e.target.value)}
                    bg="bg.input"
                    color="text.primary"
                    borderColor="border.input"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "border.input.hover" }}
                    _focus={{ 
                        borderColor: "border.focus",
                        boxShadow: "outline"
                    }}
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary" fontSize="xs" mb={1}>Project</FormLabel>
                <Select
                    value={filters.projectId || ''}
                    onChange={(e) => handleFilterChange('projectId', e.target.value)}
                    placeholder="All Projects"
                    bg="bg.input"
                    color="text.primary"
                    borderColor="border.input"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "border.input.hover" }}
                    _focus={{ 
                        borderColor: "border.focus",
                        boxShadow: "outline"
                    }}
                >
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>
                            {formatDisplayName(project.name)}
                        </option>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary" fontSize="xs" mb={1}>Agent</FormLabel>
                <Select
                    value={filters.agentName || ''}
                    onChange={(e) => handleFilterChange('agentName', e.target.value)}
                    placeholder="All Agents"
                    bg="bg.input"
                    color="text.primary"
                    borderColor="border.input"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "border.input.hover" }}
                    _focus={{ 
                        borderColor: "border.focus",
                        boxShadow: "outline"
                    }}
                >
                    {uniqueAgentsForDropdown.map(agentEntry => (
                        <option key={agentEntry.value} value={agentEntry.value}>
                            {agentEntry.display}
                        </option>
                    ))}
                </Select>
            </FormControl>

            {/* Sort Options */}
            <Box w="full" mt={2} pt={3} borderTopWidth="1px" borderColor="border.divider">
                <Heading size="sm" color="text.secondary" mb={2}>
                    Sort Options
                </Heading>
                <FormControl>
                    <HStack spacing={2}>
                        <Select
                            value={sortOptions.field || 'created_at'}
                            onChange={(e) => handleSortChange(e.target.value as TaskSortOptions['field'], null)}
                            bg="bg.input"
                            color="text.primary"
                            borderColor="border.input"
                            size="sm"
                            borderRadius="md"
                            _hover={{ borderColor: "border.input.hover" }}
                            _focus={{ 
                                borderColor: "border.focus",
                                boxShadow: "outline"
                            }}
                        >
                            <option value="created_at">Date Created</option>
                            <option value="title">Title</option>
                        </Select>
                        <Select
                            value={sortOptions.direction || 'desc'}
                            onChange={(e) => handleSortChange(null, e.target.value as TaskSortOptions['direction'])}
                            bg="bg.input"
                            color="text.primary"
                            borderColor="border.input"
                            size="sm"
                            borderRadius="md"
                            _hover={{ borderColor: "border.input.hover" }}
                            _focus={{ 
                                borderColor: "border.focus",
                                boxShadow: "outline"
                            }}
                        >
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </Select>
                    </HStack>
                </FormControl>
            </Box>

            {/* Search box and sorting can be added here later */}
        </VStack>
    );
};

export default FilterSidebar; 