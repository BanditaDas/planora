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

var form = document.querySelector('.addTask form')
var input = document.querySelector('.addTask form input')
var detsinput = document.querySelector('.addTask form textarea')
var Checkbox = document.querySelector('.addTask form input[type="checkbox"]')

var curtask = [
    
]

if(localStorage.getItem('currentTaskList')){
    curtask = JSON.parse(localStorage.getItem('currentTaskList'))
    
}else{
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
    markCompleteBtn.forEach(function(btn){
        btn.addEventListener("click", function(){
            curtask.splice(btn.id, 1)
            localStorage.setItem('currentTaskList', JSON.stringify(curtask))
            renderTask()
        })
    })
}
renderTask()


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