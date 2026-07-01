import Swal from 'sweetalert2';

const appSwalDefaults = {
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#64748b',
  background: '#ffffff',
  color: '#0f172a',
  buttonsStyling: false,
  customClass: {
    popup: 'swal2-app-popup',
    confirmButton: 'swal2-app-confirm',
    cancelButton: 'swal2-app-cancel',
  },
};

Swal.mixin(appSwalDefaults);

export const showAppAlert = (options = {}) => Swal.fire({ ...appSwalDefaults, ...options });

export const showSuccess = (title, text, options = {}) =>
  showAppAlert({ icon: 'success', title, text, ...options });

export const showError = (title, text, options = {}) =>
  showAppAlert({ icon: 'error', title, text, ...options });

export const showInfo = (title, text, options = {}) =>
  showAppAlert({ icon: 'info', title, text, ...options });

export default Swal;
