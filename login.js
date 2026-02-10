function switchView(view) {
    const loginCard = document.getElementById('login-card');
    const signupCard = document.getElementById('signup-card');
    
    // Image
    const loginImg = document.getElementById('img-login');
    const signupImg = document.getElementById('img-signup');
    
    // Text
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');
    
    if (view === 'signup') {
        //show signup form
        loginCard.classList.add('hidden');
        signupCard.classList.remove('hidden');
        
        // change signup phtot
        loginImg.classList.add('hidden');
        signupImg.classList.remove('hidden');
        
        // change text for signup
        overlayTitle.innerText = "Start Your Journey!";
        overlayText.innerText = "Create an account to organize projects and boost your team's productivity.";
    } else {
        // show login photo
        signupCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
        
        // change login phtot
        signupImg.classList.add('hidden');
        loginImg.classList.remove('hidden');
        
        // change text for login
        overlayTitle.innerText = "Welcome!";
        overlayText.innerText = "Log in to monitor your deadlines and manage your contributions.";
    }
}
// Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('l-input').value.trim();
    const pass = document.getElementById('l-pass').value;
    const users = getDB('users');

    // check email or username
    const user = users.find(u => (u.email === input || u.username === input) && u.password === pass);

    if (user) {
        localStorage.setItem('gpt_currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials!');
    }
});

// Signup
document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('s-name').value;
    const username = document.getElementById('s-username').value;
    const email = document.getElementById('s-email').value;
    const pass = document.getElementById('s-pass').value;

    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    
    if (!strongRegex.test(pass)) {
        alert("Password must contain at least 8 characters, one upper, one lower, one number and one symbol.");
        return;
    }

    const users = getDB('users');
    if (users.find(u => u.email === email || u.username === username)) {
        alert('Email or Username already exists.');
        return;
    }

    const newUser = { id: 'u' + Date.now(), name, username, email, password: pass, role: 'User' };
    users.push(newUser);
    setDB('users', users);
    
    alert('Account created! Please login.');
    switchView('login');
});
