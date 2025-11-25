// teacher-mark-attendance-script.js

// Global variables
let teacherData = {};
let teacherCourses = [];
let students = [];
let attendanceRecords = [];
let selectedCourse = null;

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
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateSelect').value = today;

    // Load teacher's courses
    loadTeacherCourses();

    // Check if course is passed via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('course');
    const dateParam = urlParams.get('date');

    if (dateParam) {
        document.getElementById('dateSelect').value = dateParam;
    }

    if (courseCode) {
        document.getElementById('courseSelect').value = courseCode;
        loadStudents();
    }
}

// Load teacher's courses
function loadTeacherCourses() {
    const savedCourses = localStorage.getItem('portalCourses');
    const courseSelect = document.getElementById('courseSelect');

    if (savedCourses) {
        const allCourses = JSON.parse(savedCourses);
        const teacherEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

        // Filter courses assigned to this teacher
        teacherCourses = allCourses.filter(course =>
            course.teacherName === teacherData.name ||
            course.teacherId === teacherData.id
        );

        // Populate course dropdown
        courseSelect.innerHTML = '<option value="">-- Select a course --</option>';
        teacherCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    }
}

// Load students for selected course
function loadStudents() {
    const courseCode = document.getElementById('courseSelect').value;

    if (!courseCode) {
        document.getElementById('studentList').innerHTML = `
            <div class="empty-state-attendance">
                <div class="icon">📚</div>
                <p>Please select a course to mark attendance</p>
            </div>
        `;
        updateStatistics();
        return;
    }

    selectedCourse = teacherCourses.find(c => c.code === courseCode);

    // Load real students from admin database
    students = loadRealStudents(courseCode);

    // Load existing attendance for this date and course
    loadExistingAttendance();

    // Render student list
    renderStudentList();

    // Update statistics
    updateStatistics();
}

// Load real students for a course from admin database
function loadRealStudents(courseCode) {
    // Load students from portalUsers (created by admin)
    const savedUsers = localStorage.getItem('portalUsers');
    let realStudents = [];

    if (savedUsers) {
        const allUsers = JSON.parse(savedUsers);
        // Filter only students
        const studentUsers = allUsers.filter(u => u.role === 'student');

        // Load course enrollments
        const savedEnrollments = localStorage.getItem('courseEnrollments');
        let enrolledStudents = [];

        if (savedEnrollments) {
            const enrollments = JSON.parse(savedEnrollments);
            // Find students enrolled in this course
            const courseEnrollments = enrollments.filter(e => e.courseCode === courseCode);
            const enrolledStudentIds = courseEnrollments.map(e => e.studentId);
            enrolledStudents = studentUsers.filter(s => enrolledStudentIds.includes(s.id));
        } else {
            // If no enrollments exist, show all students for now
            enrolledStudents = studentUsers;
        }

        // Map to attendance format
        realStudents = enrolledStudents.map(student => ({
            id: student.id,
            name: student.name,
            rollNo: student.rollNo || student.id,
            email: student.email,
            status: 'present' // Default status
        }));
    }

    // If no students found, generate sample students for demo
    if (realStudents.length === 0) {
        const sampleNames = [
            'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Wilson',
            'Olivia Martinez', 'William Brown', 'Sophia Taylor', 'Benjamin Lee'
        ];

        const prefix = courseCode.replace(/\s+/g, '').substring(0, 2).toUpperCase();

        realStudents = sampleNames.map((name, index) => ({
            id: `${prefix}2025${String(index + 1).padStart(3, '0')}`,
            name: name,
            rollNo: `${prefix}2025${String(index + 1).padStart(3, '0')}`,
            status: 'present'
        }));
    }

    return realStudents;
}

// Load existing attendance
function loadExistingAttendance() {
    const savedAttendance = localStorage.getItem('attendanceRecords');
    if (savedAttendance) {
        attendanceRecords = JSON.parse(savedAttendance);

        // Find attendance for this course and date
        const courseCode = document.getElementById('courseSelect').value;
        const selectedDate = document.getElementById('dateSelect').value;

        const existingRecord = attendanceRecords.find(record =>
            record.courseCode === courseCode &&
            record.date === selectedDate
        );

        if (existingRecord && existingRecord.students) {
            // Update students with saved attendance
            students.forEach(student => {
                const savedStudent = existingRecord.students.find(s => s.id === student.id);
                if (savedStudent) {
                    student.status = savedStudent.status;
                }
            });
        }
    }
}

