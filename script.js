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
const HIGH_SCORE_TOTAL_ID = "highscore";

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
getElement("open-task-pool-button").addEventListener('click', () => displayTasks());
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
    taskPool.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.status === "completed";
        checkbox.id = `pool-task-${index}`;

        const label = document.createElement("label");
        label.htmlFor = `pool-task-${index}`;
        label.textContent = `${task.desc} (Difficulty: ${task.diff}, Time: ${task.time} mins)`;

        // Apply strikethrough if completed
        if (task.status === "completed") {
            label.style.textDecoration = "line-through";
            label.style.color = "grey";
        }

        // Allow marking from this list too
        checkbox.addEventListener("change", () => {
            task.status = checkbox.checked ? "completed" : "open";
            label.style.textDecoration = checkbox.checked ? "line-through" : "none";
            label.style.color = checkbox.checked ? "grey" : "black";
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
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

        timeButton.innerHTML = `Score: ${score} <br> Time: ${formattedTime}`;
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

                // Pause Stopwatch Timer
                timer = false;
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

function createPreviousCardButton(onPrevious) {
    const previousCardButton = document.createElement("button");
    previousCardButton.classList.add("previous-card-button");
    previousCardButton.textContent = "Previous Card";
    previousCardButton.addEventListener("click", onPrevious);

    return previousCardButton;
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

    const previousCardButton = createPreviousCardButton(() => {
        currentCardIndex--;
        updateCardVisibility();
    });
    cardDiv.appendChild(previousCardButton);

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
 
    // Hide "Previous Card" button on the first card
    const firstCard = cards[0];
    if (firstCard) {
        const previousButton = firstCard.querySelector(".previous-card-button");
        if (previousButton) {
            previousButton.style.display = currentCardIndex >= 0 ? "none" : "block";
        }
    }

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

/*----------------------
----Stopwatch Script----
------------------------ */
let startBtn = document.getElementById('start');
let pauseBtn = document.getElementById('pause');
let resetBtn = document.getElementById('reset');

let minute = 0;
let second = 0;

timer = false;

startBtn.addEventListener('click', function() {
    if (!timer) {
        timer = true;
        stopWatch();
    } else {
        //Do Nothing
    }
})

pauseBtn.addEventListener('click', function() {
    timer = false;
})

resetBtn.addEventListener('click', function() {
    timer = false;
    minute = 0;
    second = 0;
    document.getElementById('min').innerHTML = "00";
    document.getElementById('sec').innerHTML = "00";
})

function stopWatch() {
    if(timer) {
        second++;

        if (second == 60) {
            minute++;
            second = 0;
        }

        let minString = minute;
        let secString = second;

        if (minute < 10) {
            minString = "0" + minString
        }

        if (secString < 10) {
            secString = "0" + secString
        }

        document.getElementById('min').innerHTML = minString;
        document.getElementById('sec').innerHTML = secString;    
        setTimeout(stopWatch, 1000);
    }

}

/*---------------------------
----------Settings-----------
---------------------------*/

const SORTING_LABEL = document.getElementById('sort-label').innerHTML;

