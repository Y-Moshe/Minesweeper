'use strict'

function setHint(elHint) {
  if (gGame.hints === 0 || gGame.isHintActive || !gGame.isOn) return
  gGame.isHintActive = true

  elHint.querySelector('span').innerText = --gGame.hints
  elHint.classList.add('active-hint')
  if (gGame.hints === 0) elHint.setAttribute('disabled', true)
}

function safeClick(elSafeBtn) {
  if (gGame.safeClicks === 0 || !gGame.isOn) return
  const location = getSafeLocation(gBoard)
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  
  elCell.classList.add('safe-mark')
  setTimeout(() => elCell.classList.remove('safe-mark'), 2000)

  elSafeBtn.querySelector('span').innerText = --gGame.safeClicks
  if (gGame.safeClicks === 0) elSafeBtn.setAttribute('disabled', true)
}

function getSafeLocation(board) {
  const locations = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]
      if (!currCell.isShown && !currCell.isMine) locations.push({ i, j })
    }
  }

  const randIdx = getRandomIntInclusive(0, locations.length - 1)
  return locations.splice(randIdx, 1)[0]
}

function setMegaHintMode(elHint) {
  if (!gGame.megaHintActiveCount) {
    gGame.isMegaHintActive = !gGame.isMegaHintActive
    if (gGame.isMegaHintActive) elHint.classList.add('active-hint')
  }
}

function setMegaHintLocations(i, j) {
  gGame.megaHintActiveCount++
  gGame.megaHintLocations.push({ s: i, e: j })

  if (gGame.megaHintActiveCount === 2) {
    const location1 = gGame.megaHintLocations[0]
    const location2 = gGame.megaHintLocations[1]
    if (location1.s < location2.s) {
      const temp = location1.e
      location1.e = location2.s
      location2.s = temp
    }

    revealMines(gBoard, 'MEGA', 2000)
    gGame.isMegaHintActive = false
    document.querySelector('.mega-hint').setAttribute('disabled', true)
  }
}

function onManualModeChange(elManual) {
  gGame.isManualMode = elManual.checked
  if (gGame.isManualMode) {
    elManual.classList.add('active')
  } else {
    // Prepare the board by change isShown to false and set mines count
    for (let i = 0; i < gBoard.length; i++) {
      for (let j = 0; j < gBoard[0].length; j++) {
        gBoard[i][j].isShown = false
        setMinesNegsCount(gBoard, i, j)
      }
    }
    renderBoard(gBoard)
  }
}

function setManualBoard(i, j) {
  const cell = gBoard[i][j];
  if (gGame.manualMinesCount === gLevel.MINES && !cell.isMine) return
  cell.isShown = true
  cell.isMine = !cell.isMine
  cell.isMine ? gGame.manualMinesCount++ : gGame.manualMinesCount--

  renderElValue('.mines', 'Mines: ' + gLevel.MINES - gGame.manualMinesCount)
  renderElValue(`.cell-${i}-${j}`, getCellIcon(cell))
}

function boom7() {
  initGame()
  gGame.is7BoomMode = true
}

function set7BoomBoard(i, j) {
  const cells = getCellsFromMat(gBoard)
  const clickedCell = gBoard[i][j]
  var countMines = 0

  for (let i = 0; i < cells.length; i++) {
    if (countMines === gLevel.MINES) break // if we reach max number of mines per board exit
    const index = i + 1
    if (index % 10 === 7 || index % 7 === 0) {
      if (clickedCell === cells[i]) continue // if the first click index contain 7 skip that cell
      cells[i].isMine = true
      countMines++
    }
  }

  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      setMinesNegsCount(gBoard, i, j)
    }
  }
  gGame.is7BoomMode = false
  renderBoard(gBoard)
}

function exterminator() {
  saveStep()
  const MINES_TO_ELIMINATE = 3
  const minesToElimate = getRandomMines(MINES_TO_ELIMINATE)

  for (let index = 0; index < minesToElimate.length; index++) {
    const mineLocation = minesToElimate[index].location // { i, j }
    const cell = minesToElimate[index].cell // cell object { isMine, ... }
    cell.isMine = false // elminate
    cell.isShown = true
    gGame.shownCount++

    // run on his negs and update its minesAroundCount prop
    for (let i = mineLocation.i - 1; i <= mineLocation.i + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue

      for (let j = mineLocation.j - 1; j <= mineLocation.j + 1; j++) {
        if (j < 0 || j >= gBoard[0].length) continue

        setMinesNegsCount(gBoard, i, j)
      }
    }
  }

  const minesLeft = gLevel.MINES - MINES_TO_ELIMINATE
  gLevel.MINES = minesLeft < 0 ? 0 : minesLeft
  renderElValue('.mines', 'Mines: ' + gLevel.MINES)
  renderBoard(gBoard)
}

function getRandomMines(amount) {
  const mines = [] // [{ location: { i, j }, cell }]

  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      const currCell = gBoard[i][j]
      if (!currCell.isShown && currCell.isMine)
        mines.push({ location: { i, j }, cell: currCell })
    }
  }

  const randomMines = []
  for (let i = 0; i < amount; i++) {
    const randIdx = getRandomIntInclusive(0, mines.length - 1)
    const randMine = mines.splice(randIdx, 1)[0]
    randMine && randomMines.push(randMine)
  }

  return randomMines
}
