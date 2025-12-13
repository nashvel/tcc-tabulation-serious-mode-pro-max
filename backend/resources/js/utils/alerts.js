import Swal from 'sweetalert2';

export const showSuccess = (message, options = {}) => {
  return Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: options.duration || 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...options
  });
};

export const showError = (message, options = {}) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    timer: options.duration || 4000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...options
  });
};

export const showConfirm = async (title, message, options = {}) => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonColor: options.confirmColor || '#3085d6',
    cancelButtonColor: options.cancelColor || '#d33',
    confirmButtonText: options.confirmText || 'Yes',
    cancelButtonText: options.cancelText || 'Cancel',
    ...options
  });
  return result.isConfirmed;
};

export const showInfo = (message, options = {}) => {
  return Swal.fire({
    icon: 'info',
    title: 'Info',
    text: message,
    timer: options.duration || 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...options
  });
};

export default { showSuccess, showError, showConfirm, showInfo };
