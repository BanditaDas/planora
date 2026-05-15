function openpg() {
    var allelem = document.querySelectorAll('.elem')
    var fullelem = document.querySelectorAll('.fullelem')
    var backbtn = document.querySelectorAll('.fullelem .back')

    allelem.forEach(function (elem) {
        elem.addEventListener('click', function () {

            fullelem[elem.id].style.display = 'block'
            localStorage.setItem('openFullPage', elem.id)

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

let totalTime = 25 * 60;
let timeLeft = totalTime;
let timer = null;
let session = 1;

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

            // Tiny delay ensures the browser paints 00:00 before the alert pops up
            setTimeout(() => {
                alert("Pomodoro Completed 🍅");
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