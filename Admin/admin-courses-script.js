// admin-courses-script.js

// Global variables
let courses = [];
let teachers = [];
let currentPage = 1;
const coursesPerPage = 10;
let currentEditId = null;
let currentDeleteId = null;
let filteredCourses = [];

// Sample initial data
const initialCourses = [
    {
        id: 1,
        name: 'Computer Science 101',
        code: 'CS101',
        teacherId: 1,
        teacherName: 'John Smith',
        description: 'Introduction to computer science and programming',
        credits: 4,
        duration: 15,
        students: 45,
        status: 'active',
        createdAt: '2024-01-10'
    },
    {
        id: 2,
        name: 'Mathematics 201',
        code: 'MATH201',
        teacherId: 3,
        teacherName: 'Mike Wilson',
        description: 'Advanced mathematics and calculus',
        credits: 3,
        duration: 15,
        students: 38,
        status: 'active',
        createdAt: '2024-01-12'
    },
    {
        id: 3,
        name: 'Physics 301',
        code: 'PHY301',
        teacherId: 4,
        teacherName: 'Lisa Anderson',
        description: 'Classical mechanics and thermodynamics',
        credits: 4,
        duration: 16,
        students: 32,
        status: 'active',
        createdAt: '2024-01-15'
    },
    {
        id: 4,
        name: 'Chemistry 102',
        code: 'CHEM102',
        teacherId: 1,
        teacherName: 'John Smith',
        description: 'Organic chemistry and laboratory techniques',
        credits: 3,
        duration: 14,
        students: 41,
        status: 'active',
        createdAt: '2024-02-01'
    },
    {
        id: 5,
        name: 'English Literature',
        code: 'ENG201',
        teacherId: 4,
        teacherName: 'Lisa Anderson',
        description: 'Classic and contemporary English literature',
        credits: 3,
        duration: 15,
        students: 29,
        status: 'inactive',
        createdAt: '2024-01-20'
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    checkUserSession();
    initializeCoursesPage();
    loadCourses();
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

function initializeCoursesPage() {
    // Load courses from localStorage or use initial data
    const savedCourses = localStorage.getItem('portalCourses');
    const savedUsers = localStorage.getItem('portalUsers');

    if (savedCourses) {
        courses = JSON.parse(savedCourses);
    } else {
        courses = [...initialCourses];
        saveCourses();
    }

    // Load teachers from users
    if (savedUsers) {
        const allUsers = JSON.parse(savedUsers);
        teachers = allUsers.filter(user => user.role === 'teacher');
    } else {
        // Fallback teachers
        teachers = [
            { id: 1, name: 'John Smith', email: 'john.smith@portal.com' },
            { id: 3, name: 'Mike Wilson', email: 'mike.w@portal.com' },
            { id: 4, name: 'Lisa Anderson', email: 'lisa.a@portal.com' }
        ];
    }

    filteredCourses = [...courses];

    // Setup search functionality
    const searchInput = document.getElementById('courseSearch');
    searchInput.addEventListener('input', function () {
        searchCourses();
    });

    // Setup form submission
    document.getElementById('courseForm').addEventListener('submit', handleCourseFormSubmit);

    // Load teachers dropdown
    loadTeachersDropdown();

    // Render initial table
    renderCoursesTable();
}

function loadTeachersDropdown() {
    const teacherSelect = document.getElementById('courseTeacher');
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';

    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        teacherSelect.appendChild(option);
    });
}

function loadCourses() {
    console.log('Loading courses...');
}

function saveCourses() {
    localStorage.setItem('portalCourses', JSON.stringify(courses));
}