// Render student list
function renderStudentList() {
    const studentListContainer = document.getElementById('studentList');
    studentListContainer.innerHTML = '';

    if (students.length === 0) {
        studentListContainer.innerHTML = `
            <div class="empty-state-attendance">
                <div class="icon">👥</div>
                <p>No students found for this course</p>
            </div>
        `;
        return;
    }

    students.forEach((student, index) => {
        const studentItem = document.createElement('div');
        studentItem.className = `student-item ${student.status}`;
        studentItem.id = `student-${index}`;

        const statusIcon = student.status === 'present' ? '✓' : '✕';
        const buttonText = student.status === 'present' ? 'Mark Absent' : 'Mark Present';
        const buttonClass = student.status === 'present' ? 'mark-absent' : 'mark-present';

        studentItem.innerHTML = `
            <div class="student-info-container">
                <div class="status-icon ${student.status}">
                    ${statusIcon}
                </div>
                <div class="student-details">
                    <div class="student-name">${student.name}</div>
                    <div class="student-roll">Roll No: ${student.rollNo}</div>
                </div>
            </div>
            <button class="attendance-toggle ${buttonClass}" onclick="toggleAttendance(${index})">
                ${buttonText}
            </button>
        `;

        studentListContainer.appendChild(studentItem);
    });
}

// Toggle attendance for a student
function toggleAttendance(index) {
    students[index].status = students[index].status === 'present' ? 'absent' : 'present';
    renderStudentList();
    updateStatistics();
}

// Mark all students present
function markAllPresent() {
    if (students.length === 0) {
        alert('Please select a course first');
        return;
    }

    students.forEach(student => student.status = 'present');
    renderStudentList();
    updateStatistics();
}

// Mark all students absent
function markAllAbsent() {
    if (students.length === 0) {
        alert('Please select a course first');
        return;
    }

    students.forEach(student => student.status = 'absent');
    renderStudentList();
    updateStatistics();
}

// Update statistics
function updateStatistics() {
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    document.getElementById('totalStudents').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('attendanceRate').textContent = `${rate}%`;
}

// Update attendance data when date changes
function updateAttendanceData() {
    if (selectedCourse) {
        loadStudents();
    }
}

// Save attendance
function saveAttendance() {
    const courseCode = document.getElementById('courseSelect').value;
    const selectedDate = document.getElementById('dateSelect').value;
    const sessionType = document.getElementById('sessionType').value;

    if (!courseCode) {
        alert('Please select a course');
        return;
    }

    if (!selectedDate) {
        alert('Please select a date');
        return;
    }

    if (students.length === 0) {
        alert('No students to mark attendance for');
        return;
    }

    // Load existing records
    const savedAttendance = localStorage.getItem('attendanceRecords');
    attendanceRecords = savedAttendance ? JSON.parse(savedAttendance) : [];

    // Check if record already exists
    const existingIndex = attendanceRecords.findIndex(record =>
        record.courseCode === courseCode &&
        record.date === selectedDate
    );

    const attendanceRecord = {
        courseCode: courseCode,
        courseName: selectedCourse.name,
        date: selectedDate,
        sessionType: sessionType,
        students: students.map(s => ({
            id: s.id,
            name: s.name,
            rollNo: s.rollNo,
            status: s.status
        })),
        totalStudents: students.length,
        presentCount: students.filter(s => s.status === 'present').length,
        absentCount: students.filter(s => s.status === 'absent').length,
        attendanceRate: students.length > 0 ? Math.round((students.filter(s => s.status === 'present').length / students.length) * 100) : 0,
        markedBy: teacherData.name || 'Teacher',
        markedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
        // Update existing record
        attendanceRecords[existingIndex] = attendanceRecord;
    } else {
        // Add new record
        attendanceRecords.push(attendanceRecord);
    }

    // Save to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

    // Show success message
    alert(`Attendance saved successfully for ${selectedCourse.name} on ${selectedDate}`);

    // Optionally redirect to dashboard
    setTimeout(() => {
        window.location.href = 'teacher-dashboard.html';
    }, 1000);
}

// Cancel attendance marking
function cancelAttendance() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = 'teacher-dashboard.html';
    }
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
        window.location.href = '../login/teacher-login.html';
    }
}

// Listen for storage changes from admin portal
window.addEventListener('storage', function (e) {
    if (e.key === 'portalUsers' || e.key === 'courseEnrollments') {
        // Reload student list when admin adds/modifies students
        if (selectedCourse) {
            console.log('Student data updated by admin, refreshing list...');
            loadStudents();
        }
    }
});
