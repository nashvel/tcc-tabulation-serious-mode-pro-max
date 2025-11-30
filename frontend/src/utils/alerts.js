import Swal from 'sweetalert2';

const THEME_COLORS = {
    default: '#1064b9ff', // Default blue
    indigo: '#4F46E5',
    blue: '#3B82F6',
    purple: '#9333EA',
    pink: '#EC4899',
    red: '#EF4444',
    orange: '#F97316',
    amber: '#F59E0B',
    green: '#10B981',
    teal: '#14B8A6',
    cyan: '#06B6D4'
};

const getThemeColor = () => {
    const theme = localStorage.getItem('appTheme') || 'default';
    return THEME_COLORS[theme] || THEME_COLORS.default;
};

/**
 * Show success alert
 * @param {string} message - Success message
 * @param {object} options - Additional options
 */
export const showSuccess = (message, options = {}) => {
    return Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: getThemeColor(),
        timer: options.duration || 2000,
        ...options
    });
};

/**
 * Show error alert
 * @param {string} message - Error message
 * @param {object} options - Additional options
 */
export const showError = (message, options = {}) => {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
        ...options
    });
};

/**
 * Show warning alert
 * @param {string} message - Warning message
 * @param {object} options - Additional options
 */
export const showWarning = (message, options = {}) => {
    return Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#F59E0B',
        ...options
    });
};

/**
 * Show info alert
 * @param {string} message - Info message
 * @param {object} options - Additional options
 */
export const showInfo = (message, options = {}) => {
    return Swal.fire({
        icon: 'info',
        title: message,
        showConfirmButton: false,
        timer: options.duration || 3000,
        toast: true,
        position: 'top-end',
        timerProgressBar: true,
        ...options
    });
};
