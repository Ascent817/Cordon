/**
 * Provides an object to represent a pathfinding grid of nodes.
 * This version is for use in a html <script> tag.
 */
class Grid {
    /**
     * @param {Integer} width Width of the grid in cells
     * @param {Integer} height Height of the grid in cells
     * @param {Array} [start] Optional - An array with two items, x and y, to be used as 0-based indices for the start cell
     * @param {Array} [target] Optional - An array with two items, x and y, to be used as 0-based indices for the target cell
     * @param {Boolean} useDiagonals Optional - Whether to use diagonals in the path, defaults to true
     */
    constructor(width, height, start, target, useDiagonals = true) {
        this.width = width;
        this.height = height;

        // Set what the numbers in the grid mean
        this.emptyCell = 0;
        this.obstacleCell = 1;
        this.startCell = 2;
        this.targetCell = 3;

        // Initialize array and fill it with empty space (0)
        this.cells = new Array(width);
        for (let i = 0; i < width; i++) {
            this.cells[i] = new Array(height).fill(this.emptyCell);
        }

        // If a start or target cell is provided, set those as well
        if (start) {
            this.SetCell(start[0], start[1], this.startCell);
        }

        if (target) {
            this.SetCell(target[0], target[1], this.targetCell);
        }

        // Decide whether to use diagonals in the solved path
        this.useDiagonals = useDiagonals;
    }

    /**
     * @method SetCell Sets the cell at [x, y] to the specified value
     * @param {Integer} x The horizontal index of the cell to set
     * @param {Integer} y The vertical index of the cell to set
     * @param {Integer} value The integer to set the cell to. Can be 0 for empty, 1 for an obstacle, 2 for the starting position, or 3 for the target
     */
    SetCell(x, y, value) {
        Array.from(arguments).forEach(arg => {
            if (!Number.isInteger(arg)) {
                throw 'All parameters must be integers!';
            }
        });
        this.cells[x][y] = value;
    }

