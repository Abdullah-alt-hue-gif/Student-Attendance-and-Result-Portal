// admin-dashboard-script.js

// Global variables
let attendanceData = {};
let systemStats = {};
let activityLogs = [];
let attendanceAlerts = [];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeDashboard();
    loadDashboardData();
    startAutoRefresh();
});

// Check if user is properly logged in as admin
function checkUserSession() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!userRole || userRole !== 'admin') {
        alert('Please login as admin first');
        window.location.href = 'admin-login.html';
        return;
    }

    // Update admin name - use userName from login, fallback to email
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Admin');

    if (document.getElementById('adminUserName')) {
        document.getElementById('adminUserName').textContent = displayName;
    }

    // Update avatar with first letter
    const avatar = document.querySelector('.user-avatar');
    if (avatar && userEmail) {
        const firstLetter = (displayName || userEmail).charAt(0).toUpperCase();
        avatar.textContent = firstLetter;

        // Generate consistent color based on name/email
        const colors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'];
        const colorIndex = (displayName || userEmail).length % colors.length;
        avatar.style.background = `linear-gradient(135deg, ${colors[colorIndex]}, ${colors[(colorIndex + 2) % colors.length]})`;
    }
}

// Initialize dashboard components
function initializeDashboard() {
    console.log('Initializing dynamic admin dashboard...');

    // Load initial data
    loadInitialData();

    // Add click handlers for sidebar menu items
    const menuItems = document.querySelectorAll('.menu-item a');
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Remove active class from all items
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            // Add active class to clicked item
            this.parentElement.classList.add('active');
        });
    });

    // Initialize charts
    initializeCharts();
}

// Load initial data from localStorage
function loadInitialData() {
    // Load users data
    const savedUsers = localStorage.getItem('portalUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // Load courses data
    const savedCourses = localStorage.getItem('portalCourses');
    const courses = savedCourses ? JSON.parse(savedCourses) : [];

    // Load reports data
    const savedReports = localStorage.getItem('portalReports');
    const reports = savedReports ? JSON.parse(savedReports) : [];

    // Calculate statistics
    calculateStatistics(users, courses, reports);

    // Generate sample activity logs if none exist
    const savedLogs = localStorage.getItem('portalActivityLogs');
    if (savedLogs) {
        activityLogs = JSON.parse(savedLogs);
    } else {
        generateSampleActivityLogs();
    }

    // Generate attendance alerts
    generateAttendanceAlerts(users, courses);
}

// Calculate real-time statistics
function calculateStatistics(users, courses, reports) {
    // User statistics
    const students = users.filter(user => user.role === 'student');
    const teachers = users.filter(user => user.role === 'teacher');
    const admins = users.filter(user => user.role === 'admin');

    // Course statistics
    const activeCourses = courses.filter(course => course.status === 'active');
    const inactiveCourses = courses.filter(course => course.status === 'inactive');

    // Report statistics
    const attendanceReports = reports.filter(report => report.type === 'attendance');
    const resultReports = reports.filter(report => report.type === 'results');

    // Update dashboard stats
    updateStatsCards({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCourses: activeCourses.length,
        attendanceAlerts: attendanceAlerts.length,
        totalReports: reports.length,
        activeCourses: activeCourses.length,
        inactiveCourses: inactiveCourses.length
    });

    // Update system stats
    updateSystemStats({
        storageUsed: calculateStorageUsage(users, courses, reports),
        activeSessions: Math.floor(Math.random() * 50) + 10, // Simulated
        serverUptime: Math.floor(Math.random() * 30) + 1, // Simulated
        reportsGenerated: reports.length
    });
}

// Update statistics cards
function updateStatsCards(stats) {
    // Total Students
    document.getElementById('totalStudents').textContent = stats.totalStudents.toLocaleString();
    document.getElementById('studentTrend').textContent = `+${Math.floor(Math.random() * 15) + 5}% from last month`;

    // Total Teachers
    document.getElementById('totalTeachers').textContent = stats.totalTeachers.toLocaleString();
    document.getElementById('teacherTrend').textContent = `+${Math.floor(Math.random() * 8) + 2} new this month`;

    // Active Courses
    document.getElementById('totalCourses').textContent = stats.totalCourses.toLocaleString();
    const pendingApproval = Math.floor(Math.random() * 5);
    document.getElementById('courseTrend').textContent = pendingApproval > 0 ?
        `${pendingApproval} pending approval` : 'All courses active';

    // Attendance Alerts
    document.getElementById('attendanceAlerts').textContent = stats.attendanceAlerts;
    document.getElementById('alertTrend').textContent = stats.attendanceAlerts > 0 ?
        'Requires attention' : 'No critical alerts';
}

// Update system statistics
function updateSystemStats(stats) {
    document.getElementById('storageValue').textContent = `${stats.storageUsed}%`;
    document.getElementById('storageProgress').style.width = `${stats.storageUsed}%`;
    document.getElementById('activeSessions').textContent = stats.activeSessions;
    document.getElementById('serverUptime').textContent = `${stats.serverUptime} days`;
    document.getElementById('reportsGenerated').textContent = stats.reportsGenerated;
}

// Calculate storage usage (simulated)
function calculateStorageUsage(users, courses, reports) {
    const totalItems = users.length + courses.length + reports.length;
    // Simulate storage calculation (0-100%)
    return Math.min(100, Math.floor((totalItems / 500) * 100));
}

// Initialize charts
function initializeCharts() {
    // Attendance Trends Chart
    const attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx) {
        updateAttendanceChart();
    }
}

