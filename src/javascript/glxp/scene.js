
// Strcutral
import Manifest         from '../manifest'
import Camera           from './camera'
import OrbitControl     from './orbitControl'
import TextureLoader    from './textureLoader'
import dat              from 'dat.gui'
import MotionField from '../motionfield/motionfield'

// Components
import Points           from './pointsCloud'
import Ground           from './ground'
import Bloom            from './postEffect'

// Libs
import glmat            from 'gl-matrix'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

class Scene {

    constructor(){
        this.dpr      = window.devicePixelRatio
        this.width    = window.innerWidth
        this.height   = window.innerHeight
        this.active   = false
        this.time     = 0
        this.ratio    = this.width / this.height

        this.initGui()
        
        this.canvas   = document.createElement('canvas')
        
        this.catchContext()

        this.camera   = new Camera(this, 45)
        this.orbit    = new OrbitControl(this)
        this.points   = new Points(this)
        this.ground   = new Ground(this)
        this.bloom = new Bloom(this)

        this.active = true

    }

    initGui(){
        this.gui = new dat.GUI()
        this.gui.open()
        let tmp = this.gui.addFolder('Motion detect')
        tmp.open()
        tmp.add(MotionField, 'threshold', 0, 255, 1)
        let defCtrl = tmp.add(MotionField, 'definition', 0, 720, 1)
        defCtrl.onFinishChange(function (value) {
            MotionField.changeDefinition(value)
        })

    }

    catchContext(){

        document.querySelector('#container').appendChild(this.canvas)
        this.canvas.width = this.width * this.dpr
        this.canvas.height = this.height * this.dpr
        this.canvas.style.maxWidth = this.width + "px"
        this.canvas.style.maxHeight = this.height + "px"

        this.gl = this.canvas.getContext('webgl2', {
            antialias: this.dpr < 1.5
        })
        if (this.gl == undefined) { return }

    }

    preRender(){
        let gl = this.gl

        // Voxel Array's Vectors field
        this.voxelFBO.prepare()
        this.voxel.render()
        this.voxelFBO.clean()

        
    }

    postRender(){

        this.bloom.prepare()
        this.points.postRender()
        this.bloom.render()

    }

    render(){
        
        if (!this.active) { return }    
        this.time += .01    

        let gl = this.gl
        
        this.camera.updatePositionMatrix()
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.colorMask(true, true, true, true)
        
        // this.preRender()

        gl.viewport(0, 0, this.width * this.dpr, this.height * this.dpr)
        
        this.orbit.update()
        this.camera.updateProjection(this.ratio)
        this.camera.lookAt(vec3.fromValues(0, 0, 0))        

        this.ground.render()
        this.points.render()


        this.postRender()

    }

}
const out = new Scene()
export default out