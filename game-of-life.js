class GameOfLife {
  constructor(
    gameCore,
    gridElement,
    startButton,
    stopButton,
    resetButton,
    gridSizeInput,
    speedInput
  ) {
    this.gameCore = gameCore
    this.gridElement = gridElement
    this.startButton = startButton
    this.stopButton = stopButton
    this.resetButton = resetButton
    this.gridSizeInput = gridSizeInput
    this.speedInput = speedInput
    this.interval = null
    this.isRunning = false
    this.cellElements = []
    this.speed = parseInt(speedInput.value)
    this.isDrawing = false
    this.lastCellUnderMouse = null

    this.createHtmlGrid()
    this.setupEventListeners()
  }

  createHtmlGrid() {
    this.gridElement.style.gridTemplateColumns = `repeat(${this.gameCore.width}, 10px)`
    this.gridElement.style.gridTemplateRows = `repeat(${this.gameCore.height}, 10px)`

    this.gridElement.innerHTML = ''
    for (let y = 0; y < this.gameCore.height; y++) {
      const row = []
      for (let x = 0; x < this.gameCore.width; x++) {
        const cellElement = document.createElement('div')
        cellElement.classList.add('cell')
        cellElement.dataset.x = x
        cellElement.dataset.y = y
        this.gridElement.appendChild(cellElement)
        row.push(cellElement)
      }
      this.cellElements.push(row)
    }
  }

  setupEventListeners() {
    this.gridElement.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return
      this.isDrawing = true
      const target = event.target
      if (target.classList.contains('cell')) {
        const x = parseInt(target.dataset.x)
        const y = parseInt(target.dataset.y)
        this.gameCore.toggleCell(x, y)
        this.toggleCell(x, y)
      }
    })

    this.gridElement.addEventListener('mouseup', () => {
      this.isDrawing = false
    })
    this.gridElement.addEventListener('mouseleave', () => {
      this.isDrawing = false
    })

    this.gridElement.addEventListener('mousemove', (event) => {
      if (!this.isDrawing) return
      const { target } = event
      if (
        target.classList.contains('cell') &&
        target !== this.lastCellUnderMouse
      ) {
        this.lastCellUnderMouse = target
        const x = parseInt(target.dataset.x)
        const y = parseInt(target.dataset.y)
        this.gameCore.toggleCell(x, y)
        this.toggleCell(x, y)
      }
    })

    this.startButton.addEventListener('click', () => this.start())
    this.stopButton.addEventListener('click', () => this.stop())
    this.resetButton.addEventListener('click', () => this.reset())

    this.gridSizeInput.addEventListener('change', () => this.changeGridSize())
    this.speedInput.addEventListener('change', () => this.changeSpeed())
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true
      this.interval = setInterval(() => {
        this.gameCore.step()
        this.updateUI()
      }, this.speed)
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false
      clearInterval(this.interval)
    }
  }

  reset() {
    this.stop()
    this.gameCore.reset()
    this.updateUI()
  }

  changeGridSize() {
    const newSize = parseInt(this.gridSizeInput.value)
    this.stop()
    this.gameCore = new GameOfLifeCore(newSize, newSize)
    this.cellElements = []
    this.createHtmlGrid()
  }

  changeSpeed() {
    this.speed = parseInt(this.speedInput.value)
    if (this.isRunning) {
      this.stop()
      this.start()
    }
  }

  updateUI() {
    const changedCells = this.gameCore.getChangedCells()
    requestAnimationFrame(() => {
      changedCells.forEach((cell) => {
        const cellElement = this.cellElements[cell.y][cell.x]
        cellElement.classList.toggle('alive', cell.isAlive)
      })
    })
  }

  toggleCell(x, y) {
    const cell = this.gameCore.grid[y][x]
    const cellElement = this.cellElements[y][x]
    cellElement.classList.toggle('alive', cell.isAlive)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.getElementById('grid')
  const startButton = document.getElementById('start-button')
  const stopButton = document.getElementById('stop-button')
  const resetButton = document.getElementById('reset-button')
  const gridSizeInput = document.getElementById('grid-size')
  const speedInput = document.getElementById('speed')

  const width = parseInt(gridSizeInput.value)
  const height = parseInt(gridSizeInput.value)

  const gameCore = new GameOfLifeCore(width, height)
  new GameOfLife(
    gameCore,
    gridElement,
    startButton,
    stopButton,
    resetButton,
    gridSizeInput,
    speedInput
  )
})
