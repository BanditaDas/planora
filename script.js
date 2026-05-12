function openpg() {
    var allelem = document.querySelectorAll('.elem')
    var fullelem = document.querySelectorAll('.fullelem')
    var backbtn = document.querySelectorAll('.fullelem .back')

    allelem.forEach(function (elem) {
        elem.addEventListener('click', function () {

            fullelem[elem.id].style.display = 'block'

        })

    })

    backbtn.forEach(function (back) {
        back.addEventListener('click', function () {

            fullelem[back.id].style.display = 'none'

        })
    })



}
openpg()

var form = document.querySelector('.addTask form')
var input = document.querySelector('.addTask form input')
var detsinput = document.querySelector('.addTask form textarea')
var Checkbox = document.querySelector('.addTask form input[type="checkbox"]')

var curtask = [
    {
        task: 'task1',
        dets: 'dets1',
        imp: true
    },
    {
        task: 'task2',
        dets: 'dets2',
        imp: false
    },
    {
        task: 'task3',
        dets: 'dets3',
        imp: true
    }
]



function renderTask() {
    var alltasks = document.querySelector('.alltask')

    var sum = " "

    curtask.forEach(function (elem) {
        sum += `<div class="task">
                        ${elem.imp ? '<span class="important-mark"><i class="fa-solid fa-star"></i></span>' : ''}
                        <div class="task-details">
                            <h5>${elem.task}</h5>
                            <p>${elem.dets}</p>
                        </div>
                        <button>complete </button>
                    </div>`

    })

    alltasks.innerHTML = sum
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
    input.value = ''
    detsinput.value = ''
    Checkbox.checked = false

    
    renderTask()
    
})