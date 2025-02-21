// Functions for opening and hiding windows
document.getElementById("open-task-pool-button").addEventListener('click', ()=> {
    document.getElementById("task-pool-window").style.display = "flex"
})

document.getElementById("close-pool-button").addEventListener('click', ()=> {
    document.getElementById("task-pool-window").style.display = "none"
})

document.getElementById("settings-button").addEventListener('click', ()=> {
    document.getElementById("settings-window").style.display = "block"
})

document.getElementById("close-settings").addEventListener('click', ()=> {
    document.getElementById("settings-window").style.display = "none"
})

// Function to add new tasks
var tasks = [];

const taskPool = document.getElementById("task-pool");
const tasksSection = document.querySelector(".tasks-section");

function addTask() {
    let currentTask = document.getElementById("task-input").value;
    let currentDiff = parseInt(document.getElementById("diff-input").value, 10);
    let currentTime = parseInt(document.getElementById("time-input").value, 10);

    // Prevent empty task addition
    if (!currentTask || isNaN(currentDiff) || isNaN(currentTime)) {
        alert("Please provide valid task details.");
        return;
    }

    let currentTaskObj = { desc: currentTask, diff: currentDiff, time: currentTime, status: 'open' };
    tasks.push(currentTaskObj);

    // Clear input fields
    document.getElementById("task-input").value = "";
    document.getElementById("diff-input").value = "";
    document.getElementById("time-input").value = "";

    // Refresh the task list
    displayTasks();
}

function displayTasks() {
    // Sort tasks by difficulty
    tasks.sort(function (a, b) {
        return a.diff - b.diff;
    });

    // Clear the current task pool
    taskPool.innerHTML = "";

    // Rebuild the sorted task list
    for (let i = 0; i < tasks.length; i++) {
        const listEle = document.createElement("li");
        const checkEle = document.createElement("input");
        checkEle.setAttribute("type", "checkbox");
        listEle.appendChild(checkEle);

        listEle.append(` ${tasks[i].desc} (Difficulty: ${tasks[i].diff}, Time: ${tasks[i].time} mins)`);
        taskPool.appendChild(listEle);
    }
}

// Function to create cards dynamically
let currentCardIndex = 0;

function createTaskCards() {
    const maxCardTime = document.getElementById("max-card-time").value;
    console.log(maxCardTime)

    tasksSection.innerHTML = "";
    currentCardIndex = 0;

    let currentCard = [];
    let currentCardTime = 0;

    tasks.forEach(task => {
        if (task.status === "completed") {
            return;
        }
        if (currentCardTime + task.time > maxCardTime) {
            renderCard(currentCard, currentCardTime);
            currentCard = [];
            currentCardTime = 0;
        }
        currentCard.push(task);
        currentCardTime += task.time;
    });

    if (currentCard.length > 0) {
        renderCard(currentCard, currentCardTime);
    }

    // Display only the first card
    updateCardVisibility();
}

function renderCard(taskList, totalTime) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("task-card", "hidden");

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = `Task Card ${tasksSection.children.length + 1}`;
    cardDiv.appendChild(cardTitle);

    const TimesTable = document.createElement("table");
    const headerRow = TimesTable.insertRow();
    const headerCells = [10, 5, 2];
    headerCells.forEach(text => {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = text;
    });
    const dataRow = TimesTable.insertRow();
    const dataCells = [totalTime, totalTime * 1.5, totalTime * 2];
    dataCells.forEach(value => {
        const dataCell = dataRow.insertCell();
        dataCell.textContent = value;
    });

    cardDiv.appendChild(TimesTable);

    const taskListDiv = document.createElement("ul");
    taskListDiv.style.listStyleType = "none";

    taskList.forEach((task, index) => {
        const taskItem = document.createElement("input");
        taskItem.setAttribute("type", "checkbox");
        taskItem.id = `task-${index}`;
        taskItem.name = `task-${index}`;

        const taskLabel = document.createElement("label");
        taskLabel.setAttribute("for", `task-${index}`);
        taskLabel.textContent = `${task.desc}`;

        // Add event listener to style completed tasks
        taskItem.addEventListener("change", () => {
            if (taskItem.checked) {
                taskLabel.style.textDecoration = "line-through";
                taskLabel.style.color = "grey";
                task.status = "completed";
            } else {
                taskLabel.style.textDecoration = "none";
                taskLabel.style.color = "black";
            }
        });

        const breakLine = document.createElement("br");

        taskListDiv.appendChild(taskItem);
        taskListDiv.appendChild(taskLabel);
        taskListDiv.appendChild(breakLine);
    });

    cardDiv.appendChild(taskListDiv);

    // Add button to navigate to the next card
    const nextCardButton = document.createElement("button");
    nextCardButton.textContent = "Next Card";
    nextCardButton.addEventListener("click", () => {
        currentCardIndex++;
        updateCardVisibility();
    });
    cardDiv.appendChild(nextCardButton);

    tasksSection.appendChild(cardDiv);
}

function updateCardVisibility() {
    const cards = document.querySelectorAll(".task-card");
    cards.forEach((card, index) => {
        card.classList.add("hidden"); // Hide all cards
        if (index === currentCardIndex) {
            card.classList.remove("hidden"); // Show only the current card
        }
    });

    // Hide the "Next Card" button on the last card
    if (currentCardIndex >= cards.length - 1) {
        const lastCard = cards[cards.length - 1];
        const nextButton = lastCard.querySelector("button");
        if (nextButton) nextButton.style.display = "none";
    }
}

// Attach functionality to create cards button
document.querySelector(".generate-task-cards-button").addEventListener("click", createTaskCards);
