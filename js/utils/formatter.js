/* ============================================
   Formatter Module
   Date formatting, skill parsing, text utils
   ============================================ */

/**
 * Format a date string (YYYY-MM) to readable format
 * @param {string} dateStr - e.g. "2023-06"
 * @returns {string} - e.g. "Jun 2023"
 */
export function formatDate(dateStr) {
    if (!dateStr) return 'Present';

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const parts = dateStr.split('-');
    if (parts.length < 2) return dateStr;

    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;

    if (monthIndex < 0 || monthIndex > 11) return dateStr;

    return `${months[monthIndex]} ${year}`;
}

/**
 * Format date range
 * @param {string} startDate 
 * @param {string} endDate 
 * @param {boolean} isCurrent 
 * @returns {string}
 */
export function formatDateRange(startDate, endDate, isCurrent = false) {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Present' : formatDate(endDate);
    return `${start} – ${end}`;
}

/**
 * Parse comma-separated skills into array
 * @param {string} skillsStr 
 * @returns {string[]}
 */
export function parseSkills(skillsStr) {
    if (!skillsStr) return [];
    return skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

/**
 * Format skills array back to comma-separated string
 * @param {string[]} skills 
 * @returns {string}
 */
export function formatSkills(skills) {
    return skills.join(', ');
}

/**
 * Truncate text to a max length
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 200) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Escape HTML special characters
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/**
 * Capitalize first letter of each word
 * @param {string} str 
 * @returns {string}
 */
export function titleCase(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
}
