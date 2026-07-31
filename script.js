var reduceMotion = localStorage.getItem('planora_reduceMotion') === '1';
function canAnimate() { return window.gsap && !reduceMotion; }

// ---------------- sidebar navigation ----------------

var navItems = document.querySelectorAll('.nav-item');
var views = document.querySelectorAll('.view');
var indicator = document.getElementById('nav-indicator');
var viewTitle = document.getElementById('view-title');
var mainNavList = document.querySelectorAll('.nav .nav-item');

function moveIndicator(target) {
    if (!indicator || !target || target.closest('.nav') === null) return;
    var navRect = target.parentElement.getBoundingClientRect();
    var itemRect = target.getBoundingClientRect();
    var top = itemRect.top - navRect.top;
    if (canAnimate()) {
        gsap.to(indicator, { y: top, duration: 0.4, ease: "power3.out" });
    } else {
        indicator.style.transform = "translateY(" + top + "px)";
    }
}

function switchView(name, clickedEl) {
    views.forEach(function (v) { v.classList.remove('active'); });
    var target = document.getElementById('view-' + name);
    if (!target) return;
    target.classList.add('active');

    if (canAnimate()) {
        gsap.fromTo(target, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        var cards = target.querySelectorAll('.card');
        gsap.fromTo(cards, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05, delay: 0.05 });
    }

    navItems.forEach(function (n) { n.classList.remove('active'); });
    var navBtn = document.querySelector('.nav-item[data-view="' + name + '"]');
    if (navBtn) {
        navBtn.classList.add('active');
        if (navBtn.closest('.nav')) moveIndicator(navBtn);
    }

    viewTitle.innerText = navBtn ? navBtn.querySelector('span').innerText : name;

    if (name === 'stats') renderStats();
}

document.querySelectorAll('[data-view]').forEach(function (el) {
    el.addEventListener('click', function () {
        switchView(el.getAttribute('data-view'), el);
    });
});

window.addEventListener('load', function () {
    var active = document.querySelector('.nav-item.active');
    moveIndicator(active);
});
window.addEventListener('resize', function () {
    var active = document.querySelector('.nav-item.active');
    moveIndicator(active);
});

// ---------------- live clock ----------------

function tickClock() {
    var clockEl = document.getElementById('live-clock');
    var dateEl = document.getElementById('live-date');
    if (!clockEl) return;
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    clockEl.innerText = h + ':' + m;
    if (dateEl) {
        dateEl.innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
}
tickClock();
setInterval(tickClock, 1000 * 10);

// ---------------- streak ----------------

(function trackStreak() {
    var today = new Date().toDateString();
    var lastOpen = localStorage.getItem('planora_lastOpen');
    var streak = parseInt(localStorage.getItem('planora_streak') || '0', 10);

    if (lastOpen !== today) {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastOpen === yesterday.toDateString()) {
            streak += 1;
        } else {
            streak = 1;
        }
        localStorage.setItem('planora_streak', streak);
        localStorage.setItem('planora_lastOpen', today);
    }

    var el = document.getElementById('streak-count');
    if (el) el.innerText = streak;
})();

// ---------------- tasks ----------------

var taskListEl = document.getElementById('taskList');
var addTaskForm = document.getElementById('addTaskForm');
var taskInput = document.getElementById('taskInput');
var taskImportant = document.getElementById('taskImportant');
var tasksCountEl = document.getElementById('tasks-count');

var tasks = JSON.parse(localStorage.getItem('planora_tasks') || '[]');
var completedTotal = parseInt(localStorage.getItem('planora_completedTotal') || '0', 10);
var weekCompletions = JSON.parse(localStorage.getItem('planora_weekCompletions') || '{}');

var completedToday = 0;
var completedTasksToday = [];
(function initTodayCompletions() {
    var today = new Date().toDateString();
    var storedDate = localStorage.getItem('planora_completedDate');
    if (storedDate !== today) {
        localStorage.setItem('planora_completedDate', today);
        localStorage.setItem('planora_completedToday', '0');
        localStorage.setItem('planora_completedTasksToday', '[]');
        completedToday = 0;
        completedTasksToday = [];
    } else {
        completedToday = parseInt(localStorage.getItem('planora_completedToday') || '0', 10);
        completedTasksToday = JSON.parse(localStorage.getItem('planora_completedTasksToday') || '[]');
    }
})();

