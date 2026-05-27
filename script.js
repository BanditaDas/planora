function openpg() {
    var allelem = document.querySelectorAll('.elem')
    var fullelem = document.querySelectorAll('.fullelem')
    var backbtn = document.querySelectorAll('.fullelem .back')

    allelem.forEach(function (elem) {
        elem.addEventListener('click', function () {
            // Only open a full page if the card has a valid ID mapped to a page
            if (elem.id && fullelem[elem.id]) {
                fullelem[elem.id].style.display = 'block';
                localStorage.setItem('openFullPage', elem.id);
            }

        })

    })

    backbtn.forEach(function (back) {
        back.addEventListener('click', function () {

            fullelem[back.id].style.display = 'none'
            localStorage.removeItem('openFullPage')

        })
    })

    var openPageId = localStorage.getItem('openFullPage');
    if (openPageId !== null && fullelem[openPageId]) {
        fullelem[openPageId].style.display = 'block';
    }

}
openpg()


// ---- todo list ----


var form = document.querySelector('.addTask form')
var input = document.querySelector('.addTask form input')
var detsinput = document.querySelector('.addTask form textarea')
var Checkbox = document.querySelector('.addTask form input[type="checkbox"]')

var curtask = [

]

if (localStorage.getItem('currentTaskList')) {
    curtask = JSON.parse(localStorage.getItem('currentTaskList'))

} else {
    console.log("Task list is empty");

}


function renderTask() {
    var alltasks = document.querySelector('.alltask')

    var sum = " "

    curtask.forEach(function (elem, index) {
        sum += `<div class="task">
                        ${elem.imp ? '<span class="important-mark"><i class="fa-solid fa-star"></i></span>' : ''}
                        <div class="task-details">
                            <h5>${elem.task}</h5>
                            <p>${elem.dets}</p>
                        </div>
                        <button id="${index}">complete </button>
                    </div>`

    })

    alltasks.innerHTML = sum

    var markCompleteBtn = document.querySelectorAll('.task button')
    markCompleteBtn.forEach(function (btn) {
        btn.addEventListener("click", function () {
            curtask.splice(btn.id, 1)
            localStorage.setItem('currentTaskList', JSON.stringify(curtask))
            renderTask()
        })
    })
}
renderTask()


function todo() {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        curtask.push(
            {
                task: input.value,
                dets: detsinput.value,
                imp: Checkbox.checked
            }
        )
        localStorage.setItem('currentTaskList', JSON.stringify(curtask))
        input.value = ''
        detsinput.value = ''
        Checkbox.checked = false


        renderTask()

    })
}
todo()


// ---- end of todo list ----


// --- daily planner ---



var dayPlanData = JSON.parse(localStorage.getItem('dayPlanData')) || {};

// CREATE ELEMENTS FIRST
Array.from({ length: 20 }, (_, i) => i + 5).forEach((hour, idx) => {

    let displayHour = hour > 12 ? hour - 12 : hour;
    let period = hour >= 12 ? 'PM' : 'AM';

    const timeElement = document.createElement('div');

    timeElement.className = 'day-plan-time';

    timeElement.innerHTML = `
        <p>${displayHour}:00 ${period}</p>
        <input 
            id="${idx}" 
            type="text" 
            placeholder=" "
            value="${dayPlanData[idx] || ''}"
        >
    `;

    document.querySelector('.day-planner').appendChild(timeElement);
});


// NOW SELECT INPUTS
var plan = document.querySelectorAll('.day-plan-time input');


// ADD EVENT LISTENERS
plan.forEach(function (elem) {

    elem.addEventListener('input', function () {

        dayPlanData[elem.id] = elem.value;

        localStorage.setItem(
            'dayPlanData',
            JSON.stringify(dayPlanData)
        );

        console.log(dayPlanData);

    });

});

// --- end of daily planner ---


// --- quote generator ---
const quote = document.getElementById("quote");
const author = document.getElementById("author");
const newQuoteBtn = document.getElementById("newQuoteBtn");

async function fetchQuote() {
    try {
        quote.innerText = "Loading motivation...";
        author.innerText = "";

        const response = await fetch("https://dummyjson.com/quotes/random");

        const data = await response.json();

        quote.innerText = `"${data.quote}"`;
        author.innerText = `— ${data.author}`;

    } catch (error) {
        quote.innerText = "Failed to load quote.";
        author.innerText = "Please try again.";
        console.log(error);
    }
}

fetchQuote();

newQuoteBtn.addEventListener("click", fetchQuote);

// --- end of quote generator ---

// --pomodoro timer ---

const timeEl = document.getElementById("time");
const progress = document.getElementById("progress");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const sessionEl = document.getElementById("session");
const timerBtns = document.querySelector(".timer-btns");

let totalTime = 25 * 60;
let timeLeft = totalTime;
let timer = null;
let session = 0;
if (sessionEl) sessionEl.innerText = session;
let is50MinMode = false;

