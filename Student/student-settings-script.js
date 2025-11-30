// ========================================
// Shared Data Manager (Synced with Admin & Teacher)
// ========================================

class DataManager {
    constructor() {
        // No initialization needed - we use shared localStorage
    }

    // Get current student's information
    getCurrentStudent() {
        const session = JSON.parse(localStorage.getItem('studentSession') || '{}');
        const students = this.getStudents();

        // 1. Try to find by email
        if (session.email) {
            const found = students.find(s => s.email === session.email);
            if (found) return found;
        }

        // 2. Try to find by name
        if (session.studentName) {
            const found = students.find(s => s.name === session.studentName);
            if (found) return found;
        }

        // 3. Fallback: Create a temporary student object from session data
        if (session.studentName || session.email) {
            return {
                name: session.studentName || session.email.split('@')[0],
                email: session.email || '',
                role: 'Student',
                id: 'guest-' + Date.now()
            };
        }

        return null;
    }

    // Fetch students from the central 'users' array (Synced with Admin)
    getStudents() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.filter(u => u.role === 'Student');
    }

    // Update student information
    updateStudent(studentId, updatedData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const index = users.findIndex(u => u.id == studentId);

        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    // Get notification preferences
    getNotificationPreferences(studentId) {
        const key = `notificationPrefs_${studentId}`;
        const prefs = localStorage.getItem(key);
        return prefs ? JSON.parse(prefs) : {
            results: true,
            attendance: true,
            announcements: false,
            examReminders: true
        };
    }

    // Save notification preferences
    saveNotificationPreferences(studentId, preferences) {
        const key = `notificationPrefs_${studentId}`;
        localStorage.setItem(key, JSON.stringify(preferences));
    }
}

// ========================================
// Shared UI Logic
// ========================================

function checkStudentSession() {
    const session = JSON.parse(localStorage.getItem('studentSession') || '{}');
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
            localStorage.removeItem('studentSession');
            window.location.href = '../login/student-login.html';
        });
    }

    // Notification Dropdown Logic
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

// ========================================
// Toast Notification System
// ========================================

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
        this.currentStudent = null;
        this.init();
    }

    init() {
        if (!checkStudentSession()) return;
        setupSidebar();

        this.currentStudent = this.dataManager.getCurrentStudent();

        if (this.currentStudent) {
            this.updateProfile();
            this.loadPersonalInfo();
            this.loadAcademicInfo();
            this.loadNotificationPreferences();
            this.setupEventListeners();
        } else {
            console.error('No student data found');
        }
    }

    updateProfile() {
        const nameEl = document.getElementById('studentName');
        const avatarEl = document.querySelector('.user-avatar');

        if (nameEl) nameEl.textContent = this.currentStudent.name;

        if (avatarEl) {
            const initials = this.currentStudent.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            avatarEl.textContent = initials;
        }
    }

    loadPersonalInfo() {
        // Parse name into first and last
        const nameParts = this.currentStudent.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('emailAddress').value = this.currentStudent.email || '';
        document.getElementById('studentId').value = this.currentStudent.id || '';
        document.getElementById('phoneNumber').value = this.currentStudent.phone || '';
        document.getElementById('dateOfBirth').value = this.currentStudent.dob || '';
    }

    loadAcademicInfo() {
        document.getElementById('program').value = this.currentStudent.program || 'Bachelor of Science';
        document.getElementById('major').value = this.currentStudent.major || 'Computer Science';
        document.getElementById('semester').value = this.currentStudent.semester || 'Fall 2025';
        document.getElementById('year').value = this.currentStudent.year || '3rd Year';
    }

    loadNotificationPreferences() {
        const prefs = this.dataManager.getNotificationPreferences(this.currentStudent.id);

        document.getElementById('notifResults').checked = prefs.results;
        document.getElementById('notifAttendance').checked = prefs.attendance;
        document.getElementById('notifAnnouncements').checked = prefs.announcements;
        document.getElementById('notifExamReminders').checked = prefs.examReminders;
    }

    setupEventListeners() {
        // Personal Info Form
        const personalForm = document.getElementById('personalInfoForm');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonalInfo();
            });
        }

        // Password Form
        const passwordForm = document.getElementById('changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Notification Preferences Form
        const notifForm = document.getElementById('notificationPreferencesForm');
        if (notifForm) {
            notifForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNotificationPreferences();
            });
        }
    }

    savePersonalInfo() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('emailAddress').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const dob = document.getElementById('dateOfBirth').value;

        if (!firstName || !lastName || !email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const updatedData = {
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone,
            dob: dob
        };

        const success = this.dataManager.updateStudent(this.currentStudent.id, updatedData);

        if (success) {
            // Update current student object
            this.currentStudent = { ...this.currentStudent, ...updatedData };

            // Update session
            const session = JSON.parse(localStorage.getItem('studentSession') || '{}');
            session.studentName = updatedData.name;
            session.email = updatedData.email;
            localStorage.setItem('studentSession', JSON.stringify(session));

            // Update profile display
            this.updateProfile();

            showToast('Personal information updated successfully!', 'success');
        } else {
            showToast('Failed to update personal information', 'error');
        }
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        // In a real app, you would verify the current password
        // For demo purposes, we'll just update it
        const success = this.dataManager.updateStudent(this.currentStudent.id, {
            password: newPassword
        });

        if (success) {
            showToast('Password updated successfully!', 'success');

            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showToast('Failed to update password', 'error');
        }
    }

    saveNotificationPreferences() {
        const preferences = {
            results: document.getElementById('notifResults').checked,
            attendance: document.getElementById('notifAttendance').checked,
            announcements: document.getElementById('notifAnnouncements').checked,
            examReminders: document.getElementById('notifExamReminders').checked
        };

        this.dataManager.saveNotificationPreferences(this.currentStudent.id, preferences);
        showToast('Notification preferences saved successfully!', 'success');
    }
}

// Initialize
let settingsController;
document.addEventListener('DOMContentLoaded', () => {
    settingsController = new SettingsController();
});
