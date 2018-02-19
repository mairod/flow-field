const density = 230

const VERTICES = []
const INDICES = []
const UVS = []

let index = 0
for (var i = 0; i < density; i++) {
    for (var j = 0; j < density; j++) {
        VERTICES.push(((i/density) - .5)*2)
        VERTICES.push(0)
        VERTICES.push(((j / density) - .5) * 2)
        UVS.push(i / density)
        UVS.push(j / density)
        INDICES.push(index)
        index++
    }
}

export default {
    vertices: VERTICES,
    uvs: UVS,
    indices: INDICES
}