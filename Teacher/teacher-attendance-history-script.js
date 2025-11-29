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
            return this.getCourses();
        }
        const courses = this.getCourses();
        return courses.filter(c => c.teacher === teacher.name);
    }

    // Attendance Records CRUD
    getAttendanceRecords() {
        return JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    }
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
            window.location.href = '../login/teacher-login.html';
        });
    }

    // Notification Dropdown
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
// History Controller
// ========================================

class HistoryController {
    constructor() {
        this.dataManager = new DataManager();
        this.records = [];
        this.filteredRecords = [];
        this.init();
    }

    init() {
        if (!checkTeacherSession()) return;
        setupSidebar();
        this.loadInitialData();
        this.setupEventListeners();
    }

    loadInitialData() {
        // Load courses for filter
        const courses = this.dataManager.getTeacherCourses();
        const courseFilter = document.getElementById('courseFilter');

        if (courseFilter) {
            courses.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.name} (${c.code})`;
                courseFilter.appendChild(option);
            });
        }

        // Load all records
        const allRecords = this.dataManager.getAttendanceRecords();
        const teacher = this.dataManager.getCurrentTeacher();

        // Filter records for this teacher only
        if (teacher) {
            this.records = allRecords.filter(r => r.teacherName === teacher.name);
        } else {
            this.records = allRecords;
        }

        // Sort by date descending
        this.records.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.filteredRecords = [...this.records];
        this.renderTable();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('courseFilter')?.addEventListener('change', () => this.filterRecords());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.filterRecords());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportToExcel());
    }

    filterRecords() {
        const courseId = document.getElementById('courseFilter').value;
        const date = document.getElementById('dateFilter').value;

        this.filteredRecords = this.records.filter(record => {
            const matchCourse = courseId === 'all' || record.courseId.toString() === courseId;
            const matchDate = !date || record.date === date;
            return matchCourse && matchDate;
        });

        this.renderTable();
        this.updateStats();
    }

    renderTable() {
        const tbody = document.getElementById('attendanceTableBody');
        const countSpan = document.getElementById('showingCount');

        if (!tbody) return;

        tbody.innerHTML = '';
        countSpan.textContent = this.filteredRecords.length;

        if (this.filteredRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px;">
                        <i class="fas fa-search" style="font-size: 24px; color: var(--text-light); margin-bottom: 10px;"></i>
                        <p style="color: var(--text-light);">No records found matching your filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.filteredRecords.forEach(record => {
            const rate = Math.round((record.presentCount / record.totalStudents) * 100) || 0;
            let progressColor = 'var(--green)';
            if (rate < 75) progressColor = 'var(--orange)';
            if (rate < 50) progressColor = 'var(--red)';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.date}</td>
                <td>${record.courseName} <span style="color: var(--text-light); font-size: 12px;">(${record.courseCode})</span></td>
                <td style="color: var(--green); font-weight: 600;">${record.presentCount}</td>
                <td style="color: var(--red); font-weight: 600;">${record.absentCount}</td>
                <td>
                    <div class="attendance-progress">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${rate}%; background-color: ${progressColor};"></div>
                        </div>
                        <span class="progress-text">${rate}%</span>
                    </div>
                </td>
                <td>
                    <a href="#" class="action-link" onclick="viewDetails(${record.id})">View Details</a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateStats() {
        // Average Attendance
        let totalRate = 0;
        this.filteredRecords.forEach(r => {
            totalRate += (r.presentCount / r.totalStudents) * 100 || 0;
        });
        const avgRate = this.filteredRecords.length > 0 ? Math.round(totalRate / this.filteredRecords.length) : 0;

        document.getElementById('avgAttendance').textContent = `${avgRate}%`;

        // Classes Conducted
        document.getElementById('classesConducted').textContent = this.filteredRecords.length;

        // Low Attendance Alerts (< 75%)
        const lowCount = this.filteredRecords.filter(r => (r.presentCount / r.totalStudents) * 100 < 75).length;
        document.getElementById('lowAttendance').textContent = lowCount;
    }

    exportToExcel() {
        if (this.filteredRecords.length === 0) {
            alert('No records to export');
            return;
        }

        // Create CSV content
        const headers = ['Date', 'Course Name', 'Course Code', 'Session Type', 'Total Students', 'Present', 'Absent', 'Attendance Rate'];
        const rows = this.filteredRecords.map(r => [
            r.date,
            `"${r.courseName}"`, // Quote to handle commas
            r.courseCode,
            r.sessionType,
            r.totalStudents,
            r.presentCount,
            r.absentCount,
            `${Math.round((r.presentCount / r.totalStudents) * 100)}%`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Placeholder for View Details (can be expanded later)
function viewDetails(recordId) {
    // For now, just show a simple alert or log
    console.log('View details for record:', recordId);
    // In a real app, this would open a modal or navigate to a details page
    alert('Detailed view implementation coming soon!');
}

// Initialize
let historyController;
document.addEventListener('DOMContentLoaded', () => {
    historyController = new HistoryController();
});
