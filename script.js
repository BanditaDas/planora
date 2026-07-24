// ---- entrance + card interactions ----

var cards = document.querySelectorAll('.elem');

cards.forEach(function (card) {
    var rot = card.getAttribute('data-rot') || 0;
    card.style.setProperty('--rot', rot + 'deg');
});

if (window.gsap) {
    gsap.set(cards, { opacity: 0, y: 40, scale: 0.92 });
    gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.6)",
        stagger: 0.09,
        delay: 0.1
    });

    cards.forEach(function (card) {
        var baseRot = parseFloat(card.getAttribute('data-rot') || 0);

        card.addEventListener('mouseenter', function () {
            gsap.to(card, { rotate: 0, y: -8, scale: 1.03, duration: 0.4, ease: "power3.out" });
        });
        card.addEventListener('mouseleave', function () {
            gsap.to(card, { rotate: baseRot, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
        });
        card.addEventListener('mousedown', function () {
            gsap.to(card, { scale: 0.97, duration: 0.15 });
        });
        card.addEventListener('mouseup', function () {
            gsap.to(card, { scale: 1.03, duration: 0.15 });
        });
    });
}

// ---- cursor-reactive blob ----

var blob = document.getElementById('blob');
if (window.gsap && blob) {
    var moveBlobX = gsap.quickTo(blob, "x", { duration: 1.2, ease: "power3.out" });
    var moveBlobY = gsap.quickTo(blob, "y", { duration: 1.2, ease: "power3.out" });

    window.addEventListener('mousemove', function (e) {
        var relX = (e.clientX / window.innerWidth - 0.5) * 120;
        var relY = (e.clientY / window.innerHeight - 0.5) * 120;
        moveBlobX(relX);
        moveBlobY(relY);
    });
}

// ---- live clock ----

function tickClock() {
    var el = document.getElementById('live-clock');
    if (!el) return;
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    el.innerText = h + ':' + m;
}
tickClock();
setInterval(tickClock, 1000 * 10);


// ---- page open / close with transitions ----

function openpg() {
    var allelem = document.querySelectorAll('.elem')
    var fullelem = document.querySelectorAll('.fullelem')
    var backbtn = document.querySelectorAll('.fullelem .back')

    function showPage(el) {
        el.style.display = 'block';
        if (window.gsap) {
            gsap.fromTo(el, { opacity: 0, y: 26, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
            var innerBits = el.querySelectorAll('h1, .page-eyebrow, .todo-container, .day-planner, .pomo-timer, .quote-card');
            gsap.fromTo(innerBits, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.06, delay: 0.08 });
        }
    }

    function hidePage(el) {
        if (window.gsap) {
            gsap.to(el, {
                opacity: 0, y: 16, scale: 0.98, duration: 0.3, ease: "power2.in",
                onComplete: function () { el.style.display = 'none'; }
            });
        } else {
            el.style.display = 'none';
        }
    }

    allelem.forEach(function (elem) {
        elem.addEventListener('click', function () {
            if (elem.id !== '' && fullelem[elem.id]) {
                showPage(fullelem[elem.id]);
                localStorage.setItem('openFullPage', elem.id);
            }
        })
    })

    backbtn.forEach(function (back) {
        back.addEventListener('click', function () {
            hidePage(fullelem[back.id]);
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

var curtask = []

if (localStorage.getItem('currentTaskList')) {
    curtask = JSON.parse(localStorage.getItem('currentTaskList'))
} else {
    console.log("Task list is empty");
}

function renderTask() {
    var alltasks = document.querySelector('.alltask')
    var sum = " "

    curtask.forEach(function (elem, index) {
        sum += `<div class="task" style="animation-delay:${index * 0.05}s">
                        ${elem.imp ? '<span class="important-mark"><i class="fa-solid fa-star"></i></span>' : ''}
                        <div class="task-details">
                            <h5>${elem.task}</h5>
                            <p>${elem.dets}</p>
                        </div>
                        <button id="${index}">complete</button>
                    </div>`
    })

    alltasks.innerHTML = sum

    var markCompleteBtn = document.querySelectorAll('.task button')
    markCompleteBtn.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var taskCard = btn.closest('.task');
            if (window.gsap && taskCard) {
                gsap.to(taskCard, {
                    opacity: 0, x: 40, duration: 0.25, ease: "power2.in",
                    onComplete: function () {
                        curtask.splice(btn.id, 1)
                        localStorage.setItem('currentTaskList', JSON.stringify(curtask))
                        renderTask()
                    }
                });
            } else {
                curtask.splice(btn.id, 1)
                localStorage.setItem('currentTaskList', JSON.stringify(curtask))
                renderTask()
            }
        })
    })
}
renderTask()

function todo() {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        curtask.push({
            task: input.value,
            dets: detsinput.value,
            imp: Checkbox.checked
        })
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

var plan = document.querySelectorAll('.day-plan-time input');

plan.forEach(function (elem) {
    elem.addEventListener('input', function () {
        dayPlanData[elem.id] = elem.value;
        localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData));
    });
});

// --- end of daily planner ---


// --- quote generator ---

const quote = document.getElementById("quote");
const author = document.getElementById("author");
const newQuoteBtn = document.getElementById("newQuoteBtn");

async function fetchQuote() {
    try {
        if (window.gsap) {
            gsap.to([quote, author], { opacity: 0, y: 8, duration: 0.2 });
        }
        quote.innerText = "Loading motivation...";
        author.innerText = "";

        const response = await fetch("https://dummyjson.com/quotes/random");
        const data = await response.json();

        quote.innerText = `"${data.quote}"`;
        author.innerText = `— ${data.author}`;

        if (window.gsap) {
            gsap.fromTo([quote, author], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" });
        }
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
const timerCard = document.querySelector(".timer-card");

let totalTime = 25 * 60;
let timeLeft = totalTime;
let timer = null;
let session = 0;
if (sessionEl) sessionEl.innerText = session;
let is50MinMode = false;

const timerTop = document.querySelector(".timer-top");
const modeBtnsContainer = document.createElement("div");
modeBtnsContainer.className = "mode-btns";

const toggleModeBtn = document.createElement("button");
toggleModeBtn.innerText = "Switch to 50 min";

const breakBtn = document.createElement("button");
breakBtn.innerText = "10 min break";

modeBtnsContainer.appendChild(toggleModeBtn);
modeBtnsContainer.appendChild(breakBtn);

if (timerTop) {
    const timerLabel = timerTop.querySelector(".timer-label");
    if (timerLabel) timerLabel.style.display = "none";
    timerTop.prepend(modeBtnsContainer);
}

toggleModeBtn.addEventListener("click", () => {
    is50MinMode = !is50MinMode;
    totalTime = is50MinMode ? 50 * 60 : 25 * 60;
    toggleModeBtn.innerText = is50MinMode ? "Switch to 25 min" : "Switch to 50 min";
    resetTimer();
});

breakBtn.addEventListener("click", () => {
    totalTime = 10 * 60;
    is50MinMode = false;
    toggleModeBtn.innerText = "Switch to 50 min";
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
        timeEl.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (progress) {
        const progressValue = timeLeft / totalTime;
        progress.style.strokeDashoffset = circumference * (1 - progressValue);
    }
}

function showCompletionMessage() {
    const msgBox = document.createElement("div");
    msgBox.innerText = "Pomodoro completed 🍅 time for a break!";
    Object.assign(msgBox.style, {
        position: "fixed",
        top: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#2a1b3d",
        color: "#fff3ea",
        padding: "1rem 2rem",
        borderRadius: "100px",
        fontWeight: "700",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "1.1rem",
        boxShadow: "0 14px 30px rgba(42,27,61,0.35)",
        zIndex: "9999"
    });
    document.body.appendChild(msgBox);

    if (window.gsap) {
        gsap.to(msgBox, { top: "40px", duration: 0.6, ease: "back.out(1.7)" });
        gsap.to(msgBox, { top: "-100px", duration: 0.5, ease: "power2.in", delay: 3.5, onComplete: () => msgBox.remove() });
    } else {
        setTimeout(() => { msgBox.style.top = "40px"; }, 100);
        setTimeout(() => { msgBox.style.top = "-100px"; setTimeout(() => msgBox.remove(), 500); }, 4000);
    }
}

function triggerCrackers() {
    if (!window.confetti) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ff6b4a', '#ff3d8a', '#d4ff3d', '#efe3ff'] });
        document.head.appendChild(script);
    } else {
        window.confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ff6b4a', '#ff3d8a', '#d4ff3d', '#efe3ff'] });
    }
}

function pulseTimerCard() {
    if (window.gsap && timerCard) {
        gsap.fromTo(timerCard, { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
}

function startTimer() {
    if (timer !== null) return;
    pulseTimerCard();

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
const defaultCity = "kolkata";
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
    parts.forEach(({ type, value }) => { dateParts[type] = value; });

    if (dateParts.hour === '24') dateParts.hour = '00';

    const formattedTime = `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}`;
    const datetimeElem = document.getElementById('w-datetime');
    if (datetimeElem) datetimeElem.innerText = formattedTime;
}

setInterval(updateWeatherTime, 60000);

async function fetchWeather(query) {
    try {
        var response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apikey}&q=${query}`);
        var data = await response.json();

        if (data.location && data.location.tz_id) {
            weatherTimeZone = data.location.tz_id;
        }

        document.getElementById('w-city').innerText = data.location.name;
        updateWeatherTime();

        const tempEl = document.getElementById('w-temp');
        if (window.gsap) {
            gsap.fromTo(tempEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        }
        tempEl.innerText = `${data.current.temp_c}°C`;
        document.getElementById('w-condition').innerText = data.current.condition.text;
        document.getElementById('w-precip').innerText = data.current.precip_mm;
        document.getElementById('w-humidity').innerText = data.current.humidity;
        document.getElementById('w-wind').innerText = data.current.wind_kph;
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
            },
            (error) => {
                console.log("Geolocation access denied or failed. Using default city.");
                fetchWeather(defaultCity);
            }
        );
    } else {
        fetchWeather(defaultCity);
    }
}

initWeather();

// --- end of weather widget ---