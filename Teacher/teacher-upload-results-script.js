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

    // Get students (all students for now)
    getStudents() {
        const users = this.getUsers();
        return users.filter(u => u.role === 'Student');
    }

    // Results CRUD
    getResults() {
        return JSON.parse(localStorage.getItem('examResults') || '[]');
    }

    saveResult(result) {
        const results = this.getResults();
        // Check if result already exists for this course, exam, and student
        const existingIndex = results.findIndex(r =>
            r.courseId == result.courseId &&
            r.examType === result.examType &&
            r.studentId == result.studentId
        );

        if (existingIndex >= 0) {
            results[existingIndex] = result;
        } else {
            result.id = Date.now() + Math.random();
            results.push(result);
        }

        localStorage.setItem('examResults', JSON.stringify(results));
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
        this.init();
    }

    init() {
        if (!checkTeacherSession()) return;
        setupSidebar();
        this.loadCourses();
        this.setupEventListeners();
    }

    loadCourses() {
        const courses = this.dataManager.getTeacherCourses();
        const courseFilter = document.getElementById('courseFilter');
        const modalCourseSelect = document.getElementById('modalCourseSelect');

        const options = courses.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('');

        if (courseFilter) {
            courseFilter.innerHTML = '<option value="">Select a course</option>' + options;
        }

        if (modalCourseSelect) {
            modalCourseSelect.innerHTML = '<option value="">Select a course</option>' + options;
        }
    }

    setupEventListeners() {
        // Filter changes
        document.getElementById('courseFilter')?.addEventListener('change', () => this.loadResults());
        document.getElementById('examTypeFilter')?.addEventListener('change', () => this.loadResults());

        // Modal interactions
        const modal = document.getElementById('uploadModal');
        const openBtn = document.getElementById('openUploadModalBtn');
        const closeBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelUploadBtn');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('show');
                this.resetModal();
            });
        }

        const closeModal = () => modal.classList.remove('show');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        // Modal Course Change
        document.getElementById('modalCourseSelect')?.addEventListener('change', (e) => {
            this.generateStudentInputs(e.target.value);
        });

        // Save Results
        document.getElementById('saveResultsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveResults();
        });
    }

    loadResults() {
        const courseId = document.getElementById('courseFilter').value;
        const examType = document.getElementById('examTypeFilter').value;
        const tbody = document.getElementById('resultsTableBody');
        const footer = document.getElementById('tableFooter');

        if (!courseId) {
            tbody.innerHTML = '';
            footer.style.display = 'block';
            footer.textContent = 'Please select a course to view results';
            return;
        }

        const allResults = this.dataManager.getResults();
        const filteredResults = allResults.filter(r => r.courseId == courseId && r.examType === examType);

        if (filteredResults.length === 0) {
            tbody.innerHTML = '';
            footer.style.display = 'block';
            footer.textContent = 'No results found for this selection';
            return;
        }

        footer.style.display = 'none';
        tbody.innerHTML = filteredResults.map(r => {
            let gradeColor = 'var(--text-dark)';
            if (r.grade === 'A' || r.grade === 'A+') gradeColor = 'var(--green)';
            if (r.grade === 'F') gradeColor = 'var(--red)';

            return `
                <tr>
                    <td>${r.rollNo}</td>
                    <td>${r.studentName}</td>
                    <td>${r.marksObtained}</td>
                    <td>${r.totalMarks}</td>
                    <td>${r.percentage}%</td>
                    <td style="color: ${gradeColor}; font-weight: 600;">${r.grade}</td>
                    <td>
                        <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    generateStudentInputs(courseId) {
        const container = document.getElementById('studentMarksEntry');
        if (!courseId) {
            container.innerHTML = '<div class="empty-state-small"><p>Select a course to enter marks for students</p></div>';
            return;
        }

        const students = this.dataManager.getStudents();
        // In a real app, we would filter students enrolled in this specific course
        // For now, we use all students as per the simplified data model

        if (students.length === 0) {
            container.innerHTML = '<div class="empty-state-small"><p>No students found</p></div>';
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="student-mark-row" data-student-id="${student.id}">
                <div class="student-info-small">
                    <span class="name">${student.name}</span>
                    <span class="roll">ID: ${student.id}</span>
                </div>
                <input type="number" class="form-input mark-input" placeholder="Marks" min="0" required>
            </div>
        `).join('');
    }

    calculateGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    }

    saveResults() {
        const courseSelect = document.getElementById('modalCourseSelect');
        const examTypeSelect = document.getElementById('modalExamType');
        const totalMarksInput = document.getElementById('modalTotalMarks');

        if (!courseSelect.value || !totalMarksInput.value) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const courseId = courseSelect.value;
        const courseName = courseSelect.options[courseSelect.selectedIndex].text;
        const examType = examTypeSelect.value;
        const totalMarks = parseFloat(totalMarksInput.value);

        const rows = document.querySelectorAll('.student-mark-row');
        let savedCount = 0;

        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const studentName = row.querySelector('.name').textContent;
            const marksInput = row.querySelector('.mark-input');
            const marksObtained = parseFloat(marksInput.value);

            if (!isNaN(marksObtained)) {
                const percentage = Math.round((marksObtained / totalMarks) * 100);
                const grade = this.calculateGrade(percentage);
                const courseCode = courseName.match(/\((.*?)\)/)?.[1] || 'CS';
                const rollNo = `${courseCode}2025${String(studentId).padStart(3, '0')}`;

                const result = {
                    courseId,
                    courseName,
                    examType,
                    studentId,
                    studentName,
                    rollNo,
                    marksObtained,
                    totalMarks,
                    percentage,
                    grade,
                    date: new Date().toISOString()
                };

                this.dataManager.saveResult(result);
                savedCount++;
            }
        });

        if (savedCount > 0) {
            showToast(`Results saved for ${savedCount} students`, 'success');
            document.getElementById('uploadModal').classList.remove('show');

            // If the filter matches the uploaded data, refresh the table
            const filterCourse = document.getElementById('courseFilter').value;
            const filterExam = document.getElementById('examTypeFilter').value;

            if (filterCourse == courseId && filterExam == examType) {
                this.loadResults();
            }
        } else {
            showToast('Please enter marks for at least one student', 'warning');
        }
    }

    resetModal() {
        document.getElementById('uploadForm').reset();
        document.getElementById('studentMarksEntry').innerHTML = '<div class="empty-state-small"><p>Select a course to enter marks for students</p></div>';
    }
}

// Initialize
let resultsController;
document.addEventListener('DOMContentLoaded', () => {
    resultsController = new ResultsController();
});
