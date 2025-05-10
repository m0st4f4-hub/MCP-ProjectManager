export function formatDisplayName(name: string | null | undefined): string {
    if (!name) return 'N/A'; // Or an empty string, depending on desired fallback

    let result = name;

    // Detect and split PascalCase or camelCase (e.g., RuleWriterAgent -> Rule Writer Agent)
    // This regex looks for a lowercase letter followed by an uppercase letter, or an uppercase letter followed by an uppercase letter and then a lowercase one (for acronyms like DBManager -> DB Manager)
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2')
                   .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

    // Split by space, dash, or underscore, then capitalize each word
    const words = result.split(/[-_\s]+/);
    
    return words.map(word => {
        if (word.length === 0) return '';
        // Preserve acronyms if they are all uppercase and more than 1 letter
        if (word.toUpperCase() === word && word.length > 1) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ').trim();
} 