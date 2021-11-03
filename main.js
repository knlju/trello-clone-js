let boardList

const boardListDummyData = [{
    title: "Backlog",
    tasks: []
},
{
    title: "In Progress",
    tasks: []
},
{
    title: "Complete",
    tasks: []
}, {
    title: "On Hold",
    tasks: []
},
]

const boardNode = document.querySelector(".board")
const newListNode = document.querySelector(".board__list-new")
const modalSaveBtn = document.querySelector(".edit__save")
const modalCancelBtn = document.querySelector(".edit__cancel")
const modalTitle = document.querySelector(".edit__title-input")
const modalTextArea = document.querySelector(".edit__textarea")
const modalNode = document.querySelector(".edit")
const addNewListBtn = document.querySelector('.board__list-new-btn')
const priorityBtns = document.querySelectorAll(".edit__priority-btn")

// premium priority by default
let selectedColor = "#3f51b5"
let draggedTask
let dragListSource
let lastAfterIndex

function updateLocalStorage() {
    localStorage.setItem("boardList", JSON.stringify(boardList))
}

function openModal(callback, list = false) {
    list ? modalNode.classList.add("open-list") : modalNode.classList.add("open-edit")
    modalSaveBtn.onclick = callback
}

function closeModal() {
    modalNode.classList.remove("open-edit")
    modalNode.classList.remove("open-list")
    priorityBtns.forEach(btn => btn.classList.remove("edit__priority-selected"))
    selectedColor = "#3f51b5"
    modalTitle.value = ""
    modalTextArea.value = ""
}

function handleSaveNewListClick() {
    const newList = {
        title: modalTitle.value,
        tasks: []
    }

    renderList(newList, boardList.length)
    closeModal()
    boardList.push(newList)
    updateLocalStorage()
}

addNewListBtn.addEventListener("click", () => openModal(handleSaveNewListClick, list = true))

function handlePrioBtnClick(prioBtn) {
    selectedColor = prioBtn.dataset.color
    priorityBtns.forEach(btn => btn.classList.remove("edit__priority-selected"))
    prioBtn.classList.add("edit__priority-selected")
}

priorityBtns.forEach(btn => btn.addEventListener("click", () => handlePrioBtnClick(btn)))

function handleAddNewTaskClick(listNode) {
    // otvori modal za novi task
    function handleModalNewTaskSaveClick() {
        const title = modalTitle.value
        const text = modalTextArea.value
        const color = selectedColor
        appendTask(title, text, color, listNode)
        closeModal()
    }
    openModal(handleModalNewTaskSaveClick)
}

function handleEditTaskClick(e, taskNode) {
    const titleNode = taskNode.querySelector(".board__task-title")
    const descNode = taskNode.querySelector(".board__task-desc")
    modalTitle.value = titleNode.textContent
    modalTextArea.value = descNode.textContent
    const currColor = taskNode.style.borderTopColor
    selectedColor = currColor

    priorityBtns.forEach(btn => (btn.dataset.color === currColor) ? btn.classList.add("edit__priority-selected") : btn.classList.remove("edit__priority-selected"))

    function handleModalEditTaskSaveClick() {
        const newTitle = modalTitle.value
        const newText = modalTextArea.value
        const taskIndex = [...taskNode.parentElement.children].indexOf(taskNode)
        const listIndex = taskNode.closest(".board__list").dataset.index

        const task = boardList[listIndex].tasks[taskIndex]

        task.title = newTitle
        task.text = newText
        task.color = selectedColor

        titleNode.textContent = newTitle
        descNode.textContent = newText
        taskNode.style.borderTop = `10px solid ${selectedColor}`

        updateLocalStorage()
        closeModal()
    }
    openModal(handleModalEditTaskSaveClick)
}

function handleDeleteTaskClick(e, taskNode) {
    const taskIndex = [...taskNode.parentElement.children].indexOf(taskNode)
    const listIndex = taskNode.closest(".board__list").dataset.index
    boardList[listIndex].tasks.splice(taskIndex, 1)
    updateLocalStorage()
    taskNode.remove()
}

