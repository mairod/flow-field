class FBO {

    constructor(scene, opts) {

        this.scene = scene
        this.gl = scene.gl
        this.opts = opts || {}

        this.width = this.opts.width || this.scene.width * this.scene.dpr
        this.heigth = this.opts.heigth || this.scene.height * this.scene.dpr        

        this.createTexture()
        this.createFB()

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

    }

    createTexture() {

        this.targetTexture = this.gl.createTexture()

        let gl = this.gl

        gl.bindTexture(gl.TEXTURE_2D, this.targetTexture)

        const level = 0
        const internalFormat = gl.RGBA
        const border = 0
        const format = gl.RGBA
        const type = gl.UNSIGNED_BYTE
        const data = null

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            this.width, this.heigth, border,
            format, type, data)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    }

    createFB() {
        let gl = this.gl
        this.fb = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)

        const level = 0
        const attachmentPoint = gl.COLOR_ATTACHMENT0
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.targetTexture, level)

        // create a depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.heigth);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    }

    prepare() {
        let gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.viewport(0, 0, this.scene.width * this.scene.dpr, this.scene.height * this.scene.dpr)
        // gl.colorMask(true, true, true, true)
        // this.scene.camera.updateProjection(1)
        // this.scene.camera.updateProjection(this.scene.ratio)
    }

    clean() {
        let gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    bind() {
        let gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, this.targetTexture)
    }

    getTexture() {
        return this.targetTexture
    }

}

export default FBO