class GameOfLifeCore {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.grid = this.createGrid()
    this.aliveCells = new Set()
    this.changedCells = new Set()
  }

  createGrid() {
    const grid = []
    for (let y = 0; y < this.height; y++) {
      const row = []
      for (let x = 0; x < this.width; x++) {
        const cell = new GameOfLifeCell(x, y)
        row.push(cell)
      }
      grid.push(row)
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        grid[y][x].setNeighbors(grid, this.width, this.height)
      }
    }

    return grid
  }

  toggleCell(x, y) {
    const cell = this.grid[y][x]
    cell.isAlive = !cell.isAlive
    if (cell.isAlive) {
      this.aliveCells.add(cell)
    } else {
      this.aliveCells.delete(cell)
    }
    this.changedCells.add(cell)
  }

  step() {
    const cellsToCheck = new Set()

    this.aliveCells.forEach((cell) => {
      cellsToCheck.add(cell)
      cell.neighbors.forEach((neighbor) => cellsToCheck.add(neighbor))
    })

    cellsToCheck.forEach((cell) => {
      const aliveNeighbors = cell.neighbors.filter(
        (neighbor) => neighbor.isAlive
      ).length
      const wasAlive = cell.isAlive
      if (cell.isAlive) {
        cell.nextState = aliveNeighbors === 2 || aliveNeighbors === 3
      } else {
        cell.nextState = aliveNeighbors === 3
      }
      if (wasAlive !== cell.nextState) {
        this.changedCells.add(cell)
      }
    })

    this.changedCells.forEach((cell) => {
      cell.commitNextState()
      if (cell.isAlive) {
        this.aliveCells.add(cell)
      } else {
        this.aliveCells.delete(cell)
      }
    })
  }

  reset() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x]
        cell.isAlive = false
        cell.nextState = false
        this.changedCells.add(cell)
      }
    }
    this.aliveCells.clear()
  }

  getChangedCells() {
    const changedCells = Array.from(this.changedCells)
    this.changedCells.clear()
    return changedCells
  }
}

class GameOfLifeCell {
  constructor(x, y, isAlive = false) {
    this.x = x
    this.y = y
    this.isAlive = isAlive
    this.nextState = isAlive
    this.neighbors = []
  }

  setNeighbors(grid, width, height) {
    this.neighbors = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = (this.x + dx + width) % width
        const ny = (this.y + dy + height) % height
        this.neighbors.push(grid[ny][nx])
      }
    }
  }

  commitNextState() {
    this.isAlive = this.nextState
  }
}
