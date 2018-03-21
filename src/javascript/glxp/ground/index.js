import glmat from 'gl-matrix'
import GEOM from "./geom"
import TextureLoader from '../textureLoader'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

class Plane {
    constructor(scene) {

        this.scene = scene
        this.gl = scene.gl

        this.position = vec3.fromValues(0, -15, 0)
        this.scale = vec3.fromValues(100, 0, 100)
        this.rotation = vec3.fromValues(0, 0, 0)
        this.quaternion = quat.create()
        this.matrix = mat4.create()

        this.initProgram()
        this.initBuffer()
        this.initVao()

        this.voxelDim = 100

    }


    initProgram() {

        let vert = require('../../../shaders/ground.vert')
        let frag = require('../../../shaders/ground.frag')

        let gl = this.gl

        let vertShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertShader, vert)
        gl.compileShader(vertShader)

        let fragSahder = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragSahder, frag)
        gl.compileShader(fragSahder)

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            console.error('error vert', gl.getShaderInfoLog(vertShader))
            return null
        }

        if (!gl.getShaderParameter(fragSahder, gl.COMPILE_STATUS)) {
            console.error('error frag', gl.getShaderInfoLog(fragSahder))
            return null
        }

        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader)
        gl.attachShader(shaderProgram, fragSahder)
        gl.linkProgram(shaderProgram)

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Could not initialise shaders", gl.getProgramInfoLog(shaderProgram));
        }

        gl.useProgram(shaderProgram)
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPos");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
        shaderProgram.vertexUvAttribute = gl.getAttribLocation(shaderProgram, "aUvs");
        gl.enableVertexAttribArray(shaderProgram.vertexUvAttribute)

        // shaderProgram.uTimeUniform = gl.getUniformLocation(shaderProgram, "uTime")
        // shaderProgram.uTextureUniform = gl.getUniformLocation(shaderProgram, "uTexture")

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");

        this.vertShader = vertShader
        this.fragSahder = fragSahder
        this.program = shaderProgram

    }

    setMatrixUniforms() {
        this.gl.uniformMatrix4fv(this.program.pMatrixUniform, false, this.scene.camera.getProjectionMatrix());
        this.gl.uniformMatrix4fv(this.program.vMatrixUniform, false, this.scene.camera.getViewMatrix());        
        this.gl.uniformMatrix4fv(this.program.mMatrixUniform, false, this.matrix);
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

    // Webgl 2 only
    initVao() {

        let gl = this.gl

        this.vao = gl.createVertexArray()

        gl.bindVertexArray(this.vao)

        gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer)
        gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

        gl.enableVertexAttribArray(this.program.vertexUvAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.vertexAttribPointer(this.program.vertexUvAttribute, 2, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

        gl.bindVertexArray(null)

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

    applyState() {
        let gl = this.gl
        gl.enable(gl.DEPTH_TEST)
    }

    render() {

        let gl = this.gl
        let time = this.scene.time

        gl.useProgram(this.program)

        gl.bindVertexArray(this.vao)

        this.updatePositionMatrix()
        this.setMatrixUniforms()
        this.applyState()

        gl.uniform1f(this.program.uTimeUniform, time)

        // gl.activeTexture(gl.TEXTURE0)        
        // gl.bindTexture(gl.TEXTURE_2D, this.scene.voxelFBO.getTexture())
        // gl.uniform1i(this.program.uTextureUniform, 0)

        gl.drawElements(gl.TRIANGLES, GEOM.indices.length, gl.UNSIGNED_SHORT, 0)

        gl.bindVertexArray(null)

    }
}

export default Plane