
// Strcutral
import Manifest         from '../manifest'
import Camera           from './camera'
import OrbitControl     from './orbitControl'
import TextureLoader    from './textureLoader'
import FBO              from './fbo'

// Components
import VoxelField       from './voxel'
import Plane            from './plane'
import Points           from './pointsCloud'

// Libs
import glmat            from 'gl-matrix'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

class Scene {

    constructor(){
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.active = false
        this.time = 0
        
        this.canvas = document.createElement('canvas')
        
        this.catchContext()
        TextureLoader.init(this)
        this.loadTexture()

        this.camera = new Camera(this, 45)
        this.orbit = new OrbitControl(this)
        this.plane = new Plane(this)
        this.points = new Points(this)

        this.voxelFBO = new FBO(this, {
            width: 1000,
            heigth: 100,
        })
        this.voxel = new VoxelField(this)

    }

    catchContext(){

        document.querySelector('#container').appendChild(this.canvas)
        this.canvas.width = this.width
        this.canvas.height = this.height

        this.gl = this.canvas.getContext('webgl2', {
            antialias: true
        })
        if (this.gl == undefined) { return }

    }

    onLoaded(){
        this.active = true
        // setTimeout(() => {
        //     this.points.create()
        // }, 2000);
    }

    loadTexture(){        
        TextureLoader.load(Manifest.testTexture, 'testTexture')
        .then(TextureLoader.load(Manifest.heightMap, 'heightMap'))
        .then(()=> { this.onLoaded() })
    }

    preRender(){
        let gl = this.gl

        // Voxel Array's Vectors field
        this.voxelFBO.prepare()
        this.voxel.render()
        this.voxelFBO.clean()

        
    }

    render(){
        
        if (!this.active) { return }    
        this.time += .01    

        let gl = this.gl
        
        this.camera.updatePositionMatrix()
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.colorMask(true, true, true, true)
        
        // this.preRender()

        gl.viewport(0, 0, this.width, this.height)
        
        this.orbit.update()
        this.camera.updateProjection(this.width / this.height)
        this.camera.lookAt(vec3.fromValues(0, 0, 0))        

        // this.plane.render()
        this.points.render()

    }

}
const out = new Scene()
export default out