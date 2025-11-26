// teacher-settings-script.js

// Global variables
let teacherData = {};
let teacherPreferences = {};

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    checkTeacherSession();
    loadTeacherProfile();
    loadNotificationPreferences();
});

// Check if user is logged in as teacher
function checkTeacherSession() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    let teacherName = localStorage.getItem('userName') || sessionStorage.getItem('userName');

    if (!userRole || userRole !== 'teacher') {
        alert('Please login as a teacher first');
        window.location.href = 'teacher-login.html';
        return;
    }

    // Load teacher data from portalUsers
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const teacher = users.find(u => u.email === userEmail && u.role === 'teacher');

        if (teacher) {
            teacherData = teacher;
            if (!teacherName) {
                teacherName = teacher.name;
            }
        }
    }

    if (!teacherName) {
        teacherName = userEmail ? userEmail.split('@')[0] : 'Teacher';
    }

    // Update sidebar profile
    document.getElementById('sidebarName').textContent = teacherName;
    const initials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('sidebarAvatar').textContent = initials;
}

// Load teacher profile into form
function loadTeacherProfile() {
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

    if (teacherData && teacherData.name) {
        // Split name into first and last
        const nameParts = teacherData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = teacherData.email || userEmail;
        document.getElementById('phone').value = teacherData.phone || '';
        document.getElementById('department').value = teacherData.department || '';
    } else {
        // Fallback if no teacher data
        document.getElementById('email').value = userEmail || '';
    }
}

// Load notification preferences
function loadNotificationPreferences() {
    // Try to load from localStorage
    const savedPreferences = localStorage.getItem('teacherPreferences');
    if (savedPreferences) {
        teacherPreferences = JSON.parse(savedPreferences);

        // Find preferences for this teacher
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        const userPrefs = teacherPreferences[userEmail];

        if (userPrefs) {
            document.getElementById('classNotifications').checked = userPrefs.classNotifications !== false;
            document.getElementById('submissionNotifications').checked = userPrefs.submissionNotifications !== false;
            document.getElementById('attendanceAlerts').checked = userPrefs.attendanceAlerts || false;
        }
    }
}

// Save profile information
function saveProfile() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value.trim();

    if (!firstName || !lastName) {
        showMessage('Please enter both first and last name', 'error');
        return;
    }

    // Update teacher name
    const fullName = `${firstName} ${lastName}`;

    // Load all users
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

        // Find and update teacher data
        const teacherIndex = users.findIndex(u => u.email === userEmail && u.role === 'teacher');

        if (teacherIndex !== -1) {
            users[teacherIndex].name = fullName;
            users[teacherIndex].phone = phone;
            users[teacherIndex].department = department;

            // Save back to localStorage
            localStorage.setItem('portalUsers', JSON.stringify(users));

            // Update session storage
            localStorage.setItem('userName', fullName);
            if (sessionStorage.getItem('userName')) {
                sessionStorage.setItem('userName', fullName);
            }

            // Update local copy
            teacherData = users[teacherIndex];

            // Update sidebar display
            document.getElementById('sidebarName').textContent = fullName;
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            document.getElementById('sidebarAvatar').textContent = initials;

            showMessage('Profile updated successfully!', 'success');
        } else {
            showMessage('Error: Teacher profile not found', 'error');
        }
    }
}

// Update password
function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters', 'error');
        return;
    }

    // Load all users
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

        // Find teacher
        const teacherIndex = users.findIndex(u => u.email === userEmail && u.role === 'teacher');

        if (teacherIndex !== -1) {
            // Verify current password
            if (users[teacherIndex].password !== currentPassword) {
                showMessage('Current password is incorrect', 'error');
                return;
            }

            // Update password
            users[teacherIndex].password = newPassword;

            // Save back to localStorage
            localStorage.setItem('portalUsers', JSON.stringify(users));

            // Clear form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            showMessage('Password updated successfully!', 'success');
        } else {
            showMessage('Error: Teacher profile not found', 'error');
        }
    }
}

// Save notification preferences
function savePreferences() {
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

    const preferences = {
        classNotifications: document.getElementById('classNotifications').checked,
        submissionNotifications: document.getElementById('submissionNotifications').checked,
        attendanceAlerts: document.getElementById('attendanceAlerts').checked
    };

    // Load existing preferences
    const savedPreferences = localStorage.getItem('teacherPreferences');
    let allPreferences = savedPreferences ? JSON.parse(savedPreferences) : {};

    // Update for this teacher
    allPreferences[userEmail] = preferences;

    // Save back to localStorage
    localStorage.setItem('teacherPreferences', JSON.stringify(allPreferences));

    showMessage('Notification preferences saved!', 'success');
}

// Show message to user
function showMessage(message, type = 'success') {
    // Create message overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;

    overlay.textContent = message;
    document.body.appendChild(overlay);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Remove after 3 seconds
    setTimeout(() => {
        overlay.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// Toggle notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('show');
}

// Close notifications when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('notificationDropdown');
    const btn = document.querySelector('.notification-btn');

    if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(event.target) && !btn.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
});

function markAllRead() {
    const badges = document.querySelectorAll('.notification-item.unread');
    badges.forEach(item => item.classList.remove('unread'));
    document.getElementById('notificationCount').style.display = 'none';
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        sessionStorage.clear();
        window.location.href = '../login/teacher-login.html';
    }
}

// Listen for storage changes from admin portal
window.addEventListener('storage', function (e) {
    if (e.key === 'portalUsers') {
        // Reload teacher data when admin makes changes
        console.log('User data updated by admin, refreshing profile...');
        checkTeacherSession();
        loadTeacherProfile();
    }
});
