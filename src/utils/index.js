/**
 * Utility functions for icon management
 */

/**
 * Validate an icon set
 * @param {Object} iconSet - The icon set to validate
 * @returns {boolean} Whether the icon set is valid
 */
export const validateIconSet = (iconSet) => {
    return (
        iconSet &&
        typeof iconSet === 'object' &&
        Array.isArray(iconSet.icons) &&
        typeof iconSet.name === 'string' &&
        typeof iconSet.label === 'string'
    );
};

/**
 * Transform an icon name to a consistent format
 * @param {string} name - The icon name to transform
 * @returns {string} The transformed icon name
 */
export const normalizeIconName = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}; 