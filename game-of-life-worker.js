importScripts('game-of-life-core.js')

let gameCore

self.onmessage = function (e) {
  const { type, data } = e.data

  switch (type) {
    case 'init':
      const { width, height } = data
      gameCore = new GameOfLifeCore(width, height)
      break
    case 'toggleCell':
      const { x, y } = data
      gameCore.toggleCell(x, y)
      self.postMessage({
        type: 'cellToggled',
        cell: { x, y, isAlive: gameCore.grid[y][x].isAlive }
      })
      break
    case 'step':
      gameCore.step()
      const changedCells = gameCore.getChangedCells()
      const simpleCells = changedCells.map((cell) => ({
        x: cell.x,
        y: cell.y,
        isAlive: cell.isAlive
      }))
      self.postMessage({ type: 'update', changedCells: simpleCells })
      break
    case 'reset':
      gameCore.reset()
      self.postMessage({ type: 'resetDone' })
      break
  }
}
