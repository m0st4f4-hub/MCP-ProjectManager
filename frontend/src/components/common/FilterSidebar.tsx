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
    HStack,
    Button,
    FormHelperText
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTaskStore } from '@/store/taskStore';
import { TaskFilters, TaskSortOptions, TaskSortField } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import styles from './FilterSidebar.module.css';
import { clsx } from 'clsx';

const FilterSidebar: React.FC = () => {
    const projectsFromStore = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const statusFilter = useTaskStore(state => state.filters.status);
    const projectFilter = useTaskStore(state => state.filters.projectId);
    const agentFilter = useTaskStore(state => state.filters.agentId);
    const searchTermFilter = useTaskStore(state => state.filters.search);

    const setFilters = useTaskStore(state => state.setFilters);
    const sortOptions = useTaskStore(state => state.sortOptions);
    const setSortOptions = useTaskStore(state => state.setSortOptions);
    const taskStoreFetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);

    const setProjectStoreFilters = useProjectStore((state: ProjectState) => state.setFilters);

    const setAgentStoreFilters = useAgentStore((state: AgentState) => state.setFilters);

    const uniqueAgentsForDropdown = React.useMemo(() => {
        if (!agents) return [];
        const seen = new Set<string>();
        return agents.filter(agent => {
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

    const handleFilterChange = (field: keyof TaskFilters, value: string | number | boolean | null) => {
        setFilters({ [field]: value });
    };

    const handleSortChange = (field: TaskSortOptions['field'] | null, direction: TaskSortOptions['direction'] | null) => {
        if (field && direction) {
            setSortOptions({ field, direction });
        } else {
            setSortOptions({ field: 'created_at', direction: 'desc' });
        }
    };

    const handleClearFilters = () => {
        setFilters({
            status: 'all',
            projectId: undefined,
            agentId: undefined,
            search: '',
            hideCompleted: false,
            is_archived: false, // This filter on taskStore might need re-evaluation, archive status is per-entity
        });
        setProjectStoreFilters({ is_archived: false, search: '', agentId: undefined, status: 'all' }); 
        setAgentStoreFilters({ is_archived: false, search: '', status: 'all' });
        setSortOptions({ field: 'created_at', direction: 'desc' });
        taskStoreFetchProjectsAndAgents(); // Re-fetch dropdown data respecting new archive settings
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFilterChange('search', event.target.value);
    };

    return (
        <Box className={styles.filterSidebarContainer}>
            <VStack className={styles.sidebarVStack}>
                <Heading className={styles.heading}>
                    Filters & Sort
                </Heading>

                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formLabel}>Search Tasks</FormLabel>
                    <InputGroup size="sm" className={styles.inputGroup}>
                        <InputLeftElement pointerEvents="none" className={styles.inputLeftElement}>
                            <SearchIcon /> {/* Removed color prop, will be styled by CSS if needed */}
                        </InputLeftElement>
                        <Input
                            type="text"
                            placeholder="Search by title or description"
                            value={searchTermFilter || ''}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                    </InputGroup>
                    <FormHelperText className={styles.formHelperText}>
                        Filters tasks by title or description content.
                    </FormHelperText>
                </FormControl>

                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formLabel}>Status</FormLabel>
                    <Select
                        size="sm" // Keep size for intrinsic Chakra form element sizing behavior if not fully overridden by CSS
                        value={statusFilter || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value === '' ? 'all' : (e.target.value as TaskFilters['status']) || null)}
                        className={styles.selectControl}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active (Not Completed/Failed)</option>
                        <option value="completed">Completed (Completed/Failed)</option>
                        <option value="TO_DO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                    </Select>
                </FormControl>

                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formLabel}>Project</FormLabel>
                    <Select
                        size="sm"
                        value={projectFilter || ''}
                        onChange={(e) => handleFilterChange('projectId', e.target.value || null)}
                        placeholder="All Projects"
                        className={styles.selectControl}
                    >
                        {projectsForDropdown?.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formLabel}>Agent</FormLabel>
                    <Select
                        size="sm"
                        value={agentFilter || ''}
                        onChange={(e) => handleFilterChange('agentId', e.target.value || null)}
                        placeholder="All Agents"
                        className={styles.selectControl}
                    >
                        {uniqueAgentsForDropdown?.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {formatDisplayName(agent.name)}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Heading className={styles.sortHeading}>
                    Sort By
                </Heading>

                <HStack className={styles.sortHStack}>
                    <Select
                        size="sm"
                        value={sortOptions.field}
                        onChange={(e) => handleSortChange(e.target.value as TaskSortField, sortOptions.direction)}
                        className={clsx(styles.selectControl, styles.sortSelect)} // sortSelect for flex:1
                    >
                        <option value="created_at">Created Date</option>
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                        <option value="project_id">Project</option>
                        <option value="agent_id">Agent</option>
                        <option value="updated_at">Last Updated</option>
                    </Select>
                    <Select
                        size="sm"
                        value={sortOptions.direction}
                        onChange={(e) => handleSortChange(sortOptions.field, e.target.value as 'asc' | 'desc')}
                        className={styles.selectControl}
                        w={{ base: "120px", md: "150px" }} // Keep width prop for this specific select
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </Select>
                </HStack>

                <Button 
                    onClick={handleClearFilters} 
                    className={styles.clearButton}
                >
                    Clear Filters & Sort
                </Button>
            </VStack>
        </Box>
    );
};

export default FilterSidebar; 