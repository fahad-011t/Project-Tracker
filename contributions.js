renderNavbar('contributions');
const pid = getCurrentProject();
const user = getCurrentUser();
const allTasks = getDB('tasks');

// dropdown not including completed tasks
const select = document.getElementById('c-task');
const myActiveTasks = allTasks.filter(t => 
    t.projectId === pid && 
    t.assignedTo === user.id && 
    t.status !== 'Completed' 
);

if (myActiveTasks.length === 0) {
    select.innerHTML = '<option value="" disabled selected>No active tasks assigned to you</option>';
} else {
    select.innerHTML = myActiveTasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
}

// submission
document.getElementById('contribution-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (myActiveTasks.length === 0) return alert("You have no active tasks to log work for.");

    const newLog = {
        id: 'c' + Date.now(),
        projectId: pid,
        taskId: document.getElementById('c-task').value,
        userId: user.id,
        hours: parseFloat(document.getElementById('c-hours').value),
        description: document.getElementById('c-desc').value,
        date: new Date().toISOString().split('T')[0],
        isDeleted: false
    };

    const logs = getDB('contributions');
    logs.unshift(newLog); 
    setDB('contributions', logs);
    location.reload();
});

const rawLogs = getDB('contributions').filter(l => l.projectId === pid && !l.isDeleted);
const projectLogs = rawLogs.filter(log => {
    return allTasks.some(task => task.id === log.taskId);
});
const users = getDB('users');
const logList = document.getElementById('log-list');

if (projectLogs.length === 0) {
    logList.innerHTML = '<p class="text-muted">No activity logged yet.</p>';
} else {
    logList.innerHTML = projectLogs.map(l => {
        const u = users.find(x => x.id === l.userId);
        const t = allTasks.find(x => x.id === l.taskId);
        return `
        <div class="log-item">
            <div class="log-date">${l.date}</div>
            <div class="log-content">
                <h4>${u ? u.name : 'Unknown User'} <span class="hours-badge">${l.hours} hrs</span></h4>
                <p><strong>Task:</strong> ${t.title}</p>
                <p><em>"${l.description}"</em></p>
            </div>
        </div>`;
    }).join('');
}