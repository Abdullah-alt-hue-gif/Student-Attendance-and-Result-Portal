// teacher-upload-results-script.js

// Global variables
let teacherData = {};
let teacherCourses = [];
let students = [];
let selectedCourse = null;
let resultsData = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    checkTeacherSession();
    loadTeacherCourses();
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

// Load teacher courses
function loadTeacherCourses() {
    const savedCourses = localStorage.getItem('portalCourses');
    const courseSelect = document.getElementById('courseSelect');

    if (savedCourses) {
        const allCourses = JSON.parse(savedCourses);

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

// Load students for the selected course
function loadStudentsForResults() {
    const courseCode = document.getElementById('courseSelect').value;
    const marksSection = document.getElementById('marksSection');

    if (!courseCode) {
        marksSection.style.display = 'none';
        return;
    }

    selectedCourse = teacherCourses.find(c => c.code === courseCode);

    // Load all students from portalUsers
    const savedUsers = localStorage.getItem('portalUsers');
    if (savedUsers) {
        const allUsers = JSON.parse(savedUsers);

        // Filter students for this course
        students = allUsers.filter(user =>
            user.role === 'student' && user.course === courseCode
        ).sort((a, b) => {
            const rollA = a.rollNo || '';
            const rollB = b.rollNo || '';
            return rollA.localeCompare(rollB);
        });

        if (students.length === 0) {
            alert('No students enrolled in this course');
            marksSection.style.display = 'none';
            return;
        }

        // Show marks section and render table
        marksSection.style.display = 'block';
        renderMarksTable();
    }
}

// Render marks input table
function renderMarksTable() {
    const tableBody = document.getElementById('marksTableBody');
    const totalMarks = document.getElementById('totalMarks').value || 100;

    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${student.rollNo || 'N/A'}</td>
            <td>${student.name}</td>
            <td>
                <input 
                    type="number" 
                    class="marks-input" 
                    data-student-id="${student.id}"
                    min="0" 
                    max="${totalMarks}"
                    placeholder="0"
                    oninput="calculateLiveStats()"
                >
            </td>
            <td>${totalMarks}</td>
            <td class="percentage-cell" data-student-id="${student.id}">0%</td>
        `;

        tableBody.appendChild(row);
    });

    // Reset stats
    calculateLiveStats();
}

// Calculate live statistics as user enters marks
function calculateLiveStats() {
    const totalMarks = parseFloat(document.getElementById('totalMarks').value) || 100;
    const marksInputs = document.querySelectorAll('.marks-input');

    let validMarks = [];

    marksInputs.forEach(input => {
        const studentId = input.getAttribute('data-student-id');
        const marksObtained = parseFloat(input.value) || 0;
        const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

        // Update percentage cell
        const percentageCell = document.querySelector(`.percentage-cell[data-student-id="${studentId}"]`);
        if (percentageCell) {
            percentageCell.textContent = `${percentage}%`;
        }

        if (input.value !== '') {
            validMarks.push(marksObtained);
        }
    });

    // Calculate stats
    if (validMarks.length > 0) {
        const average = Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length);
        const highest = Math.max(...validMarks);
        const lowest = Math.min(...validMarks);

        document.getElementById('liveAverage').textContent = average;
        document.getElementById('liveHighest').textContent = highest;
        document.getElementById('liveLowest').textContent = lowest;
    } else {
        document.getElementById('liveAverage').textContent = '0';
        document.getElementById('liveHighest').textContent = '0';
        document.getElementById('liveLowest').textContent = '0';
    }
}

// Update percentages when total marks change
function updatePercentages() {
    const totalMarks = parseFloat(document.getElementById('totalMarks').value) || 100;

    // Update table header
    const totalMarksCells = document.querySelectorAll('.marks-table tbody td:nth-child(4)');
    totalMarksCells.forEach(cell => {
        cell.textContent = totalMarks;
    });

    // Update max attribute for inputs
    const marksInputs = document.querySelectorAll('.marks-input');
    marksInputs.forEach(input => {
        input.setAttribute('max', totalMarks);
    });

    // Recalculate percentages
    calculateLiveStats();
}

// Calculate and preview results
function calculateAndPreview() {
    const courseCode = document.getElementById('courseSelect').value;
    const assessmentType = document.getElementById('assessmentType').value;
    const totalMarks = parseFloat(document.getElementById('totalMarks').value) || 100;

    if (!courseCode) {
        alert('Please select a course');
        return;
    }

    // Collect results data
    resultsData = [];
    const marksInputs = document.querySelectorAll('.marks-input');

    let hasEmptyFields = false;

    marksInputs.forEach(input => {
        if (input.value === '') {
            hasEmptyFields = true;
        }

        const studentId = input.getAttribute('data-student-id');
        const student = students.find(s => s.id === studentId);
        const marksObtained = parseFloat(input.value) || 0;
        const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
        const grade = calculateGrade(percentage);
        const status = percentage >= 50 ? 'Passed' : 'Failed';

        resultsData.push({
            studentId: studentId,
            rollNo: student.rollNo,
            name: student.name,
            marksObtained: marksObtained,
            totalMarks: totalMarks,
            percentage: percentage,
            grade: grade,
            status: status
        });
    });

    if (hasEmptyFields) {
        if (!confirm('Some students have no marks entered (they will get 0). Continue?')) {
            return;
        }
    }

    // Calculate summary stats
    const percentages = resultsData.map(r => r.percentage);
    const average = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const highest = Math.max(...resultsData.map(r => r.marksObtained));
    const lowest = Math.min(...resultsData.map(r => r.marksObtained));
    const passCount = resultsData.filter(r => r.status === 'Passed').length;
    const passRate = Math.round((passCount / resultsData.length) * 100);

    // Update preview stats
    document.getElementById('previewAverage').textContent = `${average}%`;
    document.getElementById('previewHighest').textContent = highest;
    document.getElementById('previewLowest').textContent = lowest;
    document.getElementById('previewPassRate').textContent = `${passRate}%`;

    // Render preview table
    renderPreviewTable();

    // Switch to preview mode
    document.getElementById('editMode').style.display = 'none';
    document.getElementById('previewMode').style.display = 'block';
}

// Calculate grade based on percentage
function calculateGrade(percentage) {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
}

// Render preview table
function renderPreviewTable() {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = '';

    resultsData.forEach(result => {
        const row = document.createElement('tr');

        // Determine grade badge class
        let gradeBadgeClass = 'grade-badge';
        if (result.grade.includes('A')) gradeBadgeClass += ' grade-a';
        else if (result.grade.includes('B')) gradeBadgeClass += ' grade-b';
        else if (result.grade.includes('C')) gradeBadgeClass += ' grade-c';
        else if (result.grade.includes('D')) gradeBadgeClass += ' grade-d';
        else gradeBadgeClass += ' grade-f';

        // Determine status badge class
        const statusBadgeClass = result.status === 'Passed' ? 'status-badge status-passed' : 'status-badge status-failed';

        row.innerHTML = `
            <td>${result.rollNo || 'N/A'}</td>
            <td>${result.name}</td>
            <td>${result.marksObtained}/${result.totalMarks}</td>
            <td>${result.percentage}%</td>
            <td><span class="${gradeBadgeClass}">${result.grade}</span></td>
            <td><span class="${statusBadgeClass}">${result.status}</span></td>
        `;

        tableBody.appendChild(row);
    });
}

// Back to edit mode
function backToEdit() {
    document.getElementById('editMode').style.display = 'block';
    document.getElementById('previewMode').style.display = 'none';
}

// Publish results
function publishResults() {
    const courseCode = document.getElementById('courseSelect').value;
    const courseName = selectedCourse.name;
    const assessmentType = document.getElementById('assessmentType').value;

    // Load existing exam results
    const savedResults = localStorage.getItem('examResults');
    let examResults = savedResults ? JSON.parse(savedResults) : [];

    // Create result record
    const resultRecord = {
        id: Date.now().toString(),
        courseCode: courseCode,
        courseName: courseName,
        assessmentType: assessmentType,
        publishedBy: teacherData.name || 'Teacher',
        publishedAt: new Date().toISOString(),
        results: resultsData
    };

    // Add to exam results
    examResults.push(resultRecord);

    // Save to localStorage
    localStorage.setItem('examResults', JSON.stringify(examResults));

    // Show success message
    showSuccessModal();

    // Reset form after a delay
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Show success modal
function showSuccessModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 400px;
    `;

    modal.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
        <h2 style="margin: 0 0 10px 0; color: #27ae60;">Published Successfully!</h2>
        <p style="margin: 0; color: #666;">Results have been published to students.</p>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Remove modal after 2 seconds
    setTimeout(() => {
        document.body.removeChild(overlay);
    }, 2000);
}

// Cancel upload
function cancelUpload() {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
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
    if (e.key === 'portalCourses' || e.key === 'portalUsers') {
        // Reload courses and students when admin makes changes
        console.log('Data updated by admin, refreshing...');
        loadTeacherCourses();

        // Reload students if a course is currently selected
        const selectedCourseCode = document.getElementById('courseSelect').value;
        if (selectedCourseCode) {
            loadStudentsForResults();
        }
    }
});
