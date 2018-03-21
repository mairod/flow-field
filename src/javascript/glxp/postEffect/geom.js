
const VERTICES = [
    -1, 1, 0,
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0
]

const INDICES = [
    0, 1, 2, 0, 2, 3
]

const UVS = [
    0, 0,
    0, 1,
    1, 1,
    1, 0,
]

export default {
    vertices: VERTICES,
    uvs: UVS,
    indices: INDICES
}