function saveTasks() { localStorage.setItem('planora_tasks', JSON.stringify(tasks)); }

function renderTasks() {
    if (!taskListEl) return;
    taskListEl.innerHTML = '';
    tasks.forEach(function (t, i) {
        var row = document.createElement('div');
        row.className = 'task' + (t.imp ? ' imp' : '');
        row.innerHTML =
            '<span class="task-check" data-i="' + i + '"></span>' +
            '<div class="task-details"><h5>' + t.task + '</h5>' + (t.dets ? '<p>' + t.dets + '</p>' : '') + '</div>' +
            '<button class="task-remove" data-i="' + i + '"><i class="ri-close-line"></i></button>';
        taskListEl.appendChild(row);
    });

    taskListEl.querySelectorAll('.task-check').forEach(function (chk) {
        chk.addEventListener('click', function () { completeTask(parseInt(chk.getAttribute('data-i'), 10)); });
    });
    taskListEl.querySelectorAll('.task-remove').forEach(function (btn) {
        btn.addEventListener('click', function () { removeTask(parseInt(btn.getAttribute('data-i'), 10)); });
    });

    if (tasksCountEl) tasksCountEl.innerText = tasks.length + (tasks.length === 1 ? ' left' : ' left');
    updateProgressRing();
    renderAllTasksView();
}

function renderAllTasksView() {
    var activeEl = document.getElementById('activeTaskList');
    var completedEl = document.getElementById('completedTaskList');
    var countEl = document.getElementById('alltasks-count');
    if (!activeEl || !completedEl) return;

    activeEl.innerHTML = '';
    tasks.forEach(function (t, i) {
        var row = document.createElement('div');
        row.className = 'task' + (t.imp ? ' imp' : '');
        row.innerHTML =
            '<span class="task-check" data-i="' + i + '"></span>' +
            '<div class="task-details"><h5>' + t.task + '</h5>' + (t.dets ? '<p>' + t.dets + '</p>' : '') + '</div>' +
            '<button class="task-remove" data-i="' + i + '"><i class="ri-close-line"></i></button>';
        activeEl.appendChild(row);
    });
    activeEl.querySelectorAll('.task-check').forEach(function (chk) {
        chk.addEventListener('click', function () { completeTask(parseInt(chk.getAttribute('data-i'), 10)); });
    });
    activeEl.querySelectorAll('.task-remove').forEach(function (btn) {
        btn.addEventListener('click', function () { removeTask(parseInt(btn.getAttribute('data-i'), 10)); });
    });

    completedEl.innerHTML = '';
    completedTasksToday.forEach(function (t, i) {
        var row = document.createElement('div');
        row.className = 'task done-task' + (t.imp ? ' imp' : '');
        row.innerHTML =
            '<span class="task-check done" data-i="' + i + '"><i class="ri-check-line"></i></span>' +
            '<div class="task-details"><h5>' + t.task + '</h5>' + (t.dets ? '<p>' + t.dets + '</p>' : '') + '</div>' +
            '<button class="task-restore" data-i="' + i + '" title="Move back to active"><i class="ri-arrow-go-back-line"></i></button>' +
            '<button class="task-remove" data-i="' + i + '"><i class="ri-close-line"></i></button>';
        completedEl.appendChild(row);
    });
    completedEl.querySelectorAll('.task-restore').forEach(function (btn) {
        btn.addEventListener('click', function () { restoreTask(parseInt(btn.getAttribute('data-i'), 10)); });
    });
    completedEl.querySelectorAll('.task-remove').forEach(function (btn) {
        btn.addEventListener('click', function () { removeCompletedTask(parseInt(btn.getAttribute('data-i'), 10)); });
    });

    if (countEl) countEl.innerText = (tasks.length + completedTasksToday.length) + ' total';
}

