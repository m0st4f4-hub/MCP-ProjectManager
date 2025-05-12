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