// Update attendance chart based on selected time range
function updateAttendanceChart() {
    const timeRange = document.getElementById('timeRange').value;
    const ctx = document.getElementById('attendanceChart');

    // Generate sample data based on time range
    const { labels, data } = generateAttendanceData(timeRange);

    // Destroy existing chart if it exists
    if (window.attendanceChartInstance) {
        window.attendanceChartInstance.destroy();
    }

    // Create new chart
    window.attendanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Attendance Rate (%)',
                data: data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Attendance: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Generate sample attendance data
function generateAttendanceData(timeRange) {
    let labels = [];
    let data = [];

    switch (timeRange) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [85, 88, 82, 90, 87, 45, 30]; // Weekend drop
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = [82, 85, 88, 86];
            break;
        case 'quarter':
            labels = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
            data = [78, 82, 85, 87]; // Improving trend
            break;
    }

    return { labels, data };
}

// Generate attendance alerts
function generateAttendanceAlerts(users, courses) {
    attendanceAlerts = [];

    // Get students with low attendance (simulated)
    const students = users.filter(user => user.role === 'student');
    const lowAttendanceStudents = students.slice(0, Math.min(5, Math.floor(students.length * 0.1)));

    lowAttendanceStudents.forEach((student, index) => {
        const attendanceRate = Math.floor(Math.random() * 30) + 40; // 40-70%
        const course = courses[Math.floor(Math.random() * courses.length)];

        let status = 'warning';
        let priority = 'medium';

        if (attendanceRate < 50) {
            status = 'critical';
            priority = 'high';
        }

        attendanceAlerts.push({
            id: index + 1,
            studentName: student.name,
            studentEmail: student.email,
            courseName: course ? course.name : 'Unknown Course',
            courseCode: course ? course.code : 'N/A',
            attendanceRate: attendanceRate,
            status: status,
            priority: priority,
            lastUpdate: new Date().toISOString()
        });
    });

    updateAlertsList();
}

