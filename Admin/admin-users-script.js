// admin-users-script.js

// Global variables
let users = [];
let currentPage = 1;
const usersPerPage = 10;
let currentEditId = null;
let currentDeleteId = null;
let filteredUsers = [];

// Sample initial data with rollNo for students
const initialUsers = [
    {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@portal.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2025-01-10'
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarahj@portal.com',
        role: 'student',
        rollNo: 'STU20250001',
        status: 'active',
        createdAt: '2024-02-20',
        lastLogin: '2025-01-08'
    },
    {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.w@portal.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2024-01-10',
        lastLogin: '2025-01-09'
    },
    {
        id: 4,
        name: 'Emily Brown',
        email: 'emily.b@portal.com',
        role: 'student',
        rollNo: 'STU20250002',
        status: 'active',
        createdAt: '2024-03-05',
        lastLogin: '2025-01-07'
    },
    {
        id: 5,
        name: 'David Lee',
        email: 'david.lee@portal.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2025-01-11'
    },
    {
        id: 6,
        name: 'Michael Chen',
        email: 'michael.chen@portal.com',
        role: 'student',
        rollNo: 'STU20250003',
        status: 'active',
        createdAt: '2024-03-10',
        lastLogin: '2025-01-06'
    },
    {
        id: 7,
        name: 'Lisa Anderson',
        email: 'lisa.anderson@portal.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2024-01-12',
        lastLogin: '2025-01-09'
    },
    {
        id: 8,
        name: 'James Wilson',
        email: 'james.w@portal.com',
        role: 'student',
        rollNo: 'STU20250004',
        status: 'active',
        createdAt: '2024-03-15',
        lastLogin: '2025-01-08'
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeUsersPage();
    loadUsers();
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

function initializeUsersPage() {
    // Load users from localStorage or use initial data
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = [...initialUsers];
        saveUsers();
    }

    filteredUsers = [...users];

    // Setup search functionality
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', function () {
        searchUsers();
    });

    // Setup form submission
    document.getElementById('userForm').addEventListener('submit', handleUserFormSubmit);

    // Render initial table
    renderUsersTable();
}

// User Management Functions
function loadUsers() {
    // In a real application, this would be an API call
    console.log('Loading users...');
}

function saveUsers() {
    localStorage.setItem('portalUsers', JSON.stringify(users));
}

function renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (usersToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    No users found. <a href="javascript:void(0)" onclick="openAddUserModal()">Add the first user</a>
                </td>
            </tr>
        `;
        return;
    }

    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td><span class="role-badge ${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewUser(${user.id})" title="View Details">👁️</button>
                    <button class="edit-btn" onclick="editUser(${user.id})" title="Edit User">✏️</button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})" title="Delete User">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderUsersTable();
    }
}

// Search and Filter Functions
function searchUsers() {
    const query = document.getElementById('userSearch').value.toLowerCase().trim();

    if (query === '') {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query) ||
            user.status.toLowerCase().includes(query)
        );
    }

    currentPage = 1;
    renderUsersTable();
}

// Modal Management Functions
function openAddUserModal() {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const passwordGroup = document.getElementById('passwordGroup');

    modalTitle.textContent = 'Add New User';
    submitBtn.textContent = 'Add User';
    passwordGroup.style.display = 'block';

    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';

    modal.style.display = 'block';
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showToast('User not found!', 'error');
        return;
    }

    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const passwordGroup = document.getElementById('passwordGroup');

    modalTitle.textContent = 'Edit User';
    submitBtn.textContent = 'Update User';
    passwordGroup.style.display = 'none';

    // Fill form with user data
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;

    currentEditId = userId;
    modal.style.display = 'block';
}

function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const rollNoText = user.rollNo ? `\nRoll No: ${user.rollNo}` : '';
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}${rollNoText}\nStatus: ${user.status}\nCreated: ${formatDate(user.createdAt)}\nLast Login: ${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}`);
    }
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showToast('User not found!', 'error');
        return;
    }

    // Prevent admin from deleting themselves
    const currentUserEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (user.email === currentUserEmail) {
        showToast('You cannot delete your own account!', 'error');
        return;
    }

    currentDeleteId = userId;
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete user "${user.name}" (${user.email})? This action cannot be undone.`;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    if (currentDeleteId === null) return;

    users = users.filter(user => user.id !== currentDeleteId);
    filteredUsers = filteredUsers.filter(user => user.id !== currentDeleteId);

    saveUsers();
    renderUsersTable();
    showToast('User deleted successfully!', 'success');
    closeDeleteModal();
}

// Form Handling
function handleUserFormSubmit(e) {
    e.preventDefault();

    const role = document.getElementById('userRole').value;
    const formData = {
        id: document.getElementById('userId').value ? parseInt(document.getElementById('userId').value) : generateUserId(),
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim().toLowerCase(),
        role: role,
        status: document.getElementById('userStatus').value,
        createdAt: document.getElementById('userId').value ?
            users.find(u => u.id === parseInt(document.getElementById('userId').value))?.createdAt :
            new Date().toISOString().split('T')[0],
        lastLogin: null
    };

    // Auto-generate rollNo for students  
    if (role === 'student' && !document.getElementById('userId').value) {
        const year = new Date().getFullYear();
        const studentCount = users.filter(u => u.role === 'student').length + 1;
        formData.rollNo = `STU${year}${String(studentCount).padStart(4, '0')}`;
    } else if (role === 'student' && document.getElementById('userId').value) {
        // Keep existing rollNo when editing
        const existingUser = users.find(u => u.id === parseInt(document.getElementById('userId').value));
        formData.rollNo = existingUser?.rollNo || `STU${new Date().getFullYear()}${String(formData.id).padStart(4, '0')}`;
    }

    // Validation
    if (!validateUserForm(formData)) {
        return;
    }

    // Check for duplicate email (excluding current user in edit mode)
    const existingUser = users.find(u => u.email === formData.email && u.id !== formData.id);
    if (existingUser) {
        showToast('A user with this email already exists!', 'error');
        return;
    }

    if (currentEditId) {
        // Update existing user
        const index = users.findIndex(u => u.id === currentEditId);
        if (index !== -1) {
            users[index] = { ...users[index], ...formData };
            showToast('User updated successfully!', 'success');
        }
    } else {
        // Add new user
        users.push(formData);
        showToast('User added successfully!', 'success');
    }

    saveUsers();
    filteredUsers = [...users];
    renderUsersTable();
    closeUserModal();
}

function validateUserForm(formData) {
    // Name validation
    if (formData.name.length < 2) {
        showToast('Name must be at least 2 characters long!', 'error');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showToast('Please enter a valid email address!', 'error');
        return false;
    }

    // Role validation
    if (!['student', 'teacher', 'admin'].includes(formData.role)) {
        showToast('Please select a valid role!', 'error');
        return false;
    }

    // Password validation (only for new users)
    if (!currentEditId) {
        const password = document.getElementById('userPassword').value;
        if (password.length < 8) {
            showToast('Password must be at least 8 characters long!', 'error');
            return false;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            showToast('Password must contain both letters and numbers!', 'error');
            return false;
        }
    }

    return true;
}

// Utility Functions
function generateUserId() {
    const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
    return maxId + 1;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    currentEditId = null;
    document.getElementById('userForm').reset();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteId = null;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Export/Import Functions
function exportUsers() {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `users-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Users exported successfully!', 'success');
}

function importUsers(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedUsers = JSON.parse(e.target.result);

            if (!Array.isArray(importedUsers)) {
                throw new Error('Invalid file format');
            }

            // Validate imported users
            const validUsers = importedUsers.filter(user =>
                user.id && user.name && user.email && user.role && user.status
            );

            if (validUsers.length === 0) {
                throw new Error('No valid users found in file');
            }

            if (confirm(`Import ${validUsers.length} users? This will replace current users.`)) {
                users = validUsers;
                filteredUsers = [...users];
                saveUsers();
                renderUsersTable();
                showToast(`${validUsers.length} users imported successfully!`, 'success');
            }
        } catch (error) {
            showToast('Error importing users: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Close modals when clicking outside
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            if (modal.id === 'userModal') closeUserModal();
            if (modal.id === 'deleteModal') closeDeleteModal();
        }
    });
};

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openAddUserModal();
    }

    if (e.key === 'Escape') {
        closeUserModal();
        closeDeleteModal();
    }
});