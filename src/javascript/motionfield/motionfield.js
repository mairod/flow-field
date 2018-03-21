import when from 'when'
import RAF from '../raf'
import Emitter from 'event-emitter'

var _emitter = {}
Emitter(_emitter)

navigator.getUserMedia =    navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia;

class Motion {
    constructor(){

        this.definition   = 175
        this.width        = 175
        this.height       = 175
        this.canvas       = document.createElement('canvas')
        this.video        = document.createElement('video')
        this.active       = false
        this.updated      = false
        this.defer        = when.defer()
        this.debug        = true

        this.threshold    = 100

        this.framerate    = 60
        this.targetFps    = (1/this.framerate) * 1000
        this.ellapsed     = 0        

        this.prevPixels   = new Uint8ClampedArray(this.width * this.height)
        this.currentPixel = new Uint8ClampedArray(this.width * this.height)
        this.velocityMap  = []
        this.colorsMap    = []

        this.on = _emitter.on.bind(_emitter)

        this.init()

    }

    toggleDebug(){
        if (this.debug) {
            this.canvas.style.display = 'none'
            this.debug = false
        } else {
            this.canvas.style.display = 'block'
            this.debug = true
        }
    }

    changeDefinition(value){
        console.log(value);
        
        this.width = value
        this.height = value
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.prevPixels = new Uint8ClampedArray(this.width * this.height)
        this.currentPixel = new Uint8ClampedArray(this.width * this.height)
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
            let grayscale = pixels[i] * .333 + pixels[i + 1] * .333 + pixels[i + 2] * .333
            grayscale = Math.pow(grayscale, 1.2)
            pixels[i + 0] = grayscale        // red
            pixels[i + 1] = grayscale        // green
            pixels[i + 2] = grayscale        // blue
        }
        //redraw the image in black & white
        this.ctx.putImageData(imgData, 0, 0)
    }

    processPixels(){

        let imgData = this.ctx.getImageData(0, 0, this.width, this.height);
        let pixels = imgData.data;

        this.updated            = false
        this.velocityMap.length = 0
        this.colorsMap.length   = 0

        for (let i = 0, n = pixels.length; i < n; i += 4) {
            let grayscale = pixels[i] * .333 + pixels[i + 1] * .333 + pixels[i + 2] * .333

            const tmpColor = [ 
                pixels[i + 0],
                pixels[i + 1],
                pixels[i + 2],
             ]

            grayscale = Math.pow(grayscale, 1.2)
            pixels[i + 0] = grayscale        // red
            pixels[i + 1] = grayscale        // green
            pixels[i + 2] = grayscale        // blue

            this.currentPixel[i / 4] = pixels[i]

            const tmp = Math.abs(this.prevPixels[i / 4] - this.currentPixel[i / 4])
            pixels[i + 0] = tmp
            pixels[i + 1] = tmp
            pixels[i + 2] = tmp 
    
            if (tmp > this.threshold ) {

                let x = (i % (this.width * 4)) - this.width * 2
                let y = (Math.floor(i / this.height))

                x *= 200 / this.width
                y -= this.height * 2
                y *= 200 / this.width

                this.velocityMap.push(x)
                this.velocityMap.push(y)
                this.velocityMap.push(0)

                this.colorsMap.push(tmpColor[0] / 255)
                this.colorsMap.push(tmpColor[1] / 255)
                this.colorsMap.push(tmpColor[2] / 255)
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

    getColors(){

        if (this.updated === false) {
            return []
        } else {
            return new Float32Array(this.colorsMap)
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

        this.processPixels()      // to B&W

        let tmp = this.prevPixels
        this.prevPixels = this.currentPixel 
        this.currentPixel = tmp  // store pixels

        _emitter.emit('update', null)

    }

}
const out = new Motion()
export default out