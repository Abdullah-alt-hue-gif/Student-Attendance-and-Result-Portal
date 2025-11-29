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
        // This ensures the name entered in login is shown even if not in the database
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
        // Filter courses where student is in the students list
        // Note: In our data model, courses have a 'students' array of names or IDs
        return courses.filter(course =>
            course.students && course.students.includes(studentName)
        );
    }

    // Get results for specific student
    getStudentResults(studentName) {
        const results = this.getResults();
        // Match by studentName (or ID if available and consistent)
        return results.filter(r => r.studentName === studentName);
    }
}

// ========================================
// Shared UI Logic
// ========================================

function checkStudentSession() {
    const session = JSON.parse(localStorage.getItem('studentSession') || '{}');
    // For demo purposes, if no session, we might auto-login a demo student or redirect
    /*
    if (!session.isLoggedIn) {
        window.location.href = '../login/student-login.html';
        return false;
    }
    */
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
// Dashboard Controller
// ========================================

class DashboardController {
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
            this.loadDashboardData();
        } else {
            console.error('No student data found');
            // Handle case where no student is found
        }
    }

    updateProfile() {
        const nameEl = document.getElementById('studentName');
        const welcomeEl = document.getElementById('welcomeMessage');
        const avatarEl = document.querySelector('.user-avatar');

        if (nameEl) nameEl.textContent = this.currentStudent.name;
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${this.currentStudent.name}!`;

        // Initials for avatar
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

    loadDashboardData() {
        const enrolledCourses = this.dataManager.getStudentCourses(this.currentStudent.name);
        const results = this.dataManager.getStudentResults(this.currentStudent.name);

        this.renderAttendance(enrolledCourses);
        this.renderQuickStats(enrolledCourses, results);
        this.renderLatestResults(results);
        this.renderNotifications(enrolledCourses);
    }

    calculateCourseAttendance(courseId, studentId) {
        const allRecords = this.dataManager.getAttendanceRecords();
        // Filter records for this course
        const courseRecords = allRecords.filter(r => r.courseId == courseId);

        if (courseRecords.length === 0) return 0;

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

        return totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    }

    renderAttendance(courses) {
        const listContainer = document.getElementById('courseAttendanceList');
        const overallEl = document.getElementById('overallAttendance');
        const chartEl = document.getElementById('attendanceChart');

        if (!listContainer) return;
        listContainer.innerHTML = '';

        let totalPercentage = 0;
        let count = 0;

        courses.forEach(course => {
            // Calculate real attendance
            const attendance = this.calculateCourseAttendance(course.id, this.currentStudent.id);

            // If no attendance records yet, maybe show 100% or 0%? Let's show 0% or a placeholder
            // But for average calculation, we only count courses with sessions? 
            // For simplicity, we'll count it as is.

            totalPercentage += attendance;
            count++;

            const isLow = attendance < 75;

            const item = document.createElement('div');
            item.className = 'course-progress-item';
            item.innerHTML = `
                <div class="course-info">
                    <span class="course-name">${course.name}</span>
                    <span class="percent ${isLow ? 'low' : ''}">${attendance}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${isLow ? 'low' : ''}" style="width: ${attendance}%"></div>
                </div>
            `;
            listContainer.appendChild(item);
        });

        const average = count > 0 ? Math.round(totalPercentage / count) : 0;

        if (overallEl) overallEl.textContent = `${average}%`;

        // Update donut chart gradient
        if (chartEl) {
            chartEl.style.background = `conic-gradient(var(--chart-green) 0% ${average}%, var(--chart-bg) ${average}% 100%)`;
        }
    }

    renderQuickStats(courses, results) {
        const enrolledEl = document.getElementById('enrolledCoursesCount');
        const resultsEl = document.getElementById('resultsPublishedCount');
        const gpaEl = document.getElementById('currentGPA');

        if (enrolledEl) enrolledEl.textContent = courses.length;
        if (resultsEl) resultsEl.textContent = results.length;

        // Calculate GPA
        if (gpaEl) {
            const gpa = this.calculateGPA(results);
            gpaEl.textContent = gpa;
        }
    }

    calculateGPA(results) {
        if (results.length === 0) return '0.0';

        let totalPoints = 0;
        results.forEach(r => {
            // Simple GPA mapping
            let points = 0;
            const grade = r.grade;
            if (grade === 'A+') points = 4.0;
            else if (grade === 'A') points = 4.0;
            else if (grade === 'B') points = 3.0;
            else if (grade === 'C') points = 2.0;
            else if (grade === 'D') points = 1.0;
            else points = 0.0;

            totalPoints += points;
        });

        return (totalPoints / results.length).toFixed(1);
    }

    renderLatestResults(results) {
        const container = document.getElementById('latestResultsList');
        if (!container) return;
        container.innerHTML = '';

        // Sort by date descending (using date field we added in teacher script)
        const latest = results.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

        if (latest.length === 0) {
            container.innerHTML = '<div class="empty-state-small" style="text-align:center; padding:20px; color:var(--text-light);">No results available yet.</div>';
            return;
        }

        latest.forEach(result => {
            const item = document.createElement('div');
            item.className = 'result-item';

            // Format date
            const date = new Date(result.date).toLocaleDateString();

            item.innerHTML = `
                <div class="result-info">
                    <h4>${result.courseName}</h4>
                    <div class="result-meta">${result.examType} • ${date}</div>
                </div>
                <div class="result-score">
                    <span class="score-value">${result.marksObtained}</span>
                    <span class="grade-badge">${result.grade}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderNotifications(courses) {
        const container = document.getElementById('dashboardNotifications');
        if (!container) return;
        container.innerHTML = '';

        const notifications = [];

        // 1. Check for low attendance
        courses.forEach(course => {
            const attendance = this.calculateCourseAttendance(course.id, this.currentStudent.id);
            if (attendance < 75 && attendance > 0) {
                notifications.push({
                    text: `Your attendance is below 75% in ${course.name}`,
                    time: 'Just now',
                    type: 'urgent'
                });
            }
        });

        // 2. Check for recent results (last 24 hours)
        const results = this.dataManager.getStudentResults(this.currentStudent.name);
        const recentResults = results.filter(r => {
            const diff = new Date() - new Date(r.date);
            return diff < 86400000; // 24 hours
        });

        recentResults.forEach(r => {
            notifications.push({
                text: `New result published for ${r.courseName}: ${r.examType}`,
                time: 'Recently',
                type: 'info'
            });
        });

        // 3. Generic fallback if empty
        if (notifications.length === 0) {
            notifications.push({
                text: 'Welcome to your new student portal!',
                time: 'Just now',
                type: 'info'
            });
        }

        notifications.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-widget-item ${notif.type}`;
            item.innerHTML = `
                <p>${notif.text}</p>
                <span class="time">${notif.time}</span>
            `;
            container.appendChild(item);
        });

        // Update badge
        const badge = document.getElementById('notificationCount');
        if (badge) badge.textContent = notifications.length;

        // Update Dropdown
        const dropdownContainer = document.getElementById('dropdownNotifications');
        if (dropdownContainer) {
            if (notifications.length === 0) {
                dropdownContainer.innerHTML = '<div class="empty-state-small">No new notifications</div>';
            } else {
                dropdownContainer.innerHTML = notifications.map(notif => `
                    <div class="dropdown-item">
                        <p>${notif.text}</p>
                        <span class="time">${notif.time}</span>
                    </div>
                `).join('');
            }
        }
    }
}

// Initialize
let dashboardController;
document.addEventListener('DOMContentLoaded', () => {
    dashboardController = new DashboardController();
});
