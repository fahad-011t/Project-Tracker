renderNavbar('tasks');

const pid = getCurrentProject();
const user = getCurrentUser();
const today = new Date().toISOString().split('T')[0];

// check for leader
const currentProject = getDB('projects').find(p => p.id === pid);
const isLeader = currentProject && currentProject.createdBy === user.id;

// min date set
const dateInput = document.getElementById('t-deadline');
if (dateInput) dateInput.setAttribute('min', today);

document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedDate = document.getElementById('t-deadline').value;
    
    if (selectedDate < today) {
        alert("Error: Deadline cannot be in the past.");
        return;
    }

    const newTask = {
        id: 't' + Date.now(),
        projectId: pid,
        title: document.getElementById('t-title').value,
        type: document.getElementById('t-type').value,
        assignedTo: document.getElementById('assignedTo').value,
        priority: document.getElementById('t-priority').value,
        deadline: selectedDate,
        minHours: parseFloat(document.getElementById('t-min-hours').value) || 0, // NEW
        status: 'Pending'
    };

    const all = getDB('tasks');
    all.push(newTask);
    setDB('tasks', all);
    
    alert("Task assigned successfully!");
    location.reload(); 
});

function renderTasks() {
    const tasks = getDB('tasks').filter(t => t.projectId === pid);
    const users = getDB('users');
    const list = document.getElementById('task-list');

    if (tasks.length === 0) {
        list.innerHTML = "<p class='text-muted'>No tasks found.</p>";
        return;
    }

    list.innerHTML = tasks.map(t => {
        const assigneeUser = users.find(u => u.id === t.assignedTo);
        const assigneeName = assigneeUser?.name || 'Unknown';
        
        const now = new Date();
        const deadline = new Date(t.deadline);
        const isCompleted = t.status === 'Completed';
        
        let statusClass = 'bg-pending';
        let statusText = t.status;
        let timingHTML = '';

        if (isCompleted) {
            statusClass = 'bg-completed';
            
            // date for submission
            const completionDate = t.completedAt ? new Date(t.completedAt) : new Date();
            const diffInMs = deadline - completionDate;
            
            const diffInDays = Math.abs(Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
            const diffInHours = Math.abs(Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

            if (diffInMs >= 0) {
                timingHTML = `<span class="text-success" style="font-weight:bold;">✅ Submitted ${diffInDays}d ${diffInHours}h Early</span>`;
            } else {
                timingHTML = `<span class="text-danger" style="font-weight:bold;">⏰ Submitted ${diffInDays}d ${diffInHours}h Late</span>`;
            }
        } else {
            const diff = deadline - now;
            if (diff < 0) {
                statusClass = 'bg-overdue';
                statusText = 'Overdue';
                timingHTML = `<span class="timer-text text-danger">⚠️ Past Due</span>`;
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                timingHTML = `<span class="timer-text">⏳ ${days}d ${hours}h left</span>`;
            }
        }

        const allLogs = getDB('contributions');
        const taskHours = allLogs
            .filter(c => c.taskId === t.id && !c.isDeleted)
            .reduce((sum, c) => sum + parseFloat(c.hours), 0);
            
        const isAssignee = t.assignedTo === user.id;

        return `
        <div class="card task-card priority-${t.priority}">
            <div class="flex-between">
                <h4>${t.title}</h4>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <p class="text-muted">${t.type}</p>
            <p>👤 Assignee: <strong>${assigneeName}</strong></p>
            
            <p style="font-size:0.8rem; color:${taskHours >= t.minHours ? '#1cc88a' : '#e74a3b'};">
                ⏱ Logged: ${taskHours}h / Required: ${t.minHours}h
            </p>

            <div style="margin: 10px 0; border-top: 1px solid #eee; padding-top: 10px;">
                ${isCompleted ? '' : `<small style="display:block;">Due: ${t.deadline}</small>`}
                <div style="margin-top:5px;">${timingHTML}</div>
            </div>

            <div class="admin-actions">
                <div style="flex-grow: 1;"></div> 
                ${!isCompleted && isAssignee ? `
                    <button onclick="markDone('${t.id}')" class="btn btn-success task-btn">✔ Done</button>
                ` : ''}
                
                ${isLeader && !isCompleted ? `
                    <button onclick="deleteTask('${t.id}')" class="btn btn-danger task-btn">🗑 Delete</button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}


function markDone(tid) {
    const allTasks = getDB('tasks');
    const task = allTasks.find(t => t.id === tid);
    
    // siltering deleted contributions
    const allLogs = getDB('contributions');
    const taskHours = allLogs
        .filter(c => c.taskId === tid && !c.isDeleted) 
        .reduce((sum, c) => sum + parseFloat(c.hours), 0);
    
    if (taskHours < task.minHours) {
        alert(`Cannot complete: You have logged ${taskHours}h, but this task requires at least ${task.minHours}h.`);
        return;
    }

    if (task) {
        task.status = 'Completed';
        // locking date of submission
        task.completedAt = new Date().toISOString(); 
        setDB('tasks', allTasks);
        renderTasks(); 
    }
}

// Deleting task only for leader
function deleteTask(tid) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    let allTasks = getDB('tasks');
    allTasks = allTasks.filter(t => t.id !== tid);
    setDB('tasks', allTasks);

    // removing contribution
    let allLogs = getDB('contributions');
    allLogs = allLogs.filter(l => l.taskId !== tid);
    setDB('contributions', allLogs);

    renderTasks();
}

const projectMembers = getDB('members').filter(m => m.projectId === pid);
const usersList = getDB('users');
document.getElementById('assignedTo').innerHTML = projectMembers.map(m => {
    const u = usersList.find(x => x.id === m.userId);
    return `<option value="${u.id}">${u.name}</option>`;
}).join('');

renderTasks();

function closeAndClearTaskModal() {
    const form = document.getElementById('add-task-form');
    if (form) {
        form.reset();
    }
    toggleModal('taskModal');
}