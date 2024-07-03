class GameOfLife {
  constructor(
    gridElement,
    startButton,
    stopButton,
    resetButton,
    gridSizeInput,
    speedInput
  ) {
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
    this.lastFrameTime = 0
    this.offsetX = 0
    this.offsetY = 0
    this.isDragging = false

    this.worker = new Worker('game-of-life-worker.js')
    this.worker.onmessage = this.handleWorkerMessage.bind(this)

    this.createHtmlGrid()
    this.setupEventListeners()

    this.initGameCore()
  }

  initGameCore() {
    const width = parseInt(this.gridSizeInput.value)
    const height = parseInt(this.gridSizeInput.value)
    this.worker.postMessage({ type: 'init', data: { width, height } })
  }

  createHtmlGrid() {
    const size = parseInt(this.gridSizeInput.value)
    this.gridElement.style.gridTemplateColumns = `repeat(${size}, 10px)`
    this.gridElement.style.gridTemplateRows = `repeat(${size}, 10px)`

    this.gridElement.innerHTML = ''
    for (let y = 0; y < size; y++) {
      const row = []
      for (let x = 0; x < size; x++) {
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
      event.preventDefault()
      if (event.button === 0) {
        this.isDrawing = true
        const target = event.target
        if (target.classList.contains('cell')) {
          const x = parseInt(target.dataset.x)
          const y = parseInt(target.dataset.y)
          this.worker.postMessage({ type: 'toggleCell', data: { x, y } })
        }
      } else if (event.button === 1) {
        this.startDragging(event)
      }
    })

    this.gridElement.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        this.isDrawing = false
      } else if (event.button === 1) {
        this.stopDragging()
      }
    })
    this.gridElement.addEventListener('mouseleave', () => {
      this.isDrawing = false
      this.stopDragging()
    })

    this.gridElement.addEventListener('mousemove', (event) => {
      if (this.isDrawing) {
        const { target } = event
        if (
          target.classList.contains('cell') &&
          target !== this.lastCellUnderMouse
        ) {
          this.lastCellUnderMouse = target
          const x = parseInt(target.dataset.x)
          const y = parseInt(target.dataset.y)
          this.worker.postMessage({ type: 'toggleCell', data: { x, y } })
        }
      } else if (this.isDragging) {
        this.dragGrid(event)
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
      this.lastFrameTime = performance.now()
      requestAnimationFrame(this.step.bind(this))
    }
  }

  step(timestamp) {
    if (!this.isRunning) return

    const elapsed = timestamp - this.lastFrameTime

    if (elapsed >= this.speed) {
      this.worker.postMessage({ type: 'step' })
      this.lastFrameTime = timestamp
    }

    requestAnimationFrame(this.step.bind(this))
  }

  stop() {
    this.isRunning = false
  }

  startDragging(event) {
    this.isDragging = true
    this.startX = event.clientX
    this.startY = event.clientY
    this.gridElement.classList.add('moving')
    event.preventDefault()
  }

  stopDragging() {
    this.isDragging = false
    this.gridElement.classList.remove('moving')
  }

  dragGrid(event) {
    this.offsetX += event.clientX - this.startX
    this.offsetY += event.clientY - this.startY
    this.startX = event.clientX
    this.startY = event.clientY
    this.updateTransform()
  }

  updateTransform() {
    this.gridElement.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`
  }

  resetGridPosition() {
    this.offsetX = 0
    this.offsetY = 0
    this.updateTransform()
  }

  reset() {
    this.stop()
    this.worker.postMessage({ type: 'reset' })
    this.resetGridPosition()
  }

  changeGridSize() {
    this.stop()
    this.cellElements = []
    this.createHtmlGrid()
    this.initGameCore()
    this.resetGridPosition()
  }

  changeSpeed() {
    this.speed = parseInt(this.speedInput.value)
  }

  handleWorkerMessage(event) {
    const { type, changedCells, cell } = event.data

    if (type === 'update') {
      requestAnimationFrame(() => {
        changedCells.forEach((cell) => {
          const cellElement = this.cellElements[cell.y][cell.x]
          cellElement.classList.toggle('alive', cell.isAlive)
        })
      })
    } else if (type === 'cellToggled') {
      const cellElement = this.cellElements[cell.y][cell.x]
      cellElement.classList.toggle('alive', cell.isAlive)
    } else if (type === 'resetDone') {
      this.updateUI()
    }
  }

  updateUI() {
    this.cellElements.forEach((row, y) => {
      row.forEach((cellElement, x) => {
        cellElement.classList.remove('alive')
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.getElementById('grid')
  const startButton = document.getElementById('start-button')
  const stopButton = document.getElementById('stop-button')
  const resetButton = document.getElementById('reset-button')
  const gridSizeInput = document.getElementById('grid-size')
  const speedInput = document.getElementById('speed')

  new GameOfLife(
    gridElement,
    startButton,
    stopButton,
    resetButton,
    gridSizeInput,
    speedInput
  )
})
