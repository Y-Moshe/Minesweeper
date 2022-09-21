'use strict'

function placeMines(board) {
  // making one array contains all objects(cell object)
  const allCells = []
  for (let i = 0; i < board.length; i++) {
    allCells.push( ...board[i] )
  }

  var minesLeft = gLevel.MINES
  while (minesLeft > 0) {
    const randIdx = getRandomIntInclusive(0, allCells.length - 1)
    const randCell = allCells.splice(randIdx, 1)[0]
    randCell.isMine = true
    minesLeft--
  }

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      setMinesNegsCount(board, i, j)
    }
  }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
  var count = 0
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      var currCell = board[i][j]
      if (currCell.isMine) count++
    }
  }

  board[rowIdx][colIdx].minesAroundCount = count
}

function revealMines(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const cell = board[i][j]
      cell.isShown = true
    }
  }
  renderBoard(board)
}
