'use strict'

function placeMines(board) {
  const allCells = getCellsFromMat(board)
  var minesLeft = gLevel.MINES

  while (minesLeft > 0) {
    const randIdx = getRandomIntInclusive(0, allCells.length - 1)
    const randCell = allCells.splice(randIdx, 1)[0]
    if (randCell.isShown) continue // skip the first click position
    randCell.isMine = true
    minesLeft--
  }

  // set each cell object to its own minesAroundCount prop
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

function blowMine(cell) {
  cell.isBlewed = true
  renderBoard(gBoard)
  boomSound.play()
  gGame.lives--
  updateLivesLeft()
  if (gGame.lives <= 0) {
    updateStatusBtn('SAD')
    gameOver()
  }
}

/**
 * Reveals mines temporary or permanent based on the func parameters
 * @param  board 
 * @param  type 'HINT' || 'MEGA' || 'ALL'
 * @param  timeout (optional) temporary reveal, timeout in ms
 * @param  i (optional) required for the 'AROUND'
 * @param  j (optional) required for the 'AROUND'
 */
 function revealMines(board, type, timeout = 0, i = 0, j = 0) {
  let rowLocation = {}
  let colLocation = {}
  gGame.shownCount++ // we count revealMines as step because on undo we --step
  switch (type) {
    case 'HINT':
      rowLocation.s = i - 1
      rowLocation.e = i + 1

      colLocation.s = j - 1
      colLocation.e = j + 1
      break;
    case 'MEGA':
      rowLocation = gGame.megaHintLocations[0]
      colLocation = gGame.megaHintLocations[1]
      break;
    case 'ALL':
      rowLocation.s = 0
      rowLocation.e = board.length - 1

      colLocation.s = 0
      colLocation.e = board[0].length - 1
      break;
  }

  displayMines(board, rowLocation, colLocation)
  timeout && setTimeout(() => {
    undoStep()
    if (type === 'HINT') gGame.isHintActive = false
    else if (type === 'MEGA') gGame.isMegaHintActive = false
  }, timeout)
}

// rowIdxLocation { s: 0, e 10 } // end and start
function displayMines(board, rowIdxLocation, colIdxLocation) {
  for (let i = rowIdxLocation.s; i <= rowIdxLocation.e; i++) {
    if (i < 0 || i >= board.length) continue
  
    for (let j = colIdxLocation.s; j <= colIdxLocation.e; j++) {
      if (j < 0 || j >= board[0].length) continue
      board[i][j].isShown = true
    }
  }
  renderBoard(board)
}
