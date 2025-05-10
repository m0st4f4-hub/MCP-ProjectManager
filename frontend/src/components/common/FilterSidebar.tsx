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
            <Heading size="sm" color="whiteAlpha.800" mb={1} mt={3} borderTopWidth="1px" borderColor="gray.700" pt={3}>
                Filters & Search
            </Heading>
            
            <FormControl>
                <FormLabel color="gray.200" fontSize="xs" mb={1}>Search</FormLabel>
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.500" />
                    </InputLeftElement>
                    <Input
                        value={filters.searchTerm || ''}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        placeholder="Search tasks..."
                        bg="gray.700"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="md"
                        fontSize="sm"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                </InputGroup>
            </FormControl>

            <FormControl>
                <FormLabel color="gray.200" fontSize="xs" mb={1}>Status</FormLabel>
                <Select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? null : e.target.value)}
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                >
                    <option style={{ backgroundColor: '#2D3748' }} value="all">All</option>
                    <option style={{ backgroundColor: '#2D3748' }} value="active">Active</option>
                    <option style={{ backgroundColor: '#2D3748' }} value="completed">Completed</option>
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel color="gray.200" fontSize="xs" mb={1}>Project</FormLabel>
                <Select
                    value={filters.projectId || ''}
                    onChange={(e) => handleFilterChange('projectId', e.target.value)}
                    placeholder="All Projects"
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                >
                    {projects.map(project => (
                        <option style={{ backgroundColor: '#2D3748' }} key={project.id} value={project.id}>
                            {formatDisplayName(project.name)}
                        </option>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel color="gray.200" fontSize="xs" mb={1}>Agent</FormLabel>
                <Select
                    value={filters.agentName || ''}
                    onChange={(e) => handleFilterChange('agentName', e.target.value)}
                    placeholder="All Agents"
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                    size="sm"
                    borderRadius="md"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                >
                    {uniqueAgentsForDropdown.map(agentEntry => (
                        <option style={{ backgroundColor: '#2D3748' }} key={agentEntry.value} value={agentEntry.value}>
                            {agentEntry.display}
                        </option>
                    ))}
                </Select>
            </FormControl>
            {/* Search box and sorting can be added here later */}
        </VStack>
    );
};

export default FilterSidebar; 