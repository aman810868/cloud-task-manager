// Task Manager Application
let tasks = [];

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('cloudTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
        updateStats();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('cloudTasks', JSON.stringify(tasks));
}

// Add new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
    updateStats();
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// Render tasks to the DOM
function renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started! 🚀</div>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↩️ Undo' : '✓ Done'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </li>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

// Set deployment date
function setDeploymentDate() {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('deployDate').textContent = date;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setDeploymentDate();

    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

// Add some demo tasks on first load
if (!localStorage.getItem('cloudTasks')) {
    tasks = [
        { id: 1, text: 'Welcome to your cloud-deployed app! 🎉', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'This app is running on Vercel servers', completed: false, createdAt: new Date().toISOString() },
        { id: 3, text: 'Try adding your own tasks!', completed: false, createdAt: new Date().toISOString() }
    ];
    saveTasks();
    renderTasks();
    updateStats();
}
