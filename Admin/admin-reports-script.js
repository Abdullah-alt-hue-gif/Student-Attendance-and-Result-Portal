class ReportsController {
    constructor() {
        this.init();
    }

    init() {
        this.checkAdminSession();
        this.setupSidebar();
        this.setupEventListeners();
        this.renderRecentReports();
        this.setupNotificationDropdown();
    }

    checkAdminSession() {
        const session = localStorage.getItem('adminSession');
        if (!session) {
            window.location.href = '../login/admin-login.html';
            return;
        }
        const adminData = JSON.parse(session);
        if (!adminData.isLoggedIn) {
            window.location.href = '../login/admin-login.html';
            return;
        }
        document.getElementById('adminName').textContent = adminData.adminName || 'Admin User';
    }

    setupSidebar() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

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

    setupNotificationDropdown() {
        const notificationIcon = document.querySelector('.notification-icon');
        if (!notificationIcon) return;

        // Create dropdown HTML if it doesn't exist
        let dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notificationDropdown';
            dropdown.className = 'notification-dropdown';
            notificationIcon.appendChild(dropdown);
        }

        // Toggle dropdown on bell icon click
        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                this.populateNotifications();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationIcon.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    populateNotifications() {
        const dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) return;

        const alerts = JSON.parse(localStorage.getItem('attendanceAlerts')) || [];

        // Build notification HTML
        const notificationsHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" onclick="markAllNotificationsRead()">Mark all read</button>
            </div>
            <div class="notification-list">
                ${alerts.length > 0 ? alerts.map(alert => `
                    <div class="notification-item ${alert.read ? '' : 'unread'}" data-id="${alert.id}">
                        <div class="notification-icon-wrapper ${alert.status ? alert.status.toLowerCase() : 'warning'}">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">Low Attendance Alert</div>
                            <div class="notification-message">${alert.studentName} - ${alert.course}: ${alert.attendance}% attendance</div>
                            <div class="notification-time">2 hours ago</div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="notification-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p>No new notifications</p>
                    </div>
                `}
            </div>
            ${alerts.length > 0 ? `
                <div class="notification-footer">
                    <a href="#" class="view-all-notifications">View all notifications</a>
                </div>
            ` : ''}
        `;

        dropdown.innerHTML = notificationsHTML;
    }

    setupEventListeners() {
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('adminSession');
            window.location.href = '../login/admin-login.html';
        });

        // Form Submissions
        document.getElementById('attendanceReportForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePDF('Attendance Report', 'attendanceModal');
        });

        document.getElementById('resultsReportForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePDF('Results Report', 'resultsModal');
        });

        document.getElementById('customReportForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePDF('Custom Report', 'customModal');
        });

        // Export All
        document.getElementById('exportAllBtn')?.addEventListener('click', () => {
            this.generateExportAllPDF();
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    renderRecentReports() {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;

        // Mock data for recent reports
        const reports = [
            { title: 'Monthly Attendance Report - October', type: 'Attendance', date: '2025-11-01', typeClass: 'attendance' },
            { title: 'Midterm Results Analysis', type: 'Results', date: '2025-10-28', typeClass: 'results' },
            { title: 'Student Performance Overview', type: 'Results', date: '2025-10-15', typeClass: 'results' },
            { title: 'Weekly Attendance Summary', type: 'Attendance', date: '2025-10-10', typeClass: 'attendance' }
        ];

        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>
                    <div class="file-icon">
                        <i class="fas fa-file-pdf"></i>
                        <span>${report.title}</span>
                    </div>
                </td>
                <td><span class="report-type ${report.typeClass}">${report.type}</span></td>
                <td>${report.date}</td>
                <td>
                    <button class="action-link" onclick="downloadReport('${report.title}')">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async generatePDF(title, modalId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add logo/header
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 137); // #2C3E89
        doc.text("School Management System", 20, 20);

        doc.setFontSize(16);
        doc.setTextColor(51, 51, 51);
        doc.text(title, 20, 35);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
        doc.text(`Generated by: Admin User`, 20, 50);

        // Add dummy content based on report type
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Report Summary", 20, 65);

        const lorem = "This is a generated report containing detailed analysis and statistics. The data presented here reflects the current state of the system based on the selected parameters. This document is confidential and intended for administrative use only.";
        const splitText = doc.splitTextToSize(lorem, 170);
        doc.text(splitText, 20, 75);

        // Add a table using autoTable
        if (title.includes('Attendance')) {
            const alerts = JSON.parse(localStorage.getItem('attendanceAlerts')) || [];
            const tableData = alerts.map(a => [a.studentName, a.course, `${a.attendance}%`, a.status]);

            doc.autoTable({
                startY: 90,
                head: [['Student Name', 'Course', 'Attendance', 'Status']],
                body: tableData.length ? tableData : [['John Doe', 'CS101', '85%', 'Active'], ['Jane Smith', 'MATH201', '92%', 'Active']],
                theme: 'striped',
                headStyles: { fillColor: [44, 62, 137] }
            });
        } else {
            // Generic table for other reports
            doc.autoTable({
                startY: 90,
                head: [['Metric', 'Value', 'Change']],
                body: [
                    ['Total Students', '1,248', '+12%'],
                    ['Average Attendance', '87%', '+2%'],
                    ['Course Completion', '94%', '+5%'],
                    ['New Enrollments', '45', '+8%']
                ],
                theme: 'striped',
                headStyles: { fillColor: [44, 62, 137] }
            });
        }

        // Save PDF
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);

        // Close modal and show toast
        closeModal(modalId);
        showToast(`${title} generated successfully!`, 'success');
    }

    generateExportAllPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(44, 62, 137);
        doc.text("Comprehensive School Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

        // Add sections
        doc.text("Recent Reports Summary", 20, 45);

        const reports = [
            ['Monthly Attendance Report', 'Attendance', '2025-11-01'],
            ['Midterm Results Analysis', 'Results', '2025-10-28'],
            ['Student Performance Overview', 'Results', '2025-10-15'],
            ['Weekly Attendance Summary', 'Attendance', '2025-10-10']
        ];

        doc.autoTable({
            startY: 50,
            head: [['Report Title', 'Type', 'Date']],
            body: reports,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 137] }
        });

        doc.save('All_Reports_Export.pdf');
        showToast('All reports exported successfully!', 'success');
    }
}

// Global functions for HTML onclick events
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Set today's date in title if present
        const titleInput = modal.querySelector('input[type="text"]');
        if (titleInput && titleInput.value.includes('11/27/2025')) {
            // Keep the default or update to current date dynamically if needed
            // titleInput.value = titleInput.value.replace(/\d{1,2}\/\d{1,2}\/\d{4}/, new Date().toLocaleDateString());
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function markAllNotificationsRead() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));
    showToast('All notifications marked as read', 'success');
}

function downloadReport(title) {
    // Reuse the generatePDF logic or create a simple dummy download
    const controller = new ReportsController();
    controller.generatePDF(title, 'none');
}

// Toast Notification Helper (copied from dashboard.js for standalone usage)
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

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ReportsController();
});
