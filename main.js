let boardList

const boardListDummyData = [{
    title: "Backlog",
    tasks: [{
        title: "title 1",
        text: "text 1",
        priority: "test priority"
    },
    {
        title: "title 2",
        text: "text 2",
        priority: "max",
    },
    {
        title: "title 3",
        text: "text 3"
    }
    ]
},
{
    title: "In Progress",
    tasks: [{
        title: "title 1",
        text: "text 1"
    }]
},
{
    title: "Complete",
    tasks: [{
        title: "title 1",
        text: "text 1"
    }]
}, {
    title: "On Hold",
    tasks: [{
        title: "title 1",
        text: "text 1"
    }]
},
]

const boardNode = document.querySelector(".board")
const newListNode = document.querySelector(".board__list-new")
const modalSaveBtn = document.querySelector(".edit__save")
const modalCancelBtn = document.querySelector(".edit__cancel")
const modalTitle = document.querySelector(".edit__title-input")
const modalTextArea = document.querySelector(".edit__textarea")
const modalNode = document.querySelector(".edit")
// const 

function updateLocalStorage() {
    localStorage.setItem("boardList", JSON.stringify(boardList))
}

function openModal(callback) {
    console.log("open modal")
    modalNode.classList.add("open-edit")
    modalSaveBtn.onclick = callback
    console.log(modalSaveBtn.onclick)
}

function closeModal() {
    modalNode.classList.remove("open-edit")
}

function handleAddNewTaskClick(listNode) {
    // otvori modal za novi task
    
    modalTitle.value = ""
    modalTextArea.value = ""
    function handleModalNewTaskSaveClick() {
        console.log("handleModalNewTaskSaveClick")
        const title = modalTitle.value
        const text = modalTextArea.value
        appendTask(title, text, listNode)
        modalTitle.value = ""
        modalTextArea.value = ""
        closeModal()
    }
    openModal(handleModalNewTaskSaveClick)
}

function handleEditTaskClick(e, taskNode) {
    // todo napuni text i title
    const titleNode = taskNode.querySelector(".board__task-title")
    const descNode = taskNode.querySelector(".board__task-desc")
    // na primer
    // const borderColor = taskNode.querySelector(".selected").dataset.color
    modalTitle.value = titleNode.textContent
    modalTextArea.value = descNode.textContent
    // taskNode.style.borderTop = `10px solid ${color}`

    function handleModalNewTaskSaveClick() {
        const newTitle = modalTitle.value
        const newText = modalTextArea.value
        modalTitle.value = ""
        modalTextArea.value = ""
        const taskIndex = [...taskNode.parentElement.children].indexOf(taskNode)
        const listIndex = taskNode.closest(".board__list").dataset.index

        const task = boardList[listIndex].tasks[taskIndex]

        task.title = newTitle
        task.text = newText

        titleNode.textContent = newTitle
        descNode.textContent = newText

        updateLocalStorage()
        closeModal()
    }
    openModal(handleModalNewTaskSaveClick)
}

function handleDeleteTaskClick(e, taskNode) {
    console.log("handleDeleteTaskClick")
    console.log(taskNode)

    const taskIndex = [...taskNode.parentElement.children].indexOf(taskNode)
    const listIndex = taskNode.closest(".board__list").dataset.index
    console.log("taskIndex", taskIndex, "listIndex", listIndex)
    console.log(boardList[listIndex])

    boardList[listIndex].tasks.splice(taskIndex, 1)
    updateLocalStorage()
    // remove from html
    taskNode.remove()
}

function appendTask(title, text, listNode) {
    // dodaj task na kraj liste
    // renderuj ga
    const listIndex = listNode.dataset.index
    const currList = boardList[listIndex]
    currList.tasks.push({
        title,
        text
    })
    console.log(currList)
    console.log(boardList)
    updateLocalStorage()
    // ili renderList ?
    renderTask(title, text, listNode)
}

