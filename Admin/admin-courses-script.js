// ========================================
// Shared Data Management (Embedded)
// ========================================

class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize with sample data if empty
        if (!localStorage.getItem('users')) {
            const sampleUsers = [
                {
                    id: 1,
                    name: 'John Smith',
                    email: 'john.smith@portal.com',
                    role: 'Teacher',
                    status: 'Active',
                    joinDate: '2024-09-01'
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    email: 'sarah.j@portal.com',
                    role: 'Student',
                    status: 'Active',
                    joinDate: '2025-11-10'
                },
                {
                    id: 3,
                    name: 'Mike Wilson',
                    email: 'mike.w@portal.com',
                    role: 'Teacher',
                    status: 'Active',
                    joinDate: '2024-08-15'
                },
                {
                    id: 4,
                    name: 'Emily Brown',
                    email: 'emily.b@portal.com',
                    role: 'Student',
                    status: 'Active',
                    joinDate: '2025-11-08'
                },
                {
                    id: 5,
                    name: 'David Lee',
                    email: 'david.l@portal.com',
                    role: 'Student',
                    status: 'Inactive',
                    joinDate: '2025-10-20'
                },
                {
                    id: 6,
                    name: 'Lisa Anderson',
                    email: 'lisa.a@portal.com',
                    role: 'Teacher',
                    status: 'Active',
                    joinDate: '2024-09-05'
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }


        // Initialize courses - check if empty or less than 8
        const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        if (existingCourses.length < 8) {
            const sampleCourses = [
                {
                    id: 1,
                    name: 'Computer Science 101',
                    code: 'CS101',
                    teacher: 'John Smith',
                    students: 45,
                    status: 'Active',
                    description: 'Introduction to Computer Science'
                },
                {
                    id: 2,
                    name: 'Mathematics 201',
                    code: 'MATH201',
                    teacher: 'Mike Wilson',
                    students: 38,
                    status: 'Active',
                    description: 'Advanced Mathematics'
                },
                {
                    id: 3,
                    name: 'Physics 301',
                    code: 'PHY301',
                    teacher: 'Lisa Anderson',
                    students: 32,
                    status: 'Active',
                    description: 'Advanced Physics'
                },
                {
                    id: 4,
                    name: 'Chemistry 102',
                    code: 'CHEM102',
                    teacher: 'John Smith',
                    students: 41,
                    status: 'Active',
                    description: 'General Chemistry'
                },
                {
                    id: 5,
                    name: 'English Literature',
                    code: 'ENG201',
                    teacher: 'Lisa Anderson',
                    students: 29,
                    status: 'Active',
                    description: 'English Literature and Composition'
                },
                {
                    id: 6,
                    name: 'Biology 101',
                    code: 'BIO101',
                    teacher: 'Mike Wilson',
                    students: 35,
                    status: 'Active',
                    description: 'Introduction to Biology'
                },
                {
                    id: 7,
                    name: 'History 201',
                    code: 'HIST201',
                    teacher: 'John Smith',
                    students: 28,
                    status: 'Active',
                    description: 'World History'
                },
                {
                    id: 8,
                    name: 'Art and Design',
                    code: 'ART101',
                    teacher: 'Lisa Anderson',
                    students: 22,
                    status: 'Active',
                    description: 'Introduction to Art and Design'
                }
            ];
            localStorage.setItem('courses', JSON.stringify(sampleCourses));
            console.log('✅ Initialized 8 courses in localStorage');
        } else {
            console.log(`ℹ️ Courses already exist (${existingCourses.length} courses)`);
        }

        if (!localStorage.getItem('attendanceAlerts')) {
            const sampleAlerts = [
                {
                    id: 1,
                    studentName: 'David Lee',
                    course: 'Computer Science 101',
                    attendance: 45,
                    status: 'Critical'
                },
                {
                    id: 2,
                    studentName: 'Emily Brown',
                    course: 'Mathematics 201',
                    attendance: 62,
                    status: 'Warning'
                },
                {
                    id: 3,
                    studentName: 'Sarah Johnson',
                    course: 'Physics 301',
                    attendance: 58,
                    status: 'Warning'
                }
            ];
            localStorage.setItem('attendanceAlerts', JSON.stringify(sampleAlerts));
        }

        if (!localStorage.getItem('attendanceTrends')) {
            const trends = [
                { month: 'Jan', percentage: 85 },
                { month: 'Feb', percentage: 82 },
                { month: 'Mar', percentage: 88 },
                { month: 'Apr', percentage: 86 },
                { month: 'May', percentage: 90 },
                { month: 'Jun', percentage: 87 }
            ];
            localStorage.setItem('attendanceTrends', JSON.stringify(trends));
        }
    }

    // Users CRUD
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user.joinDate = new Date().toISOString().split('T')[0];
        if (!user.status) user.status = 'Active';
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    updateUser(id, updatedData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(filtered));
    }

    // Courses CRUD
    getCourses() {
        const coursesData = localStorage.getItem('courses');
        console.log('Raw courses from localStorage:', coursesData);
        const courses = JSON.parse(coursesData) || [];
        console.log('Parsed courses:', courses);
        return courses;
    }

    addCourse(course) {
        const courses = this.getCourses();
        course.id = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
        course.students = 0;
        course.status = 'Active';
        courses.push(course);
        localStorage.setItem('courses', JSON.stringify(courses));
        console.log('Added course:', course);
        return course;
    }

    updateCourse(id, updatedData) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updatedData };
            localStorage.setItem('courses', JSON.stringify(courses));
            return courses[index];
        }
        return null;
    }

    deleteCourse(id) {
        const courses = this.getCourses();
        const filtered = courses.filter(c => c.id !== id);
        localStorage.setItem('courses', JSON.stringify(filtered));
    }

    // Attendance Alerts
    getAttendanceAlerts() {
        return JSON.parse(localStorage.getItem('attendanceAlerts')) || [];
    }

    getAttendanceTrends() {
        return JSON.parse(localStorage.getItem('attendanceTrends')) || [];
    }
}

