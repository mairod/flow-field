import MotionField from '../../motionfield/motionfield'

class Layer {

    constructor(factory) {

        this.factory  = factory
        this.gl       = factory.scene.gl
        this.death    = performance.now() + (3 + ((Math.random() - .5) * 2)) * 1000
        this.data     = MotionField.getFramePoints()
        this.length   = this.data.length / 3
        this.initBuffer()

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

        this.transformFeedback = gl.createTransformFeedback()

    }

    render( program ){

        let gl = this.gl
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferIN)
        gl.enableVertexAttribArray(program.vertexPositionAttribute)      
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)        

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.bufferOUT)
        gl.beginTransformFeedback(gl.POINTS)
        gl.drawArrays(gl.POINTS, 0, this.length)
        gl.endTransformFeedback()
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)

        let tmp = this.bufferIN
        this.bufferIN = this.bufferOUT
        this.bufferOUT = tmp

    }

    kill(){

        let index = this.factory.layers.indexOf(this)
        this.factory.layers.splice(index, 1)
        this.gl.deleteBuffer(this.bufferIN)
        this.gl.deleteBuffer(this.bufferOUT)

    }

}

export default Layer