// Dynamically create the mode buttons container
const timerTop = document.querySelector(".timer-top");
const modeBtnsContainer = document.createElement("div");
modeBtnsContainer.className = "mode-btns";

const toggleModeBtn = document.createElement("button");
toggleModeBtn.innerText = "Switch to 50 Min";

const breakBtn = document.createElement("button");
breakBtn.innerText = "10 Min Break";

modeBtnsContainer.appendChild(toggleModeBtn);
modeBtnsContainer.appendChild(breakBtn);

if (timerTop) {
    // Hide the static timer-label to make space for our newly placed buttons
    const timerLabel = timerTop.querySelector(".timer-label");
    if (timerLabel) timerLabel.style.display = "none";
    timerTop.prepend(modeBtnsContainer);
}

toggleModeBtn.addEventListener("click", () => {
    is50MinMode = !is50MinMode;
    totalTime = is50MinMode ? 50 * 60 : 25 * 60;
    toggleModeBtn.innerText = is50MinMode ? "Switch to 25 Min" : "Switch to 50 Min";
    resetTimer();
});

breakBtn.addEventListener("click", () => {
    totalTime = 10 * 60;
    is50MinMode = false;
    toggleModeBtn.innerText = "Switch to 50 Min";
    resetTimer();
});

const radius = 105;
const circumference = 2 * Math.PI * radius;

progress.style.strokeDasharray = circumference;
progress.style.strokeDashoffset = 0;

function updateDisplay() {
    if (timeEl) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeEl.innerText =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (progress) {
        const progressValue = timeLeft / totalTime;
        progress.style.strokeDashoffset =
            circumference * (1 - progressValue);
    }
}

// Slides down a custom animated notification
function showCompletionMessage() {
    const msgBox = document.createElement("div");
    msgBox.innerText = "Pomodoro Completed 🍅 Time for a break!";
    Object.assign(msgBox.style, {
        position: "fixed",
        top: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#c07a5d",
        color: "white",
        padding: "1rem 2rem",
        borderRadius: "1rem",
        fontWeight: "bold",
        fontSize: "1.2rem",
        boxShadow: "0 10px 20px rgba(192, 122, 93, 0.4)",
        transition: "top 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)", // gives a nice bouncy drop
        zIndex: "9999"
    });
    document.body.appendChild(msgBox);

    setTimeout(() => { msgBox.style.top = "40px"; }, 100);

    // Remove notification after 4 seconds
    setTimeout(() => {
        msgBox.style.top = "-100px";
        setTimeout(() => msgBox.remove(), 500);
    }, 4000);
}

// Dynamically loads and shoots fireworks
function triggerCrackers() {
    if (!window.confetti) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        document.head.appendChild(script);
    } else {
        window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
}

function startTimer() {
    if (timer !== null) return;

    // Immediate tick so the UI feels responsive right away
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
    }

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            timer = null;

            session++;
            if (sessionEl) sessionEl.innerText = session;

            // Show custom notification and trigger confetti instead of an alert block
            setTimeout(() => {
                showCompletionMessage();
                triggerCrackers();
                resetTimer();
            }, 50);
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    clearInterval(timer);
    timer = null;

    timeLeft = totalTime;

    // Disable transition temporarily for an instant snap-back
    if (progress) progress.style.transition = "none";
    updateDisplay();

    setTimeout(() => {
        if (progress) progress.style.transition = "stroke-dashoffset 1s linear";
    }, 50);
}

if (startBtn) startBtn.addEventListener("click", startTimer);
if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
if (resetBtn) resetBtn.addEventListener("click", resetTimer);

updateDisplay();

// ---- end of pomodoro timer ----


// --- weather widget ---

const apikey = 'b2396b3dd79f47c3b5f41751262405';
const city = "kolkata";
let weatherTimeZone = "Asia/Kolkata";

function updateWeatherTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { 
        timeZone: weatherTimeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const dateParts = {};
    parts.forEach(({ type, value }) => {
        dateParts[type] = value;
    });
    
    // Some locales return '24' for midnight when hour12 is false
    if (dateParts.hour === '24') dateParts.hour = '00';
    
    const formattedTime = `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}`;
    const datetimeElem = document.getElementById('w-datetime');
    if (datetimeElem) {
        datetimeElem.innerText = formattedTime;
    }
}

// Update the time on the widget every minute
setInterval(updateWeatherTime, 60000);

async function fetchWeather() {
    try {
        var response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apikey}&q=${city}`);
        
        var data = await response.json();
        
        if (data.location && data.location.tz_id) {
            weatherTimeZone = data.location.tz_id;
        }

        document.getElementById('w-city').innerText = data.location.name;
        updateWeatherTime();
        document.getElementById('w-temp').innerText = `${data.current.temp_c}°C`;
        document.getElementById('w-condition').innerText = data.current.condition.text;
        document.getElementById('w-precip').innerText = data.current.precip_mm;
        document.getElementById('w-humidity').innerText = data.current.humidity;
        document.getElementById('w-wind').innerText = data.current.wind_kph;
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

fetchWeather()