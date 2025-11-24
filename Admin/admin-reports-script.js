// admin-reports-script.js

// Global variables
let reports = [];
let currentReportType = '';

// Sample initial reports
const initialReports = [
    {
        id: 1,
        title: 'Monthly Attendance Report - October',
        type: 'attendance',
        date: '2025-11-01',
        size: '2.4 MB',
        format: 'pdf',
        downloadCount: 15
    },
    {
        id: 2,
        title: 'Midterm Results Analysis',
        type: 'results',
        date: '2025-10-28',
        size: '1.8 MB',
        format: 'excel',
        downloadCount: 23
    },
    {
        id: 3,
        title: 'Student Performance Overview',
        type: 'results',
        date: '2025-10-15',
        size: '3.1 MB',
        format: 'pdf',
        downloadCount: 18
    },
    {
        id: 4,
        title: 'Weekly Attendance Summary',
        type: 'attendance',
        date: '2025-10-10',
        size: '1.2 MB',
        format: 'csv',
        downloadCount: 8
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeReportsPage();
    loadReports();
});

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
}

function initializeReportsPage() {
    // Load reports from localStorage or use initial data
    const savedReports = localStorage.getItem('portalReports');
    if (savedReports) {
        reports = JSON.parse(savedReports);
    } else {
        reports = [...initialReports];
        saveReports();
    }

    // Setup form submission
    document.getElementById('generateReportForm').addEventListener('submit', handleReportGeneration);

    // Setup date range toggle
    const dateRange = document.getElementById('reportDateRange');
    const customDateGroup = document.getElementById('customDateRangeGroup');

    dateRange.addEventListener('change', function () {
        customDateGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    // Set default dates for custom range
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    document.getElementById('startDate').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];

    // Initialize charts and statistics
    initializeCharts();
    updateStatistics();
    renderReportsTable();
}

function loadReports() {
    console.log('Loading reports...');
}

function saveReports() {
    localStorage.setItem('portalReports', JSON.stringify(reports));
}

function initializeCharts() {
    // Attendance Overview Chart
    const attendanceCtx = document.getElementById('attendanceOverviewChart');
    if (attendanceCtx) {
        new Chart(attendanceCtx, {
            type: 'bar',
            data: {
                labels: ['CS101', 'MATH201', 'PHY301', 'CHEM102', 'ENG201'],
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: [88, 92, 85, 90, 78],
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#27ae60',
                        '#f39c12',
                        '#9b59b6'
                    ],
                    borderWidth: 0,
                    borderRadius: 4
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
}

function updateStatistics() {
    // Update report counts
    const attendanceCount = reports.filter(r => r.type === 'attendance').length;
    const resultsCount = reports.filter(r => r.type === 'results').length;
    const customCount = reports.filter(r => r.type === 'custom').length;

    document.getElementById('attendanceReportsCount').textContent = attendanceCount;
    document.getElementById('resultReportsCount').textContent = resultsCount;
    document.getElementById('customReportsCount').textContent = customCount;

    // Update quick statistics (these would come from your data)
    const savedUsers = localStorage.getItem('portalUsers');
    const savedCourses = localStorage.getItem('portalCourses');

    if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const students = users.filter(u => u.role === 'student').length;
        const teachers = users.filter(u => u.role === 'teacher').length;

        document.getElementById('totalStudents').textContent = students;
        document.getElementById('totalTeachers').textContent = teachers;
    }

    if (savedCourses) {
        const courses = JSON.parse(savedCourses);
        const activeCourses = courses.filter(c => c.status === 'active').length;
        document.getElementById('totalCourses').textContent = activeCourses;
    }

    // Simulate average attendance
    document.getElementById('avgAttendance').textContent = '87%';
}

function renderReportsTable() {
    const tableBody = document.getElementById('reportsTableBody');
    const recentReports = reports.slice(0, 10); // Show latest 10 reports

    tableBody.innerHTML = '';

    if (recentReports.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    No reports generated yet. Generate your first report!
                </td>
            </tr>
        `;
    } else {
        recentReports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${report.title}</strong>
                    ${report.notes ? `<br><small style="color: #7f8c8d;">${report.notes}</small>` : ''}
                </td>
                <td><span class="report-type ${report.type}">${report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span></td>
                <td>${formatDate(report.date)}</td>
                <td>${report.size}</td>
                <td>
                    <div class="action-buttons">
                        <button class="download-btn" onclick="downloadReport(${report.id})" title="Download">
                            📥 Download
                        </button>
                        <button class="delete-btn" onclick="deleteReport(${report.id})" title="Delete Report">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('reportsCount').textContent = `Showing ${recentReports.length} recent reports`;
}

// Report Generation Functions
function generateAttendanceReport() {
    currentReportType = 'attendance';
    openReportModal('Attendance Report');
}

function generateResultReport() {
    currentReportType = 'results';
    openReportModal('Results Report');
}

function generateCustomReport() {
    currentReportType = 'custom';
    openReportModal('Custom Report');
}

function openReportModal(reportType) {
    const modal = document.getElementById('generateReportModal');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = `Generate ${reportType}`;
    document.getElementById('reportType').value = currentReportType;

    // Set default title based on report type
    const defaultTitles = {
        'attendance': `Attendance Report - ${new Date().toLocaleDateString()}`,
        'results': `Results Analysis - ${new Date().toLocaleDateString()}`,
        'custom': `Custom Report - ${new Date().toLocaleDateString()}`
    };

    document.getElementById('reportTitle').value = defaultTitles[currentReportType] || 'New Report';

    modal.style.display = 'block';
}

function useTemplate(templateType) {
    const templates = {
        'weekly_attendance': {
            type: 'attendance',
            title: `Weekly Attendance Report - Week ${getWeekNumber(new Date())}`,
            dateRange: 'last_week',
            notes: 'Weekly attendance summary across all courses'
        },
        'monthly_results': {
            type: 'results',
            title: `Monthly Results Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            dateRange: 'last_month',
            notes: 'Monthly examination results and performance analysis'
        },
        'student_performance': {
            type: 'custom',
            title: 'Student Performance Overview',
            dateRange: 'last_quarter',
            notes: 'Comprehensive student performance and progress tracking'
        },
        'teacher_efficiency': {
            type: 'custom',
            title: 'Teacher Efficiency Report',
            dateRange: 'last_quarter',
            notes: 'Teacher performance and course effectiveness analysis'
        }
    };

    const template = templates[templateType];
    if (template) {
        currentReportType = template.type;
        openReportModal(template.type.charAt(0).toUpperCase() + template.type.slice(1) + ' Report');

        // Pre-fill form with template values
        setTimeout(() => {
            document.getElementById('reportTitle').value = template.title;
            document.getElementById('reportDateRange').value = template.dateRange;
            document.getElementById('reportNotes').value = template.notes;
        }, 100);
    }
}

function handleReportGeneration(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('reportTitle').value.trim(),
        type: document.getElementById('reportType').value,
        dateRange: document.getElementById('reportDateRange').value,
        format: document.getElementById('reportFormat').value,
        includeCharts: document.getElementById('includeCharts').checked,
        notes: document.getElementById('reportNotes').value.trim()
    };

    if (formData.dateRange === 'custom') {
        formData.startDate = document.getElementById('startDate').value;
        formData.endDate = document.getElementById('endDate').value;
    }

    // Validation
    if (!validateReportForm(formData)) {
        return;
    }

    // Generate report
    generateReport(formData);
}

function validateReportForm(formData) {
    if (formData.title.length < 5) {
        showToast('Report title must be at least 5 characters long!', 'error');
        return false;
    }

    if (!formData.dateRange) {
        showToast('Please select a date range!', 'error');
        return false;
    }

    if (formData.dateRange === 'custom' && (!formData.startDate || !formData.endDate)) {
        showToast('Please select both start and end dates!', 'error');
        return false;
    }

    return true;
}

function generateReport(formData) {
    const submitBtn = document.querySelector('#generateReportForm .submit-btn');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Generating...';
    submitBtn.disabled = true;

    // Simulate report generation
    setTimeout(() => {
        // Create new report
        const newReport = {
            id: generateReportId(),
            title: formData.title,
            type: formData.type,
            date: new Date().toISOString().split('T')[0],
            size: generateFileSize(formData.format),
            format: formData.format,
            notes: formData.notes,
            downloadCount: 0
        };

        // Add to reports array
        reports.unshift(newReport);
        saveReports();

        // Update UI
        updateStatistics();
        renderReportsTable();

        showToast('Report generated successfully!', 'success');
        closeReportModal();

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Auto-download simulation
        setTimeout(() => {
            if (confirm('Report generated! Would you like to download it now?')) {
                downloadReport(newReport.id);
            }
        }, 500);

    }, 2000);
}

// Report Management Functions
function downloadReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
        showToast('Report not found!', 'error');
        return;
    }

    // Simulate download
    showToast(`Downloading ${report.title}...`, 'info');

    // Update download count
    report.downloadCount = (report.downloadCount || 0) + 1;
    saveReports();

    // In a real application, this would trigger actual file download
    setTimeout(() => {
        showToast('Download completed!', 'success');
    }, 1000);
}

function deleteReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
        showToast('Report not found!', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
        reports = reports.filter(r => r.id !== reportId);
        saveReports();
        updateStatistics();
        renderReportsTable();
        showToast('Report deleted successfully!', 'success');
    }
}

function clearAllReports() {
    if (reports.length === 0) {
        showToast('No reports to clear!', 'info');
        return;
    }

    if (confirm('Are you sure you want to delete all reports? This action cannot be undone.')) {
        reports = [];
        saveReports();
        updateStatistics();
        renderReportsTable();
        showToast('All reports cleared successfully!', 'success');
    }
}

// Utility Functions
function generateReportId() {
    const maxId = reports.reduce((max, report) => Math.max(max, report.id), 0);
    return maxId + 1;
}

function generateFileSize(format) {
    const sizes = {
        'pdf': ['1.2 MB', '2.4 MB', '3.1 MB'],
        'excel': ['0.8 MB', '1.8 MB', '2.5 MB'],
        'csv': ['0.5 MB', '1.2 MB', '1.8 MB']
    };

    const availableSizes = sizes[format] || ['1.0 MB'];
    return availableSizes[Math.floor(Math.random() * availableSizes.length)];
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function closeReportModal() {
    document.getElementById('generateReportModal').style.display = 'none';
    document.getElementById('generateReportForm').reset();
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

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('generateReportModal');
    if (event.target === modal) {
        closeReportModal();
    }
};