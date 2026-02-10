const INITIAL_DATA = {
    users: [
        { id: 'u1', name: 'Admin', username: 'admin', email: 'admin@test.com', password: 'Password1!', role: 'Admin' }
    ],
    projects: [],
    projectMembers: [],
    tasks: [],
    contributions: []
};

function initDB() {
    if (!localStorage.getItem('gpt_users')) {
        localStorage.setItem('gpt_users', JSON.stringify(INITIAL_DATA.users));
        localStorage.setItem('gpt_projects', JSON.stringify([]));
        localStorage.setItem('gpt_members', JSON.stringify([]));
        localStorage.setItem('gpt_tasks', JSON.stringify([]));
        localStorage.setItem('gpt_contributions', JSON.stringify([]));
    }
}
initDB();

// db access
const getDB = (key) => JSON.parse(localStorage.getItem(`gpt_${key}`)) || [];
const setDB = (key, data) => localStorage.setItem(`gpt_${key}`, JSON.stringify(data));
const getCurrentUser = () => JSON.parse(localStorage.getItem('gpt_currentUser'));
const getCurrentProject = () => localStorage.getItem('gpt_currentProjectId');

function renderNavbar(activePage) {
    const nav = document.getElementById('navbar');
    const projectId = getCurrentProject();
    
    // top navbar
    let links = `<a href="dashboard.html" class="nav-btn ${activePage === 'dashboard' ? 'active' : ''}">Projects</a>`;
    if (projectId) {
        links += `
            <a href="tasks.html" class="nav-btn ${activePage === 'tasks' ? 'active' : ''}">Tasks</a>
            <a href="contributions.html" class="nav-btn ${activePage === 'contributions' ? 'active' : ''}">Contributions</a>
            <a href="analytics.html" class="nav-btn ${activePage === 'analytics' ? 'active' : ''}">Analytics</a>
        `;
    }

    nav.innerHTML = `
        <a href="dashboard.html" class="brand">🚀 Tracker</a>
        <div class="nav-links">${links}</div>
    `;

    // bottom navbar
    if (!document.getElementById('bottom-logout-nav')) {
        const bottomNav = document.createElement('footer');
        bottomNav.id = 'bottom-logout-nav';
        bottomNav.className = 'bottom-navbar';
        bottomNav.innerHTML = `
            <div class="bottom-nav-content">
                <span class="footer-text">Project Management System</span>
                <button onclick="logout()" class="btn-logout-nav">Logout</button>
            </div>
        `;
        document.body.appendChild(bottomNav);
    }
}

function logout() {
    localStorage.removeItem('gpt_currentUser');
    localStorage.removeItem('gpt_currentProjectId');
    window.location.href = 'index.html';
}

function toggleModal(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}
