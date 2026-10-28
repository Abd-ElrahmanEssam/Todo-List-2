// 1. استدعاء عناصر الـ DOM من صفحة HTML
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const tasksCount = document.getElementById('tasks-count');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const dateDisplay = document.getElementById('date-display');

// عرض تاريخ اليوم بالعربي في الهيدر
const today = new Date();
dateDisplay.textContent = today.toLocaleDateString('ar-EG', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// 2. تحميل المهام المحفوظة من LocalStorage أو إنشاء مصفوفة فارغة
let tasks = JSON.parse(localStorage.getItem('my_tasks')) || [];
let currentFilter = 'all';

// 3. دالة حفظ المهام في المتصفح
function saveTasks() {
  localStorage.setItem('my_tasks', JSON.stringify(tasks));
}

// 4. دالة رسم وعرض المهام داخل الصفحة (DOM Manipulation)
function renderTasks() {
  // تفريغ القائمة قبل إعادة الرسم
  todoList.innerHTML = '';

  // فلترة المهام حسب التبويب المختار
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // إظهار أو إخفاء رسالة القائمة الفارغة
  if (filteredTasks.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
  }

  // إنشاء عناصر HTML لكل مهمة
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-left" onclick="toggleTask(${task.id})">
        <div class="custom-checkbox">✓</div>
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})" title="حذف المهمة">✕</button>
    `;

    todoList.appendChild(li);
  });

  // تحديث عداد المهام غير المكتملة
  const pendingCount = tasks.filter(t => !t.completed).length;
  tasksCount.textContent = pendingCount;
}

// 5. إضافة مهمة جديدة عند إرسال الفورم
todoForm.addEventListener('submit', function (e) {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const text = todoInput.value.trim();
  if (text === '') return;

  const newTask = {
    id: Date.now(), // رقم مميز لكل مهمة
    text: text,
    completed: false
  };

  tasks.unshift(newTask); // إضافة المهمة في أول القائمة
  saveTasks();
  renderTasks();

  todoInput.value = ''; // تفريغ حقل الكتابة
  todoInput.focus();
});

// 6. تبديل حالة المهمة (مكتملة / غير مكتملة)
window.toggleTask = function (id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
};

// 7. حذف مهمة واحدة
window.deleteTask = function (id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
};

// 8. مسح كل المهام المكتملة
clearCompletedBtn.addEventListener('click', function () {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// 9. تشغيل أزرار الفلترة
filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // إزالة كلاس active من كل الأزرار وإضافته للزر المضغوط
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    currentFilter = this.getAttribute('data-filter');
    renderTasks();
  });
});

// دالة حماية بسيطة للنصوص المدخلة
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// تشغيل العرض لأول مرة عند فتح الصفحة
renderTasks();