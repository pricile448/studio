const COLORS = [
    '#e51c23', // red
    '#e91e63', // pink
    '#9c27b0', // purple
    '#673ab7', // deep purple
    '#3f51b5', // indigo
    '#2196f3', // blue
    '#03a9f4', // light blue
    '#00bcd4', // cyan
    '#009688', // teal
    '#4caf50', // green
    '#8bc34a', // light green
    '#cddc39', // lime
    '#ffc107', // amber
    '#ff9800', // orange
    '#ff5722', // deep orange
    '#795548', // brown
    '#607d8b', // blue grey
];

/**
 * Generates a color from a predefined palette based on a string.
 * This is used to give user avatars a consistent, unique color.
 * @param str The input string (e.g., user's name or ID).
 * @returns A hex color code from the palette.
 */
export function generateColorFromString(str: string): string {
    if (!str) {
        return COLORS[0];
    }
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // Simple hash function
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Normalize to a non-negative index
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}
