// teacher-dashboard-script.js

// Global variables
let teacherData = {};
let teacherCourses = [];
let todayClasses = [];
let pendingTasks = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    checkTeacherSession();
    loadTeacherDashboard();
});

// Check if user is logged in as teacher
function checkTeacherSession() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

    // Get teacher name from login session (PRIORITY)
    let teacherName = localStorage.getItem('userName') || sessionStorage.getItem('userName');

    if (!userRole || userRole !== 'teacher') {
        alert('Please login as a teacher first');
        window.location.href = 'login.html';
        return;
    }

    // Load teacher data from portalUsers
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const teacher = users.find(u => u.email === userEmail && u.role === 'teacher');

        if (teacher) {
            teacherData = teacher;
            // Use stored name from login if available, otherwise use name from portalUsers
            if (!teacherName) {
                teacherName = teacher.name;
            }
        }
    }

    // If still no name, use email or default
    if (!teacherName) {
        teacherName = userEmail ? userEmail.split('@')[0] : 'Teacher';
    }

    // Update profile with the determined name
    updateTeacherProfile(teacherName);
}

// Update teacher profile display
function updateTeacherProfile(teacherName) {
    // Update welcome message
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${teacherName}!`;

    // Update sidebar profile
    document.getElementById('teacherName').textContent = teacherName;

    // Update avatar with initials
    const initials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('teacherAvatar').textContent = initials;
}

// Load teacher dashboard data
function loadTeacherDashboard() {
    // Load courses assigned to this teacher from portalCourses
    const savedCourses = localStorage.getItem('portalCourses');
    if (savedCourses) {
        const allCourses = JSON.parse(savedCourses);
        // Filter courses assigned to current teacher
        const teacherEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        teacherCourses = allCourses.filter(course =>
            course.teacherName === teacherData.name ||
            course.teacherId === teacherData.id
        );

        // Update statistics
        updateStatistics();

        // Load today's classes
        loadTodayClasses();

        // Load pending tasks
        loadPendingTasks();
    } else {
        // No courses yet
        updateStatistics();
        loadTodayClasses();
        loadPendingTasks();
    }
}

// Update statistics cards
function updateStatistics() {
    // Total courses
    document.getElementById('totalCourses').textContent = teacherCourses.length;

    // Today's classes (simulate based on courses)
    const todayClassesCount = Math.min(teacherCourses.length, 2); // Simulate 2 classes per day
    document.getElementById('todayClasses').textContent = todayClassesCount;

    // Pending tasks
    const tasksCount = 3; // Will be dynamic
    document.getElementById('pendingTasks').textContent = tasksCount;

    // Attendance marked percentage
    const attendancePercentage = teacherCourses.length > 0 ? 87 : 0; // Simulated
    document.getElementById('attendanceMarked').textContent = `${attendancePercentage}%`;
}

// Load today's classes
function loadTodayClasses() {
    const classesContainer = document.getElementById('todayClassesList');

    if (teacherCourses.length === 0) {
        classesContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <p>No classes scheduled for today</p>
            </div>
        `;
        return;
    }

    // Simulate today's classes (take first 2 courses)
    todayClasses = teacherCourses.slice(0, 2);

    classesContainer.innerHTML = '';

    todayClasses.forEach((course, index) => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';

        // Generate time slots
        const timeSlots = [
            { start: '09:00 AM', end: '10:30 AM', room: 'A-201' },
            { start: '02:00 PM', end: '03:30 PM', room: 'B-105' }
        ];
        const slot = timeSlots[index % timeSlots.length];

        classCard.innerHTML = `
            <div class="class-header">
                <div>
                    <div class="class-title">${course.name}</div>
                    <div class="student-count">${course.students || 0} Students</div>
                </div>
            </div>
            <div class="class-details">
                <div class="class-detail">
                    <span>🕐</span>
                    <span>${slot.start} - ${slot.end}</span>
                </div>
                <div class="class-detail">
                    <span>📍</span>
                    <span>Room: ${slot.room}</span>
                </div>
            </div>
            <button class="mark-attendance-btn" onclick="markAttendance('${course.code}')">
                Mark Attendance
            </button>
        `;

        classesContainer.appendChild(classCard);
    });
}

// Load pending tasks
function loadPendingTasks() {
    const tasksContainer = document.getElementById('pendingTasksList');

    // Sample tasks synchronized with course data
    pendingTasks = [
        {
            title: `Upload Midterm Results for ${teacherCourses[0]?.code || 'CS101'}`,
            due: '2025-11-20',
            priority: 'high'
        },
        {
            title: `Mark Attendance for ${teacherCourses[1]?.code || 'Chemistry 102'}`,
            due: '2025-11-18',
            priority: 'critical'
        },
        {
            title: 'Review Assignment Submissions',
            due: '2025-11-22',
            priority: 'medium'
        }
    ];

    if (pendingTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">✓</div>
                <p>No pending tasks</p>
            </div>
        `;
        return;
    }

    tasksContainer.innerHTML = '';

    pendingTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.priority}`;

        taskItem.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-priority ${task.priority}">${task.priority}</div>
            </div>
            <div class="task-due">Due: ${formatDate(task.due)}</div>
        `;

        tasksContainer.appendChild(taskItem);
    });
}

// Mark attendance for a course
function markAttendance(courseCode) {
    // Navigate to mark attendance page with course parameter
    window.location.href = `teacher-mark-attendance.html?course=${courseCode}`;
}

// Navigate to different pages
function navigateTo(page) {
    window.location.href = page;
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

// Utility function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Auto-refresh dashboard data every 5 minutes
setInterval(() => {
    loadTeacherDashboard();
}, 300000);

// Listen for storage changes from admin portal
window.addEventListener('storage', function (e) {
    if (e.key === 'portalCourses' || e.key === 'portalUsers') {
        // Reload dashboard when admin makes changes
        console.log('Data updated by admin, refreshing...');
        loadTeacherDashboard();
    }
});
