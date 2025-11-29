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
        if (!teacher) return [];

        const courses = this.getCourses();
        return courses.filter(c => c.teacher === teacher.name);
    }

    // Get students enrolled in teacher's courses
    getTeacherStudents() {
        const teacherCourses = this.getTeacherCourses();
        const courseNames = teacherCourses.map(c => c.name);

        // In a real system, we'd have enrollment data
        // For now, return all students
        const users = this.getUsers();
        return users.filter(u => u.role === 'Student');
    }

    // Tasks Management
    getTasks() {
        return JSON.parse(localStorage.getItem('teacherTasks') || '[]');
    }

    addTask(task) {
        const tasks = this.getTasks();
        task.id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        task.createdAt = new Date().toISOString();
        tasks.push(task);
        localStorage.setItem('teacherTasks', JSON.stringify(tasks));
        return task;
    }

    updateTask(id, updatedData) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedData };
            localStorage.setItem('teacherTasks', JSON.stringify(tasks));
            return tasks[index];
        }
        return null;
    }

    deleteTask(id) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== id);
        localStorage.setItem('teacherTasks', JSON.stringify(filtered));
    }

    // Attendance Data
    getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }

    addAttendanceRecord(record) {
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
    const welcomeMsg = document.getElementById('welcomeMessage');

    if (teacherNameEl && session.teacherName) {
        teacherNameEl.textContent = session.teacherName;
    }
    if (welcomeMsg && session.teacherName) {
        welcomeMsg.textContent = `Welcome back, ${session.teacherName}!`;
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
// Dashboard Controller
// ========================================

class DashboardController {
    constructor() {
        this.dataManager = new DataManager();
        this.init();
    }

    init() {
        if (!checkTeacherSession()) return;
        setupSidebar();
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeSampleTasks();
    }

    setupEventListeners() {
        // Quick Actions
        document.getElementById('markAttendanceAction')?.addEventListener('click', () => {
            window.location.href = 'teacher-mark-attendance.html';
        });

        document.getElementById('uploadResultsAction')?.addEventListener('click', () => {
            window.location.href = 'teacher-upload-results.html';
        });

        document.getElementById('viewHistoryAction')?.addEventListener('click', () => {
            window.location.href = 'teacher-attendance-history.html';
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

    initializeSampleTasks() {
        const tasks = this.dataManager.getTasks();
        if (tasks.length === 0) {
            // Create sample tasks
            this.dataManager.addTask({
                title: 'Upload Midterm Results for CS101',
                dueDate: '2025-11-20',
                priority: 'HIGH',
                status: 'pending'
            });
            this.dataManager.addTask({
                title: 'Mark Attendance for Chemistry 102',
                dueDate: '2025-11-18',
                priority: 'CRITICAL',
                status: 'pending'
            });
            this.dataManager.addTask({
                title: 'Review Assignment Submissions',
                dueDate: '2025-11-22',
                priority: 'MEDIUM',
                status: 'pending'
            });
        }
    }

    loadDashboardData() {
        // Load Stats
        const teacherCourses = this.dataManager.getTeacherCourses();
        const todaysClasses = this.getTodaysClasses(teacherCourses);
        const tasks = this.dataManager.getTasks().filter(t => t.status === 'pending');

        document.getElementById('myCourses').textContent = teacherCourses.length;
        document.getElementById('todaysClasses').textContent = todaysClasses.length;
        document.getElementById('pendingTasks').textContent = tasks.length;
        document.getElementById('attendanceMarked').textContent = '87%';

        // Load Today's Classes
        this.renderTodaysClasses(todaysClasses);

        // Load Pending Tasks
        this.renderPendingTasks(tasks);

        // Update notification count
        document.getElementById('notificationCount').textContent = tasks.length;
    }

    getTodaysClasses(courses) {
        // If teacher has no courses assigned, show first 2 courses from all courses
        let classesToShow = courses;

        if (classesToShow.length === 0) {
            const allCourses = this.dataManager.getCourses();
            classesToShow = allCourses.slice(0, 2);
            console.log('Teacher has no assigned courses, showing first 2 from all courses');
        }

        // Ensure we have at least 1 class to show
        if (classesToShow.length === 0) {
            return [];
        }

        // Return up to 2 classes with time and room info
        return classesToShow.slice(0, 2).map((course, index) => ({
            ...course,
            time: index === 0 ? '09:00 AM - 10:30 AM' : '02:00 PM - 03:30 PM',
            room: index === 0 ? 'A-201' : 'B-105'
        }));
    }

    renderTodaysClasses(classes) {
        const container = document.getElementById('todaysClassesList');
        if (!container) return;

        if (classes.length === 0) {
            container.innerHTML = '<div class="empty-state">No classes scheduled for today</div>';
            return;
        }

        container.innerHTML = classes.map(cls => `
            <div class="class-item">
                <div class="class-header">
                    <h4>${cls.name}</h4>
                    <span class="student-count">${cls.students || 0} Students</span>
                </div>
                <div class="class-details">
                    <span><i class="fas fa-clock"></i> ${cls.time}</span>
                    <span><i class="fas fa-map-marker-alt"></i> Room: ${cls.room}</span>
                </div>
                <button class="btn-primary btn-block" onclick="markAttendance('${cls.id}')">
                    Mark Attendance
                </button>
            </div>
        `).join('');
    }

    renderPendingTasks(tasks) {
        const container = document.getElementById('pendingTasksList');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending tasks</div>';
            return;
        }

        const priorityColors = {
            'CRITICAL': 'critical',
            'HIGH': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low'
        };

        container.innerHTML = tasks.map(task => `
            <div class="task-item">
                <div class="task-indicator ${priorityColors[task.priority] || 'medium'}"></div>
                <div class="task-content">
                    <h4>${task.title}</h4>
                    <div class="task-meta">
                        <span>Due: ${task.dueDate}</span>
                    </div>
                </div>
                <span class="task-badge ${priorityColors[task.priority] || 'medium'}">${task.priority}</span>
            </div>
        `).join('');
    }
}

// Global function for Mark Attendance button
function markAttendance(courseId) {
    window.location.href = `teacher-mark-attendance.html?courseId=${courseId}`;
}

// Initialize Dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardController();
});
