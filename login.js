// ===== LOGIN PAGE FUNCTIONALITY =====

function handleLogin(e) {
    e.preventDefault();

    const mobileNumber = document.getElementById('mobileNumber').value;
    const password = document.getElementById('password').value;

    if (!/^\d{10}$/.test(mobileNumber)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }

    if (!password) {
        alert('Please enter your password.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.mobileNumber === mobileNumber && u.password === password);

    if (user) {
        // In a real app, you would get a session token from the server.
        // Here, we'll simulate a login session.
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('Login successful! Redirecting to the home page.');
        
        // Redirect to the page the user was trying to access, or home page
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    } else {
        alert('Invalid mobile number or password. Please try again or register.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
