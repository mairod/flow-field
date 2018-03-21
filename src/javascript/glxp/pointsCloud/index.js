import Layer from './layer'
import glmat from 'gl-matrix'
import MotionField from '../../motionfield/motionfield'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

let M4 = mat4.create()

class Factory {
    constructor(scene){

        this.scene      = scene
        this.gl         = scene.gl
        this.layers     = []

        this.position   = vec3.fromValues(0, 0, 0)
        this.scale      = vec3.fromValues(.05 * -1.33, .05, .05)
        this.rotation   = vec3.fromValues(0, -Math.PI / 2, Math.PI)
        this.quaternion = quat.create()
        this.matrix     = mat4.create()

        this.debugPrint = document.querySelector('.debugPrint')

        this.params = {
            exposure: 1.2,
            particleSize: 1.25,
            discRadius: 0.35,
            discFade: 0.1,
            hueShift: 2.25,
            colorPass: [1, 0., 0.]
        }

        this.initProgram()

        this.create = this.create.bind(this)

        MotionField.on('update', ()=>{
            this.create()
        })

        this.gui = this.scene.gui.addFolder('Particles')
        this.gui.add(this.params, 'exposure', -1, 2, .001)
        this.gui.add(this.params, 'particleSize', 0, 2, .01)
        this.gui.add(this.params, 'discRadius', 0, 1, .01)
        this.gui.add(this.params, 'discFade', 0, 1, .01)
        this.gui.add(this.params, 'hueShift', 0, Math.PI * 2, .01)
        this.gui.open()

    }

    create(){
        let layer = new Layer(this)        
        if (layer.length > 0){
            this.layers.push(layer)
        }
    }


    initProgram() {

        let vert = require('../../../shaders/particle.vert')
        let frag = require('../../../shaders/particle.frag')

        let gl = this.gl

        let vertSahder = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertSahder, vert)
        gl.compileShader(vertSahder)

        let fragSahder = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragSahder, frag)
        gl.compileShader(fragSahder)

        if (!gl.getShaderParameter(vertSahder, gl.COMPILE_STATUS)) {
            console.error('error vert', gl.getShaderInfoLog(vertSahder))
            return null
        }

        if (!gl.getShaderParameter(fragSahder, gl.COMPILE_STATUS)) {
            console.error('error frag', gl.getShaderInfoLog(fragSahder))
            return null
        }

        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertSahder)
        gl.attachShader(shaderProgram, fragSahder)
        gl.transformFeedbackVaryings(shaderProgram, ["vPositiions"], gl.SEPARATE_ATTRIBS)
        gl.linkProgram(shaderProgram)   

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(shaderProgram);
            console.error("Could not initialise shaders", info);
        }

        gl.useProgram(shaderProgram)

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPos")
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
        shaderProgram.directionAttribute      = gl.getAttribLocation(shaderProgram, "aDirs")
        gl.enableVertexAttribArray(shaderProgram.directionAttribute)
        shaderProgram.colorsAttribute         = gl.getAttribLocation(shaderProgram, "aColors")
        gl.enableVertexAttribArray(shaderProgram.colorsAttribute)

        shaderProgram.pMatrixUniform     = gl.getUniformLocation(shaderProgram, "uMVP")
        shaderProgram.uTimeUniform       = gl.getUniformLocation(shaderProgram, "uTime")
        shaderProgram.uDprUniform        = gl.getUniformLocation(shaderProgram, "uDpr")
        shaderProgram.uExposureUniform   = gl.getUniformLocation(shaderProgram, "uExposure")
        shaderProgram.uSizeUniform       = gl.getUniformLocation(shaderProgram, "uSize")
        shaderProgram.uDiscradiusUniform = gl.getUniformLocation(shaderProgram, "uDiscradius")
        shaderProgram.uBorderUniform     = gl.getUniformLocation(shaderProgram, "uBorder")
        shaderProgram.uHueShiftUniform   = gl.getUniformLocation(shaderProgram, "uHueShift")
        shaderProgram.uPostPassUniform   = gl.getUniformLocation(shaderProgram, "uPostPass")

        this.vertShader = vertSahder
        this.fragSahder = fragSahder
        this.program = shaderProgram
        
    }

    setMatrixUniforms() {
        mat4.mul(M4, this.scene.camera.getProjectionMatrix(), this.scene.camera.getViewMatrix())
        mat4.mul(M4, M4, this.matrix)
        this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, M4)        
    }

    updatePositionMatrix() {
        let gl = this.gl
        mat4.identity(this.matrix)
        this.quaternion = quat.create()
        quat.rotateX(this.quaternion, this.quaternion, this.rotation[0])
        quat.rotateY(this.quaternion, this.quaternion, this.rotation[1])
        quat.rotateZ(this.quaternion, this.quaternion, this.rotation[2])
        mat4.fromRotationTranslationScale(this.matrix, this.quaternion, this.position, this.scale)
    }

    delete(){
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].kill()
        }
    }

    bind(){
        let gl = this.gl
        gl.uniform1f(this.program.uDprUniform,          this.scene.dpr)
        gl.uniform1f(this.program.uExposureUniform,     this.params.exposure)
        gl.uniform1f(this.program.uSizeUniform,         this.params.particleSize)
        gl.uniform1f(this.program.uBorderUniform,       this.params.discFade)
        gl.uniform1f(this.program.uDiscradiusUniform,   this.params.discRadius)
        gl.uniform1f(this.program.uHueShiftUniform,     this.params.hueShift)
    }

    applyState() {
        let gl = this.gl
        gl.disable(gl.DEPTH_TEST)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND)
    }

    postRender(){
        
        let gl = this.gl
        gl.useProgram(this.program)
        // this.setMatrixUniforms() 
        // this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, M4)               
        this.bind()
        gl.uniform1f(this.program.uPostPassUniform, 1)
        if (this.layers.length > 0) {
            this.layers[this.layers.length - 1].bind(this.program)
            gl.drawArrays(gl.POINTS, 0, this.layers[this.layers.length - 1].length)
        }
    }

    render(){

        // this.delete()
        // this.create()

        let gl = this.gl

        gl.useProgram(this.program)
        
        this.updatePositionMatrix()
        this.setMatrixUniforms()        
        this.applyState()

        this.bind()
        gl.uniform1f(this.program.uPostPassUniform, 0)

        let now = performance.now()

        for (let i = 0; i < this.layers.length; i++) {

            const layer = this.layers[i]            
            if (layer.death < now) {
                layer.kill()
                continue
            }

            layer.render(this.program)
            // gl.bindVertexArray(layer.vao)
        }

    }
}

export default Factory