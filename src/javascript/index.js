import RAF from './raf'

import MotionField from './motionfield/motionfield'
import Scene from './glxp/scene'

RAF.suscribe('motion field', MotionField.update.bind(MotionField))
RAF.suscribe('scene', Scene.render.bind(Scene))


let gui = document.querySelector('.dg')
let canvasMotion = document.querySelector('.camvelocity')
let button = document.querySelector('.button')
let activeDebug = true

button.addEventListener('click', ()=>{
    toggleDebug()
})

function toggleDebug(){
    if (activeDebug) {
        gui.classList.add('hidden')
        canvasMotion.classList.add('hidden')
        button.textContent = 'Play with the params'
        activeDebug = false
    } else {
        gui.classList.remove('hidden')
        canvasMotion.classList.remove('hidden')
        button.textContent = 'Hide the params'
        activeDebug = true
    }
}
toggleDebug()

// console.log("YO !");
