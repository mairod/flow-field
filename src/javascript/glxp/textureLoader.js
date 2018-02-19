import when from 'when'

class TextureLoader {

    constructor(){
        this.textures = {}
        this.currentUnit = 0
    }

    init(scene){
        this.scene = scene 
        this.gl = scene.gl
    }

    load(url, id){
        let image = new Image()
        image.onload = ()=>{
            let texture = this.initTexture(image)
            this.textures[id].texture = texture
            this.textures[id].unit = this.currentUnit
            this.currentUnit++
            this.textures[id].defer.resolve(texture)
        }
        image.src = url
        this.textures[id] = {
            img: image,
            defer: when.defer()
        }
        return this.textures[id].defer.promise
    }

    initTexture(image){
        let gl = this.gl
        // create
        let texture = gl.createTexture();

        // bind it to operate on it
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the filter wrapping and filter parameters.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        // Upload the image into the texture.
        // WARNING : your image MUST be loaded before
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        return texture
    }

    getTexture(id){        
        if (this.textures[id].texture){
            return this.textures[id].texture
        }
    }

    getTextureUnit(id){
        if (this.textures[id].unit) {
            return this.textures[id].unit
        }
    }

}
const out = new TextureLoader()
export default out