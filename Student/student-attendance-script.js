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

    // Get attendance records for a specific student
    getStudentAttendance(studentId) {
        const allRecords = this.getAttendanceRecords();
        const studentRecords = [];

        allRecords.forEach(record => {
            const studentEntry = record.attendance.find(a => a.studentId == studentId);
            if (studentEntry) {
                studentRecords.push({
                    courseId: record.courseId,
                    courseName: record.courseName,
                    date: record.date,
                    status: studentEntry.status
                });
            }
        });

        return studentRecords;
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
// Attendance Controller
// ========================================

class AttendanceController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentStudent = null;
        this.selectedCourse = null;
        this.init();
    }

    init() {
        if (!checkStudentSession()) return;
        setupSidebar();

        this.currentStudent = this.dataManager.getCurrentStudent();

        if (this.currentStudent) {
            this.updateProfile();
            this.loadAttendanceData();
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

    loadAttendanceData() {
        const enrolledCourses = this.dataManager.getStudentCourses(this.currentStudent.name);

        // Calculate overall stats
        this.calculateOverallStats(enrolledCourses);

        // Render course list
        this.renderCourseList(enrolledCourses);

        // Load notifications
        this.loadNotifications();
    }

    calculateOverallStats(courses) {
        let totalPresent = 0;
        let totalClasses = 0;

        courses.forEach(course => {
            const attendance = this.dataManager.calculateCourseAttendance(
                course.id,
                this.currentStudent.id
            );
            totalPresent += attendance.present;
            totalClasses += attendance.total;
        });

        const totalAbsent = totalClasses - totalPresent;
        const overallPercentage = totalClasses > 0
            ? Math.round((totalPresent / totalClasses) * 100)
            : 0;

        // Update UI
        const overallEl = document.getElementById('overallAttendancePercent');
        const presentEl = document.getElementById('totalPresent');
        const absentEl = document.getElementById('totalAbsent');
        const classesEl = document.getElementById('totalClasses');

        if (overallEl) overallEl.textContent = `${overallPercentage}%`;
        if (presentEl) presentEl.textContent = totalPresent;
        if (absentEl) absentEl.textContent = totalAbsent;
        if (classesEl) classesEl.textContent = totalClasses;
    }

    renderCourseList(courses) {
        const container = document.getElementById('coursesList');
        if (!container) return;

        container.innerHTML = '';

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>No courses enrolled</p>
                </div>
            `;
            return;
        }

        courses.forEach((course, index) => {
            const attendance = this.dataManager.calculateCourseAttendance(
                course.id,
                this.currentStudent.id
            );

            const percentageClass = attendance.percentage >= 75 ? 'high' :
                attendance.percentage >= 60 ? 'medium' : 'low';

            const item = document.createElement('div');
            item.className = `course-item ${index === 0 ? 'active' : ''}`;
            item.dataset.courseId = course.id;
            item.innerHTML = `
                <div class="course-item-header">
                    <span class="course-item-name">${course.name}</span>
                    <span class="course-item-percentage ${percentageClass}">${attendance.percentage}%</span>
                </div>
                <div class="course-item-classes">${attendance.present}/${attendance.total} classes</div>
            `;

            item.addEventListener('click', () => this.selectCourse(course));
            container.appendChild(item);
        });

        // Auto-select first course
        if (courses.length > 0) {
            this.selectCourse(courses[0]);
        }
    }

    selectCourse(course) {
        this.selectedCourse = course;

        // Update active state
        document.querySelectorAll('.course-item').forEach(item => {
            item.classList.toggle('active', item.dataset.courseId == course.id);
        });

        // Render course details
        this.renderCourseDetails();
    }

    renderCourseDetails() {
        if (!this.selectedCourse) return;

        const nameEl = document.getElementById('courseDetailsName');
        const codeEl = document.getElementById('courseDetailsCode');

        if (nameEl) nameEl.textContent = this.selectedCourse.name;
        if (codeEl) codeEl.textContent = `Course Code: ${this.selectedCourse.code || 'N/A'}`;

        // Calculate stats for this course
        const attendance = this.dataManager.calculateCourseAttendance(
            this.selectedCourse.id,
            this.currentStudent.id
        );

        const attendedEl = document.getElementById('classesAttended');
        const missedEl = document.getElementById('classesMissed');
        const rateEl = document.getElementById('attendanceRate');

        if (attendedEl) attendedEl.textContent = attendance.present;
        if (missedEl) missedEl.textContent = attendance.total - attendance.present;
        if (rateEl) rateEl.textContent = `${attendance.percentage}%`;

        // Render session history
        this.renderSessionHistory();
    }

    renderSessionHistory() {
        const container = document.getElementById('sessionHistoryList');
        if (!container) return;

        const allRecords = this.dataManager.getAttendanceRecords();
        const courseRecords = allRecords.filter(r => r.courseId == this.selectedCourse.id);

        container.innerHTML = '';

        if (courseRecords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No attendance records yet</p>
                </div>
            `;
            return;
        }

        // Sort by date descending
        courseRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        courseRecords.forEach(record => {
            const studentEntry = record.attendance.find(a => a.studentId == this.currentStudent.id);
            if (!studentEntry) return;

            const status = studentEntry.status;
            const date = new Date(record.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const item = document.createElement('div');
            item.className = `session-item ${status}`;
            item.innerHTML = `
                <div class="session-item-left">
                    <div class="session-icon">
                        <i class="fas fa-${status === 'present' ? 'check' : 'times'}"></i>
                    </div>
                    <div class="session-info">
                        <h5>${record.topic || 'Class Session'}</h5>
                        <div class="session-date">${date}</div>
                    </div>
                </div>
                <span class="session-badge ${status}">${status}</span>
            `;

            container.appendChild(item);
        });
    }

    setupEventListeners() {
        const downloadBtn = document.getElementById('downloadReportBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }
    }

    downloadReport() {
        if (!this.selectedCourse) {
            showToast('Please select a course first', 'warning');
            return;
        }

        const attendance = this.dataManager.calculateCourseAttendance(
            this.selectedCourse.id,
            this.currentStudent.id
        );

        // Get session history
        const allRecords = this.dataManager.getAttendanceRecords();
        const courseRecords = allRecords.filter(r => r.courseId == this.selectedCourse.id);

        // Create report content
        let reportContent = `ATTENDANCE REPORT\n`;
        reportContent += `=================\n\n`;
        reportContent += `Student: ${this.currentStudent.name}\n`;
        reportContent += `Course: ${this.selectedCourse.name}\n`;
        reportContent += `Course Code: ${this.selectedCourse.code || 'N/A'}\n`;
        reportContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        reportContent += `SUMMARY\n`;
        reportContent += `-------\n`;
        reportContent += `Classes Attended: ${attendance.present}\n`;
        reportContent += `Classes Missed: ${attendance.total - attendance.present}\n`;
        reportContent += `Total Classes: ${attendance.total}\n`;
        reportContent += `Attendance Rate: ${attendance.percentage}%\n\n`;
        reportContent += `SESSION HISTORY\n`;
        reportContent += `---------------\n`;

        courseRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        courseRecords.forEach(record => {
            const studentEntry = record.attendance.find(a => a.studentId == this.currentStudent.id);
            if (studentEntry) {
                const date = new Date(record.date).toLocaleDateString();
                const status = studentEntry.status.toUpperCase();
                reportContent += `${date} - ${record.topic || 'Class Session'} - ${status}\n`;
            }
        });

        // Create downloadable file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Report_${this.selectedCourse.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Report downloaded successfully!', 'success');
    }

    loadNotifications() {
        // Generate notifications based on low attendance
        const enrolledCourses = this.dataManager.getStudentCourses(this.currentStudent.name);
        const notifications = [];

        enrolledCourses.forEach(course => {
            const attendance = this.dataManager.calculateCourseAttendance(
                course.id,
                this.currentStudent.id
            );
            if (attendance.percentage < 75 && attendance.percentage > 0) {
                notifications.push({
                    text: `Your attendance is below 75% in ${course.name}`,
                    time: 'Just now',
                    type: 'urgent'
                });
            }
        });

        if (notifications.length === 0) {
            notifications.push({
                text: 'Your attendance is looking good! Keep it up!',
                time: 'Just now',
                type: 'info'
            });
        }

        // Update badge
        const badge = document.getElementById('notificationCount');
        if (badge) badge.textContent = notifications.length;

        // Update dropdown
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
let attendanceController;
document.addEventListener('DOMContentLoaded', () => {
    attendanceController = new AttendanceController();
});
