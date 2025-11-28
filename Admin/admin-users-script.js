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

        if (!localStorage.getItem('courses')) {
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
        return JSON.parse(localStorage.getItem('courses')) || [];
    }

    addCourse(course) {
        const courses = this.getCourses();
        course.id = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
        course.students = 0;
        course.status = 'Active';
        courses.push(course);
        localStorage.setItem('courses', JSON.stringify(courses));
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
        if (href === currentPage || (currentPage === 'manage-users.html' && href === 'manage-users.html')) {
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
// Manage Users Page Controller
// ========================================

class UsersController {
    constructor() {
        this.dataManager = new DataManager();
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.editingUserId = null;
        this.searchQuery = '';

        this.init();
    }

    init() {
        checkAdminSession();
        setupSidebar();
        setupNotificationDropdown();
        this.setupEventListeners();
        this.renderUsersTable();

        // Check for action parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'add') {
            this.openUserModal();
        }
    }

    setupEventListeners() {
        // Modal buttons
        document.getElementById('addUserModalBtn')?.addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModal')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancelUserBtn')?.addEventListener('click', () => this.closeUserModal());

        // Form submission
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserSubmit(e));

        // Search
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentPage = 1; // Reset to first page on search
            this.renderUsersTable();
        });

        // Pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderUsersTable();
            }
        });

        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            const totalPages = this.getTotalPages();
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderUsersTable();
            }
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeUserModal();
            }
        });
    }

    getFilteredUsers() {
        const users = this.dataManager.getUsers();
        if (!this.searchQuery) return users;

        return users.filter(u =>
            u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }

    getTotalPages() {
        return Math.ceil(this.getFilteredUsers().length / this.itemsPerPage);
    }

    renderUsersTable() {
        const filteredUsers = this.getFilteredUsers();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedUsers = filteredUsers.slice(start, end);

        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${this.getInitials(user.name)}</div>
                        <span class="user-name-text">${user.name}</span>
                    </div>
                </td>
                <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-btn" onclick="usersController.editUser(${user.id})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="icon-btn delete-btn" onclick="usersController.deleteUser(${user.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(filteredUsers.length);
    }

    updatePagination(totalItems) {
        const totalPages = this.getTotalPages();
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(start + this.itemsPerPage - 1, totalItems);

        document.getElementById('paginationInfo').textContent =
            totalItems > 0 ? `Showing ${start} to ${end} of ${totalItems} users` : 'No users found';

        document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages || totalPages === 0;

        // Render page numbers
        const numbersContainer = document.getElementById('paginationNumbers');
        if (numbersContainer) {
            numbersContainer.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
                btn.textContent = i;
                btn.onclick = () => {
                    this.currentPage = i;
                    this.renderUsersTable();
                };
                numbersContainer.appendChild(btn);
            }
        }
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    openUserModal(user = null) {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const title = document.getElementById('userModalTitle');
        const submitBtn = document.getElementById('submitUserBtn');
        const passwordInput = document.getElementById('userPassword');

        if (user) {
            this.editingUserId = user.id;
            title.textContent = 'Edit User';
            submitBtn.textContent = 'Update User';
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            // Make password optional for editing
            passwordInput.required = false;
            passwordInput.placeholder = 'Leave blank to keep current password';
            passwordInput.value = '';
        } else {
            this.editingUserId = null;
            title.textContent = 'Create New User';
            submitBtn.textContent = 'Create User';
            form.reset();
            // Make password required for new users
            passwordInput.required = true;
            passwordInput.placeholder = 'Enter password';
        }

        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('userModal').classList.remove('active');
        this.editingUserId = null;
    }

    handleUserSubmit(e) {
        e.preventDefault();

        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value
        };

        // Only include password for new users or if changed
        const password = document.getElementById('userPassword').value;
        if (password) {
            userData.password = password;
        }

        if (this.editingUserId) {
            // Update existing user
            this.dataManager.updateUser(this.editingUserId, userData);
            showToast('User updated successfully!', 'success');
        } else {
            // Add new user
            userData.status = 'Active';
            this.dataManager.addUser(userData);
            showToast('User added successfully!', 'success');
        }

        this.closeUserModal();
        this.renderUsersTable();
    }

    editUser(id) {
        const users = this.dataManager.getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
            this.openUserModal(user);
        }
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.dataManager.deleteUser(id);
            this.renderUsersTable();
            showToast('User deleted successfully!', 'success');
        }
    }
}

// Initialize controller
let usersController;
document.addEventListener('DOMContentLoaded', () => {
    usersController = new UsersController();
});
