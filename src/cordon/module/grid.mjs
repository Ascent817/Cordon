/**
 * Provides an object to represent a pathfinding grid of nodes.
 * This verision is for use as an ES6 module with nodejs
 */
class Grid {
    /**
     * @param {integer} width Width of the grid in cells
     * @param {integer} height Height of the grid in cells
     * @param {Array} [start] Optional - An array with two items, x and y, to be used as 0-based indices for the start cell
     * @param {Array} [target] Optional - An array with two items, x and y, to be used as 0-based indices for the target cell
     */
    constructor (width, height, start, target) {
        this.width = width;
        this.height = height;

        // Set what the numbers in the grid mean
        this.emptyCell = 0;
        this.obstacleCell = 1;
        this.startCell = 2;
        this.targetCell = 3;

        // Initialize array and fill it with empty space (0)
        this.cells = Array(width);
        for (var i = 0; i < width; i++) {
            this.cells[i] = Array(height).fill(this.emptyCell);
        }

        // If a start or target cell is provided, set those as well
        if (start) {
            this.SetCell(start[0], start[1], this.startCell);
        }

        if (target) {
            this.SetCell(target[0], target[1], this.targetCell);
        }
    }

    /**
     * @method SetCell Sets the cell at [x, y] to the specified value
     * @param {integer} x The horizontal index of the cell to set
     * @param {integer} y The vertical index of the cell to set
     * @param {integer} value The integer to set the cell to. Can be 0 for empty, 1 for an obstacle, 2 for the starting position, or 3 for the target
     */
    SetCell(x, y, value) {
        Array.from(arguments).forEach(arg => {
            if (!Number.isInteger(arg)) {
                throw 'All parameters must be integers!';
            }
        });
        this.cells[x][y] = value;
    }
}

export default Grid;