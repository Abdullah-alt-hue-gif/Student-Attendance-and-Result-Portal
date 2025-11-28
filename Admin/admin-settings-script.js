// Settings Controller
class SettingsController {
    constructor() {
        this.init();
    }

    init() {
        this.checkAdminSession();
        this.setupSidebar();
        this.loadSettings();
        this.setupEventListeners();
        this.setupNotificationDropdown();
    }

    checkAdminSession() {
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        if (!session.isLoggedIn) {
            window.location.href = '../login/admin-login.html';
            return;
        }

        // Update admin name in sidebar
        const adminNameEl = document.getElementById('adminName');
        if (adminNameEl && session.adminName) {
            adminNameEl.textContent = session.adminName;
        }
    }

    setupSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    }

    loadSettings() {
        // Load profile settings
        const adminProfile = JSON.parse(localStorage.getItem('adminProfile') || '{}');
        if (adminProfile.firstName) {
            document.getElementById('firstName').value = adminProfile.firstName;
        }
        if (adminProfile.lastName) {
            document.getElementById('lastName').value = adminProfile.lastName;
        }
        if (adminProfile.email) {
            document.getElementById('email').value = adminProfile.email;
        }
        if (adminProfile.phone) {
            document.getElementById('phone').value = adminProfile.phone;
        }

        // Load system settings
        const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}');
        if (systemSettings.academicYear) {
            document.getElementById('academicYear').value = systemSettings.academicYear;
        }
        if (systemSettings.semester) {
            document.getElementById('semester').value = systemSettings.semester;
        }
        if (systemSettings.attendanceThreshold) {
            document.getElementById('attendanceThreshold').value = systemSettings.attendanceThreshold;
        }

        // Load notification preferences
        const notificationPrefs = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        document.getElementById('emailAttendance').checked = notificationPrefs.emailAttendance !== false;
        document.getElementById('emailRegistration').checked = notificationPrefs.emailRegistration !== false;
        document.getElementById('weeklyReports').checked = notificationPrefs.weeklyReports || false;
    }

    setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileSettings();
        });

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // System form
        const systemForm = document.getElementById('systemForm');
        systemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });

        // Notification form
        const notificationForm = document.getElementById('notificationForm');
        notificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNotificationPreferences();
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminSession');
                showToast('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = '../login/admin-login.html';
                }, 1000);
            });
        }
    }

    saveProfileSettings() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        // Validation
        if (!firstName || !lastName || !email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Save to localStorage
        const adminProfile = {
            firstName,
            lastName,
            email,
            phone,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('adminProfile', JSON.stringify(adminProfile));

        // Update session
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        session.adminName = `${firstName} ${lastName}`;
        localStorage.setItem('adminSession', JSON.stringify(session));

        // Update UI
        const adminNameEl = document.getElementById('adminName');
        if (adminNameEl) {
            adminNameEl.textContent = session.adminName;
        }

        showToast('Profile settings saved successfully!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
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

        // In a real app, you'd verify the current password against the server
        // For demo purposes, we'll just update it
        const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');

        // Verify current password (simplified for demo)
        if (adminCredentials.password && adminCredentials.password !== currentPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }

        // Save new password
        adminCredentials.password = newPassword;
        adminCredentials.lastPasswordChange = new Date().toISOString();
        localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));

        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        showToast('Password updated successfully!', 'success');
    }

    saveSystemSettings() {
        const academicYear = document.getElementById('academicYear').value;
        const semester = document.getElementById('semester').value;
        const attendanceThreshold = parseInt(document.getElementById('attendanceThreshold').value);

        // Validation
        if (attendanceThreshold < 0 || attendanceThreshold > 100) {
            showToast('Attendance threshold must be between 0 and 100', 'error');
            return;
        }

        // Save to localStorage
        const systemSettings = {
            academicYear,
            semester,
            attendanceThreshold,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('systemSettings', JSON.stringify(systemSettings));

        showToast('System settings saved successfully!', 'success');
    }

    saveNotificationPreferences() {
        const emailAttendance = document.getElementById('emailAttendance').checked;
        const emailRegistration = document.getElementById('emailRegistration').checked;
        const weeklyReports = document.getElementById('weeklyReports').checked;

        // Save to localStorage
        const notificationPreferences = {
            emailAttendance,
            emailRegistration,
            weeklyReports,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('notificationPreferences', JSON.stringify(notificationPreferences));

        showToast('Notification preferences saved successfully!', 'success');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupNotificationDropdown() {
        const notificationIcon = document.querySelector('.notification-icon');
        if (!notificationIcon) return;

        let dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notificationDropdown';
            dropdown.className = 'notification-dropdown';
            notificationIcon.appendChild(dropdown);
        }

        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                this.populateNotifications();
            }
        });

        document.addEventListener('click', (e) => {
            if (!notificationIcon.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    populateNotifications() {
        const dropdown = document.getElementById('notificationDropdown');
        const alerts = JSON.parse(localStorage.getItem('attendanceAlerts')) || [];

        let notificationsHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" onclick="markAllNotificationsRead()">Mark all read</button>
            </div>
            <div class="notification-list">
        `;

        if (alerts.length === 0) {
            notificationsHTML += `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
        } else {
            alerts.slice(0, 5).forEach(alert => {
                const iconClass = alert.status === 'Critical' ? 'critical' : 'warning';
                notificationsHTML += `
                    <div class="notification-item unread">
                        <div class="notification-icon-wrapper ${iconClass}">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">Low Attendance Alert</div>
                            <div class="notification-message">${alert.studentName} - ${alert.course}: ${alert.attendance}%</div>
                            <div class="notification-time">Just now</div>
                        </div>
                    </div>
                `;
            });
        }

        notificationsHTML += `
            </div>
            <div class="notification-footer">
                <a href="#" class="view-all-notifications">View All Notifications</a>
            </div>
        `;

        dropdown.innerHTML = notificationsHTML;

        // Update badge count
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = alerts.length;
        }
    }
}

// Helper Functions
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

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    });
}

function markAllNotificationsRead() {
    showToast('All notifications marked as read', 'info');
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});
