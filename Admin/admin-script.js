// admin-script.js

// Mock Data for Dynamic Dashboard
const dashboardData = {
    stats: {
        students: { count: '1,248', trend: '+12% from last month', trendType: 'positive' },
        teachers: { count: '85', trend: '+5 new this month', trendType: 'positive' },
        courses: { count: '42', trend: '3 pending approval', trendType: 'negative' },
        alerts: { count: '23', trend: 'Requires attention', trendType: 'negative' }
    },
    attendanceTrends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [75, 78, 82, 80, 85, 88]
    },
    recentAlerts: [
        { name: 'John Doe', course: 'Computer Science 101', attendance: '45%', status: 'Critical', type: 'critical' },
        { name: 'Jane Smith', course: 'Mathematics 201', attendance: '62%', status: 'Warning', type: 'warning' },
        { name: 'Mike Johnson', course: 'Physics 301', attendance: '58%', status: 'Warning', type: 'warning' },
        { name: 'Sarah Wilson', course: 'Chemistry 101', attendance: '42%', status: 'Critical', type: 'critical' }
    ]
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    checkUserSession();
});

// Check if user is properly logged in as admin
function checkUserSession() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (!userRole || userRole !== 'admin') {
        // For demo purposes, we might skip this check if running locally without login flow
        // alert('Please login as admin first');
        // window.location.href = 'admin-login.html';
        // return;
        console.log('Session check skipped for demo');
    }

    // Update user welcome message
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (userEmail) {
        const welcomeElement = document.querySelector('.user-info span');
        if (welcomeElement) {
            welcomeElement.textContent = userEmail;
        }
    }
}

// Initialize dashboard components
function initializeDashboard() {
    console.log('Admin dashboard initialized');

    loadDashboardStats();
    initializeCharts();
    loadRecentAlerts();

    // Add click handlers for sidebar menu items
    const menuItems = document.querySelectorAll('.menu-item a');
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Only prevent default if it's a # link (like Settings)
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            // Remove active class from all items
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            // Add active class to clicked item
            this.parentElement.classList.add('active');
        });
    });
}

// Load Dashboard Stats
function loadDashboardStats() {
    // Students
    document.getElementById('total-students').textContent = dashboardData.stats.students.count;
    const studentTrend = document.getElementById('students-trend');
    studentTrend.textContent = dashboardData.stats.students.trend;
    studentTrend.className = `stat-trend ${dashboardData.stats.students.trendType}`;

    // Teachers
    document.getElementById('total-teachers').textContent = dashboardData.stats.teachers.count;
    const teacherTrend = document.getElementById('teachers-trend');
    teacherTrend.textContent = dashboardData.stats.teachers.trend;
    teacherTrend.className = `stat-trend ${dashboardData.stats.teachers.trendType}`;

    // Courses
    document.getElementById('active-courses').textContent = dashboardData.stats.courses.count;
    const courseTrend = document.getElementById('courses-trend');
    courseTrend.textContent = dashboardData.stats.courses.trend;
    courseTrend.className = `stat-trend ${dashboardData.stats.courses.trendType}`;

    // Alerts
    document.getElementById('total-alerts').textContent = dashboardData.stats.alerts.count;
    const alertTrend = document.getElementById('alerts-trend');
    alertTrend.textContent = dashboardData.stats.alerts.trend;
    alertTrend.className = `stat-trend ${dashboardData.stats.alerts.trendType}`;
}

// Load Recent Alerts Table
function loadRecentAlerts() {
    const tableBody = document.getElementById('alerts-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear existing content

    dashboardData.recentAlerts.forEach(alert => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${alert.name}</td>
            <td>${alert.course}</td>
            <td>${alert.attendance}</td>
            <td><span class="badge-${alert.type}">${alert.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize charts
function initializeCharts() {
    // Attendance Trends Chart
    const attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx) {
        new Chart(attendanceCtx, {
            type: 'line',
            data: {
                labels: dashboardData.attendanceTrends.labels,
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: dashboardData.attendanceTrends.data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
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
}

// Quick Actions Functions
function addNewUser() {
    // In actual implementation, this would open a modal or redirect
    window.location.href = 'admin-users.html?action=add';
}

function createCourse() {
    // In actual implementation, this would open a modal or redirect
    window.location.href = 'admin-courses.html?action=add';
}

function generateReport() {
    // In actual implementation, this would open a report generation modal
    window.location.href = 'admin-reports.html';
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all stored data
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userRole');

        // Redirect to login page
        window.location.href = 'admin-login.html';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}