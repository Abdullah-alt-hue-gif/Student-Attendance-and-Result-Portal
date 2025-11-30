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

    getCourses() {
        return JSON.parse(localStorage.getItem('courses')) || [];
    }

    getResults() {
        return JSON.parse(localStorage.getItem('examResults')) || [];
    }

    getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    }

    // Get courses the student is enrolled in
    getStudentCourses(studentName) {
        const courses = this.getCourses();
        return courses.filter(course =>
            course.students && course.students.includes(studentName)
        );
    }

    // Get results for specific student
    getStudentResults(studentName) {
        const results = this.getResults();
        return results.filter(r => r.studentName === studentName);
    }

    // Calculate attendance for a specific course
    calculateCourseAttendance(courseId, studentId) {
        const allRecords = this.getAttendanceRecords();
        const courseRecords = allRecords.filter(r => r.courseId == courseId);

        if (courseRecords.length === 0) return { present: 0, total: 0, percentage: 0 };

        let presentCount = 0;
        let totalSessions = 0;

        courseRecords.forEach(record => {
            const studentStatus = record.attendance.find(a => a.studentId == studentId);
            if (studentStatus) {
                totalSessions++;
                if (studentStatus.status === 'present') {
                    presentCount++;
                }
            }
        });

        return {
            present: presentCount,
            total: totalSessions,
            percentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
        };
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
// Notifications Controller
// ========================================

class NotificationsController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentStudent = null;
        this.allNotifications = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        if (!checkStudentSession()) return;
        setupSidebar();

        this.currentStudent = this.dataManager.getCurrentStudent();

        if (this.currentStudent) {
            this.updateProfile();
            this.generateNotifications();
            this.setupEventListeners();
            this.loadNotifications();
            this.updateDropdown();
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

    generateNotifications() {
        const notifications = [];
        const courses = this.dataManager.getStudentCourses(this.currentStudent.name);
        const results = this.dataManager.getStudentResults(this.currentStudent.name);
        const attendanceRecords = this.dataManager.getAttendanceRecords();

        // 1. Result Notifications (recent 7 days)
        results.forEach(result => {
            const daysSince = Math.floor((new Date() - new Date(result.date)) / (1000 * 60 * 60 * 24));
            if (daysSince <= 7) {
                notifications.push({
                    id: `result-${result.id}`,
                    type: 'result',
                    icon: 'fa-check-circle',
                    title: 'New Result Published',
                    description: `Your ${result.examType} result for ${result.courseName} has been published. You scored ${result.marksObtained}/${result.totalMarks}.`,
                    time: this.formatTime(result.date),
                    category: 'RESULT',
                    unread: daysSince <= 2,
                    timestamp: new Date(result.date).getTime()
                });
            }
        });

        // 2. Low Attendance Alerts
        courses.forEach(course => {
            const attendance = this.dataManager.calculateCourseAttendance(
                course.id,
                this.currentStudent.id
            );
            if (attendance.percentage < 75 && attendance.percentage > 0) {
                const daysAgo = Math.floor(Math.random() * 2) + 1; // Random 1-2 days
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);

                notifications.push({
                    id: `attendance-alert-${course.id}`,
                    type: 'attendance',
                    icon: 'fa-exclamation-triangle',
                    title: 'Low Attendance Alert',
                    description: `Your attendance in ${course.name} is ${attendance.percentage}%, which is below the required 75%. Please attend classes regularly.`,
                    time: this.formatTime(date.toISOString()),
                    category: 'ATTENDANCE',
                    unread: daysAgo <= 1,
                    timestamp: date.getTime()
                });
            }
        });

        // 3. Recent Attendance Marked (last 5 days)
        const recentAttendance = [];
        attendanceRecords.forEach(record => {
            const daysSince = Math.floor((new Date() - new Date(record.date)) / (1000 * 60 * 60 * 24));
            if (daysSince <= 5) {
                const studentEntry = record.attendance.find(a => a.studentId == this.currentStudent.id);
                if (studentEntry) {
                    recentAttendance.push({
                        record: record,
                        status: studentEntry.status,
                        daysSince: daysSince
                    });
                }
            }
        });

        recentAttendance.slice(0, 3).forEach(item => {
            notifications.push({
                id: `attendance-marked-${item.record.id}`,
                type: 'attendance',
                icon: 'fa-check-circle',
                title: 'Attendance Marked',
                description: `Your attendance has been marked as ${item.status.charAt(0).toUpperCase() + item.status.slice(1)} for ${item.record.courseName} on ${new Date(item.record.date).toLocaleDateString()}.`,
                time: this.formatTime(item.record.date),
                category: 'ATTENDANCE',
                unread: item.daysSince <= 1,
                timestamp: new Date(item.record.date).getTime()
            });
        });

        // 4. Sample Announcements
        const announcements = [
            {
                id: 'announcement-1',
                type: 'announcement',
                icon: 'fa-calendar',
                title: 'Exam Schedule Released',
                description: 'The Final Exam schedule for Fall 2025 has been released. Check the schedule on the portal.',
                time: '1 day ago',
                category: 'ANNOUNCEMENT',
                unread: true,
                timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'announcement-2',
                type: 'announcement',
                icon: 'fa-info-circle',
                title: 'Holiday Notice',
                description: 'The institution will be closed on November 25, 2025 due to Thanksgiving holiday.',
                time: '3 days ago',
                category: 'ANNOUNCEMENT',
                unread: false,
                timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'announcement-3',
                type: 'announcement',
                icon: 'fa-info-circle',
                title: 'New Course Material',
                description: 'New lecture notes have been uploaded for your enrolled courses. Please review before the next class.',
                time: '1 week ago',
                category: 'ANNOUNCEMENT',
                unread: false,
                timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000)
            }
        ];

        notifications.push(...announcements);

        // Sort by timestamp (newest first)
        notifications.sort((a, b) => b.timestamp - a.timestamp);

        this.allNotifications = notifications;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        }
    }

    loadNotifications() {
        this.renderNotifications();
        this.updateCounts();
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        let filteredNotifications = [...this.allNotifications];

        // Apply filter
        if (this.currentFilter === 'unread') {
            filteredNotifications = filteredNotifications.filter(n => n.unread);
        } else if (this.currentFilter !== 'all') {
            filteredNotifications = filteredNotifications.filter(n =>
                n.type === this.currentFilter.replace('s', '') // 'results' -> 'result'
            );
        }

        container.innerHTML = '';

        if (filteredNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 48px 24px;">
                    <i class="fas fa-bell" style="font-size: 48px; color: var(--text-light); opacity: 0.3; margin-bottom: 16px;"></i>
                    <p style="color: var(--text-light);">No notifications found</p>
                </div>
            `;
            return;
        }

        filteredNotifications.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-item ${notif.unread ? 'unread' : ''}`;
            item.dataset.id = notif.id;
            item.innerHTML = `
                <div class="notification-icon-wrapper ${notif.type}">
                    <i class="fas ${notif.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-description">${notif.description}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${notif.time}</span>
                        <span class="notification-category ${notif.type}">${notif.category}</span>
                    </div>
                </div>
                ${notif.unread ? '<div class="notification-unread-dot"></div>' : ''}
            `;

            item.addEventListener('click', () => this.markAsRead(notif.id));
            container.appendChild(item);
        });

        // Update summary
        const summaryEl = document.getElementById('notificationsSummary');
        if (summaryEl) {
            summaryEl.textContent = `Showing ${filteredNotifications.length} of ${this.allNotifications.length} notifications`;
        }
    }

    updateCounts() {
        const unreadCount = this.allNotifications.filter(n => n.unread).length;
        const newCountBadge = document.getElementById('newCountBadge');
        const unreadCountEl = document.getElementById('unreadCount');
        const notifBadge = document.getElementById('notificationCount');

        if (newCountBadge) newCountBadge.textContent = `${unreadCount} new`;
        if (unreadCountEl) unreadCountEl.textContent = `(${unreadCount})`;
        if (notifBadge) notifBadge.textContent = unreadCount;
    }

    markAsRead(notificationId) {
        const notification = this.allNotifications.find(n => n.id === notificationId);
        if (notification && notification.unread) {
            notification.unread = false;
            this.updateCounts();
            this.renderNotifications();
            this.updateDropdown();
            showToast('Notification marked as read', 'success');
        }
    }

    markAllAsRead() {
        this.allNotifications.forEach(n => n.unread = false);
        this.updateCounts();
        this.renderNotifications();
        this.updateDropdown();
        showToast('All notifications marked as read', 'success');
    }

    setupEventListeners() {
        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.renderNotifications();
            });
        });

        // Mark all as read button
        const markAllBtn = document.getElementById('markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllAsRead());
        }
    }

    updateDropdown() {
        const dropdownContainer = document.getElementById('dropdownNotifications');
        if (!dropdownContainer) return;

        const unreadNotifs = this.allNotifications.filter(n => n.unread).slice(0, 5);

        if (unreadNotifs.length === 0) {
            dropdownContainer.innerHTML = '<div class="empty-state-small">No new notifications</div>';
        } else {
            dropdownContainer.innerHTML = unreadNotifs.map(notif => `
                <div class="dropdown-item">
                    <p>${notif.title}</p>
                    <span class="time">${notif.time}</span>
                </div>
            `).join('');
        }
    }
}

// Initialize
let notificationsController;
document.addEventListener('DOMContentLoaded', () => {
    notificationsController = new NotificationsController();
});
