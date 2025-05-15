import { Status, StatusID } from '@/types';

export const formatDisplayName = (name?: string | null): string => {
    if (!name || name.trim() === '') {
        return 'Unnamed';
    }

    // Replace underscores and hyphens with spaces, then capitalize each word
    const words = name
        .replace(/[_-]/g, ' ')
        .toLowerCase()
        .split(' ');

    const capitalizedWords = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    );

    return capitalizedWords.join(' ').trim();
};

// Example usage (can be removed or kept for testing)
/*
console.log(formatDisplayName("my_project_name")); // My Project Name
console.log(formatDisplayName("another-agent-name")); // Another Agent Name
console.log(formatDisplayName("SingleWord"));      // Singleword (Note: Could be improved to handle camelCase better if needed)
console.log(formatDisplayName("  leading space  ")); // Leading Space
console.log(formatDisplayName(null));                 // Unnamed
console.log(formatDisplayName(""));                   // Unnamed
*/

export const mapStatusToStatusID = (status: Status | null | undefined): StatusID => {
    if (!status) return 'TO_DO'; // Default for null, undefined, or empty string if it somehow bypasses Status type
    switch (status) {
        case 'To Do': return 'TO_DO';
        case 'In Progress': return 'IN_PROGRESS';
        case 'Blocked': return 'BLOCKED';
        case 'Completed': return 'COMPLETED';
        default:
            // This case should ideally not be reached if Status type is strictly followed
            // However, to be robust for unexpected values:
            const upperStatus = status.toUpperCase().replace(/\\s+/g, '_');
            if (['TO_DO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].includes(upperStatus)) {
                if (typeof console !== 'undefined') {
                    console.warn(`[mapStatusToStatusID] Mapped non-standard status "${status}" to "${upperStatus as StatusID}".`);
                }
                return upperStatus as StatusID;
            }
            if (typeof console !== 'undefined') {
                console.warn(`[mapStatusToStatusID] Unknown status value: "${status}", defaulting to TO_DO.`);
            }
            return 'TO_DO';
    }
}; 