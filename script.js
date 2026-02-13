// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const completedCount = document.getElementById('completed-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');
const filterButtons = document.querySelectorAll('.filter-btn');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    loadTasks();
    renderTasks();
    updateStats();
    setupEventListeners();
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

// Render tasks based on current filter
function renderTasks() {
    // Clear the task list
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = [];
    
    switch(currentFilter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        default:
            filteredTasks = [...tasks];
    }
    
    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-tasks"></i>
            <p>No tasks found. Add one above!</p>
        `;
        taskList.appendChild(emptyState);
        return;
    }
    
    // Render each task
    filteredTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" aria-label="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    // Add event listeners to the new elements
    addTaskEventListeners();
}

// Update task and completed counts
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
    completedCount.textContent = `${completedTasks} completed`;
    
    // Toggle clear buttons based on tasks
    clearCompletedBtn.style.display = completedTasks > 0 ? 'flex' : 'none';
    clearAllBtn.style.display = totalTasks > 0 ? 'flex' : 'none';
}

// Add a new task
function addTask(text) {
    if (!text.trim()) return;
    
    const newTask = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    
    // Clear input and focus
    taskInput.value = '';
    taskInput.focus();
}

// Toggle task completion
function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].completedAt = tasks[taskIndex].completed ? new Date().toISOString() : null;
        saveTasks();
        renderTasks();
    }
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Clear all tasks
function clearAll() {
    if (confirm('Are you sure you want to delete all tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Add task on button click
    addBtn.addEventListener('click', () => addTask(taskInput.value));
    
    // Add task on Enter key
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });
    
    // Filter tasks
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Clear all tasks
    clearAllBtn.addEventListener('click', clearAll);
}

// Add event listeners to task items (checkboxes and delete buttons)
function addTaskEventListeners() {
    // Checkbox change event
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.id;
            toggleTask(taskId);
        });
    });
    
    // Delete button click event
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.id;
            deleteTask(taskId);
        });
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Add animation for task items
function animateTaskItem(element) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'slideIn 0.3s ease';
}

// Add animation when tasks are rendered
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    animateTaskItem(node);
                }
            });
        }
    });
});

// Start observing the task list for changes
observer.observe(taskList, { childList: true });