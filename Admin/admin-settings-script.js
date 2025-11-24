// admin-settings-script.js

// Initialize settings page
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    loadSettings();
});

function checkUserSession() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!userRole || userRole !== 'admin') {
        alert('Please login as admin first');
        window.location.href = 'admin-login.html';
        return;
    }
}

function loadSettings() {
    // Load admin's name and email from login session
    const adminName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Admin';
    const adminEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'admin@portal.com';

    // Split name into first and last
    const nameParts = adminName.split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Load profile settings from login data
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
    document.getElementById('emailAddress').value = adminEmail;

    // Load additional settings from localStorage if they exist
    const savedSettings = localStorage.getItem('portalSettings');

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        // Load profile settings (override with saved if exists)
        if (settings.profile) {
            if (settings.profile.phone) {
                document.getElementById('phoneNumber').value = settings.profile.phone;
            }
        }

        // Load system settings
        if (settings.system) {
            document.getElementById('academicYear').value = settings.system.academicYear || '2025-2026';
            document.getElementById('semester').value = settings.system.semester || 'Fall 2025';
            document.getElementById('attendanceThreshold').value = settings.system.attendanceThreshold || 75;
        }

        // Load notification preferences
        if (settings.notifications) {
            document.getElementById('lowAttendanceAlerts').checked = settings.notifications.lowAttendance !== false;
            document.getElementById('newUserNotifications').checked = settings.notifications.newUser !== false;
            document.getElementById('weeklySummary').checked = settings.notifications.weeklySummary || false;
        }
    }
}

function saveProfileSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('portalSettings') || '{}');

    savedSettings.profile = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('emailAddress').value,
        phone: document.getElementById('phoneNumber').value
    };

    localStorage.setItem('portalSettings', JSON.stringify(savedSettings));
    showToast('Profile settings saved successfully!', 'success');
}

function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        showToast('Password must contain both letters and numbers', 'error');
        return;
    }

    // In a real application, this would verify the current password and update it
    // For now, we'll just show success
    showToast('Password updated successfully!', 'success');

    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function saveSystemSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('portalSettings') || '{}');

    savedSettings.system = {
        academicYear: document.getElementById('academicYear').value,
        semester: document.getElementById('semester').value,
        attendanceThreshold: parseInt(document.getElementById('attendanceThreshold').value)
    };

    localStorage.setItem('portalSettings', JSON.stringify(savedSettings));
    showToast('System settings saved successfully!', 'success');
}

function saveNotificationPreferences() {
    const savedSettings = JSON.parse(localStorage.getItem('portalSettings') || '{}');

    savedSettings.notifications = {
        lowAttendance: document.getElementById('lowAttendanceAlerts').checked,
        newUser: document.getElementById('newUserNotifications').checked,
        weeklySummary: document.getElementById('weeklySummary').checked
    };

    localStorage.setItem('portalSettings', JSON.stringify(savedSettings));
    showToast('Notification preferences saved successfully!', 'success');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        sessionStorage.clear();
        window.location.href = '../Login/admin-login.html';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}