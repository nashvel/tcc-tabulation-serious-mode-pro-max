import Swal from 'sweetalert2';

/**
 * Show success alert
 * @param {string} message - Success message
 * @param {object} options - Additional options
 */
export const showSuccess = (message, options = {}) => {
    return Swal.fire({
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: options.duration || 2000,
        toast: true,
        position: 'top-end',
        timerProgressBar: true,
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
