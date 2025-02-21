// Constants for DOM element IDs
const TASK_POOL_WINDOW_ID = "task-pool-window";
const SETTINGS_WINDOW_ID = "settings-window";
const TASK_INPUT_ID = "task-input";
const DIFF_INPUT_ID = "diff-input";
const TIME_INPUT_ID = "time-input";
const TASK_POOL_ID = "task-pool";
const TASKS_SECTION_ID = "tasks-section";
const MAX_CARD_TIME_ID = "max-card-time";


// Helper function to get element by ID
const getElement = (id) => document.getElementById(id);

// Window management functions
const showElement = (id) => getElement(id).style.display = "flex"; // Use flex for task pool?
const hideElement = (id) => getElement(id).style.display = "none";

// Event listeners for window controls
getElement("open-task-pool-button").addEventListener('click', () => showElement(TASK_POOL_WINDOW_ID));
getElement("close-pool-button").addEventListener('click', () => hideElement(TASK_POOL_WINDOW_ID));
getElement("settings-button").addEventListener('click', () => showElement(SETTINGS_WINDOW_ID));
getElement("close-settings").addEventListener('click', () => hideElement(SETTINGS_WINDOW_ID));

// Task management
let tasks = [];

const taskPool = getElement(TASK_POOL_ID);
const tasksSection = document.querySelector(`.${TASKS_SECTION_ID}`); // Use CSS selector for consistency

function addTask() {
    const taskDesc = getElement(TASK_INPUT_ID).value;
    const difficulty = parseInt(getElement(DIFF_INPUT_ID).value, 10);
    const time = parseInt(getElement(TIME_INPUT_ID).value, 10);

    if (!taskDesc || isNaN(difficulty) || isNaN(time)) {
        alert("Please provide valid task details.");
        return;
    }

    const newTask = { desc: taskDesc, diff: difficulty, time: time, status: 'open' };
    tasks.push(newTask);

    // Clear input fields
    getElement(TASK_INPUT_ID).value = "";
    getElement(DIFF_INPUT_ID).value = "";
    getElement(TIME_INPUT_ID).value = "";

    displayTasks();
}

function displayTasks() {
    tasks.sort((a, b) => a.diff - b.diff);

    taskPool.innerHTML = ""; // Clear task pool

    tasks.forEach(task => {
        const listItem = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        listItem.appendChild(checkbox);
        listItem.append(` ${task.desc} (Difficulty: ${task.diff}, Time: ${task.time} mins)`);
        taskPool.appendChild(listItem);
    });
}

// Card creation
let currentCardIndex = 0;

function createTaskCards() {
    const maxCardTime = parseInt(getElement(MAX_CARD_TIME_ID).value, 10); // Parse as int
    tasksSection.innerHTML = "";
    currentCardIndex = 0;

    let currentCard = [];
    let currentCardTime = 0;

    tasks.filter(task => task.status !== "completed").forEach(task => { // Filter completed tasks early
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

    updateCardVisibility();
}

function renderCard(taskList, totalTime) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("task-card", "hidden");

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = `Task Card ${tasksSection.children.length + 1}`;
    cardDiv.appendChild(cardTitle);

    // Score Buttons Creation
    const timeButtonsDiv = document.createElement("div");
    timeButtonsDiv.classList.add("time-buttons");

    const scoresAndMultipliers = [
        { score: 10, multiplier: 1 },
        { score: 5, multiplier: 1.5 },
        { score: 2, multiplier: 2 },
    ];

    scoresAndMultipliers.forEach(item => { 
        console.log(item)
        const timeButton = document.createElement("button");
        timeButton.textContent = `${item.score}`;
        timeButton.value = item.score;
        timeButton.classList.add("time-score-button");

        timeButton.addEventListener("click", () => {
            const selectedScore = parseInt(timeButton.value, 10);
            const selectedMultiplier = item.multiplier;
            console.log("Selected Score: ", selectedScore);
            console.log("Selected Multiplier: ", selectedMultiplier);

            const calculatedTime = totalTime * selectedMultiplier;
            console.log("Calculated Time:", calculatedTime);

        });

        timeButtonsDiv.appendChild(timeButton);
    });

    cardDiv.appendChild(timeButtonsDiv);

    // Task List Creation
    const taskListDiv = document.createElement("ul");
    taskListDiv.style.listStyleType = "none";

    taskList.forEach((task, index) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${index}`;
        checkbox.name = `task-${index}`;

        const label = document.createElement("label");
        label.htmlFor = `task-${index}`; // Use htmlFor for label association
        label.textContent = task.desc;

        checkbox.addEventListener("change", () => {
            label.style.textDecoration = checkbox.checked ? "line-through" : "none";
            label.style.color = checkbox.checked ? "grey" : "black";
            task.status = checkbox.checked ? "completed" : "open"; // Update task status
        });

        taskListDiv.appendChild(checkbox);
        taskListDiv.appendChild(label);
        taskListDiv.appendChild(document.createElement("br")); // Append br directly
    });
    cardDiv.appendChild(taskListDiv);

    const nextCardButton = document.createElement("button");
    nextCardButton.classList.add("next-card-button");
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
    cards.forEach((card, index) => card.classList.toggle("hidden", index !== currentCardIndex)); // Use toggle for visibility

    // Hide "Next Card" button on the last card
    const lastCard = cards[cards.length - 1];
    if (lastCard) {
        const nextButton = lastCard.querySelector(".next-card-button"); // Target by class
        if (nextButton) {
            nextButton.style.display = currentCardIndex >= cards.length - 1 ? "none" : "block";
        }
    }
}


getElement("generate-task-cards-button").addEventListener("click", createTaskCards);
