renderNavbar('analytics');
const pid = getCurrentProject();

// Get data and filter out deleted items
const members = getDB('members').filter(m => m.projectId === pid);
const tasks = getDB('tasks').filter(t => t.projectId === pid);
const contributions = getDB('contributions').filter(c => c.projectId === pid && !c.isDeleted);
const users = getDB('users');

const grid = document.getElementById('analytics-grid');

// Global Totals for proportions
const totalTasksInProject = tasks.length;
const totalHoursInProject = contributions.reduce((acc, cur) => acc + cur.hours, 0);

grid.innerHTML = members.map(m => {
    const u = users.find(x => x.id === m.userId);
    
    // Individual Data
    const myTasks = tasks.filter(t => t.assignedTo === u.id);
    const completedTasks = myTasks.filter(t => t.status === 'Completed');
    const myHours = contributions.filter(c => c.userId === u.id).reduce((acc, cur) => acc + cur.hours, 0);

    // 1. Tasks Completed (40%)
    const taskScoreRaw = totalTasksInProject > 0 ? (completedTasks.length / totalTasksInProject) * 100 : 0;
    const taskWeight = taskScoreRaw * 0.40;

    // 2. Hours Logged (40%)
    const hoursScoreRaw = totalHoursInProject > 0 ? (myHours / totalHoursInProject) * 100 : 0;
    const hoursWeight = hoursScoreRaw * 0.40;

    // 3. Deadline Compliance (20%)
    // Check how many completed tasks were finished on or before the deadline
    const onTimeTasks = completedTasks.filter(t => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt) <= new Date(t.deadline);
    });
    const complianceScoreRaw = myTasks.length > 0 ? (onTimeTasks.length / myTasks.length) * 100 : 0;
    const complianceWeight = complianceScoreRaw * 0.20;

    // Final Calculation
    const totalScore = Math.round(taskWeight + hoursWeight + complianceWeight);

    // Interpretation Logic
    let interpretation = { text: "No work done", color: "#6c757d" };
    if (totalScore >= 80) interpretation = { text: "Excellent Contributor", color: "#28a745" };
    else if (totalScore >= 60) interpretation = { text: "Good Contributor", color: "#17a2b8" };
    else if (totalScore >= 40) interpretation = { text: "Average Contributor", color: "#ffc107" };
    else if (totalScore > 0) interpretation = { text: "Underperformer", color: "#dc3545" };

    return `
    <div class="card">
        <div class="flex-between" style="border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
            <h3>${u.name}</h3>
            <span class="badge" style="background:#eee; padding:5px 10px; border-radius:15px;">${m.role}</span>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div class="stat-card">
                <div class="stat-val">${completedTasks.length}/${myTasks.length}</div>
                <div class="stat-label">Tasks Done</div>
            </div>
            <div class="stat-card">
                <div class="stat-val">${myHours.toFixed(1)}h</div>
                <div class="stat-label">Effort Spent</div>
            </div>
        </div>

        <div style="margin-top:15px;">
            <div class="flex-between">
                <span class="text-muted" style="font-size:0.8rem">Deadline Compliance</span>
                <span style="font-weight:bold; font-size:0.8rem">${Math.round(complianceScoreRaw)}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar bar-green" style="width: ${complianceScoreRaw}%"></div>
            </div>
        </div>

        <div style="margin-top:25px; text-align:center;">
             <div class="score-circle">
                <span style="font-size:0.6rem; color:#666; text-transform:uppercase">Score</span>
                ${totalScore}
             </div>
             <div class="interpretation-badge" style="background: ${interpretation.color}; color: white;">
                ${interpretation.text}
             </div>
        </div>
    </div>
    `;
}).join('');