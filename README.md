# 🎓 Student Attendance & Result Management System

A comprehensive web-based management system for educational institutions featuring three dedicated portals for Admins, Teachers, and Students. Built with Node.js, Express, SQL Server, and vanilla JavaScript with real-time updates.

![GitHub](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![SQL Server](https://img.shields.io/badge/database-SQL%20Server-red.svg)

## ✨ Features

### 👨‍💼 Admin Portal
- **Dashboard Analytics**: Real-time statistics with interactive charts
  - Total students, teachers, and courses
  - Monthly attendance trends
  - Low attendance alerts
- **User Management**: Create, edit, and manage students and teachers
- **Course Management**: Full CRUD operations for courses with teacher assignments
- **Reports Generation**: Generate PDF reports for attendance and results
- **System Settings**: Configure academic year, semester, and attendance thresholds

### 👨‍🏫 Teacher Portal
- **Mark Attendance**: Bulk attendance marking with session types
- **Attendance History**: View past attendance records with filtering
- **Upload Results**: Batch result upload for assessments (Midterms, Finals, Quizzes)
- **Student Analytics**: Track individual student performance
- **Real-time Notifications**: Instant updates on system events

### 👨‍🎓 Student Portal
- **Personal Dashboard**: Overview of CGPA, attendance, and recent results
- **Attendance Tracking**: Course-wise attendance with visual progress bars
- **Results Viewing**: Access all published results with grade breakdowns
- **Notifications**: Real-time alerts for new attendance and results
- **Profile Management**: Update personal information and preferences

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Font Awesome** - Icons
- **Socket.IO Client** - Real-time updates
- **jsPDF & jsPDF-AutoTable** - PDF generation

### Backend
- **Node.js (v14+)**
- **Express.js** - Web framework
- **Sequelize ORM** - Database management
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **Socket.IO** - WebSocket communication
- **mssql & tedious** - SQL Server connectivity

### Database
- **Microsoft SQL Server** - Primary database

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (2016 or higher)
- [SQL Server Management Studio (SSMS)](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional, for database management)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/student-attendance-result-system.git
cd student-attendance-result-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Database Connection

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_SERVER=localhost
DB_NAME=school_management
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_PORT=1433

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Origin
CORS_ORIGIN=http://127.0.0.1:5500
```

### 4. Set Up SQL Server Database

#### Option A: Using SQL Scripts
1. Open SQL Server Management Studio (SSMS)
2. Connect to your SQL Server instance
3. Create a new database named `school_management`
4. Execute the schema creation scripts from `backend/database/schema.sql`
5. (Optional) Populate with sample data from `backend/database/sample-data.sql`

#### Option B: Using Sequelize Sync
The application will automatically create tables on first run using Sequelize migrations.

```bash
# In the backend directory
npm run dev
```

### 5. Start the Backend Server

```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### 6. Start the Frontend

#### Using Live Server (VS Code Extension)
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click on `index.html` and select "Open with Live Server"
3. The application will open in your browser at `http://127.0.0.1:5500`

#### Using Python HTTP Server
```bash
# In the project root directory
python -m http.server 5500
```

Then navigate to `http://127.0.0.1:5500` in your browser.

## 📊 Database Schema

The database consists of the following core tables:

- **Admins** - Admin user accounts
- **Teachers** - Teacher user accounts
- **Students** - Student user accounts
- **Courses** - Course information
- **Enrollments** - Student-Course relationships
- **Attendance** - Daily attendance records
- **Results** - Student assessment results

## 🔐 Default Login Credentials

### Admin Portal
```
Email: admin@school.test
Password: Admin@123
```

### Teacher Portal
```
Email: teacher1@school.test
Password: Teacher@123
```

### Student Portal
```
Email: student1@school.test
Password: Student@123
```

**⚠️ Important:** Change these default credentials immediately after first login in a production environment!

## 📁 Project Structure

```
├── Admin/                      # Admin portal files
│   ├── admin-dashboard.html
│   ├── admin-dashboard-script.js
│   ├── admin-users.html
│   ├── admin-courses.html
│   ├── admin-reports.html
│   └── admin-styles.css
├── Teacher/                    # Teacher portal files
│   ├── teacher-dashboard.html
│   ├── teacher-mark-attendance.html
│   ├── teacher-attendance-history.html
│   └── teacher-upload-results.html
├── Student/                    # Student portal files
│   ├── student-dashboard.html
│   ├── student-attendance.html
│   ├── student-results.html
│   └── student-notifications.html
├── Login/                      # Authentication pages
│   ├── admin-login.html
│   ├── teacher-login.html
│   └── student-login.html
├── backend/                    # Node.js backend
│   ├── config/                 # Database & server config
│   ├── controllers/            # Route controllers
│   ├── models/                 # Sequelize models
│   ├── routes/                 # API routes
│   ├── middleware/             # Authentication & validation
│   └── server.js               # Entry point
├── api-service.js              # Frontend API client
├── index.html                  # Landing page
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Attendance
- `POST /api/attendance` - Mark attendance (bulk)
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/report/:student_id` - Get student attendance report
- `GET /api/attendance/monthly-stats` - Get monthly statistics

### Results
- `POST /api/results/assessments` - Upload assessment results
- `GET /api/results/student/:student_id` - Get student results
- `GET /api/results/course/:course_id` - Get course results

### Enrollments
- `GET /api/enrollments/student/:student_id` - Get student enrollments
- `POST /api/enrollments` - Create enrollment
- `DELETE /api/enrollments/:id` - Remove enrollment

For complete API documentation, see [backend/README.md](backend/README.md)

## 🎨 Features Walkthrough

### Real-time Updates
The system uses Socket.IO for instant notifications:
- New user registrations
- Attendance markings
- Result publications
- Course updates

### Dynamic Charts & Graphs
- Donut charts for attendance visualization
- Bar charts for monthly trends
- Progress bars for course-wise statistics
- Interactive data tables with sorting and filtering

### PDF Report Generation
- Attendance reports with date ranges
- Results analysis with charts
- Custom report templates
- Automated formatting

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for all screen sizes
- Touch-optimized controls
- Consistent user experience across devices

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Manual Testing
1. Register test users in each portal
2. Log in with different user roles
3. Create courses and enroll students
4. Mark attendance for various dates
5. Upload results and verify calculations
6. Test real-time notifications
7. Generate and download reports

## 🐛 Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check database credentials in `.env`
- Ensure SQL Server allows TCP/IP connections
- Confirm firewall allows port 1433

### Frontend Not Loading
- Check if backend server is running
- Verify CORS origin in `.env` matches your frontend URL
- Clear browser cache
- Check browser console for errors

### Real-time Updates Not Working
- Ensure Socket.IO is properly initialized
- Check WebSocket connections in Network tab
- Verify firewall allows WebSocket connections

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **M.Abdullah and Junaid Haider** -

## 🙏 Acknowledgments

- Font Awesome for icons
- jsPDF for PDF generation
- Socket.IO for real-time functionality
- The open-source community

## 📧 Contact

For questions or support, please contact:
<<<<<<< HEAD
- Email: your.email@example.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/student-attendance-result-system/issues)
=======
- Email: ryomansukuna@gmail.com
>>>>>>> 52e0762c5c836f074db4c0741053d7aa529413ef

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**
