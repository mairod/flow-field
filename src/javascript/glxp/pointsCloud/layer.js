import MotionField from '../../motionfield/motionfield'

class Layer {

    constructor(factory) {

        this.factory  = factory
        this.gl       = factory.scene.gl
        this.death    = performance.now() + (3 + ((Math.random() - .5) * 2)) * 1000
        this.data     = MotionField.getFramePoints()
        this.length   = this.data.length / 3
        this.initBuffer()
        this.initVao()

    }

    initBuffer(){
        let gl = this.gl
        
        let buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW)

        this.positionBuffer = buffer

    }

    initVao() {

        let gl = this.gl
        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)
        gl.enableVertexAttribArray(0);        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.vertexAttribPointer(this.factory.program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)        
        gl.bindVertexArray(null)

    }

    kill(){

        let index = this.factory.layers.indexOf(this)
        this.factory.layers.splice(index, 1)
        this.gl.deleteBuffer(this.positionBuffer)

    }

}

export default Layer