// Toast Notification System
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Toast icons
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    // Create toast element
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

    // Add to container
    container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 3000);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Shared UI Logic
function checkAdminSession() {
    const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
    if (!session.isLoggedIn) {
        window.location.href = '../login/admin-login.html';
        return;
    }

    // Display admin name if element exists
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = session.adminName || 'Admin User';
    }
}

function setupSidebar() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminSession');
                window.location.href = '../login/admin-login.html';
            }
        });
    }

    // Highlight active nav item
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === 'manage-courses.html' && href === 'manage-courses.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Notification Dropdown System
function setupNotificationDropdown() {
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
            populateNotifications();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationIcon.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function populateNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    const dataManager = new DataManager();
    const alerts = dataManager.getAttendanceAlerts();

    // Build notification HTML
    const notificationsHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="mark-all-read" onclick="markAllNotificationsRead()">Mark all read</button>
        </div>
        <div class="notification-list">
            ${alerts.length > 0 ? alerts.map(alert => `
                <div class="notification-item ${alert.read ? '' : 'unread'}" data-id="${alert.id}">
                    <div class="notification-icon-wrapper ${alert.status.toLowerCase()}">
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

function markAllNotificationsRead() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => item.classList.remove('unread'));
    showToast('All notifications marked as read', 'success');
}

// ========================================
// Courses Controller
// ========================================

class CoursesController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingCourseId = null;
        this.init();
    }

    init() {
        console.log('CoursesController initializing...');
        checkAdminSession();
        setupSidebar();
        setupNotificationDropdown();
        this.setupEventListeners();
        this.renderCoursesTable();

        // Check for action parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'add') {
            this.openCourseModal();
        }
    }

    setupEventListeners() {
        // Add Course button
        document.getElementById('addCourseModalBtn')?.addEventListener('click', () => this.openCourseModal());

        // Modal controls
        document.getElementById('closeCourseModal')?.addEventListener('click', () => this.closeCourseModal());
        document.getElementById('cancelCourseBtn')?.addEventListener('click', () => this.closeCourseModal());

        // Form submission
        document.getElementById('courseForm')?.addEventListener('submit', (e) => this.handleCourseSubmit(e));

        // Pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPageBtn')?.addEventListener('click', () => this.changePage(1));

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeCourseModal();
            }
        });
    }

    renderCoursesTable() {
        const courses = this.dataManager.getCourses();
        const tbody = document.getElementById('coursesTableBody');

        console.log('Rendering courses table...');
        console.log('Total courses found:', courses.length);
        console.log('Courses data:', courses);

        if (!tbody) {
            console.error('coursesTableBody element not found!');
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedCourses = courses.slice(startIndex, endIndex);

        console.log('Paginated courses:', paginatedCourses.length);

        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No courses found. Click "Add Course" to create one.</td></tr>';
            this.updatePagination(0);
            return;
        }

        tbody.innerHTML = paginatedCourses.map(course => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-book" style="color: #4a90e2;"></i>
                        <span>${course.name || 'Untitled Course'}</span>
                    </div>
                </td>
                <td>${course.code || 'N/A'}</td>
                <td>${course.teacher || 'Unassigned'}</td>
                <td>${course.students || 0}</td>
                <td>
                    <span class="status-badge ${(course.status || 'active').toLowerCase()}">${course.status || 'Active'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="coursesController.editCourse(${course.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="coursesController.deleteCourse(${course.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(courses.length);
        console.log('Table rendered successfully');
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationNumbers = document.getElementById('paginationNumbers');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${totalItems} courses`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages || totalPages === 0;
        }

        if (paginationNumbers) {
            paginationNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.renderCoursesTable();
                });
                paginationNumbers.appendChild(pageBtn);
            }
        }
    }

    changePage(direction) {
        const courses = this.dataManager.getCourses();
        const totalPages = Math.ceil(courses.length / this.itemsPerPage);

        this.currentPage += direction;
        if (this.currentPage < 1) this.currentPage = 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        this.renderCoursesTable();
    }

    openCourseModal(course = null) {
        const modal = document.getElementById('courseModal');
        const form = document.getElementById('courseForm');
        const title = document.getElementById('courseModalTitle');

        if (course) {
            this.editingCourseId = course.id;
            title.textContent = 'Edit Course';
            document.getElementById('courseName').value = course.name;
            document.getElementById('courseCode').value = course.code || '';
            document.getElementById('courseDescription').value = course.description || '';

            // Populate teacher dropdown and select current teacher
            this.populateTeacherDropdown();
            document.getElementById('courseTeacher').value = course.teacher;
        } else {
            this.editingCourseId = null;
            title.textContent = 'Create New Course';
            form.reset();
            this.populateTeacherDropdown();
        }

        modal.classList.add('active');
    }

    closeCourseModal() {
        document.getElementById('courseModal').classList.remove('active');
        this.editingCourseId = null;
    }

    populateTeacherDropdown() {
        const users = this.dataManager.getUsers();
        const teachers = users.filter(u => u.role === 'Teacher');
        const select = document.getElementById('courseTeacher');

        if (!select) return;

        select.innerHTML = '<option value="">Select a teacher</option>' +
            teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
    }

    handleCourseSubmit(e) {
        e.preventDefault();

        const courseData = {
            name: document.getElementById('courseName').value,
            code: document.getElementById('courseCode').value,
            teacher: document.getElementById('courseTeacher').value,
            description: document.getElementById('courseDescription').value
        };

        if (this.editingCourseId) {
            // Update existing course
            this.dataManager.updateCourse(this.editingCourseId, courseData);
            showToast('Course updated successfully!', 'success');
        } else {
            // Add new course
            this.dataManager.addCourse(courseData);
            showToast('Course created successfully!', 'success');
        }

        this.closeCourseModal();
        this.renderCoursesTable();
    }

    editCourse(id) {
        const courses = this.dataManager.getCourses();
        const course = courses.find(c => c.id === id);
        if (course) {
            this.openCourseModal(course);
        }
    }

    deleteCourse(id) {
        if (confirm('Are you sure you want to delete this course?')) {
            this.dataManager.deleteCourse(id);
            this.renderCoursesTable();
            showToast('Course deleted successfully!', 'success');
        }
    }
}

// Initialize controller
let coursesController;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing CoursesController...');
    coursesController = new CoursesController();
});