function completeTask(i) {
    var row = taskListEl.children[i];
    var finish = function () {
        var doneTask = tasks.splice(i, 1)[0];
        saveTasks();
        completedTotal += 1;
        localStorage.setItem('planora_completedTotal', completedTotal);

        completedToday += 1;
        localStorage.setItem('planora_completedToday', completedToday);

        completedTasksToday.push(doneTask);
        localStorage.setItem('planora_completedTasksToday', JSON.stringify(completedTasksToday));

        var day = new Date().toLocaleDateString(undefined, { weekday: 'short' });
        weekCompletions[day] = (weekCompletions[day] || 0) + 1;
        localStorage.setItem('planora_weekCompletions', JSON.stringify(weekCompletions));

        renderTasks();
    };
    if (canAnimate() && row) {
        gsap.to(row, { opacity: 0, x: 24, duration: 0.25, ease: "power2.in", onComplete: finish });
    } else {
        finish();
    }
}

function restoreTask(i) {
    var restored = completedTasksToday.splice(i, 1)[0];
    localStorage.setItem('planora_completedTasksToday', JSON.stringify(completedTasksToday));

    completedToday = Math.max(0, completedToday - 1);
    localStorage.setItem('planora_completedToday', completedToday);

    if (restored) {
        tasks.push(restored);
        saveTasks();
    }
    renderTasks();
}

function removeCompletedTask(i) {
    completedTasksToday.splice(i, 1);
    localStorage.setItem('planora_completedTasksToday', JSON.stringify(completedTasksToday));
    renderAllTasksView();
}

function removeTask(i) {
    tasks.splice(i, 1);
    saveTasks();
    renderTasks();
}

if (addTaskForm) {
    addTaskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!taskInput.value.trim()) return;
        tasks.push({ task: taskInput.value.trim(), dets: '', imp: taskImportant.checked });
        saveTasks();
        taskInput.value = '';
        taskImportant.checked = false;
        renderTasks();
    });
}

function updateProgressRing() {
    var ring = document.getElementById('progress-ring');
    var percentEl = document.getElementById('ring-percent');
    if (!ring) return;
    var total = completedToday + tasks.length;
    var pct = total === 0 ? 0 : Math.round((completedToday / total) * 100);
    var circumference = 314;
    var offset = circumference - (circumference * pct) / 100;
    if (canAnimate()) {
        gsap.to(ring, { strokeDashoffset: offset, duration: 0.7, ease: "power2.out" });
    } else {
        ring.style.strokeDashoffset = offset;
    }
    if (percentEl) percentEl.innerText = pct + '%';
}

renderTasks();

// ---------------- inbox ----------------

var inboxListEl = document.getElementById('inboxList');
var addInboxForm = document.getElementById('addInboxForm');
var inboxInput = document.getElementById('inboxInput');
var inboxItems = JSON.parse(localStorage.getItem('planora_inbox') || '[]');

function renderInbox() {
    if (!inboxListEl) return;
    inboxListEl.innerHTML = '';
    inboxItems.forEach(function (item, i) {
        var row = document.createElement('div');
        row.className = 'task';
        row.innerHTML =
            '<div class="task-details"><h5>' + item + '</h5></div>' +
            '<button class="task-remove" data-i="' + i + '"><i class="ri-close-line"></i></button>';
        inboxListEl.appendChild(row);
    });
    inboxListEl.querySelectorAll('.task-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            inboxItems.splice(parseInt(btn.getAttribute('data-i'), 10), 1);
            localStorage.setItem('planora_inbox', JSON.stringify(inboxItems));
            renderInbox();
        });
    });
}

if (addInboxForm) {
    addInboxForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!inboxInput.value.trim()) return;
        inboxItems.push(inboxInput.value.trim());
        localStorage.setItem('planora_inbox', JSON.stringify(inboxItems));
        inboxInput.value = '';
        renderInbox();
    });
}
renderInbox();

// ---------------- day planner (calendar view) ----------------

var dayPlanData = JSON.parse(localStorage.getItem('planora_dayPlan') || '{}');
var plannerEl = document.getElementById('dayPlanner');

if (plannerEl) {
    Array.from({ length: 20 }, function (_, i) { return i + 5; }).forEach(function (hour, idx) {
        var displayHour = hour > 12 ? hour - 12 : hour;
        var period = hour >= 12 ? 'PM' : 'AM';

        var el = document.createElement('div');
        el.className = 'day-plan-time';
        el.innerHTML =
            '<p>' + displayHour + ':00 ' + period + '</p>' +
            '<input id="dp-' + idx + '" type="text" placeholder=" " value="' + (dayPlanData[idx] || '') + '">';
        plannerEl.appendChild(el);
    });

    plannerEl.querySelectorAll('input').forEach(function (input, idx) {
        input.addEventListener('input', function () {
            dayPlanData[idx] = input.value;
            localStorage.setItem('planora_dayPlan', JSON.stringify(dayPlanData));
        });
    });
}

