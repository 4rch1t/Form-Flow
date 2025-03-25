// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// Event Listeners
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
signupPassword.addEventListener('input', checkPasswordStrength);
signupConfirm.addEventListener('input', checkPasswordMatch);

// Functions
function switchTab(tabName) {
    // Update active tab button
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show active form
    authForms.forEach(form => {
        if (form.id === `${tabName}-form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validate inputs
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Prepare login data
    const loginData = {
        email,
        password,
        rememberMe
    };
    
    // Send login request to server
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    });
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Prepare signup data
    const signupData = {
        name,
        email,
        password
    };
    
    // Send signup request to server
    fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Signup failed');
        }
        return response.json();
    })
    .then(data => {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    });
}

function checkPasswordStrength() {
    const password = signupPassword.value;
    let strength = 0;
    let tips = [];
    
    // Check password length
    if (password.length < 8) {
        tips.push('at least 8 characters');
    } else {
        strength += 25;
    }
    
    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        tips.push('lowercase letters');
    } else {
        strength += 25;
    }
    
    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        tips.push('uppercase letters');
    } else {
        strength += 25;
    }
    
    // Check for numbers or special characters
    if (!/[0-9!@#$%^&*]/.test(password)) {
        tips.push('numbers or special characters');
    } else {
        strength += 25;
    }
    
    // Update strength bar
    strengthBar.style.width = `${strength}%`;
    
    // Update strength text and color
    if (strength < 50) {
        strengthBar.style.backgroundColor = '#ff7675';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#ff7675';
    } else if (strength < 100) {
        strengthBar.style.backgroundColor = '#fdcb6e';
        strengthText.textContent = 'Medium password';
        strengthText.style.color = '#fdcb6e';
    } else {
        strengthBar.style.backgroundColor = '#00b894';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#00b894';
    }
    
    // Add tips if needed
    if (tips.length > 0) {
        strengthText.textContent += ` (add ${tips.join(', ')})`;
    }
}

function checkPasswordMatch() {
    const password = signupPassword.value;
    const confirmPassword = signupConfirm.value;
    
    if (confirmPassword && password !== confirmPassword) {
        signupConfirm.style.borderColor = '#ff7675';
        signupConfirm.style.boxShadow = '0 0 0 3px rgba(255, 118, 117, 0.2)';
    } else if (confirmPassword) {
        signupConfirm.style.borderColor = '#00b894';
        signupConfirm.style.boxShadow = '0 0 0 3px rgba(0, 184, 148, 0.2)';
    } else {
        signupConfirm.style.borderColor = '#dfe6e9';
        signupConfirm.style.boxShadow = 'none';
    }
}