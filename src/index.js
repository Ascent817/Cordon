/**
 * Example usage of Cordon. Not included in the module.
 */

let grid = new Grid(20, 20, [5, 10], [15, 10]);
let cellWidth = 0;

function setup() {
    /* Set up p5 sketch */
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    background(22, 22, 22);

    /* Set up the grid */
    drawGrid(grid.cells);
}

function draw() {
    if (mouseIsPressed) {
        let cellX = Math.floor(mouseX / cellWidth)
        let cellY = Math.floor(mouseY / cellWidth)
        
        if (cellX < grid.cells.length && cellY < grid.cells[0].length && cellX > -1 && cellY > -1) {
            grid.SetCell(cellX, cellY, 1);
            fill(0);
            rect(cellX * cellWidth, cellY * cellWidth, cellWidth, cellWidth);
            let path = grid.SolvePath();
            console.log(path);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    drawGrid(grid.cells);
}

function drawGrid(grid = [[0, 0], [0, 0]]) {
    // Find out the maximum size the cells can be by dividing both the width and height by the number of columns and rows
    let maxWidth = windowWidth / grid.length;
    let maxHeight = windowHeight / grid[0].length;
    maxWidth > maxHeight ? cellWidth = maxHeight : cellWidth = maxWidth;

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            let cell = grid[x][y];
            switch (cell) {
                case 0:
                    fill(100);
                    break;
                case 1:
                    fill(0);
                    break;
                case 2:
                    fill(255, 0, 0);
                    break;
                case 3:
                    fill(0, 255, 0);
                    break;
                default:
                    throw "The grid passed was not of an appropriate type.";
                    break;
            }
            strokeWeight(0.5);
            rect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        }
    }
}