// Update alerts list in the UI
function updateAlertsList() {
    const alertsList = document.getElementById('alertsList');

    if (attendanceAlerts.length === 0) {
        alertsList.innerHTML = `
            <div class="no-alerts">
                <span>🎉</span>
                <p>No attendance alerts</p>
                <small>All students are maintaining good attendance</small>
            </div>
        `;
        return;
    }

    alertsList.innerHTML = '';

    // Sort alerts by priority (critical first)
    const sortedAlerts = [...attendanceAlerts].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sortedAlerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alert.status}`;
        alertElement.innerHTML = `
            <div class="alert-content">
                <div class="alert-header">
                    <strong>${alert.studentName}</strong>
                    <span class="attendance-rate ${alert.status}">${alert.attendanceRate}%</span>
                </div>
                <div class="alert-details">
                    <span class="course-info">${alert.courseName} (${alert.courseCode})</span>
                    <span class="alert-time">${formatRelativeTime(alert.lastUpdate)}</span>
                </div>
            </div>
            <button class="alert-action" onclick="viewStudentDetails('${alert.studentEmail}')" title="View Details">
                👁️
            </button>
        `;
        alertsList.appendChild(alertElement);
    });
}

// Update activity logs
function updateActivityLogs() {
    const activityList = document.getElementById('activityList');

    if (activityLogs.length === 0) {
        activityList.innerHTML = `
            <div class="no-activity">
                <span>📝</span>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    // Get recent activities (last 10)
    const recentActivities = activityLogs.slice(0, 10);

    activityList.innerHTML = '';
    recentActivities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.description}</div>
                <div class="activity-time">${formatRelativeTime(activity.timestamp)}</div>
            </div>
        `;
        activityList.appendChild(activityElement);
    });
}

// Generate sample activity logs
function generateSampleActivityLogs() {
    const activities = [
        { icon: '👥', description: 'New student registered: Emily Johnson' },
        { icon: '📚', description: 'Course "Advanced Physics" created' },
        { icon: '📊', description: 'Monthly attendance report generated' },
        { icon: '👩‍🏫', description: 'Teacher profile updated: Mike Wilson' },
        { icon: '⚠️', description: 'System backup completed successfully' },
        { icon: '🎓', description: '5 new students enrolled in CS101' },
        { icon: '📈', description: 'Performance report exported' },
        { icon: '🔧', description: 'System maintenance completed' }
    ];

    // Generate logs for the past 7 days
    for (let i = 0; i < 20; i++) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days ago

        activityLogs.push({
            id: i + 1,
            icon: randomActivity.icon,
            description: randomActivity.description,
            timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
            type: 'system'
        });
    }

    // Sort by timestamp (newest first)
    activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Save to localStorage
    localStorage.setItem('portalActivityLogs', JSON.stringify(activityLogs));

    updateActivityLogs();
}

// Load dashboard data
function loadDashboardData() {
    // Simulate API call delay
    setTimeout(() => {
        loadInitialData();
        showToast('Dashboard data updated', 'success');
    }, 1000);
}

// Start auto-refresh for dashboard data
function startAutoRefresh() {
    // Refresh data every 2 minutes
    setInterval(() => {
        loadDashboardData();
    }, 120000);
}

// Quick Actions Functions
function addNewUser() {
    window.location.href = 'admin-users.html?action=add';
}

function createCourse() {
    window.location.href = 'admin-courses.html?action=add';
}

function generateReport() {
    window.location.href = 'admin-reports.html';
}

function viewSystemLogs() {
    document.getElementById('systemLogsModal').style.display = 'block';
    loadSystemLogs();
}

function closeSystemLogs() {
    document.getElementById('systemLogsModal').style.display = 'none';
}

function refreshLogs() {
    loadSystemLogs();
    showToast('Logs refreshed', 'info');
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all system logs?')) {
        activityLogs = [];
        localStorage.removeItem('portalActivityLogs');
        loadSystemLogs();
        updateActivityLogs();
        showToast('System logs cleared', 'success');
    }
}

function exportLogs() {
    const logsText = activityLogs.map(log =>
        `${new Date(log.timestamp).toLocaleString()} - ${log.description}`
    ).join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();

    showToast('Logs exported successfully', 'success');
}

function loadSystemLogs() {
    const logsContent = document.getElementById('systemLogsContent');
    const logsText = activityLogs.map(log =>
        `[${new Date(log.timestamp).toLocaleString()}] ${log.icon} ${log.description}`
    ).join('\n');

    logsContent.textContent = logsText || 'No system logs available';
}

// Reset attendance alerts
function resetAlerts() {
    if (attendanceAlerts.length === 0) {
        showToast('No alerts to reset', 'info');
        return;
    }

    if (confirm('Are you sure you want to reset all attendance alerts? This will clear all current alerts.')) {
        attendanceAlerts = [];
        updateAlertsList();
        showToast('All attendance alerts have been reset', 'success');

        // Log this action
        logActivity('🗑️', 'All attendance alerts reset by admin');
    }
}

// View student details
function viewStudentDetails(studentEmail) {
    alert(`Viewing details for student: ${studentEmail}\n\nThis would open a detailed student profile in a real application.`);
}

// Utility Functions
function formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

function logActivity(icon, description) {
    const newActivity = {
        id: activityLogs.length + 1,
        icon: icon,
        description: description,
        timestamp: new Date().toISOString(),
        type: 'user'
    };

    activityLogs.unshift(newActivity);

    // Keep only last 100 activities
    if (activityLogs.length > 100) {
        activityLogs.splice(100);
    }

    localStorage.setItem('portalActivityLogs', JSON.stringify(activityLogs));
    updateActivityLogs();
}

// Close modals when clicking outside
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// Add real-time data updates every 30 seconds
setInterval(() => {
    // Simulate real-time updates
    const randomUpdate = Math.random();
    if (randomUpdate > 0.7) {
        // Simulate new activity
        const activities = [
            '👤 New user login detected',
            '📚 Course enrollment updated',
            '📊 Report generation started',
            '⚠️ System check completed'
        ];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        logActivity('🔄', randomActivity);
    }
}, 30000);