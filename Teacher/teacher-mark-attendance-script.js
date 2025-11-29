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

    // Courses CRUD (shared with admin)
    getCourses() {
        return JSON.parse(localStorage.getItem('courses')) || [];
    }

    // Get courses for current teacher
    getTeacherCourses() {
        const teacher = this.getCurrentTeacher();
        if (!teacher) {
            // If no specific teacher, return all courses
            return this.getCourses();
        }

        const courses = this.getCourses();
        return courses.filter(c => c.teacher === teacher.name);
    }

    // Get students (all students for now)
    getStudents() {
        const users = this.getUsers();
        return users.filter(u => u.role === 'Student');
    }

    // Attendance Records CRUD
    getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }

    saveAttendanceRecord(record) {
        const records = this.getAttendanceRecords();
        record.id = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
        record.markedAt = new Date().toISOString();
        records.push(record);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        return record;
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
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../login/teacher-login.html';
            }, 1000);
        });
    }

    // Highlight active nav item
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ========================================
// Attendance Controller
// ========================================

class AttendanceController {
    constructor() {
        this.dataManager = new DataManager();
        this.studentAttendance = new Map(); // studentId -> 'present' | 'absent'
        this.selectedCourse = null;
        this.init();
    }

    init() {
        if (!checkTeacherSession()) return;
        setupSidebar();
        this.loadCourses();
        this.setupEventListeners();
        this.setTodayDate();
    }

    setTodayDate() {
        const dateInput = document.getElementById('dateSelect');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    loadCourses() {
        const courses = this.dataManager.getTeacherCourses();
        const courseSelect = document.getElementById('courseSelect');

        if (!courseSelect) return;

        courseSelect.innerHTML = '<option value="">Select a course</option>' +
            courses.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('');
    }

    setupEventListeners() {
        // Course selection
        document.getElementById('courseSelect')?.addEventListener('change', (e) => {
            this.handleCourseChange(e.target.value);
        });

        // Date selection
        document.getElementById('dateSelect')?.addEventListener('change', () => {
            if (this.selectedCourse) {
                this.loadStudents();
            }
        });

        // Mark All buttons
        document.getElementById('markAllPresentBtn')?.addEventListener('click', () => {
            this.markAllAs('present');
        });

        document.getElementById('markAllAbsentBtn')?.addEventListener('click', () => {
            this.markAllAs('absent');
        });

        // Save and Cancel buttons
        document.getElementById('saveAttendanceBtn')?.addEventListener('click', () => {
            this.saveAttendance();
        });

        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            this.resetAttendance();
        });

        // Notification Dropdown
        const notifIcon = document.querySelector('.notification-icon');
        const notifDropdown = document.getElementById('notificationDropdown');

