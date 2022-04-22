
const tasksList = document.querySelector('#tasks');
const tasksInput = document.querySelector('#tasksInput');
const buttonAdd = document.querySelector('#tasksAdd');
const buttonEllipsis = document.querySelector('#buttonEllipsis');
const tasksCount = document.querySelector('#tasksCount');
const tasksTitle = document.querySelector('#tasksTitle');
const tasksDate = document.querySelector('#tasksDate');
const tasksFilters = document.querySelector('#tasksFilters');
const filterButtons = document.querySelectorAll('.filter__button');
const footer = document.querySelector('#tasksNew');
const templateTask = document.querySelector('#tasksTemplate').content;

// - - - - - DATA - - - - -

let filter = 'inProgress';
let tasks = [];
const title = {
    'all': 'To do list',
    'inProgress': 'To do list',
    'completed': 'Completed list',
    'removed': 'Removed list',
}


const getTasks = async () => {

    tasks = await getTasksRequest();
    updatePageTasks()
}

// - - - - - REQUEST FUNCTIONS - - - - -

const requestUrl = 'https://web-todo-bek.herokuapp.com';

async function getTasksRequest(){

    let response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    });

    return await response.json();
}

async function addTaskRequest(task){

    let response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(task)
    });

    return await response.json();
}

async function updateTaskRequest(_id, dataToUpdate) {

    const response = await fetch(`${requestUrl}/${_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(dataToUpdate)
    })

    return await response.json();
}

async function deleteTaskRequest(_id){

    return await fetch(`${requestUrl}/${_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    })
}

// - - - - - CODE - - - - -

setDate();
getTasks();

// - - - - - LIST FUNCTIONS - - - - -

function findTaskInList(searchId) {

    return  tasks.find(el => el._id === searchId);
}

function replaceTaskInList(replaceId, newTask) {

    let taskIndexInList = tasks.findIndex(el => el._id === replaceId);
    tasks[taskIndexInList] = newTask;
}

function deleteTaskFromList(deleteId) {

    tasks = tasks.filter(el => el._id !== deleteId);
}


// - - - - - FUNCTIONS - - - - -

async function completeTask(_id) {

    let task = findTaskInList(_id);

    const dataToUpdate = {
        isCompleted: !task.isCompleted
    }

    const updatedTask = await updateTaskRequest(_id, dataToUpdate);

    replaceTaskInList(_id, updatedTask);
    updatePageTasks();
}

async function deleteTaskForever (_id) {

    const response = await deleteTaskRequest(_id)

    if (response.ok) {
        deleteTaskFromList(_id);
        updatePageTasks();
    }
    else{
        console.log('Server error');
    }
}

async function deleteTask(_id) {

    const dataToUpdate = {
        isRemoved: true
    }
    const updatedTask = await updateTaskRequest(_id, dataToUpdate);

    replaceTaskInList(_id, updatedTask);
    updatePageTasks();
}

async function addTask(text){

    let task = { text: text, isCompleted: false, isRemoved: false };

    const newTask = await addTaskRequest(task);

    tasks.push(newTask);
    tasksInput.value = '';
    updatePageTasks();
}


function updatePageTasks() {

    console.log(tasks)

    while (tasksList.firstChild) {
        tasksList.removeChild(tasksList.firstChild);
    }

    let count = 0;

    if (filter === 'inProgress') {

        for (let task of tasks) {
            if (!task.isCompleted && !task.isRemoved) {
                addTaskToPage(task.text, task.isCompleted, task.isRemoved, task._id);
                count++;
            }
        }
    }
    else if (filter === 'removed') {

        for (let task of tasks) {
            if (task.isRemoved) {
                addTaskToPage(task.text, task.isCompleted, task.isRemoved, task._id);
                count++;
            }
        }
    }
    else if (filter === 'completed') {

        for (let task of tasks) {
            if (task.isCompleted && !task.isRemoved) {
                addTaskToPage(task.text, task.isCompleted, task.isRemoved, task._id);
                count++;
            }
        }
    }

    setCount(count);
    setTitle();
    toggleNew();
}

function addTaskToPage(text, isCompleted, isRemoved, id) {

    const newElement = templateTask.cloneNode(true);
    newElement.querySelector('.task__text').append(text);

    if (isCompleted) {
        newElement.querySelector('#taskCheckbox').checked = true;
    }

    newElement.querySelector('li').setAttribute('id', id)

    tasksList.prepend(newElement);
}

function toggleNew() {

    if (filter === 'inProgress') {
        footer.classList.remove('hidden');
    }
    else {
        footer.classList.add('hidden');
    }
}

function setTitle() {

    const newTitle = title[filter];
    tasksTitle.textContent = newTitle;
}

function setCount(count) {

    tasksCount.textContent = count + ' tasks';
}

function setDate() {

    const date = new Date();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getDay()];

    const mounths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const mounth = mounths[date.getMonth()];

    const day = date.getDate();

    const year = date.getFullYear();

    tasksDate.textContent = dayOfWeek + ', ' + mounth + ' ' + day + ', ' + year;
}

// - - - - - LISTENERS - - - - -

buttonEllipsis.addEventListener('click', function () {

    tasksFilters.classList.toggle('hidden');
})

buttonAdd.addEventListener('click', async function () {

    const text = tasksInput.value;

    addTask(text);
})

tasksInput.addEventListener('keydown', function (event) {

    if (event.keyCode === 13) {
        buttonAdd.click();
    }

});

tasksList.addEventListener('click', function (event) {

    if (event.target.closest('li')) { // элемент, на котором событие сработало

        if (event.target.classList.contains('task__remove')) {

            if (filter === 'removed') {
                deleteTaskForever(event.target.closest('li').id)
            }
            else{
                deleteTask(event.target.closest('li').id);
            }
        }
        else if (event.target.closest('label')) {

            completeTask(event.target.closest('li').id);
        }
    }
});

for (let filterButton of filterButtons) {

    filterButton.addEventListener('click', function () {

        filter = filterButton.dataset.filter;
        updatePageTasks();
    })
}







