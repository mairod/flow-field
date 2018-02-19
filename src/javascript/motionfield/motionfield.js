import when from 'when'
import RAF from '../raf'

navigator.getUserMedia =    navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia;

const LIMIT = 100

class Motion {
    constructor(){

        this.width        = 128
        this.height       = 128
        this.canvas       = document.createElement('canvas')
        this.video        = document.createElement('video')
        this.active       = false
        this.updated      = false
        this.defer        = when.defer()

        this.framerate    = 30
        this.targetFps    = (1/this.framerate) * 1000
        this.ellapsed     = 0        

        this.prevPixels   = new Uint8ClampedArray(this.width * this.height)
        this.currentPixel = new Uint8ClampedArray(this.width * this.height)
        this.velocityMap  = []

        this.init()

    }

    init(){
        document.body.appendChild(this.canvas)
        this.canvas.classList.add('camvelocity')
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.ctx = this.canvas.getContext('2d')
        navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 1280, height: 720 } })
        .then( (stream) => {
            this.video.src = window.URL.createObjectURL(stream)
            this.video.onloadedmetadata = (e) => { this.video.play() }
            this.video.play()
            this.onloaded()            
        })
        .catch( (err) => {
            alert('No cam detected... 😢')
        })
    }

    onloaded(){
        this.active = true
    }

    getLoadable(){
        return this.defer.promise
    }

    toGreyScale(){
        let imgData = this.ctx.getImageData(0, 0, this.width, this.height);        
        let pixels = imgData.data;
        for (let i = 0, n = pixels.length; i < n; i += 4) {
            let grayscale = pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11
            pixels[i + 0] = grayscale        // red
            pixels[i + 1] = grayscale        // green
            pixels[i + 2] = grayscale        // blue
        }
        //redraw the image in black & white
        this.ctx.putImageData(imgData, 0, 0)
    }

    processPixels(){

        this.updated = false
        this.velocityMap.length = 0

        let imgData = this.ctx.getImageData(0, 0, this.width, this.height);
        let pixels = imgData.data;
        let tmp = []        

        for (let i = 0, n = pixels.length; i < n; i += 4) {
            this.currentPixel[i / 4] = pixels[i]
        }     

        for (let i = 0, n = pixels.length; i < n; i += 4) {
            const tmp = Math.abs(this.prevPixels[i / 4] - this.currentPixel[i / 4])
            pixels[i + 0] = tmp
            pixels[i + 1] = tmp
            pixels[i + 2] = tmp 
            if (tmp > LIMIT) {
                this.velocityMap.push((i % (this.width * 4)) - this.width * 2)
                this.velocityMap.push((Math.floor(i / this.height)) - this.height * 2)
                this.velocityMap.push(0)
            }
        }

        this.updated = true
        
        this.ctx.putImageData(imgData, 0, 0)

    }

    getFramePoints(){

        if (this.updated === false) {
            return []
        } else {
            return new Float32Array(this.velocityMap)
        }

    }

    update(){
        if (!this.active) { return }
        
        if (this.ellapsed < this.targetFps) {
            this.ellapsed += RAF.dt
            return
        } else {
            this.ellapsed = 0
        }        

        this.ctx.drawImage(this.video, 0, 0, this.width, this.height)

        this.toGreyScale()      // to B&W
        this.processPixels()    // proccess diff 

        this.prevPixels = this.currentPixel.slice(0) // store pixels

    }

}
const out = new Motion()
export default out