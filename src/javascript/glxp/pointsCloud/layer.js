import MotionField from '../../motionfield/motionfield'
import RAF from '../../raf'

import glmat from 'gl-matrix'
let vec3 = glmat.vec3

let V3 = vec3.create()

class Layer {

    constructor(factory) {

        this.factory  = factory
        this.gl       = factory.scene.gl
        this.death    = performance.now() + (3 + ((Math.random() - .5) * 2)) * 1000
        this.data     = MotionField.getFramePoints()
        this.colors   = MotionField.getColors()
        this.length   = this.data.length / 3
        this.time     = 0

        // this.createIndices()
        if (this.length > 0) {
            this.createDirections()
            this.initBuffer()
        }
        
        
    }
    
    createIndices(){
        let gl = this.gl
        
        let index = []
        for (let i = 0; i < this.data.length / 3; i++) {
            index.push(i)
        }
        this.indices = new Uint16Array(index)

        let indicesBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)
        this.indicesBuffer = indicesBuffer
        
    }

    createDirections(){

        let dirs = []        
        for (let i = 0; i < this.data.length / 3; i++) {
            V3 = vec3.fromValues(0, 0, Math.random() * 3)
            vec3.rotateY(V3, V3, [0, 0, 0], (Math.random() - .5) * Math.PI * .3)            
            dirs.push(V3[0])
            dirs.push(V3[1])
            dirs.push(V3[2])
        }
        this.directions = new Float32Array(dirs)        
        
    }
    

    initBuffer(){
        let gl = this.gl
        
        let bufferIN = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferIN)
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_COPY)
        this.bufferIN = bufferIN

        let bufferOUT = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferOUT)
        gl.bufferData(gl.ARRAY_BUFFER, this.data.length * 4, gl.DYNAMIC_COPY)
        this.bufferOUT = bufferOUT

        let bufferDirs = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferDirs)
        gl.bufferData(gl.ARRAY_BUFFER, this.directions, gl.STATIC_DRAW)
        this.bufferDirs = bufferDirs

        let bufferColors = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferColors)
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW)
        this.bufferColors = bufferColors

        this.transformFeedback = gl.createTransformFeedback()

    }

    bind( program ){

        let gl = this.gl
        this.time += RAF.dt

        gl.uniform1f(program.uTimeUniform, false, this.time / 1000)

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferIN)
        gl.enableVertexAttribArray(program.vertexPositionAttribute)
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferDirs)
        gl.enableVertexAttribArray(program.directionAttribute)
        gl.vertexAttribPointer(program.directionAttribute, 3, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferColors)
        gl.enableVertexAttribArray(program.colorsAttribute)
        gl.vertexAttribPointer(program.colorsAttribute, 3, gl.FLOAT, false, 0, 0)    

    }

    

    render( program ){

        let gl = this.gl
        
        this.bind(program)
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.bufferOUT)
        gl.beginTransformFeedback(gl.POINTS)
        gl.drawArrays(gl.POINTS, 0, this.length)
        gl.endTransformFeedback()
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
        // gl.drawElements(gl.POINTS, this.length, gl.UNSIGNED_SHORT, 0)

        let tmp = this.bufferIN
        this.bufferIN = this.bufferOUT
        this.bufferOUT = tmp

    }

    kill(){

        let index = this.factory.layers.indexOf(this)
        this.factory.layers.splice(index, 1)
        this.gl.deleteBuffer(this.bufferIN)
        this.gl.deleteBuffer(this.bufferOUT)
        this.gl.deleteBuffer(this.bufferDirs)
        this.gl.deleteBuffer(this.bufferColors)

    }

}

export default Layer