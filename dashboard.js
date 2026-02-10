renderNavbar('dashboard');

const user = getCurrentUser();
const today = new Date().toISOString().split('T')[0];

//welcome msg
const welcomeEl = document.getElementById('welcome-msg');
if (welcomeEl && user) {
    welcomeEl.textContent = `Welcome, ${user.name}!`; 
}

//Deadline 
document.getElementById('p-deadline').setAttribute('min', today);

const allProjects = getDB('projects');
const allMembers = getDB('members');
const allUsers = getDB('users');

// project for current user
const myProjectIds = allMembers.filter(m => m.userId === user.id).map(m => m.projectId);
const myProjects = allProjects.filter(p => myProjectIds.includes(p.id));

const container = document.getElementById('project-list');

if (myProjects.length === 0) {
    container.innerHTML = `<p class="text-muted">You have no projects yet. Click 'Create New Project' to start.</p>`;
} else {
    container.innerHTML = myProjects.map(p => {
    const count = allMembers.filter(m => m.projectId === p.id).length;
    const projectTasks = getDB('tasks').filter(t => t.projectId === p.id);
    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter(t => t.status === 'Completed').length;

    const deadline = new Date(p.deadline);
    const now = new Date();
    now.setHours(0,0,0,0);

    let status = p.status || "Pending";
    let statusClass = "bg-pending";

    if (status === "Completed") {
        statusClass = "bg-completed";
    } else if (deadline < now) {
        status = "Overdue";
        statusClass = "bg-overdue";
    }

    //project done
    const canComplete = totalTasks > 0 && totalTasks === doneTasks;
    const isLeader = p.createdBy === user.id;

    return `
    <div class="card project-card">
        <div onclick="enterProject('${p.id}')" style="cursor:pointer">
            <div class="flex-between">
                <h3>${p.title}</h3>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            <p class="text-muted">${p.description}</p>
            <div class="project-meta">
                <span>📅 Due: ${p.deadline}</span>
                <span>👥 ${count} Members</span>
                <span>📊 Tasks: ${doneTasks}/${totalTasks}</span>
            </div>
        </div>

        ${isLeader ? `
            <div class="admin-actions">
                ${status !== 'Completed' ? `
                    <button onclick="completeProject('${p.id}')" 
                            class="btn-sm btn-success" 
                            style="opacity: ${canComplete ? '1' : '0.4'}; cursor: ${canComplete ? 'pointer' : 'not-allowed'}"
                            title="${canComplete ? 'Mark project as finished' : 'Finish all tasks first'}">
                        Mark Done
                    </button>
                ` : ''}
                <button onclick="deleteProject('${p.id}')" class="btn-sm btn-danger">Delete</button>
            </div>
        ` : ''}
    </div>
    `;
}).join('');
}

function enterProject(pid) {
    localStorage.setItem('gpt_currentProjectId', pid);
    window.location.href = 'tasks.html';
}


document.getElementById('create-project-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('p-title').value;
    const desc = document.getElementById('p-desc').value;
    const deadline = document.getElementById('p-deadline').value;
    const memberInput = document.getElementById('p-members').value;

    // member verification
    const memberUsernames = memberInput.split(',').map(s => s.trim()).filter(s => s !== "");
    const validMemberIds = [user.id]; 

    for (const username of memberUsernames) {
        const foundUser = allUsers.find(u => u.username === username);
        if (!foundUser) {
            alert(`User "${username}" not found. Please check the spelling.`);
            return; 
        }
        if (foundUser.id !== user.id) {
            validMemberIds.push(foundUser.id);
        }
    }

    const newId = 'p' + Date.now();
    
    const newProject = { 
        id: newId, 
        title, 
        description: desc, 
        deadline: deadline,
        createdBy: user.id 
    };
    const projects = getDB('projects');
    projects.push(newProject);
    setDB('projects', projects);

    const members = getDB('members');
    validMemberIds.forEach(mId => {
        members.push({ projectId: newId, userId: mId, role: mId === user.id ? 'Leader' : 'Member' });
    });
    setDB('members', members);

    alert(`Project Created with ${validMemberIds.length} members!`);
    location.reload();
});

// project mark done
function completeProject(pid) {

    const allTasks = getDB('tasks').filter(t => t.projectId === pid);

    if (allTasks.length === 0) {
        alert("Cannot Complete Project: You must have at least one task assigned before finishing a project.");
        return;
    }

    // tasks marksed completed
    const pendingTasks = allTasks.filter(t => t.status !== 'Completed');
    
    if (pendingTasks.length > 0) {
        alert(`Cannot Complete Project: There are still ${pendingTasks.length} pending tasks. All tasks must be marked as 'Done' first.`);
        return;
    }

    if (!confirm("All tasks are finished! Are you sure you want to mark this project as Completed?")) return;

    const projects = getDB('projects');
    const index = projects.findIndex(p => p.id === pid);
    
    if (index > -1) {
        projects[index].status = "Completed";
        setDB('projects', projects);
        location.reload();
    }
}

// delete project
function deleteProject(pid) {
    if (!confirm("This will permanently delete the project and all associated data. Continue?")) return;

    const projects = getDB('projects').filter(p => p.id !== pid);
    setDB('projects', projects);

    const members = getDB('members').filter(m => m.projectId !== pid);
    setDB('members', members);

    const tasks = getDB('tasks').filter(t => t.projectId !== pid);
    setDB('tasks', tasks);

    const contributions = getDB('contributions').filter(c => c.projectId !== pid);
    setDB('contributions', contributions);

    location.reload();
}