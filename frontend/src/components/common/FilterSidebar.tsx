'use client';

import React from 'react';
import {
    VStack,
    // FormControl, // No longer needed directly if all controls are removed
    // FormLabel, // No longer needed
    // Select, // No longer needed
    // Heading, // May remove or change
    // Box, // No longer needed
    // Input, // No longer needed
    // InputGroup, // No longer needed
    // InputLeftElement, // No longer needed
    // HStack, // No longer needed
    // Button, // No longer needed
    // Switch, // No longer needed
    // FormHelperText // No longer needed
} from '@chakra-ui/react';
// import { SearchIcon } from '@chakra-ui/icons'; // No longer needed
// import { useTaskStore } from '@/store/taskStore'; // May not be needed if all filters are gone
// import { TaskFilters, TaskSortOptions, TaskSortField } from '@/types'; // May not be needed
// import { formatDisplayName } from '@/lib/utils'; // May not be needed
// import { shallow } from 'zustand/shallow'; // May not be needed

const FilterSidebar: React.FC = () => {
    // const projetos = useTaskStore(state => state.projects);
    // const agents = useTaskStore(state => state.agents);
    // const currentFilters = useTaskStore(state => state.filters, shallow);
    // const hideCompletedFilter = useTaskStore(state => state.filters.hideCompleted);
    // const statusFilter = useTaskStore(state => state.filters.status);
    // const projectFilter = useTaskStore(state => state.filters.projectId);
    // const agentFilter = useTaskStore(state => state.filters.agentId);
    // const searchTermFilter = useTaskStore(state => state.filters.search);

    // const setFilters = useTaskStore(state => state.setFilters);
    // const sortOptions = useTaskStore(state => state.sortOptions, shallow);
    // const setSortOptions = useTaskStore(state => state.setSortOptions);

    // const uniqueAgentsForDropdown = React.useMemo(() => { ... }, [agents]);

    // const handleFilterChange = (field: keyof TaskFilters, value: string | number | null) => { ... };

    // const handleSortChange = (field: TaskSortOptions['field'] | null, direction: TaskSortOptions['direction'] | null) => { ... };

    // const handleClearFilters = () => { ... };

    // const handleToggleShowCompleted = () => { ... };

    // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => { ... };

    return (
        // Removed all filter and sort UI elements
        // The VStack can be removed if there's no content left, or kept for future shared sidebar items.
        // For now, let's leave a placeholder or remove the heading if nothing else is here.
        <VStack spacing={{ base: 4, md: 6 }} align="stretch" w="full" p={{ base: 2, md: 4 }}>
            {/* <Heading size="sm" color="text.secondary" mb={1} mt={3} borderTopWidth="1px" borderColor="border.divider" pt={3}>
                Filters & Sort
            </Heading> */}
            {/* Content removed as per user request */}
        </VStack>
    );
};

export default FilterSidebar; 