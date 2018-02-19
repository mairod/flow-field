class OrbitControl {
    constructor(scene){
        this.scene = scene
        this.camera = scene.camera

        this.width = scene.width
        this.height = scene.height

        this.mouse = { x: 0, y:0 }
        this.dragRotation = { x: 0, y:0 }
        this.zoom = 30
        this.drag = false

        this.initEvents()
    }

    initEvents(){

        let last_mouse = { x: 0, y: 0 }
        function onMove(pointer, mobile) {

            this.mouse.x = (pointer.clientX / this.width - .5) * 2
            this.mouse.y = (pointer.clientY / this.height - .5) * 2

            let mouse_x = this.mouse.x - last_mouse.x
            let mouse_y = this.mouse.y - last_mouse.y

            if (this.drag) {
                this.dragRotation.x += mouse_x * 1.5
                this.dragRotation.y += mouse_y * 1.5
                this.dragRotation.y = Math.min(Math.max(this.dragRotation.y, -Math.PI / 4), Math.PI / 4)
            }

            last_mouse.x = this.mouse.x
            last_mouse.y = this.mouse.y
            
        }

        window.addEventListener("mousemove", onMove.bind(this))
        window.addEventListener("mousedown", () => {
            this.drag = true
        })
        window.addEventListener("mouseup", () => {
            this.drag = false
        })

        window.addEventListener('wheel', (e) => {
            this.zoom += e.deltaY / 10 
            this.zoom = Math.min(Math.max(this.zoom, 10),50)
        })

    }

    update(){
        this.camera.position[0] = Math.cos(this.dragRotation.x) * this.zoom
        this.camera.position[1] = Math.sin(this.dragRotation.y) * this.zoom
        this.camera.position[2] = Math.sin(this.dragRotation.x) * this.zoom
    }
}
export default OrbitControl