// ---------------- sticky notes ----------------

var notesWidget = document.getElementById('notesWidget');
var saveNoteBtn = document.getElementById('saveNoteBtn');
var stickyGrid = document.getElementById('stickyGrid');

var stickyNotes = JSON.parse(localStorage.getItem('planora_stickyNotes') || '[]');
var notesDraft = localStorage.getItem('planora_notesDraft') || '';
if (notesWidget) notesWidget.value = notesDraft;

if (notesWidget) {
    notesWidget.addEventListener('input', function () {
        localStorage.setItem('planora_notesDraft', notesWidget.value);
    });
}

function renderStickyNotes() {
    if (!stickyGrid) return;
    if (stickyNotes.length === 0) {
        stickyGrid.innerHTML = '<p class="sticky-empty">No notes saved yet — jot one on the Today dashboard.</p>';
        return;
    }
    stickyGrid.innerHTML = '';
    stickyNotes.slice().reverse().forEach(function (note, revI) {
        var i = stickyNotes.length - 1 - revI;
        var time = new Date(note.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        var el = document.createElement('div');
        el.className = 'sticky-note';
        el.innerHTML =
            '<button class="sticky-remove" data-i="' + i + '"><i class="ri-close-line"></i></button>' +
            '<div class="sticky-text"></div>' +
            '<span class="sticky-time">' + time + '</span>';
        el.querySelector('.sticky-text').innerText = note.text;
        stickyGrid.appendChild(el);
    });

    stickyGrid.querySelectorAll('.sticky-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var idx = parseInt(btn.getAttribute('data-i'), 10);
            var card = btn.closest('.sticky-note');
            var finish = function () {
                stickyNotes.splice(idx, 1);
                localStorage.setItem('planora_stickyNotes', JSON.stringify(stickyNotes));
                renderStickyNotes();
            };
            if (canAnimate() && card) {
                gsap.to(card, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in", onComplete: finish });
            } else {
                finish();
            }
        });
    });

    if (canAnimate()) {
        gsap.fromTo(stickyGrid.querySelectorAll('.sticky-note'), { opacity: 0, y: 10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.04, ease: "power2.out" });
    }
}
renderStickyNotes();

function saveNote() {
    if (!notesWidget || !notesWidget.value.trim()) return;
    stickyNotes.push({ text: notesWidget.value.trim(), ts: Date.now() });
    localStorage.setItem('planora_stickyNotes', JSON.stringify(stickyNotes));

    notesWidget.value = '';
    localStorage.setItem('planora_notesDraft', '');
    renderStickyNotes();

    if (canAnimate() && saveNoteBtn) {
        gsap.fromTo(saveNoteBtn, { scale: 1 }, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
}
if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNote);

// ---------------- end of sticky notes ----------------

// ---------------- quote generator ----------------

var quoteEl = document.getElementById('quote');
var authorEl = document.getElementById('author');
var newQuoteBtn = document.getElementById('newQuoteBtn');

async function fetchQuote() {
    if (!quoteEl) return;
    try {
        if (canAnimate()) gsap.to([quoteEl, authorEl], { opacity: 0, y: 6, duration: 0.15 });
        quoteEl.innerText = "Loading motivation...";
        authorEl.innerText = "";

        var response = await fetch("https://dummyjson.com/quotes/random");
        var data = await response.json();

        quoteEl.innerText = '"' + data.quote + '"';
        authorEl.innerText = "— " + data.author;

        if (canAnimate()) gsap.fromTo([quoteEl, authorEl], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 });
    } catch (err) {
        quoteEl.innerText = "Failed to load quote.";
        authorEl.innerText = "Please try again.";
    }
}
fetchQuote();
if (newQuoteBtn) newQuoteBtn.addEventListener('click', fetchQuote);

// ---------------- pomodoro ----------------

