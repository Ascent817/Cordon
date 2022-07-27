/** Provides a node object for use in a pathfinding grid */
class PathNode {
    constructor(parent = null, position = null) {
        this.parent = parent;
        this.position = position;

        this.g = 0;
        this.h = 0;
        this.f = 0;
    }
}

export default PathNode;