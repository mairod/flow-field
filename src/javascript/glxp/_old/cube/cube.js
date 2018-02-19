import glmat from 'gl-matrix'
import GEOM from "./geom";
import TextureLoader from '../textureLoader'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

let mvMatrix = mat4.create()

class Cube {
    constructor(scene){

        this.scene = scene
        this.gl = scene.gl

        this.position = vec3.fromValues(0, 0, 0)
        this.scale = vec3.fromValues(1, 1, 1)
        this.rotation = vec3.fromValues(0, 0, 0)
        this.quaternion = quat.create()

        this.initProgram()
        this.initBuffer()
    }


    initProgram() {

        let vert = require('../../../shaders/cube.vert')
        let frag = require('../../../shaders/cube.frag')

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
        gl.linkProgram(shaderProgram)

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram)
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPos")
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aUvs")
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix")
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix")
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix")
        shaderProgram.uTextureUniform = gl.getUniformLocation(shaderProgram, "uTexture")

        this.vertShader = vertSahder
        this.fragSahder = fragSahder
        this.program = shaderProgram

    }

    setMatrixUniforms() {
        this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, this.scene.camera.getProjectionMatrix());
        this.gl.uniformMatrix4fv(this.program.vMatrixUniform, false, this.scene.camera.getViewMatrix());
        this.gl.uniformMatrix4fv(this.program.mMatrixUniform, false, mvMatrix);
    }

    initBuffer() {

        let gl = this.gl

        let vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GEOM.vertices), gl.STATIC_DRAW)

        let uvsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(GEOM.uvs), gl.STATIC_DRAW)

        let indicesBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(GEOM.indices), gl.STATIC_DRAW)

        this.vertexPositionBuffer = vertexPositionBuffer
        this.uvsBuffer = uvsBuffer

        this.indicesBuffer = indicesBuffer

    }

    updatePositionMatrix() {
        let gl = this.gl
        mat4.identity(mvMatrix)
        this.quaternion = quat.create()
        quat.rotateX(this.quaternion, this.quaternion, this.rotation[0])
        quat.rotateY(this.quaternion, this.quaternion, this.rotation[1])
        quat.rotateZ(this.quaternion, this.quaternion, this.rotation[2])
        mat4.fromRotationTranslationScale(mvMatrix, this.quaternion, this.position, this.scale)
    }

    applyState() {
        let gl = this.gl
        gl.enable(gl.DEPTH_TEST)
    }

    render(){

        let gl = this.gl
        let time = this.scene.time

        
        this.rotation[1] = time
        this.rotation[0] = time / 2

        gl.useProgram(this.program)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer)
        gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.vertexAttribPointer(this.program.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0)
        
        this.updatePositionMatrix()
        this.setMatrixUniforms()
        this.applyState()

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, TextureLoader.getTexture('testTexture'))
        gl.uniform1i(this.program.uTextureUniform, 0)
        gl.uniform1f(this.program.uTimeUniform, time)
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
        gl.drawElements(gl.TRIANGLES, GEOM.indices.length, gl.UNSIGNED_SHORT, 0)
        // gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}

export default Cube