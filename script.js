function openpg(){
    var allelem = document.querySelectorAll('.elem')
var fullelem = document.querySelectorAll ('.fullelem')
var backbtn = document.querySelectorAll('.fullelem .back')

allelem.forEach(function(elem){
    elem.addEventListener('click', function(){
        
    fullelem[elem.id].style.display = 'block'
        
    })
    
})
 
backbtn.forEach(function(back){
    back.addEventListener('click', function(){
        
    fullelem[back.id].style.display = 'none'
        
    })
})    
    
 

}
openpg()