    /**
     * @method SolvePath Solves the path using the A* algorithm
     * @returns {Array} A 2-D array containing all cells in the path
     */
    SolvePath() {
        // First, check that there is only one start and end cell.
        if (this.IsValid() == false) {
            throw "There can be exactly one start and end cell, but either none or too many were found!";
        }

        // The location of the start cell must be added to the open list in order to start the algorithm
        let open = []; // Make a new node with its position set to that of the start cell
        let closed = [];

        open.push(new PathNode(null, this.FindCell(this.startCell)));

        // Add the location of end cell
        const goal = this.FindCell(this.targetCell); // This will be an array containing indices, e.g. [0, 3]

        while (open.length > 0 && open.length < 100000) {

            // Find the node with the lowest f-cost to start with
            let currentNode = open[0]; // Just use the first node as a default. Remember, the open list will always have at least one item when in this loop
            open.forEach((pathnode) => {
                if (pathnode.f < currentNode.f) {
                    currentNode = pathnode;
                }
            }); //The currentNode is now the node with the lowest f-cost

            open.splice(open.findIndex((element) => element == currentNode), 1); // Remove current node from open list
            closed.push(currentNode); // Add the current node to the closed list

            if (currentNode.position[0] === goal[0] && currentNode.position[1] === goal[1]) {
                // follow parents back to get the path
                let path = [];
                let tempNode = currentNode;

                while (tempNode.parent != null) {
                    path.push(tempNode.position);
                    tempNode = tempNode.parent;
                }
                return path.reverse();
            }

            // Get all adjacent cells and add them as children to the current node
            let children = [];

            const newPositions = this.useDiagonals
                ? [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]] 
                : [[0, 1], [1, 0], [0, -1], [-1, 0]];

            newPositions.forEach((position) => {
                let adjacentNode = this.GetAdjacent(currentNode, position);

                if (adjacentNode !== null) {

                    let isClosed = false;

                    closed.forEach((pathnode) => {
                        if (this.CompareNodes(pathnode, adjacentNode)) {
                            isClosed = true;
                        }
                    });

                    if (!isClosed) {
                        children.push(adjacentNode); // Add all adjacent spaces which are not walls and are not closed to the list
                    }
                }
            });

            children.forEach((child) => {

                // Check if the child is already in the closed list
                let isInClosed = false;
                closed.forEach((element) => {
                    // If the positions of the nodes match, they're equal
                    if (element.position[0] == child.position[0] && element.position[1] == child.position[1]) {
                        isInClosed = true;
                    }
                });

                if (!isInClosed) { // If the child isn't in the closed list, continue
                    // Find the distances between the child, the start, and the end

                    // Set up variables for use in the heuristic formulas
                    let x1 = child.position[0];
                    let y1 = child.position[1];
                    let x2 = currentNode.position[0];
                    let y2 = currentNode.position[1];
                    let x3 = goal[0];
                    let y3 = goal[1];

                    let childToCurrent = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) * 10;
                    let childToEnd = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2)) * 10;

                    // Update child values
                    child.g = currentNode.g + childToCurrent;
                    child.h = childToEnd;
                    child.f = child.g + child.h;

                    // Child is already in open list
                    let isInOpen = false;
                    let childIndex = -1;

                    for (let i = 0; i < open.length; i++) {
                        let element = open[i];
                        if (this.CompareNodes(element, child)) {
                            isInOpen = true;
                            childIndex = i;
                        }
                    }

                    if (isInOpen) { // The child is in the open list
                        if (child.g < open[childIndex].g) { // The child g isn't greater than the copy in the open list
                            open[childIndex].parent = currentNode;
                            open[childIndex].g = child.g;
                            open[childIndex].h = child.h;
                            open[childIndex].f = child.f;
                        }
                    } else {
                        open.push(child);
                    }
                }
            });
        }
    }

    /**
     * @method IsValid Checks whether the grid has exactly one start and end cell
     * @returns {Boolean} A boolean indicating whether the grid is valid or not
     */
    IsValid() {
        let startCount = 0;
        let endCount = 0;
        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells[x].length; y++) {
                let cell = this.cells[x][y];
                if (cell == 2) {
                    startCount++;
                } else if (cell == 3) {
                    endCount++;
                }
            }
        }

        if (startCount == 1 && endCount == 1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @method FindCell Returns the indices of the first match of a given value
     * @param {Integer} value Type of cell to search for
     * @returns {Array} An array containing the x and y indices of the cell found, or -1 if not found
     */
    FindCell(value) {

        if (!Number.isInteger(value)) {
            throw 'The search value must be an integer!';
        }

        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells[x].length; y++) {
                let cell = this.cells[x][y];
                if (cell == value) {
                    return [x, y];
                }
            }
        }

        return -1;
    }

    /**
     * @method GetAdjacent A helper function to easily search around the parent node
     * @param {PathNode} node The parent node to search around
     * @param {Array} offset An array containing the x and y indices of the offset to be applied to the parent position
     * @returns {PathNode} The child node if the search cell is navigable, otherwise null
     */
    GetAdjacent(node, offset = [0, 0]) {
        let indexExists = false;

        // Check whether index exists
        if ((node.position[0] + offset[0]) > 0 && (node.position[0] + offset[0]) < this.cells.length) {
            if ((node.position[1] + offset[1]) > 0 && (node.position[1] + offset[1]) < this.cells[0].length) {
                indexExists = true;
            }
        }

        if (indexExists) {

            let isNavigable = this.cells[node.position[0] + offset[0]][node.position[1] + offset[1]] !== 1;

            if (isNavigable) {
                return new PathNode(node, [node.position[0] + offset[0], node.position[1] + offset[1]]);
            } else {
                return null;
            }

        } else {
            return null;
        }
    }

    /**
     * @method CompareNodes A helper function to easily determine the equality of two nodes
     * @param {PathNode} node1 
     * @param {PathNode} node2 
     * @returns {Boolean} True if both nodes are equal, false if not
     */
    CompareNodes(node1, node2) {
        if (node1.position[0] === node2.position[0] && node1.position[1] === node2.position[1]) {
            return true;
        } else {
            return false;
        }
    }
}