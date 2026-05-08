var allelem = document.querySelectorAll('.elem')
var fullelem = document.querySelectorAll ('.fullelem')

allelem.forEach(function(elem){
    elem.addEventListener('click', function(){
        
    fullelem[elem.id].style.display = 'block'
        
    })
    
})
