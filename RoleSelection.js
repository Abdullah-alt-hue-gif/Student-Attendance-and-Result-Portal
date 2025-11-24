function redirectToLogin(role) {
    // Store the selected role in sessionStorage
    sessionStorage.setItem('selectedRole', role);

    // Redirect to the appropriate login page
    switch (role) {
        case 'admin':
            window.location.href = 'login/admin-login.html';
            break;
        case 'teacher':
            window.location.href = 'login/teacher-login.html';
            break;
        case 'student':
            window.location.href = 'login/student-login.html';
            break;
        default:
            console.error('Invalid role selected');
    }
}

// Add animation effects
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.role-card');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});