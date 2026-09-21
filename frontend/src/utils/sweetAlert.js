import Swal from 'sweetalert2';
// Base styling matching the dark aesthetic
const darkCustomClass = {
    popup: 'bg-zinc-900 text-zinc-100 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-6 font-sans',
    title: 'text-lg font-bold text-white tracking-tight',
    htmlContainer: 'text-xs text-zinc-300 leading-relaxed font-normal',
    confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer mx-1',
    cancelButton: 'px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all focus:outline-none cursor-pointer mx-1',
    denyButton: 'px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all focus:outline-none cursor-pointer mx-1'
};
export const SweetAlert = Swal.mixin({
    background: '#18181b',
    color: '#f4f4f5',
    buttonsStyling: false,
    customClass: darkCustomClass
});
/**
 * Display a Success Sweet Popup
 */
export const showSuccessAlert = async (title, htmlOrText, timer = 2000) => {
    return SweetAlert.fire({
        icon: 'success',
        title,
        html: htmlOrText,
        timer: timer > 0 ? timer : undefined,
        timerProgressBar: timer > 0,
        showConfirmButton: timer === 0,
        confirmButtonText: 'Great, Continue',
        iconColor: '#10b981'
    });
};
/**
 * Display an Error Sweet Popup
 */
export const showErrorAlert = async (title, htmlOrText) => {
    return SweetAlert.fire({
        icon: 'error',
        title,
        html: htmlOrText,
        confirmButtonText: 'Understood',
        iconColor: '#f43f5e'
    });
};
/**
 * Display a Warning Sweet Popup
 */
export const showWarningAlert = async (title, htmlOrText) => {
    return SweetAlert.fire({
        icon: 'warning',
        title,
        html: htmlOrText,
        confirmButtonText: 'Acknowledge',
        iconColor: '#f59e0b'
    });
};
/**
 * Display an Info Sweet Popup
 */
export const showInfoAlert = async (title, htmlOrText) => {
    return SweetAlert.fire({
        icon: 'info',
        title,
        html: htmlOrText,
        confirmButtonText: 'Got It',
        iconColor: '#6366f1'
    });
};
/**
 * Display a Confirmation Popup with Yes/No action
 */
export const showConfirmAlert = async (title, htmlOrText, confirmButtonText = 'Yes, Proceed', cancelButtonText = 'Cancel', icon = 'warning') => {
    return SweetAlert.fire({
        icon,
        title,
        html: htmlOrText,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        iconColor: icon === 'warning' ? '#f59e0b' : icon === 'question' ? '#818cf8' : '#38bdf8'
    });
};
/**
 * Display a Sweet Toast (non-blocking notification)
 */
export const showSweetToast = (title, icon = 'success', timer = 3000) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        background: '#18181b',
        color: '#f4f4f5',
        customClass: {
            popup: 'bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-xl p-3 flex items-center gap-2 text-xs font-medium',
            title: 'text-xs font-semibold text-zinc-100'
        },
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
    return Toast.fire({
        icon,
        title
    });
};
/**
 * Dedicated Logout Confirmation Sweet Popup
 */
export const showLogoutConfirmation = async () => {
    const res = await SweetAlert.fire({
        icon: 'question',
        title: 'Confirm Session Sign Out',
        html: '<p class="text-xs text-zinc-400">Are you sure you want to log out of your current academic workspace?</p>',
        showCancelButton: true,
        confirmButtonText: 'Yes, Sign Out',
        cancelButtonText: 'Stay Signed In',
        reverseButtons: true,
        iconColor: '#f43f5e',
        customClass: {
            ...darkCustomClass,
            confirmButton: 'px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all focus:outline-none cursor-pointer mx-1'
        }
    });
    return res.isConfirmed;
};
/**
 * Dedicated Role Access Mismatch Sweet Popup
 */
export const showRoleMismatchAlert = async (accountRole, requestedRole, onSwitchRole) => {
    const roleNames = {
        student: 'Student',
        teacher: 'Faculty / Teacher',
        admin: 'System Administrator'
    };
    const res = await SweetAlert.fire({
        icon: 'error',
        title: 'Access Restricted: Role Mismatch',
        html: `
      <div class="space-y-2 text-left bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 my-2">
        <p class="text-xs text-zinc-300">
          This account is registered under the <strong class="text-amber-400">${roleNames[accountRole] || accountRole}</strong> role.
        </p>
        <p class="text-xs text-zinc-400">
          You are currently attempting to authenticate into the <strong class="text-indigo-400">${roleNames[requestedRole] || requestedRole} Portal</strong>.
        </p>
      </div>
      <p class="text-xs text-zinc-400 mt-2">
        To maintain strict institutional grading security, please switch to your designated portal.
      </p>
    `,
        showCancelButton: !!onSwitchRole,
        confirmButtonText: onSwitchRole ? `Switch to ${roleNames[accountRole] || accountRole} Portal` : 'Understood',
        cancelButtonText: 'Dismiss',
        iconColor: '#f43f5e'
    });
    if (res.isConfirmed && onSwitchRole) {
        onSwitchRole();
    }
};
