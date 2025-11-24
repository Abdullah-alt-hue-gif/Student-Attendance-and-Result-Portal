// login-script.js
function goBack() {
    window.location.href = '../index.html';
}

// Form submission handling
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const rememberMe = this.querySelector('input[type="checkbox"]').checked;

            // Basic validation
            if (!email || !password) {
                alert('Please fill in all required fields');
                return;
            }

            // Determine user role from current page
            const currentPage = window.location.pathname;
            let userRole = '';

            if (currentPage.includes('admin-login.html')) {
                userRole = 'admin';
            } else if (currentPage.includes('teacher-login.html')) {
                userRole = 'teacher';
            } else if (currentPage.includes('student-login.html')) {
                userRole = 'student';
            }

            // Simulate login process with role-based redirection
            simulateLogin(email, password, rememberMe, userRole);
        });
    }
});

function simulateLogin(email, password, rememberMe, userRole) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // For demo purposes, always succeed
        console.log(`Login successful for ${userRole}: ${email}`);

        // Store user session data
        if (rememberMe) {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('rememberMe', 'true');
        } else {
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userRole', userRole);
        }

        // Redirect to appropriate dashboard based on role
        redirectToDashboard(userRole);

    }, 1500);
}

function redirectToDashboard(userRole) {
    const dashboardPages = {
        'admin': '../Admin/admin-dashboard.html',
        'teacher': '../Teacher/teacher-dashboard.html',
        'student': '../Student/student-dashboard.html'
    };

    const dashboardPage = dashboardPages[userRole];

    if (dashboardPage) {
        window.location.href = dashboardPage;
    } else {
        console.error('Invalid user role for redirection');
        alert('Error: Unable to determine user role for redirection');
    }
}

// Check if user is already logged in and redirect accordingly
function checkExistingLogin() {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');

    if (userRole && userEmail) {
        // User is already logged in, redirect to dashboard
        redirectToDashboard(userRole);
    }
}

// Auto-redirect if user is already logged in (optional)
// Uncomment the line below if you want automatic redirection
// document.addEventListener('DOMContentLoaded', checkExistingLogin);

// Add input animations
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('userEmail');
    const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';

    if (rememberedEmail && rememberMeChecked) {
        const emailInput = document.querySelector('input[type="email"]');
        const rememberCheckbox = document.querySelector('input[type="checkbox"]');

        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
});

// Logout function (to be used in dashboard pages)
function logout() {
    // Clear all stored data
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');

    // Redirect to role selection page
    window.location.href = 'index.html';
}