var timeEl = document.getElementById("time");
var pomoProgress = document.getElementById("pomo-progress");
var startBtn = document.getElementById("start");
var pauseBtn = document.getElementById("pause");
var resetBtn = document.getElementById("reset");
var sessionEl = document.getElementById("session");
var mode25 = document.getElementById("mode25");
var mode50 = document.getElementById("mode50");
var pomoCard = document.querySelector(".pomodoro-card");

var totalTime = 25 * 60;
var timeLeft = totalTime;
var timer = null;
var session = 1;
if (sessionEl) sessionEl.innerText = session;

var radius = 60;
var circumference = 2 * Math.PI * radius;
if (pomoProgress) {
    pomoProgress.style.strokeDasharray = circumference;
    pomoProgress.style.strokeDashoffset = 0;
}

function buildTimerDigits(text) {
    if (!timeEl) return;
    timeEl.innerHTML = '';
    text.split('').forEach(function (ch) {
        var cell = document.createElement('span');
        cell.className = 'digit-cell' + (ch === ':' ? ' colon' : '');
        var inner = document.createElement('span');
        inner.className = 'digit-inner';
        inner.textContent = ch;
        cell.appendChild(inner);
        timeEl.appendChild(cell);
    });
}

function setTimerDigits(text) {
    if (!timeEl) return;
    var cells = timeEl.querySelectorAll('.digit-cell');
    if (cells.length !== text.length) { buildTimerDigits(text); return; }

    text.split('').forEach(function (ch, i) {
        var inner = cells[i].querySelector('.digit-inner');
        if (!inner || inner.textContent === ch) return;

        if (canAnimate()) {
            gsap.to(inner, {
                y: '-100%', opacity: 0, duration: 0.16, ease: "power1.in",
                onComplete: function () {
                    inner.textContent = ch;
                    gsap.fromTo(inner, { y: '70%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.22, ease: "power2.out" });
                }
            });
        } else {
            inner.textContent = ch;
        }
    });
}

function updatePomoDisplay() {
    if (timeEl) {
        var minutes = Math.floor(timeLeft / 60);
        var seconds = timeLeft % 60;
        var text = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
        if (timeEl.children.length === 0) {
            buildTimerDigits(text);
        } else {
            setTimerDigits(text);
        }
    }
    if (pomoProgress) {
        var progressValue = timeLeft / totalTime;
        pomoProgress.style.strokeDashoffset = circumference * (1 - progressValue);
    }
}

function setMode(minutes, btn) {
    totalTime = minutes * 60;
    [mode25, mode50].forEach(function (b) { if (b) b.classList.remove('mode-active'); });
    if (btn) btn.classList.add('mode-active');
    resetPomo();
}
if (mode25) mode25.addEventListener('click', function () { setMode(25, mode25); });
if (mode50) mode50.addEventListener('click', function () { setMode(50, mode50); });

function showCompletionMessage() {
    var msgBox = document.createElement("div");
    msgBox.innerText = "Pomodoro complete — take a break!";
    Object.assign(msgBox.style, {
        position: "fixed", top: "-100px", left: "50%", transform: "translateX(-50%)",
        background: "#2A3427", color: "#fff", padding: "0.9rem 1.6rem", borderRadius: "100px",
        fontWeight: "700", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.95rem",
        boxShadow: "0 14px 30px rgba(0,0,0,0.3)", zIndex: "9999"
    });
    document.body.appendChild(msgBox);

    if (canAnimate()) {
        gsap.to(msgBox, { top: "24px", duration: 0.5, ease: "back.out(1.7)" });
        gsap.to(msgBox, { top: "-100px", duration: 0.4, ease: "power2.in", delay: 3, onComplete: function () { msgBox.remove(); } });
    } else {
        setTimeout(function () { msgBox.style.top = "24px"; }, 100);
        setTimeout(function () { msgBox.remove(); }, 3500);
    }
}

function triggerCrackers() {
    if (!window.confetti) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = function () { window.confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#6B8F71', '#C98A54', '#A7C4A0'] }); };
        document.head.appendChild(script);
    } else {
        window.confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#6B8F71', '#C98A54', '#A7C4A0'] });
    }
}

function pulsePomoCard() {
    if (canAnimate() && pomoCard) {
        gsap.fromTo(pomoCard, { scale: 1 }, { scale: 1.02, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
}

function startPomo() {
    if (timer !== null) return;
    pulsePomoCard();
    if (timeLeft > 0) { timeLeft--; updatePomoDisplay(); }

    timer = setInterval(function () {
        if (timeLeft > 0) {
            timeLeft--;
            updatePomoDisplay();
        } else {
            clearInterval(timer);
            timer = null;
            session++;
            if (sessionEl) sessionEl.innerText = session;
            setTimeout(function () { showCompletionMessage(); triggerCrackers(); resetPomo(); }, 50);
        }
    }, 1000);
}

function pausePomo() { clearInterval(timer); timer = null; }

function resetPomo() {
    clearInterval(timer);
    timer = null;
    timeLeft = totalTime;
    if (pomoProgress) pomoProgress.style.transition = "none";
    updatePomoDisplay();
    setTimeout(function () { if (pomoProgress) pomoProgress.style.transition = "stroke-dashoffset 1s linear"; }, 50);
}

if (startBtn) startBtn.addEventListener("click", startPomo);
if (pauseBtn) pauseBtn.addEventListener("click", pausePomo);
if (resetBtn) resetBtn.addEventListener("click", resetPomo);
updatePomoDisplay();

// ---------------- weather ----------------

var apikey = 'b2396b3dd79f47c3b5f41751262405';
var defaultCity = "kolkata";

async function fetchWeather(query) {
    try {
        var response = await fetch("https://api.weatherapi.com/v1/current.json?key=" + apikey + "&q=" + query);
        var data = await response.json();

        var cityEl = document.getElementById('w-city');
        var tempEl = document.getElementById('w-temp');
        if (cityEl) cityEl.innerText = data.location.name;
        if (tempEl) {
            if (canAnimate()) gsap.fromTo(tempEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
            tempEl.innerText = data.current.temp_c + "°";
        }
        var condEl = document.getElementById('w-condition');
        if (condEl) condEl.innerText = data.current.condition.text;
    } catch (err) {
        console.error("weather error", err);
    }
}

function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (pos) { fetchWeather(pos.coords.latitude + "," + pos.coords.longitude); },
            function () { fetchWeather(defaultCity); }
        );
    } else {
        fetchWeather(defaultCity);
    }
}
initWeather();

// ---------------- stats ----------------

function renderStats() {
    var completedEl = document.getElementById('stat-completed');
    var activeEl = document.getElementById('stat-active');
    var rateEl = document.getElementById('stat-rate');
    var chart = document.getElementById('barChart');
    if (completedEl) completedEl.innerText = completedTotal;
    if (activeEl) activeEl.innerText = tasks.length;
    var total = completedTotal + tasks.length;
    if (rateEl) rateEl.innerText = (total === 0 ? 0 : Math.round((completedTotal / total) * 100)) + '%';

    if (chart) {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var max = Math.max(1, Object.values(weekCompletions).reduce(function (a, b) { return Math.max(a, b); }, 1));
        chart.innerHTML = '';
        days.forEach(function (d) {
            var val = weekCompletions[d] || 0;
            var col = document.createElement('div');
            col.className = 'bar-col';
            var barHeight = Math.max(4, (val / max) * 100);
            col.innerHTML = '<div class="bar" style="height:' + barHeight + '%"></div><span class="bar-day">' + d + '</span>';
            chart.appendChild(col);
        });
    }
}

// ---------------- settings ----------------

var darkToggle = document.getElementById('darkToggle');
var motionToggle = document.getElementById('motionToggle');

var savedTheme = localStorage.getItem('planora_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (darkToggle) darkToggle.checked = savedTheme === 'dark';
if (motionToggle) motionToggle.checked = reduceMotion;

if (darkToggle) {
    darkToggle.addEventListener('change', function () {
        var theme = darkToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('planora_theme', theme);
    });
}
if (motionToggle) {
    motionToggle.addEventListener('change', function () {
        reduceMotion = motionToggle.checked;
        localStorage.setItem('planora_reduceMotion', reduceMotion ? '1' : '0');
    });
}

// ---------------- entrance ----------------

window.addEventListener('load', function () {
    if (canAnimate()) {
        var cards = document.querySelectorAll('#view-today .card');
        gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.08 });
        var navBtns = document.querySelectorAll('.nav-item');
        gsap.fromTo(navBtns, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.04 });
    }
});