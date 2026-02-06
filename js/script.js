let tasks = [];
let currentFilter = 'all';
let currentCategory = 'all';

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function createTask(title, description, category, priority, isUrgent) {
    const task = {
        id: generateId(),
        title: title,
        description: description,
        category: category,
        priority: priority,
        isUrgent: isUrgent,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    return task;
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
    }
}

function filterTasks(filterType, categoryType) {
    let filteredTasks = tasks;
    
    if (filterType === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filterType === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    if (categoryType !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === categoryType);
    }
    
    return filteredTasks;
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasksList) return;
    
    const filteredTasks = filterTasks(currentFilter, currentCategory);
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    tasksList.innerHTML = '';
    
    for (let i = 0; i < filteredTasks.length; i++) {
        const task = filteredTasks[i];
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    }
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.classList.add(`priority-${task.priority}`);
    
    if (task.completed) {
        taskDiv.classList.add('completed');
    }
    
    const categoryNames = {
        work: 'Работа',
        personal: 'Личное',
        shopping: 'Покупки',
        health: 'Здоровье'
    };
    
    let badges = `<span class="task-badge category-${task.category}">${categoryNames[task.category]}</span>`;
    
    if (task.isUrgent) {
        badges += '<span class="task-badge urgent">Срочно</span>';
    }
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-title-wrapper">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-meta">${badges}</div>
            </div>
        </div>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
        <div class="task-actions">
            <button class="btn btn-success" onclick="toggleTask('${task.id}')">
                ${task.completed ? 'Вернуть' : 'Выполнено'}
            </button>
            <button class="btn btn-danger" onclick="removeTask('${task.id}')">Удалить</button>
        </div>
    `;
    
    return taskDiv;
}

function toggleTask(taskId) {
    toggleTaskComplete(taskId);
    renderTasks();
    updateStats();
}

function removeTask(taskId) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        deleteTask(taskId);
        renderTasks();
        updateStats();
    }
}

function updateStats() {
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const activeTasksEl = document.getElementById('activeTasks');
    
    if (totalTasksEl) {
        const totalTasks = tasks.length;
        let completedCount = 0;
        
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].completed) {
                completedCount++;
            }
        }
        
        const activeTasks = totalTasks - completedCount;
        
        totalTasksEl.textContent = totalTasks;
        completedTasksEl.textContent = completedCount;
        activeTasksEl.textContent = activeTasks;
    }
}

function validateEmail(email) {
    const atIndex = email.indexOf('@');
    return atIndex > 0 && atIndex < email.length - 1;
}

function handleTaskFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const isUrgent = document.getElementById('taskUrgent').checked;
    
    if (title === '') {
        alert('Пожалуйста, введите название задачи');
        return;
    }
    
    if (category === '') {
        alert('Пожалуйста, выберите категорию');
        return;
    }
    
    createTask(title, description, category, priority, isUrgent);
    
    document.getElementById('taskForm').reset();
    
    renderTasks();
    updateStats();
    
    alert('Задача успешно добавлена!');
}

function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const subject = document.getElementById('messageSubject').value;
    const message = document.getElementById('userMessage').value.trim();
    const agreed = document.getElementById('agreeTerms').checked;
    
    const contactMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    if (name === '' || email === '' || phone === '' || message === '') {
        showFormResult('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showFormResult('Пожалуйста, введите корректный email адрес', 'error');
        return;
    }
    
    if (subject === '') {
        showFormResult('Пожалуйста, выберите тему сообщения', 'error');
        return;
    }
    
    if (!agreed) {
        showFormResult('Необходимо согласие с политикой конфиденциальности', 'error');
        return;
    }
    
    const formData = {
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message,
        contactMethod: contactMethod,
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    console.log('Данные формы:', formData);
    
    showFormResult(`Спасибо, ${name}! Ваше сообщение отправлено. Мы свяжемся с вами через ${contactMethod === 'email' ? 'email' : contactMethod === 'phone' ? 'телефон' : 'удобный способ'}.`, 'success');
    
    document.getElementById('contactForm').reset();
}

function showFormResult(message, type) {
    const resultDiv = document.getElementById('formResult');
    if (resultDiv) {
        resultDiv.textContent = message;
        resultDiv.className = `form-result ${type}`;
        
        setTimeout(() => {
            resultDiv.className = 'form-result';
        }, 5000);
    }
}

function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    for (let i = 0; i < filterButtons.length; i++) {
        filterButtons[i].addEventListener('click', function() {
            for (let j = 0; j < filterButtons.length; j++) {
                filterButtons[j].classList.remove('active');
            }
            
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    }
}

function initCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            renderTasks();
        });
    }
}

function initTaskForm() {
    const taskForm = document.getElementById('taskForm');
    
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

function init() {
    loadTasks();
    updateStats();
    renderTasks();
    initFilterButtons();
    initCategoryFilter();
    initTaskForm();
    initContactForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}