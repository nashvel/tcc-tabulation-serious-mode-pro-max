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

export const showFormModal = async (title, fields, options = {}) => {
  // Build HTML for form fields
  let html = '<div class="space-y-4 text-left">';
  
  for (const [key, field] of Object.entries(fields)) {
    html += `<div>`;
    html += `<label class="block text-sm font-medium text-gray-700 mb-1">${field.label}</label>`;
    
    if (field.type === 'select') {
      html += `<select id="swal-${key}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900">`;
      for (const opt of field.options) {
        const selected = opt.value === field.value ? 'selected' : '';
        html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
      }
      html += `</select>`;
    } else {
      html += `<input 
        type="${field.type || 'text'}" 
        id="swal-${key}" 
        value="${field.value || ''}" 
        placeholder="${field.placeholder || ''}"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
      />`;
    }
    
    html += `</div>`;
  }
  
  html += '</div>';
  
  const result = await Swal.fire({
    title: title,
    html: html,
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Save',
    cancelButtonText: options.cancelText || 'Cancel',
    confirmButtonColor: '#111827',
    cancelButtonColor: '#6b7280',
    focusConfirm: false,
    customClass: {
      popup: 'rounded-xl',
      title: 'text-lg font-semibold text-gray-900',
      htmlContainer: 'px-2',
      confirmButton: 'rounded-lg',
      cancelButton: 'rounded-lg'
    },
    preConfirm: () => {
      const values = {};
      for (const key of Object.keys(fields)) {
        const el = document.getElementById(`swal-${key}`);
        if (el) {
          values[key] = el.value;
        }
      }
      return values;
    }
  });
  
  if (result.isConfirmed) {
    return result.value;
  }
  return null;
};

export default { showSuccess, showError, showConfirm, showInfo, showFormModal };
