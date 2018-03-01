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
        this.scale      = vec3.fromValues(.05 * this.scene.ratio, .05, .05)
        this.rotation   = vec3.fromValues(0, -Math.PI / 2, Math.PI)
        this.quaternion = quat.create()
        this.matrix     = mat4.create()

        this.initProgram()

        this.create = this.create.bind(this)

        MotionField.on('update', ()=>{
            this.create()
        })

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

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVP")
        shaderProgram.timeUniform = gl.getUniformLocation(shaderProgram, "uTime")

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

    render(){

        // this.delete()
        // this.create()

        let gl = this.gl

        gl.useProgram(this.program)
        
        this.updatePositionMatrix()
        this.setMatrixUniforms()        

        this.gl.uniform1f(this.program.timeUniform, false, this.scene.time)        

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