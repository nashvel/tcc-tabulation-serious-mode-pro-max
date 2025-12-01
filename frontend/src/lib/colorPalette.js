/**
 * Color Palette Library
 * Reusable color management system with localStorage persistence
 */

export const THEME_COLORS = [
    { name: 'Default', value: 'default', primary: '#FFFFFF', hover: '#F3F4F6', text: '#1F2937', border: '#E5E7EB' },
    { name: 'Indigo', value: 'indigo', primary: '#4F46E5', hover: '#4338CA', text: '#FFFFFF', border: '#4F46E5' },
    { name: 'Blue', value: 'blue', primary: '#3B82F6', hover: '#2563EB', text: '#FFFFFF', border: '#3B82F6' },
    { name: 'Purple', value: 'purple', primary: '#9333EA', hover: '#7C3AED', text: '#FFFFFF', border: '#9333EA' },
    { name: 'Pink', value: 'pink', primary: '#EC4899', hover: '#DB2777', text: '#FFFFFF', border: '#EC4899' },
    { name: 'Red', value: 'red', primary: '#EF4444', hover: '#DC2626', text: '#FFFFFF', border: '#EF4444' },
    { name: 'Orange', value: 'orange', primary: '#F97316', hover: '#EA580C', text: '#FFFFFF', border: '#F97316' },
    { name: 'Amber', value: 'amber', primary: '#F59E0B', hover: '#D97706', text: '#FFFFFF', border: '#F59E0B' },
    { name: 'Green', value: 'green', primary: '#10B981', hover: '#059669', text: '#FFFFFF', border: '#10B981' },
    { name: 'Teal', value: 'teal', primary: '#14B8A6', hover: '#0D9488', text: '#FFFFFF', border: '#14B8A6' },
    { name: 'Cyan', value: 'cyan', primary: '#06B6D4', hover: '#0891B2', text: '#FFFFFF', border: '#06B6D4' },
];

const STORAGE_KEY = 'candidateColors';

/**
 * Load candidate colors from localStorage
 * @returns {Object} Candidate colors object
 */
export const loadCandidateColors = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error loading candidate colors:', error);
        return {};
    }
};

/**
 * Save candidate colors to localStorage
 * @param {Object} colors - Candidate colors object
 */
export const saveCandidateColors = (colors) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    } catch (error) {
        console.error('Error saving candidate colors:', error);
    }
};

/**
 * Clear all candidate colors from localStorage
 */
export const clearCandidateColors = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing candidate colors:', error);
    }
};

/**
 * Apply color to a candidate number
 * @param {Object} colors - Current colors object
 * @param {number} candidateId - Candidate ID
 * @param {Object} color - Color object from THEME_COLORS
 * @returns {Object} Updated colors object
 */
export const applyNumberColor = (colors, candidateId, color) => {
    return {
        ...colors,
        [`${candidateId}-number`]: color.primary === '#FFFFFF' ? '#000000' : color.primary
    };
};

/**
 * Apply color to a candidate name background
 * @param {Object} colors - Current colors object
 * @param {number} candidateId - Candidate ID
 * @param {Object} color - Color object from THEME_COLORS
 * @returns {Object} Updated colors object
 */
export const applyNameColor = (colors, candidateId, color) => {
    return {
        ...colors,
        [`${candidateId}-name-bg`]: color.primary
    };
};

/**
 * Apply color to all candidates with the same gender (row background)
 * @param {Object} colors - Current colors object
 * @param {string} gender - Gender ('Male' or 'Female')
 * @param {Object} color - Color object from THEME_COLORS
 * @returns {Object} Updated colors object
 */
export const applyGenderRowColor = (colors, gender, color) => {
    return {
        ...colors,
        [`gender-${gender}-row-bg`]: color.primary
    };
};

/**
 * Get color for a candidate number
 * @param {Object} colors - Candidate colors object
 * @param {number} candidateId - Candidate ID
 * @param {string} fallbackColor - Fallback color if not found
 * @returns {string} Color hex value
 */
export const getCandidateNumberColor = (colors, candidateId, fallbackColor = '#000000') => {
    return colors[`${candidateId}-number`] || fallbackColor;
};

/**
 * Get background color for a candidate name
 * @param {Object} colors - Candidate colors object
 * @param {number} candidateId - Candidate ID
 * @returns {string} Color hex value or 'transparent'
 */
export const getCandidateNameBgColor = (colors, candidateId) => {
    return colors[`${candidateId}-name-bg`] || 'transparent';
};

/**
 * Get row background color for a gender
 * @param {Object} colors - Candidate colors object
 * @param {string} gender - Gender ('Male' or 'Female')
 * @returns {string} Color hex value or 'transparent'
 */
export const getGenderRowBgColor = (colors, gender) => {
    return colors[`gender-${gender}-row-bg`] || 'transparent';
};

/**
 * Export colors to JSON file
 * @param {Object} colors - Candidate colors object
 * @param {string} filename - Output filename
 */
export const exportColorsToFile = (colors, filename = 'candidate-colors.json') => {
    try {
        const dataStr = JSON.stringify(colors, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting colors:', error);
    }
};

/**
 * Import colors from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported colors object
 */
export const importColorsFromFile = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const colors = JSON.parse(e.target.result);
                resolve(colors);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        } catch (error) {
            reject(error);
        }
    });
};