function renderCoursesTable() {
    const tableBody = document.getElementById('coursesTableBody');
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    if (coursesToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    No courses found. <a href="javascript:void(0)" onclick="openAddCourseModal()">Add the first course</a>
                </td>
            </tr>
        `;
        return;
    }

    coursesToShow.forEach((course, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1 + ((currentPage - 1) * coursesPerPage)}</td>
            <td>
                <strong>${course.name}</strong>
                ${course.description ? `<br><small style="color: #7f8c8d;">${course.description}</small>` : ''}
            </td>
            <td><code>${course.code}</code></td>
            <td>${course.teacherName}</td>
            <td>
                <span class="student-count">${course.students}</span>
                <button class="view-students-btn" onclick="viewCourseStudents(${course.id})" title="View Students">👥</button>
            </td>
            <td><span class="status-badge ${course.status}">${course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span></td>
            <td>${formatDate(course.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewCourse(${course.id})" title="View Details">👁️</button>
                    <button class="edit-btn" onclick="editCourse(${course.id})" title="Edit Course">✏️</button>
                    <button class="delete-btn" onclick="deleteCourse(${course.id})" title="Delete Course">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderCoursesTable();
    }
}

// Search and Filter Functions
function searchCourses() {
    const query = document.getElementById('courseSearch').value.toLowerCase().trim();

    if (query === '') {
        filteredCourses = [...courses];
    } else {
        filteredCourses = courses.filter(course =>
            course.name.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query) ||
            course.teacherName.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query)
        );
    }

    currentPage = 1;
    renderCoursesTable();
}

// Modal Management Functions
function openAddCourseModal() {
    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');

    modalTitle.textContent = 'Add New Course';
    submitBtn.textContent = 'Add Course';

    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseCredits').value = '3';
    document.getElementById('courseDuration').value = '15';
    document.getElementById('courseStatus').value = 'active';

    modal.style.display = 'block';
}

function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        showToast('Course not found!', 'error');
        return;
    }

    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmitBtn');

    modalTitle.textContent = 'Edit Course';
    submitBtn.textContent = 'Update Course';

    // Fill form with course data
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseCode').value = course.code;
    document.getElementById('courseTeacher').value = course.teacherId;
    document.getElementById('courseDescription').value = course.description || '';
    document.getElementById('courseCredits').value = course.credits;
    document.getElementById('courseDuration').value = course.duration;
    document.getElementById('courseStatus').value = course.status;

    currentEditId = courseId;
    modal.style.display = 'block';
}

function viewCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        alert(`Course Details:\n\nName: ${course.name}\nCode: ${course.code}\nTeacher: ${course.teacherName}\nDescription: ${course.description}\nCredits: ${course.credits}\nDuration: ${course.duration} weeks\nStudents: ${course.students}\nStatus: ${course.status}\nCreated: ${formatDate(course.createdAt)}`);
    }
}

function viewCourseStudents(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        alert(`Course: ${course.name}\n\nTotal Students: ${course.students}\n\nThis would open A detailed student list in a real application.`);
    }
}

function deleteCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        showToast('Course not found!', 'error');
        return;
    }

    currentDeleteId = courseId;
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete course "${course.name}" (${course.code})? This action cannot be undone.`;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    if (currentDeleteId === null) return;

    courses = courses.filter(course => course.id !== currentDeleteId);
    filteredCourses = filteredCourses.filter(course => course.id !== currentDeleteId);

    saveCourses();
    renderCoursesTable();
    showToast('Course deleted successfully!', 'success');
    closeDeleteModal();
}

// Form Handling
function handleCourseFormSubmit(e) {
    e.preventDefault();

    const teacherId = parseInt(document.getElementById('courseTeacher').value);
    const teacher = teachers.find(t => t.id === teacherId);

    const formData = {
        id: document.getElementById('courseId').value ? parseInt(document.getElementById('courseId').value) : generateCourseId(),
        name: document.getElementById('courseName').value.trim(),
        code: document.getElementById('courseCode').value.trim().toUpperCase(),
        teacherId: teacherId,
        teacherName: teacher ? teacher.name : 'Unknown',
        description: document.getElementById('courseDescription').value.trim(),
        credits: parseInt(document.getElementById('courseCredits').value),
        duration: parseInt(document.getElementById('courseDuration').value),
        students: currentEditId ? courses.find(c => c.id === currentEditId).students : 0,
        status: document.getElementById('courseStatus').value,
        createdAt: currentEditId ? courses.find(c => c.id === currentEditId).createdAt : new Date().toISOString().split('T')[0]
    };

    // Validation
    if (!validateCourseForm(formData)) {
        return;
    }

    // Check for duplicate code (excluding current course in edit mode)
    const existingCourse = courses.find(c => c.code === formData.code && c.id !== formData.id);
    if (existingCourse) {
        showToast('A course with this code already exists!', 'error');
        return;
    }

    if (currentEditId) {
        // Update existing course
        const index = courses.findIndex(c => c.id === currentEditId);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...formData };
            showToast('Course updated successfully!', 'success');
        }
    } else {
        // Add new course
        courses.push(formData);
        showToast('Course added successfully!', 'success');
    }

    saveCourses();
    filteredCourses = [...courses];
    renderCoursesTable();
    closeCourseModal();
}

function validateCourseForm(formData) {
    if (formData.name.length < 3) {
        showToast('Course name must be at least 3 characters long!', 'error');
        return false;
    }

    if (formData.code.length < 2) {
        showToast('Course code must be at least 2 characters long!', 'error');
        return false;
    }

    if (!formData.teacherId) {
        showToast('Please select a teacher!', 'error');
        return false;
    }

    if (formData.credits < 1 || formData.credits > 6) {
        showToast('Credits must be between 1 and 6!', 'error');
        return false;
    }

    if (formData.duration < 1 || formData.duration > 20) {
        showToast('Duration must be between 1 and 20 weeks!', '  error  ');
        return false;
    }

    return true;
}

// Utility Functions
function generateCourseId() {
    const maxId = courses.reduce((max, course) => Math.max(max, course.id), 0);
    return maxId + 1;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function closeCourseModal() {
    document.getElementById('courseModal').style.display = 'none';
    currentEditId = null;
    document.getElementById('courseForm').reset();
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

// Close modals when clicking outside
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            if (modal.id === 'courseModal') closeCourseModal();
            if (modal.id === 'deleteModal') closeDeleteModal();
        }
    });
};

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openAddCourseModal();
    }

    if (e.key === 'Escape') {
        closeCourseModal();
        closeDeleteModal();
    }
});