function appendTask(title, text, color, listNode) {
    const listIndex = listNode.dataset.index
    const currList = boardList[listIndex]
    currList.tasks.push({
        title,
        text,
        color
    })
    updateLocalStorage()
    const blNode = listNode.querySelector(".board__tasks")
    renderTask(title, text, color, blNode)
}

function createTaskNode(title, desc, color) {
    const newTaskNode = document.createElement("div")
    newTaskNode.classList.add("board__task")
    newTaskNode.style.borderTop = `10px solid ${color}`

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

function renderTask(title, desc, color, listNode) {
    const newTaskNode = createTaskNode(title, desc, color)
    listNode.appendChild(newTaskNode)
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

    deleteBtn.addEventListener("click", e => {
        boardList.splice(index, 1)
        const boardLists = document.querySelectorAll(".board__list:not(.board__list-new)")
        boardLists.forEach(list => list.remove())
        boardList.forEach((list, i) => renderList(list, i))
        updateLocalStorage()
    })

    editBtn.addEventListener("click", e => {
        modalTitle.value = list.title
        function handleModalEditListClick() {
            boardList[index].title = modalTitle.value
            listTitle.innerHTML = modalTitle.value
            updateLocalStorage()
            closeModal()
        }

        openModal(handleModalEditListClick, true)
    })

    headerBtns.append(editBtn, deleteBtn)

    listHeaderContainer.append(listTitle, headerBtns)

    listNode.classList.add("board__list")
    const tasksContainer = document.createElement("div")
    tasksContainer.classList.add("board__tasks")
    tasksContainer.addEventListener("dragover", e => handleTaskDragOver(e, tasksContainer))

    // Render tasks
    list.tasks.forEach(task => renderTask(task.title, task.text, task.color, tasksContainer))

    const btnNewTask = document.createElement("button")
    btnNewTask.innerHTML = "<i class=\"fas fa-plus\"></i> Add New Task"
    btnNewTask.addEventListener("click", () => handleAddNewTaskClick(listNode))
    btnNewTask.classList.add("board__button")
    listNode.appendChild(listHeaderContainer)
    listNode.appendChild(tasksContainer)
    listNode.appendChild(btnNewTask)
    boardNode.insertBefore(listNode, newListNode)

    listNode.addEventListener("drop", e => handleDrop(e, listNode))
}

function handleTaskDragStart(e, taskNode) {
    const taskIndex = [...taskNode.parentElement.children].indexOf(taskNode)
    const listIndex = taskNode.closest(".board__list").dataset.index
    dragListSource = boardList[listIndex]
    draggedTask = boardList[listIndex].tasks[taskIndex]
    taskNode.classList.add("dragged")
}

function handleTaskDragEnd(e, taskNode) {
    taskNode.classList.remove("dragged")
}

function handleDrop(e, listNode) {
    const listIndex = listNode.dataset.index
    const targetList = boardList[listIndex]
    const taskIndex = dragListSource.tasks.indexOf(draggedTask)
    dragListSource.tasks.splice(taskIndex, 1)
    const targetTaskIndex = lastAfterIndex + 1
    targetList.tasks.splice(targetTaskIndex, 0, draggedTask)
    updateLocalStorage()
}

function handleTaskDragOver(e, taskContainer) {
    e.preventDefault()
    const afterElement = getDragAfterElement(taskContainer, e.clientY)
    // todo ruzno je ovo
    lastAfterIndex = afterElement ? [...afterElement.parentElement.children].indexOf(afterElement) : 0
    const dragged = document.querySelector(".dragged")
    if (afterElement == null) {
        taskContainer.appendChild(dragged)
    } else {
        taskContainer.insertBefore(dragged, afterElement)
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.board__task:not(.dragged)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

function init() {
    boardList = JSON.parse(localStorage.getItem("boardList"))
    if (!boardList) {
        localStorage.setItem("boardList", JSON.stringify(boardListDummyData))
        boardList = boardListDummyData
    }
    boardList.forEach((list, index) => renderList(list, index))
}

modalCancelBtn.addEventListener("click", closeModal)

init()