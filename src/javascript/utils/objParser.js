
// o object_name | g group_name
const object_pattern = /^[og]\s*(.+)?/;
// mtllib file_reference
const material_library_pattern = /^mtllib /;
// usemtl material_name
const material_use_pattern = /^usemtl /;

class State {
    constructor() {
        this.objects = []
        this.objectIndex = 0

        this.vertices = []
        this.normals = []
        this.uvs = []
        this.currentIndice = 0

        this.registeredIndex = []
    }

    startObject(name) {

        if (this.objects.length > 0) {
            this.objectIndex = this.objects.length
        }

        this.objects.push({
            name: name || '',
            geometry: {
                vertices: [],
                normals: [],
                uvs: [],
                indices: []
            },
            infos: {
                triangles: 0,
                vertex: 0,
            },
            smooth: false
        })

        this.tmp = 0

        this.object = this.objects[this.objectIndex]

    }

    addFace(a, b, c, ua, ub, uc, na, nb, nc) {

        let vLen = this.vertices.length
        let ia = this.parseVertexIndex(a, vLen)
        let ib = this.parseVertexIndex(b, vLen)
        let ic = this.parseVertexIndex(c, vLen)

        this.makeVertIfNotRegistered(ia, ua, na)
        this.makeVertIfNotRegistered(ib, ub, nb)
        this.makeVertIfNotRegistered(ic, uc, nc)

    }

    makeVertIfNotRegistered(iv, uv, nv) {

        // CHeck if index alreday exist
        let parserIndex = this.getkVertexIndex(iv)
        if (parserIndex > -1) { this.addVertWithIndice(parserIndex); return }

        // Vertex Not here
        this.registerIndex(iv)
        this.addVertex(iv, this.currentIndice)

        if (uv !== undefined) {
            iv = this.parseUVIndex(uv, this.uvs.length)
            this.addUV(iv)
        }

        if (nv !== undefined) {
            iv = this.parseNormalIndex(nv, this.normals.length)
            this.addNormal(iv)
        }

        this.currentIndice++

    }

    addVertWithIndice(iv) {
        this.object.geometry.indices.push(iv)
    }

    addVertex(v, iv) {
        this.object.geometry.vertices.push(this.vertices[v + 0], this.vertices[v + 1], this.vertices[v + 2])
        this.object.geometry.indices.push(iv)
    }

    addVertexLine(a) {

        let src = this.vertices
        let dst = this.object.geometry.vertices

        dst.push(src[a + 0], src[a + 1], src[a + 2])

    }

    addNormal(a) {
        this.object.geometry.normals.push(this.normals[a + 0], this.normals[a + 1], this.normals[a + 2])
    }

    addUV(a) {
        this.object.geometry.uvs.push(this.uvs[a + 0], this.uvs[a + 1])
    }

    addUVLine(a) {
        this.object.geometry.uvs.push(this.uvs[a + 0], this.uvs[a + 1])
    }

    registerIndex(id) {
        this.registeredIndex.push(id)
    }

    getkVertexIndex(ivert) {
        return this.registeredIndex.indexOf(ivert)
    }

    parseVertexIndex(value, len) {

        let index = parseInt(value, 10)
        return (index >= 0 ? index - 1 : index + len / 3) * 3

    }

    parseNormalIndex(value, len) {

        let index = parseInt(value, 10)
        return (index >= 0 ? index - 1 : index + len / 3) * 3

    }

    parseUVIndex(value, len) {

        let index = parseInt(value, 10)
        return (index >= 0 ? index - 1 : index + len / 2) * 2

    }

    addLineGeometry(vertices, uvs) {

        let vLen = this.vertices.length
        let uvLen = this.uvs.length

        for (let vi = 0, l = vertices.length; vi < l; vi++) {
            this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen))
        }
        for (let uvi = 0, l = uvs.length; uvi < l; uvi++) {
            this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen))
        }

    }

    computeInfos() {
        for (var i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i]
            obj.infos.vertex = obj.geometry.vertices.length / 3
            obj.infos.triangles = obj.geometry.indices.length / 3
        }
    }

}


class OBJParser {

    constructor(rawOBJ) {
        this.parseLines(rawOBJ)
        return this.objects
    }

    parseLines(text) {

        let state = new State()

        if (text.indexOf('\r\n') !== - 1) {
            text = text.replace(/\r\n/g, '\n')
        }

        if (text.indexOf('\\\n') !== - 1) {
            text = text.replace(/\\\n/g, '')
        }

        let lines = text.split('\n');
        let line = '', lineFirstChar = '';

        let lineLength = 0
        let result = []

        // Faster than .trim() if avaliable
        let trimLeft = (typeof ''.trimLeft === 'function')

        for (let i = 0, l = lines.length; i < l; i++) {

            line = lines[i]
            line = trimLeft ? line.trimLeft() : line.trim()
            lineLength = line.length

            if (lineLength === 0) continue

            lineFirstChar = line.charAt(0)
            if (lineFirstChar === '#') continue

            if (lineFirstChar === 'v') {

                let data = line.split(/\s+/)

                switch (data[0]) {
                    case 'v':
                        state.vertices.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                        )
                        break
                    case 'vn':
                        state.normals.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                        )
                        break
                    case 'vt':
                        state.uvs.push(
                            parseFloat(data[1]),
                            parseFloat(data[2])
                        )
                        break
                }
            } else if (lineFirstChar === 'f') {

                let lineData = line.substr(1).trim();
                let vertexData = lineData.split(/\s+/);
                let faceVertices = [];

                // Parse the face vertex data into an easy to work with format

                for (let j = 0, jl = vertexData.length; j < jl; j++) {

                    let vertex = vertexData[j];

                    if (vertex.length > 0) {

                        let vertexParts = vertex.split('/');
                        faceVertices.push(vertexParts);

                    }

                }

                let v1 = faceVertices[0];

                for (let j = 1, jl = faceVertices.length - 1; j < jl; j++) {

                    let v2 = faceVertices[j];
                    let v3 = faceVertices[j + 1];
                    state.addFace(
                        v1[0], v2[0], v3[0],
                        v1[1], v2[1], v3[1],
                        v1[2], v2[2], v3[2]
                    );

                }

            } else if (lineFirstChar === 'l') {

                let lineParts = line.substring(1).trim().split(" ")
                let lineVertices = [], lineUVs = []

                if (line.indexOf("/") === - 1) {
                    lineVertices = lineParts
                } else {

                    for (let li = 0, llen = lineParts.length; li < llen; li++) {
                        let parts = lineParts[li].split("/")
                        if (parts[0] !== "") lineVertices.push(parts[0])
                        if (parts[1] !== "") lineUVs.push(parts[1])
                    }

                }
                state.addLineGeometry(lineVertices, lineUVs)

            } else if ((result = object_pattern.exec(line)) !== null) {

                var name = (" " + result[0].substr(1).trim()).substr(1);
                state.startObject(name);

            } else if (material_use_pattern.test(line)) {

                state.object.material = (line.substring(7).trim());

            } else if (lineFirstChar === 's') {

                // ZBrush can produce "s" lines #11707
                result = line.split(' ')

                if (result.length > 1) {
                    var value = result[1].trim().toLowerCase()
                    state.object.smooth = (value !== '0' && value !== 'off')
                } else {
                    state.object.smooth = true
                }

            } else {
                // Handle null terminated files without exception
                if (line === '\0') continue;
                throw new Error("Unexpected line: '" + line + "'");
            }
        }

        state.computeInfos()
        this.finalize(state)

    }

    finalize(state) {
        this.objects = JSON.parse(JSON.stringify(state.objects))
    }
}

export default OBJParser