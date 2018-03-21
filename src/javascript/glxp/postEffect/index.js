import glmat from 'gl-matrix'
import FBO from './fbo'
import GEOM from './geom'

let mat4 = glmat.mat4
let quat = glmat.quat
let vec3 = glmat.vec3

class PostEffect {
    constructor(scene){

        this.scene = scene

        this.gl = scene.gl
        this.fbo = new FBO(this.scene)

        this.params = {
            active: false,
            blurX: 10,
            blurY: 0,
            brigth: .5,
        }

        this.initProgram()
        this.initBuffer()
        this.initVao()

        this.gui = this.scene.gui.addFolder('Post process')
        this.gui.add(this.params, 'active')
        this.gui.add(this.params, 'blurX', 0, 15, .001)
        this.gui.add(this.params, 'blurY', 0, 15, .001)
        this.gui.add(this.params, 'brigth', 0, 1, .001)
        this.gui.open()


    }

    initProgram() {

        let vert = require('./post.vert')
        let frag = require('../../../shaders/post.frag')

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

        shaderProgram.uTextureUniform = gl.getUniformLocation(shaderProgram, "uTexture")
        shaderProgram.uRezUniform = gl.getUniformLocation(shaderProgram, "uRez")
        shaderProgram.uBlurXUniform = gl.getUniformLocation(shaderProgram, "uBlurX")
        shaderProgram.uBlurYUniform = gl.getUniformLocation(shaderProgram, "uBlurY")
        shaderProgram.uBrigthUniform = gl.getUniformLocation(shaderProgram, "uBrigth")
        // shaderProgram.uTimeUniform = gl.getUniformLocation(shaderProgram, "uTime")
        // shaderProgram.uTextureUniform = gl.getUniformLocation(shaderProgram, "uTexture")

        this.vertShader = vertShader
        this.fragSahder = fragSahder
        this.program = shaderProgram

    }

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
        gl.disable(gl.DEPTH_TEST)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND)
    }

    prepare() {
        this.fbo.prepare()
    }

    render(){

        let gl = this.gl

        this.fbo.clean()
        gl.useProgram(this.program)
        gl.bindVertexArray(this.vao)
        this.applyState()

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.getTexture())        
        gl.uniform2fv(this.program.uRezUniform, [this.scene.width * this.scene.dpr, this.scene.height * this.scene.dpr ])  
        gl.uniform1f(this.program.uBlurXUniform, this.params.blurX)  
        gl.uniform1f(this.program.uBlurYUniform, this.params.blurY)  
        gl.uniform1f(this.program.uBrigthUniform, this.params.brigth)  
        // gl.uniform1f(this.program.uRezUniform, this.scene.ratio)

        if (this.params.active) {
            gl.drawElements(gl.TRIANGLES, GEOM.indices.length, gl.UNSIGNED_SHORT, 0)
        }
        gl.bindVertexArray(null)
         
    }


}

export default PostEffect