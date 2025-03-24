/**
 * Icon store that provides access to icon sets and utility functions.
 * Manages the state and operations for all available icon sets.
 * 
 * @example
 * // Get all enabled icons
 * const enabledIcons = iconStore.getEnabledIcons();
 * 
 * // Get icons from a specific set
 * constIcons = iconStore.getIconsBySet('phosphor');
 * 
 * // Toggle an icon set's enabled state
 * iconStore.toggleIconSet('fontAwesome');
 */
export const iconStore = {
    /**
     * Get all enabled icons grouped by set name
     * @returns {Object.<string, {label: string, icons: Array}>} Object containing enabled icon sets
     */
    getEnabledIcons() {
        return Object.values(this)
            .filter(set => typeof set === 'object' && set.enabled)
            .reduce((acc, set) => {
                acc[set.name] = {
                    label: set.label,
                    icons: set.icons
                };
                return acc;
            }, {});
    },
    /**
     * Get icons from a specific set
     * @param {string} setName - Name of the icon set (e.g., 'phosphor', 'fontAwesome')
     * @returns {Array} Array of icons from the specified set
     */
    getIconsBySet(setName) {
        return this[setName]?.icons || [];
    },

    /**
     * Get all available icon sets with their configurations
     * @returns {Array<{name: string, label: string, enabled: boolean}>} Array of icon set configurations
     */
    getIconSets() {
        return Object.entries(this)
            .filter(([_, value]) => typeof value === 'object' && 'enabled' in value)
            .map(([key, set]) => ({
                name: key,
                label: set.label,
                enabled: set.enabled
            }));
    },

    /**
     * Toggle the enabled state of an icon set
     * @param {string} setName - Name of the icon set to toggle
     * @returns {boolean} True if the operation was successful, false if the set doesn't exist
     */
    toggleIconSet(setName) {
        if (this[setName] && typeof this[setName] === 'object') {
            this[setName].enabled = !this[setName].enabled;
            return true;
        }
        return false;
    }
}; 