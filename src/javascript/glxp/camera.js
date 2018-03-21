import glmat from 'gl-matrix'

let vec3 = glmat.vec3
let mat4 = glmat.mat4
let quat = glmat.quat

class Camera {
    constructor(scene, fov) {

        this.scene = scene
        this.gl = scene.gl
        this.fov = fov        

        this.position = vec3.fromValues(0, -2.8, 0)
        this.rotation = vec3.fromValues(0, 0, 0)
        this.quaternion = quat.create()

        this.pMatrix = mat4.create()
        this.vMatrix = mat4.create()

    }

    updatePositionMatrix() {
        let gl = this.gl
        mat4.identity(this.vMatrix)
        this.quaternion = quat.create()
        quat.rotateX(this.quaternion, this.quaternion, this.rotation[0])
        quat.rotateY(this.quaternion, this.quaternion, this.rotation[1])
        quat.rotateZ(this.quaternion, this.quaternion, this.rotation[2])
        mat4.fromRotationTranslationScale(this.vMatrix, this.quaternion, this.position, [1, 1, 1])
    }

    lookAt(tgt) {
        mat4.lookAt(this.vMatrix, this.position, tgt, [0, 1, 0])
    }

    getProjectionMatrix() {
        return this.pMatrix
    }

    getViewMatrix() {
        return this.vMatrix
    }

    updateProjection(ratio) {
        mat4.perspective(this.pMatrix, this.fov * Math.PI / 180, ratio, 0.1, 1000.0)
    }

    update(ratio) {
        this.updatePositionMatrix()
        this.updateProjection(ratio)
    }
}

export default Camera