// teacher-attendance-history-script.js

// Global variables
let teacherData = {};
let attendanceRecords = [];
let filteredRecords = [];
let teacherCourses = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    checkTeacherSession();
    initializePage();
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

    // Load teacher data
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

    // Update profile display
    document.getElementById('teacherName').textContent = teacherName;
    const initials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('teacherAvatar').textContent = initials;
}

// Initialize page
function initializePage() {
    loadTeacherCourses();
    loadAttendanceRecords();
    updateDashboardStats();
}

// Load teacher's courses for filter
function loadTeacherCourses() {
    const savedCourses = localStorage.getItem('portalCourses');
    const courseFilter = document.getElementById('courseFilter');

    if (savedCourses) {
        const allCourses = JSON.parse(savedCourses);

        // Filter courses assigned to this teacher
        teacherCourses = allCourses.filter(course =>
            course.teacherName === teacherData.name ||
            course.teacherId === teacherData.id
        );

        // Populate course dropdown
        courseFilter.innerHTML = '<option value="">All Courses</option>';
        teacherCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = course.name;
            courseFilter.appendChild(option);
        });
    }
}

// Load attendance records
function loadAttendanceRecords() {
    const savedAttendance = localStorage.getItem('attendanceRecords');
    if (savedAttendance) {
        const allRecords = JSON.parse(savedAttendance);

        // Filter records for this teacher's courses
        // Or if we assume only this teacher sees their records, we might need to filter by markedBy or course
        // Since courses are assigned to teachers, filtering by course should be enough if we only show teacher's courses

        const teacherCourseCodes = teacherCourses.map(c => c.code);

        attendanceRecords = allRecords.filter(record =>
            teacherCourseCodes.includes(record.courseCode) ||
            record.markedBy === teacherData.name // Fallback if course assignment changed
        );

        // Sort by date descending
        attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredRecords = [...attendanceRecords];
        renderHistoryTable();
        updateDashboardStats();
    }
}

// Filter records
function filterRecords() {
    const courseCode = document.getElementById('courseFilter').value;
    const date = document.getElementById('dateFilter').value;

    filteredRecords = attendanceRecords.filter(record => {
        const matchCourse = courseCode ? record.courseCode === courseCode : true;
        const matchDate = date ? record.date === date : true;
        return matchCourse && matchDate;
    });

    renderHistoryTable();
}

// Render history table
function renderHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    const paginationInfo = document.getElementById('paginationInfo');

    tableBody.innerHTML = '';

    if (filteredRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    No attendance records found
                </td>
            </tr>
        `;
        paginationInfo.textContent = 'Showing 0 records';
        return;
    }

    filteredRecords.forEach(record => {
        const row = document.createElement('tr');

        // Calculate progress bar color
        let progressClass = 'high';
        if (record.attendanceRate < 75) progressClass = 'low';
        else if (record.attendanceRate < 85) progressClass = 'medium';

        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.courseName}</td>
            <td class="count-present">${record.presentCount}</td>
            <td class="count-absent">${record.absentCount}</td>
            <td>
                <div class="attendance-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${record.attendanceRate}%"></div>
                    </div>
                    <span class="progress-text">${record.attendanceRate}%</span>
                </div>
            </td>
            <td>
                <button class="view-details-btn" onclick="viewDetails('${record.courseCode}', '${record.date}')">
                    View Details
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    paginationInfo.textContent = `Showing ${filteredRecords.length} records`;
}

// View details (redirect to mark attendance page with params)
function viewDetails(courseCode, date) {
    // We can redirect to mark attendance page but in "view" mode or just pre-filled
    // Since mark attendance page loads existing attendance, this works perfectly
    window.location.href = `teacher-mark-attendance.html?course=${courseCode}&date=${date}`;
}

// Update bottom stats
function updateDashboardStats() {
    if (attendanceRecords.length === 0) return;

    // Average Attendance
    const totalRate = attendanceRecords.reduce((sum, record) => sum + (record.attendanceRate || 0), 0);
    const avgRate = Math.round(totalRate / attendanceRecords.length);
    document.getElementById('avgAttendance').textContent = `${avgRate}%`;

    // Classes Conducted (This Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const classesThisMonth = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('classesConducted').textContent = classesThisMonth;

    // Low Attendance Alerts (< 75%)
    const lowAttendanceCount = attendanceRecords.filter(record => record.attendanceRate < 75).length;
    document.getElementById('lowAttendanceAlerts').textContent = lowAttendanceCount;
}

// Export records to CSV
function exportRecords() {
    if (filteredRecords.length === 0) {
        alert('No records to export');
        return;
    }

    // Define CSV headers
    const headers = ['Date', 'Course Code', 'Course Name', 'Total Students', 'Present', 'Absent', 'Attendance Rate (%)'];

    // Convert records to CSV rows
    const csvRows = [
        headers.join(','),
        ...filteredRecords.map(record => [
            record.date,
            record.courseCode,
            `"${record.courseName}"`, // Quote course name in case of commas
            record.totalStudents,
            record.presentCount,
            record.absentCount,
            record.attendanceRate
        ].join(','))
    ];

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        window.location.href = 'teacher-login.html';
    }
}
