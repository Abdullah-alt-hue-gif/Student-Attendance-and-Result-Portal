# 🎓 School Management System - Frontend Project

## 📖 Project Overview
This is a comprehensive, web-based **School Management System** designed to digitize and streamline the administrative and academic processes of an educational institution. The application provides three distinct, secure portals tailored for **Administrators**, **Teachers**, and **Students**.

Built with a focus on **User Experience (UX)** and **Modern Design**, the interface is responsive, intuitive, and visually appealing.

> **Note:** This is currently a **Frontend-Only** prototype. All data (users, courses, attendance, results) is stored locally in your browser's `localStorage`. This means the application works offline and requires no server setup for demonstration purposes.

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
-   **HTML5**: Semantic markup for structure.
-   **CSS3**: Custom styling using CSS Variables for theming, Flexbox/Grid for layout, and media queries for responsiveness. No external CSS frameworks (like Bootstrap) were used to ensure complete control over the design.
-   **JavaScript (ES6+)**: Vanilla JavaScript for all logic, DOM manipulation, and data handling.
-   **Font Awesome 6**: For consistent and modern iconography.
-   **Google Fonts**: Uses the 'Inter' font family for clean typography.

### Key Libraries
-   **jsPDF & jsPDF-AutoTable**: Used in the Admin portal to generate professional PDF reports for attendance and exam results directly from the browser.

### Data Management Strategy
The application mimics a real-world full-stack application using a **Mock Backend** approach:
-   **`DataManager` Class**: Each portal (Admin, Student, Teacher) uses a `DataManager` class that acts as an interface between the UI and the data storage.
-   **`localStorage`**: Acts as the database. Data is persisted across page reloads but remains local to the specific browser.

---

## 🚀 Key Features by Role

### 👨‍💼 1. Admin Portal
The command center of the system.
-   **Dashboard**: Visual analytics showing total students, teachers, active courses, and recent alerts.
-   **User Management**: Full CRUD (Create, Read, Update, Delete) capabilities for Student and Teacher accounts.
-   **Course Management**: Create new courses, assign course codes, and allocate teachers.
-   **Reports Center**: Generate comprehensive PDF reports for:
    -   Student Attendance (filtered by course/date).
    -   Exam Results.
-   **System Settings**: Configure academic years, semesters, and update admin profile details.

### 👩‍🏫 2. Teacher Portal
Tools to manage daily academic tasks efficiently.
-   **Class Dashboard**: View today's schedule, upcoming classes, and pending tasks (e.g., "Upload Midterm Marks").
-   **Smart Attendance**: A streamlined interface to mark students as Present/Absent for specific dates and sessions.
-   **Attendance History**: Review past attendance records, filter by date/course, and export data to CSV.
-   **Result Management**: Upload marks for exams (Midterm, Final, Quiz) which are instantly visible to students.

### 👨‍🎓 3. Student Portal
A personal dashboard for academic tracking.
-   **Academic Overview**: Real-time view of CGPA, total attendance percentage, and active courses.
-   **My Attendance**: Detailed breakdown of attendance per course, including a log of every session attended/missed.
-   **My Results**: View grades, marks obtained, and status (Pass/Fail) for all assessments.
-   **Notifications**: Real-time alerts for low attendance (<75%), new results published, or upcoming exams.

---

## 📂 File Structure Explained

-   **`index.html`**: The landing page. Contains the Role Selection interface.
-   **`Login/`**: Contains dedicated login pages (`admin-login.html`, etc.) and the shared `login-script.js` which handles authentication logic.
-   **`Admin/`**:
    -   `admin-dashboard.html`: Main admin view.
    -   `admin-users.html`: User management interface.
    -   `admin-reports-script.js`: Logic for generating PDFs.
-   **`Teacher/`**:
    -   `teacher-mark-attendance.html`: The core attendance marking tool.
    -   `teacher-upload-results.html`: Interface for grade entry.
-   **`Student/`**:
    -   `student-dashboard.html`: Student's main view.
    -   `student-results.html`: Results display logic.

---

## �️ How to Run & Test

Since this is a static web application, no server installation (Node.js, Python, PHP) is required.

1.  **Download** the project files.
2.  **Locate** the `index.html` file in the root directory.
3.  **Double-click** `index.html` to open it in your default web browser (Chrome, Edge, Firefox, Safari).
4.  **Select a Role** to log in.

### 🔑 Demo Credentials
Pre-configured accounts for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` |
| **Teacher** | `teacher@school.com` | `teacher123` |
| **Student** | `student@school.com` | `student123` |

---

## 🔮 Future Improvements (Backend Integration)
This frontend is "Backend-Ready". To make it a full-stack application:
1.  **Replace `localStorage`**: The `DataManager` methods (e.g., `getUsers()`, `saveAttendance()`) should be updated to make HTTP requests (`fetch` or `axios`) to a real API.
2.  **Authentication**: Replace the simulated session checks with real JWT (JSON Web Token) validation.
3.  **Database**: Connect the API to a database like MySQL, PostgreSQL, or MongoDB.

---

*Generated for School Management System Project*