        if (notifIcon && notifDropdown) {
            notifIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                notifDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!notifDropdown.contains(e.target) && !notifIcon.contains(e.target)) {
                    notifDropdown.classList.remove('show');
                }
            });
        }
    }

    handleCourseChange(courseId) {
        if (!courseId) {
            this.selectedCourse = null;
            this.showEmptyState();
            return;
        }

        const courses = this.dataManager.getCourses();
        this.selectedCourse = courses.find(c => c.id == courseId);

        if (this.selectedCourse) {
            this.loadStudents();
        }
    }

    loadStudents() {
        const students = this.dataManager.getStudents();

        if (students.length === 0) {
            showToast('No students found in the system', 'warning');
            return;
        }

        // Initialize all students as present by default
        this.studentAttendance.clear();
        students.forEach(student => {
            this.studentAttendance.set(student.id, 'present');
        });

        this.renderStudentList(students);
        this.updateStats();
        this.showActionButtons();
    }

    generateRollNumber(studentId, courseCode) {
        // Generate roll number like CS2025001, CS2025002, etc.
        const code = courseCode || 'CS';
        const year = '2025';
        const number = String(studentId).padStart(3, '0');
        return `${code}${year}${number}`;
    }

    renderStudentList(students) {
        const container = document.getElementById('studentList');
        if (!container) return;

        const courseCode = this.selectedCourse?.code?.substring(0, 2) || 'CS';

        container.innerHTML = students.map(student => {
            const status = this.studentAttendance.get(student.id) || 'present';
            const rollNo = this.generateRollNumber(student.id, courseCode);

            return `
                <div class="student-attendance-item ${status}" data-student-id="${student.id}">
                    <div class="student-status-icon ${status}">
                        <i class="fas ${status === 'present' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    </div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-roll">Roll No: ${rollNo}</div>
                    </div>
                    <button class="student-toggle-btn ${status === 'present' ? 'btn-mark-absent' : 'btn-mark-present'}" 
                            onclick="attendanceController.toggleStudentStatus(${student.id})">
                        ${status === 'present' ? 'Mark Absent' : 'Mark Present'}
                    </button>
                </div>
            `;
        }).join('');
    }

    toggleStudentStatus(studentId) {
        const currentStatus = this.studentAttendance.get(studentId);
        const newStatus = currentStatus === 'present' ? 'absent' : 'present';

        this.studentAttendance.set(studentId, newStatus);

        // Update the UI for this specific student
        const studentElement = document.querySelector(`[data-student-id="${studentId}"]`);
        if (studentElement) {
            studentElement.className = `student-attendance-item ${newStatus}`;

            const icon = studentElement.querySelector('.student-status-icon');
            icon.className = `student-status-icon ${newStatus}`;
            icon.innerHTML = `<i class="fas ${newStatus === 'present' ? 'fa-check-circle' : 'fa-times-circle'}"></i>`;

            const button = studentElement.querySelector('.student-toggle-btn');
            button.className = `student-toggle-btn ${newStatus === 'present' ? 'btn-mark-absent' : 'btn-mark-present'}`;
            button.textContent = newStatus === 'present' ? 'Mark Absent' : 'Mark Present';
        }

        this.updateStats();
    }

    markAllAs(status) {
        this.studentAttendance.forEach((_, studentId) => {
            this.studentAttendance.set(studentId, status);
        });

        const students = this.dataManager.getStudents();
        this.renderStudentList(students);
        this.updateStats();

        showToast(`All students marked as ${status}`, 'success');
    }

    updateStats() {
        const total = this.studentAttendance.size;
        let present = 0;
        let absent = 0;

        this.studentAttendance.forEach(status => {
            if (status === 'present') present++;
            else absent++;
        });

        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        document.getElementById('totalStudents').textContent = total;
        document.getElementById('presentCount').textContent = present;
        document.getElementById('absentCount').textContent = absent;
        document.getElementById('attendanceRate').textContent = `${rate}%`;
    }

    showActionButtons() {
        const actions = document.getElementById('attendanceActions');
        if (actions) {
            actions.style.display = 'flex';
        }
    }

    showEmptyState() {
        const container = document.getElementById('studentList');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Please select a course and date to view students</p>
                </div>
            `;
        }

        const actions = document.getElementById('attendanceActions');
        if (actions) {
            actions.style.display = 'none';
        }

        // Reset stats
        document.getElementById('totalStudents').textContent = '0';
        document.getElementById('presentCount').textContent = '0';
        document.getElementById('absentCount').textContent = '0';
        document.getElementById('attendanceRate').textContent = '0%';
    }

    saveAttendance() {
        if (!this.selectedCourse) {
            showToast('Please select a course', 'error');
            return;
        }

        const date = document.getElementById('dateSelect')?.value;
        if (!date) {
            showToast('Please select a date', 'error');
            return;
        }

        const sessionType = document.getElementById('sessionType')?.value || 'Lecture';
        const teacher = this.dataManager.getCurrentTeacher();

        // Prepare attendance data
        const attendanceData = [];
        this.studentAttendance.forEach((status, studentId) => {
            const student = this.dataManager.getStudents().find(s => s.id === studentId);
            if (student) {
                attendanceData.push({
                    studentId: studentId,
                    studentName: student.name,
                    status: status
                });
            }
        });

        // Create attendance record
        const record = {
            courseId: this.selectedCourse.id,
            courseName: this.selectedCourse.name,
            courseCode: this.selectedCourse.code,
            teacherName: teacher?.name || 'Unknown',
            date: date,
            sessionType: sessionType,
            attendance: attendanceData,
            totalStudents: this.studentAttendance.size,
            presentCount: attendanceData.filter(a => a.status === 'present').length,
            absentCount: attendanceData.filter(a => a.status === 'absent').length
        };

        // Save to localStorage
        this.dataManager.saveAttendanceRecord(record);

        showToast('Attendance saved successfully!', 'success');

        // Reset after a short delay
        setTimeout(() => {
            this.resetAttendance();
        }, 1500);
    }

    resetAttendance() {
        document.getElementById('courseSelect').value = '';
        this.studentAttendance.clear();
        this.selectedCourse = null;
        this.showEmptyState();
        showToast('Attendance form reset', 'info');
    }
}

// Initialize Attendance Controller
let attendanceController;
document.addEventListener('DOMContentLoaded', () => {
    attendanceController = new AttendanceController();
});
