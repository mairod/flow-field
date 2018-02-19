import when from 'when'
import OBJParser from '../../utils/OBJParser'

let defer = when.defer()

class Loader {
    constructor() {
        this.createXHR()
    }

    loadModel(url) {
        this.sendXHR(url)
        return defer.promise
    }

    createXHR() {
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.rawText = xhr.responseText
                    this.parseOBJ()
                }
            }
        }
        this.xhr = xhr
    }

    sendXHR(url) {
        this.xhr.open('GET', url)
        this.xhr.send()
    }

    parseOBJ() {
        let parsed = new OBJParser(this.rawText)
        defer.resolve(parsed)
    }
}
export default Loader