// Constants for DOM element IDs
const TASK_POOL_WINDOW_ID = "task-pool-window";
const SETTINGS_WINDOW_ID = "settings-window";
const HELP_WINDOW_ID = "help-window";
const TASK_INPUT_ID = "task-input";
const DIFF_INPUT_ID = "diff-input";
const TIME_INPUT_ID = "time-input";
const TASK_POOL_ID = "task-pool";
const TASKS_SECTION_ID = "tasks-section";
const MAX_CARD_TIME_ID = "max-card-time";
const HIGH_SCORE_TOTAL_ID = "high-score";

// Variable to store the high score
let highScoreTotal = 0;

// Helper function to update the high score display
function updateHighScoreDisplay() {
    getElement(HIGH_SCORE_TOTAL_ID).innerHTML = highScoreTotal;
}

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
getElement("help-button").addEventListener('click', () => showElement(HELP_WINDOW_ID));
getElement("close-help").addEventListener('click', () => hideElement(HELP_WINDOW_ID));

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

function createCardElement(cardTitleText) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("task-card", "hidden");

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = cardTitleText;
    cardDiv.appendChild(cardTitle);

    return cardDiv;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function createTimeButtons(scoresAndMultipliers, totalTime, onScoreSelected) {
    const timeButtonsDiv = document.createElement("div");
    timeButtonsDiv.classList.add("time-buttons");

    scoresAndMultipliers.forEach(({ score, multiplier }) => {
        const timeButton = document.createElement("button");
        const buttonTime = totalTime * multiplier;
        const formattedTime = formatTime(buttonTime)

        timeButton.innerHTML = `${score} <br> ${formattedTime}`;
        timeButton.value = score;
        timeButton.classList.add("time-score-button");

        timeButton.addEventListener("click", () => {
            const currentCard = timeButton.closest(".task-card");
        
            if (currentCard) {
                const previousSelectedButton = currentCard.querySelector(".selected-time-button");
        
                // If a button was previously selected, remove its score from high score
                if (previousSelectedButton) {
                    highScoreTotal -= parseInt(previousSelectedButton.value, 10);
                    previousSelectedButton.classList.remove("selected-time-button");
                }
        
                // Add new score to high score
                const newScore = parseInt(timeButton.value, 10);
                highScoreTotal += newScore;
                timeButton.classList.add("selected-time-button");
        
                // Update display
                updateHighScoreDisplay();
        
                // Select all checkboxes and trigger change event
                const checkboxes = currentCard.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach((checkbox) => {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event("change")); // Trigger event listener
                    }
                });
            }
        });
        
        
        timeButtonsDiv.appendChild(timeButton);
    });

    return timeButtonsDiv;
}

function createTaskListView(taskList) {
    const taskListDiv = document.createElement("ul");
    taskListDiv.style.listStyleType = "none";

    taskList.forEach((task, index) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${index}`;
        checkbox.name = `task-${index}`;

        const label = document.createElement("label");
        label.htmlFor = `task-${index}`;
        label.textContent = task.desc;

        checkbox.addEventListener("change", () => {
            label.style.textDecoration = checkbox.checked ? "line-through" : "none";
            label.style.color = checkbox.checked ? "grey" : "black";
            task.status = checkbox.checked ? "completed" : "open";
        });

        taskListDiv.appendChild(checkbox);
        taskListDiv.appendChild(label);
        taskListDiv.appendChild(document.createElement("br"));
    });

    return taskListDiv;
}

function createNextCardButton(onNext) {
    const nextCardButton = document.createElement("button");
    nextCardButton.classList.add("next-card-button");
    nextCardButton.textContent = "Next Card";
    nextCardButton.addEventListener("click", onNext);

    return nextCardButton;
}

function renderCard(taskList, totalTime) {
    const cardDiv = createCardElement(`Task Card ${tasksSection.children.length + 1}`);

    const scoresAndMultipliers = [
        { score: 10, multiplier: 1 },
        { score: 5, multiplier: 1.5 },
        { score: 2, multiplier: 2 },
    ];

    const timeButtonsDiv = createTimeButtons(scoresAndMultipliers, totalTime, (selectedScore) => {
        console.log(selectedScore);
        highScoreTotal += selectedScore;
        updateHighScoreDisplay();
    });

    cardDiv.appendChild(timeButtonsDiv);

    const taskListDiv = createTaskListView(taskList);
    cardDiv.appendChild(taskListDiv);

    const nextCardButton = createNextCardButton(() => {
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

// Help Menu slides
document.querySelectorAll('.next-button, .prev-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.slide').forEach(slide => slide.classList.add('hidden'));
        document.getElementById(button.dataset.target).classList.remove('hidden');
    });
});