function createTaskNode(title, desc, prioColor = "red") {
    const newTaskNode = document.createElement("div")
    newTaskNode.classList.add("board__task")
    // moze i preko klasa
    newTaskNode.style.borderTop = `10px solid ${prioColor}`

    const taskTitle = document.createElement("h3")
    taskTitle.textContent = title
    taskTitle.classList.add("board__task-title")

    const taskDesc = document.createElement("p")
    taskDesc.textContent = desc
    taskDesc.classList.add("board__task-desc")

    const btnsContainer = document.createElement("div")
    btnsContainer.classList.add("board__task-btns")
    const editBtn = document.createElement("button")
    const deleteBtn = document.createElement("button")
    editBtn.classList.add("board__task-edit")
    deleteBtn.classList.add("board__task-btn")
    editBtn.addEventListener("click", e => handleEditTaskClick(e, newTaskNode))
    deleteBtn.addEventListener("click", e => handleDeleteTaskClick(e, newTaskNode))
    editBtn.innerHTML = "Edit <i class=\"fas fa-pen\"></i>"
    deleteBtn.innerHTML = "Delete <i class=\"fas fa-trash\"></i>"

    newTaskNode.draggable = true

    newTaskNode.addEventListener("dragstart", e => handleTaskDragStart(e, newTaskNode))
    newTaskNode.addEventListener("dragend", e => handleTaskDragEnd(e, newTaskNode))

    btnsContainer.appendChild(editBtn)
    btnsContainer.appendChild(deleteBtn)
    newTaskNode.appendChild(taskTitle)
    newTaskNode.appendChild(taskDesc)
    newTaskNode.appendChild(btnsContainer)
    return newTaskNode
}

function renderTask(title, desc, listNode) {
    const newTaskNode = createTaskNode(title, desc)
    const addNewTaskBtn = listNode.querySelector(".board__button")
    listNode.insertBefore(newTaskNode, addNewTaskBtn)
}

function renderList(list, index) {
    // todo appendList
    const listNode = document.createElement("div")
    listNode.dataset.index = index

    // todo razmisli o imenima klasa
    const listHeaderContainer = document.createElement("div")
    listHeaderContainer.classList.add("board__task-btns")

    const listTitle = document.createElement("h2")
    listTitle.classList.add("board__title")
    listTitle.innerHTML = list.title

    const headerBtns = document.createElement("div")
    headerBtns.classList.add("edit__btns-right")
    const editBtn = document.createElement("button")
    const deleteBtn = document.createElement("button")
    editBtn.classList.add("board__task-edit")
    deleteBtn.classList.add("board__task-btn")
    editBtn.innerHTML = "<i class=\"fas fa-pen\"></i>"
    deleteBtn.innerHTML = "<i class=\"fas fa-trash\"></i>"

    headerBtns.append(editBtn, deleteBtn)

    listHeaderContainer.append(listTitle, headerBtns)

    listNode.classList.add("board__list")
    const tasksContainer = document.createElement("div")
    tasksContainer.classList.add("board__tasks")
    tasksContainer.addEventListener("dragover", e => handleTaskDragOver(e, tasksContainer))

    // Render tasks
    list.tasks.forEach(task => renderTask(task.title, task.text, tasksContainer))

    const btnNewTask = document.createElement("button")
    btnNewTask.innerHTML = "<i class=\"fas fa-plus\"></i> Add New Task"
    btnNewTask.addEventListener("click", () => handleAddNewTaskClick(listNode))
    btnNewTask.classList.add("board__button")
    listNode.appendChild(listHeaderContainer)
    listNode.appendChild(tasksContainer)
    listNode.appendChild(btnNewTask)
    boardNode.insertBefore(listNode, newListNode)
}

function handleTaskDragStart(e, taskNode) {
    taskNode.classList.add("dragged")
}

function handleTaskDragEnd(e, taskNode) {
    taskNode.classList.remove("dragged")
}

function handleTaskDragOver(e, taskContainer) {
    e.preventDefault()
    const dragged = document.querySelector(".dragged")
    // console.log(dragged)
    taskContainer.appendChild(dragged)
}

function init() {
    boardList = JSON.parse(localStorage.getItem("boardList"))
    if (!boardList) {
        localStorage.setItem("boardList", JSON.stringify(boardListDummyData))
        boardList = boardListDummyData
    }
    console.log(boardList)
    boardList.forEach((list, index) => renderList(list, index))
}

modalCancelBtn.addEventListener("click", closeModal)

init()