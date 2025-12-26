// ===== REGISTRATION PAGE FUNCTIONALITY =====

function handleRegistration(e) {
    e.preventDefault();

    const mobileNumber = document.getElementById('mobileNumber').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!/^\d{10}$/.test(mobileNumber)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.mobileNumber === mobileNumber);

    if (existingUser) {
        alert('A user with this mobile number already exists. Please login.');
        return;
    }

    // In a real app, you would send this to the server to be stored in the database.
    // Here, we'll store it in localStorage.
    users.push({ mobileNumber, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! Please login to continue.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});
