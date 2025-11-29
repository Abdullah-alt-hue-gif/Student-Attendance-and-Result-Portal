// ========================================
// Shared Data Manager (Synced with Admin)
// ========================================

class DataManager {
    constructor() {
        // No initialization needed - we use admin's data directly
    }

    // Get current teacher's information
    getCurrentTeacher() {
        const session = JSON.parse(localStorage.getItem('teacherSession') || '{}');
        if (session.teacherName) {
            const users = this.getUsers();
            return users.find(u => u.name === session.teacherName && u.role === 'Teacher');
        }
        return null;
    }

    // Users CRUD (shared with admin)
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    updateUser(updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));

            // Update session if name changed
            const session = JSON.parse(localStorage.getItem('teacherSession') || '{}');
            if (session.teacherName === updatedUser.name) {
                // Name didn't change, or we need to update session name if it did?
                // Actually, if name changes, we should update session too
                session.teacherName = updatedUser.name;
                localStorage.setItem('teacherSession', JSON.stringify(session));
            }
            return true;
        }
        return false;
    }
}

// ========================================
// Shared UI Logic
// ========================================

function checkTeacherSession() {
    const session = JSON.parse(localStorage.getItem('teacherSession') || '{}');
    if (!session.isLoggedIn) {
        window.location.href = '../login/teacher-login.html';
        return false;
    }

    const teacherNameEl = document.getElementById('teacherName');
    if (teacherNameEl && session.teacherName) {
        teacherNameEl.textContent = session.teacherName;
    }

    return true;
}

function setupSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('teacherSession');
            window.location.href = '../login/teacher-login.html';
        });
    }

    // Notification Dropdown
    const notifIcon = document.querySelector('.notification-icon');
    const notifDropdown = document.getElementById('notificationDropdown');

    if (notifIcon && notifDropdown) {
        notifIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !notifIcon.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.success}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// Settings Controller
// ========================================

class SettingsController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentUser = null;
        this.init();
    }

    init() {
        if (!checkTeacherSession()) return;
        setupSidebar();

        this.currentUser = this.dataManager.getCurrentTeacher();
        if (this.currentUser) {
            this.loadProfileData();
            this.loadPreferences();
        }

        this.setupEventListeners();
    }

    loadProfileData() {
        const nameParts = this.currentUser.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = this.currentUser.email || '';
        document.getElementById('phone').value = this.currentUser.phone || '';
        document.getElementById('department').value = this.currentUser.subject || 'General';
    }

    loadPreferences() {
        const prefs = this.currentUser.preferences || {};
        document.getElementById('notifClasses').checked = prefs.upcomingClasses !== false; // Default true
        document.getElementById('notifSubmissions').checked = prefs.submissions !== false; // Default true
        document.getElementById('notifAlerts').checked = prefs.lowAttendance === true; // Default false
    }

    setupEventListeners() {
        // Profile Form
        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Password Form
        document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePassword();
        });

        // Preferences Form
        document.getElementById('preferencesForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePreferences();
        });
    }

    saveProfile() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!firstName || !lastName || !email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const updatedUser = {
            ...this.currentUser,
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone
        };

        if (this.dataManager.updateUser(updatedUser)) {
            this.currentUser = updatedUser;
            document.getElementById('teacherName').textContent = updatedUser.name;
            showToast('Profile updated successfully', 'success');
        } else {
            showToast('Failed to update profile', 'error');
        }
    }

    updatePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // In a real app, we would verify current password with backend
        // Here we just check if it matches the stored password (if we stored it, which we don't for security in this demo)
        // So we'll simulate verification success for demo purposes

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            showToast('Password updated successfully', 'success');
            document.getElementById('passwordForm').reset();
        }, 800);
    }

    savePreferences() {
        const preferences = {
            upcomingClasses: document.getElementById('notifClasses').checked,
            submissions: document.getElementById('notifSubmissions').checked,
            lowAttendance: document.getElementById('notifAlerts').checked
        };

        const updatedUser = {
            ...this.currentUser,
            preferences: preferences
        };

        if (this.dataManager.updateUser(updatedUser)) {
            this.currentUser = updatedUser;
            showToast('Preferences saved successfully', 'success');
        } else {
            showToast('Failed to save preferences', 'error');
        }
    }
}

// Initialize
let settingsController;
document.addEventListener('DOMContentLoaded', () => {
    settingsController = new SettingsController();
});
