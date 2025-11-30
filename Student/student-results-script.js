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

    getResults() {
        return JSON.parse(localStorage.getItem('examResults')) || [];
    }

    // Get courses the student is enrolled in
    getStudentCourses(studentName) {
        const courses = this.getCourses();
        return courses.filter(course =>
            course.students && course.students.includes(studentName)
        );
    }

    // Get results for specific student
    getStudentResults(studentName) {
        const results = this.getResults();
        return results.filter(r => r.studentName === studentName);
    }

    // Calculate GPA from grades
    gradeToGPA(grade) {
        const gradeMap = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0,
            'F': 0.0
        };
        return gradeMap[grade] || 0.0;
    }

    // Get grade letter from grade
    getGradeLetter(grade) {
        // Extract just the letter part (A, B, C, D, F)
        if (!grade) return '';
        return grade.charAt(0);
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
// Results Controller
// ========================================

class ResultsController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentStudent = null;
        this.selectedCourse = null;
        this.selectedCourseResults = [];
        this.init();
    }

    init() {
        if (!checkStudentSession()) return;
        setupSidebar();

        this.currentStudent = this.dataManager.getCurrentStudent();

        if (this.currentStudent) {
            this.updateProfile();
            this.loadResultsData();
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

    loadResultsData() {
        const results = this.dataManager.getStudentResults(this.currentStudent.name);
        const enrolledCourses = this.dataManager.getStudentCourses(this.currentStudent.name);

        // Calculate overall stats
        this.calculateOverallStats(results, enrolledCourses);

        // Group results by course
        const courseResults = this.groupResultsByCourse(results, enrolledCourses);

        // Render course list
        this.renderCourseList(courseResults);

        // Load notifications
        this.loadNotifications(results);
    }

    calculateOverallStats(results, courses) {
        const coursesCompleted = courses.length;

        // Calculate overall GPA
        let totalGPA = 0;
        let totalPercentage = 0;
        let count = 0;

        // Group by course and get one result per course
        const courseGrades = {};
        results.forEach(result => {
            if (!courseGrades[result.courseId]) {
                courseGrades[result.courseId] = result;
                const gpa = this.dataManager.gradeToGPA(result.grade);
                totalGPA += gpa;
                totalPercentage += parseFloat(result.percentage) || 0;
                count++;
            }
        });

        const cgpa = count > 0 ? (totalGPA / count).toFixed(2) : '0.0';
        const avgPercentage = count > 0 ? Math.round(totalPercentage / count) : 0;

        // Update UI
        const cgpaEl = document.getElementById('currentCGPA');
        const percentageEl = document.getElementById('overallPercentage');
        const completedEl = document.getElementById('coursesCompleted');

        if (cgpaEl) cgpaEl.textContent = cgpa;
        if (percentageEl) percentageEl.textContent = `${avgPercentage}%`;
        if (completedEl) completedEl.textContent = coursesCompleted;

        // Show improvement note (simplified)
        const changeEl = document.getElementById('percentageChange');
        if (changeEl) {
            changeEl.textContent = 'Great work!';
            changeEl.classList.add('positive');
        }
    }

    groupResultsByCourse(results, courses) {
        const grouped = [];

        courses.forEach(course => {
            const courseResults = results.filter(r => r.courseId == course.id);

            if (courseResults.length > 0) {
                // Calculate course totals
                let totalObtained = 0;
                let totalMax = 0;

                courseResults.forEach(r => {
                    totalObtained += parseFloat(r.marksObtained) || 0;
                    totalMax += parseFloat(r.totalMarks) || 0;
                });

                const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(0) : 0;
                const grade = courseResults[0].grade || 'N/A'; // Use grade from first result
                const gpa = this.dataManager.gradeToGPA(grade);

                grouped.push({
                    course: course,
                    results: courseResults,
                    totalObtained: totalObtained,
                    totalMax: totalMax,
                    percentage: percentage,
                    grade: grade,
                    gpa: gpa.toFixed(1)
                });
            }
        });

        return grouped;
    }

    renderCourseList(courseResults) {
        const container = document.getElementById('resultsCoursesList');
        if (!container) return;

        container.innerHTML = '';

        if (courseResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>No results published yet</p>
                </div>
            `;
            return;
        }

        courseResults.forEach((item, index) => {
            const gradeLetter = this.dataManager.getGradeLetter(item.grade);

            const courseItem = document.createElement('div');
            courseItem.className = `result-course-item ${index === 0 ? 'active' : ''}`;
            courseItem.dataset.courseId = item.course.id;
            courseItem.innerHTML = `
                <div class="result-course-header">
                    <span class="result-course-name">${item.course.name}</span>
                    <span class="result-course-grade ${gradeLetter}">${item.grade}</span>
                </div>
                <div class="result-course-footer">
                    <span>${item.course.code || 'N/A'}</span>
                    <span>${item.percentage}%</span>
                </div>
            `;

            courseItem.addEventListener('click', () => this.selectCourse(item));
            container.appendChild(courseItem);
        });

        // Auto-select first course
        if (courseResults.length > 0) {
            this.selectCourse(courseResults[0]);
        }
    }

    selectCourse(courseData) {
        this.selectedCourse = courseData.course;
        this.selectedCourseResults = courseData.results;

        // Update active state
        document.querySelectorAll('.result-course-item').forEach(item => {
            item.classList.toggle('active', item.dataset.courseId == this.selectedCourse.id);
        });

        // Render course details
        this.renderCourseDetails(courseData);
    }

    renderCourseDetails(courseData) {
        const nameEl = document.getElementById('resultsCourseName');
        const codeEl = document.getElementById('resultsCourseCode');
        const totalMarksEl = document.getElementById('totalMarks');
        const percentageEl = document.getElementById('coursePercentage');
        const gradeEl = document.getElementById('courseGrade');
        const gpaEl = document.getElementById('courseGPA');

        if (nameEl) nameEl.textContent = courseData.course.name;
        if (codeEl) codeEl.textContent = `Course Code: ${courseData.course.code || 'N/A'}`;
        if (totalMarksEl) totalMarksEl.textContent = `${courseData.totalObtained}/${courseData.totalMax}`;
        if (percentageEl) percentageEl.textContent = `${courseData.percentage}%`;
        if (gradeEl) gradeEl.textContent = courseData.grade;
        if (gpaEl) gpaEl.textContent = courseData.gpa;

        // Render assessment breakdown
        this.renderAssessmentTable(courseData);
    }

    renderAssessmentTable(courseData) {
        const tbody = document.getElementById('assessmentTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        courseData.results.forEach(result => {
            const percentage = parseFloat(result.percentage) || 0;
            const percentageClass = percentage >= 85 ? 'high' : percentage >= 70 ? 'medium' : 'low';
            const gradeLetter = this.dataManager.getGradeLetter(result.grade);

            const date = new Date(result.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="assessment-name">${result.examType || 'Assessment'}</td>
                <td class="assessment-date">${date}</td>
                <td>${result.marksObtained}</td>
                <td>${result.totalMarks}</td>
                <td>
                    <div class="percentage-bar-cell">
                        <div class="percentage-bar">
                            <div class="percentage-fill ${percentageClass}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="percentage-text">${percentage}%</span>
                    </div>
                </td>
                <td><span class="grade-badge-sm ${gradeLetter}">${result.grade}</span></td>
            `;
            tbody.appendChild(row);
        });

        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td></td>
            <td><strong>${courseData.totalObtained}</strong></td>
            <td><strong>${courseData.totalMax}</strong></td>
            <td><strong>${courseData.percentage}%</strong></td>
            <td><strong>${courseData.grade}</strong></td>
        `;
        tbody.appendChild(totalRow);
    }

    setupEventListeners() {
        const downloadBtn = document.getElementById('downloadResultsBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
        }
    }

    downloadReport() {
        if (!this.selectedCourse) {
            showToast('Please select a course first', 'warning');
            return;
        }

        // Find the selected course data
        const results = this.dataManager.getStudentResults(this.currentStudent.name);
        const courseResults = results.filter(r => r.courseId == this.selectedCourse.id);

        let totalObtained = 0;
        let totalMax = 0;
        courseResults.forEach(r => {
            totalObtained += parseFloat(r.marksObtained) || 0;
            totalMax += parseFloat(r.totalMarks) || 0;
        });

        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
        const grade = courseResults[0]?.grade || 'N/A';
        const gpa = this.dataManager.gradeToGPA(grade);

        // Create report content
        let reportContent = `ACADEMIC RESULTS REPORT\n`;
        reportContent += `=======================\n\n`;
        reportContent += `Student: ${this.currentStudent.name}\n`;
        reportContent += `Course: ${this.selectedCourse.name}\n`;
        reportContent += `Course Code: ${this.selectedCourse.code || 'N/A'}\n`;
        reportContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        reportContent += `OVERALL PERFORMANCE\n`;
        reportContent += `------------------\n`;
        reportContent += `Total Marks: ${totalObtained}/${totalMax}\n`;
        reportContent += `Percentage: ${percentage}%\n`;
        reportContent += `Grade: ${grade}\n`;
        reportContent += `GPA: ${gpa.toFixed(1)}\n\n`;
        reportContent += `ASSESSMENT DETAILS\n`;
        reportContent += `------------------\n`;

        courseResults.sort((a, b) => new Date(a.date) - new Date(b.date));

        courseResults.forEach(result => {
            const date = new Date(result.date).toLocaleDateString();
            reportContent += `\n${result.examType || 'Assessment'}\n`;
            reportContent += `Date: ${date}\n`;
            reportContent += `Marks: ${result.marksObtained}/${result.totalMarks} (${result.percentage}%)\n`;
            reportContent += `Grade: ${result.grade}\n`;
        });

        // Create downloadable file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Results_Report_${this.selectedCourse.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Report downloaded successfully!', 'success');
    }

    loadNotifications(results) {
        const notifications = [];

        // Check for recent results (last 7 days)
        const recentResults = results.filter(r => {
            const diff = new Date() - new Date(r.date);
            return diff < 604800000; // 7 days
        });

        if (recentResults.length > 0) {
            notifications.push({
                text: `${recentResults.length} new result(s) published`,
                time: 'Recently',
                type: 'info'
            });
        }

        // Check for low grades
        const lowGrades = results.filter(r => {
            const grade = this.dataManager.getGradeLetter(r.grade);
            return grade === 'D' || grade === 'F';
        });

        if (lowGrades.length > 0) {
            notifications.push({
                text: 'Consider reviewing courses with low grades',
                time: 'Just now',
                type: 'urgent'
            });
        }

        if (notifications.length === 0) {
            notifications.push({
                text: 'Great performance! Keep it up!',
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
            dropdownContainer.innerHTML = notifications.map(notif => `
                <div class="dropdown-item">
                    <p>${notif.text}</p>
                    <span class="time">${notif.time}</span>
                </div>
            `).join('');
        }
    }
}

// Initialize
let resultsController;
document.addEventListener('DOMContentLoaded', () => {
    resultsController = new ResultsController();
});
