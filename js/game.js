'use strict'

const FLAG_ICON = '<img src="assets/images/flag-48x48.png" />'
const MINE_ICON = '<img src="assets/images/mine-48x48.png" />'

const SMILE_ICON = '<img src="assets/images/buttons/smile.png" />'
const SAD_ICON   = '<img src="assets/images/buttons/sad.png" />'
const HAPPY_ICON = '<img src="assets/images/buttons/happy.png" />'

const boomSound  = new Audio('assets/sounds/boom.mp3')
boomSound.volume = 0.7

var gBoard = []
var gLevel = {
  SIZE: 4,
  MINES: 2
}
var gGameSteps = [] // will store a game state { shownCount, gBoard }
var initialGameState = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 1,

  isManualMode: false,
  manualMinesCount: 0,

  hints: 3,
  isHintActive: false,
  safeClicks: 3,

  isMegaHintActive: false,
  megaHintActiveCount: 0,
  megaHintLocations: []
}
var gGame = { ...initialGameState }
var gTimerIntervalId

function initGame() {
  updateStatusBtn()

  gGame = { ...initialGameState, megaHintLocations: [] }
  gBoard = buildBoard()
  renderBoard(gBoard)
  renderScores()
  updateLivesLeft()
  renderElValue('.flags', 'Flags: ' + gGame.markedCount)
  renderElValue('.mines', 'Mines: ' + gLevel.MINES)

  gGame.isOn = true
}

function buildBoard() {
  const board = []
  for (let i = 0; i < gLevel.SIZE; i++) {
    
    board.push([])
    for (let j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = createCell()
    }
  }

  return board;
}

function createCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isBlewed: false,
    isMarked: false
  }
}

function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {

      strHTML += '<tr>'
      for (var j = 0; j < board[0].length; j++) {
          const cell = board[i][j]
          let className = `cell cell-${i}-${j} ${cell.isShown ? 'shown' : ''}`
          const style = cell.isBlewed ? 'border: 2px solid red' : ''

          strHTML += `<td class="${className}" style="${style}"
            onclick="cellClicked(this, ${i}, ${j}, true)"
            onmouseenter="cellEnter(${i}, ${j})"
            oncontextmenu="cellMarked(event, ${i}, ${j})">${getCellIcon(cell)}</td>`
      }
      strHTML += '</tr>'
  }
  
  renderElValue('.board', strHTML)
}

function getCellIcon(cell) {
  let icon = cell.isShown ? (cell.minesAroundCount || '') : ''
  if (cell.isShown && cell.isMine) icon = MINE_ICON
  else if (cell.isMarked) icon = FLAG_ICON

  return icon
}

function cellClicked(elCell, i, j, isUserClick = false) {
  if (gGame.isManualMode) return setManualBoard(i, j)
  
  isUserClick && saveStep() // save step only if it was a user click, another case click can be from expandShown
  if (gGame.isMegaHintActive) return setMegaHintLocations(i, j)
  if (gGame.isHintActive) return revealMines(gBoard, 'HINT', 1000, i, j)

  const cell = gBoard[i][j]
  if (cell.isShown || cell.isMarked || !gGame.isOn) return
  cell.isShown = true
  if (cell.isMine) return blowMine(cell)
  
  gGame.shownCount++
  elCell.classList.add('shown')
  // if cells around not falsy(0) and its not the first click
  if (!cell.minesAroundCount && gGame.shownCount !== 1) expandShown(gBoard, i, j)
  // on first click, skip on manual
  if (gGame.shownCount === 1) {
    if (gGame.manualMinesCount === 0) { // if manual mode was not set
      placeMines(gBoard)
      startTimer()
    }
  }

  renderElValue(`.cell-${i}-${j}`, getCellIcon(cell))
  checkGameOver()
}

function cellMarked(event, i, j) {
  event.preventDefault() // prevent the defaults right click menu
  const cell = gBoard[i][j]
  if (cell.isShown || gGame.isManualMode) return
  if (!cell.isMarked && gGame.markedCount === gLevel.MINES) return // max flags = gLevel.MINES

  cell.isMarked = !cell.isMarked
  cell.isMarked ? gGame.markedCount++ : gGame.markedCount--

  renderElValue('.flags', 'Flags: ' + gGame.markedCount)
  renderElValue(`.cell-${i}-${j}`, getCellIcon(cell))
}

function cellEnter(currI, currJ) {
  if (gGame.isMegaHintActive && gGame.megaHintActiveCount > 0) {
    const location = gGame.megaHintLocations[0]
    for (let i = location.s; i <= gBoard.length; i++) {
      for (let j = location.e; j < gBoard[0].length; j++) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell && elCell.classList.remove('safe-mark')
        if (i <= currI && j <= currJ)
          elCell.classList.add('safe-mark')
      }
    }
  }
}

function startTimer() {
  gTimerIntervalId = setInterval(() => {
    renderElValue('.time', 'Time: ' + convertSecToTime(++gGame.secsPassed))
  }, 1000)
}

function checkGameOver() {
  var cellsToReveal = gLevel.SIZE ** 2 - gGame.shownCount
  if (cellsToReveal === gLevel.MINES) {
    gameOver()
    updateStatusBtn('HAPPY')
    if (gGame.secsPassed < getHigestScore()) saveHigestScore()
    alert('Victory')
  }
}

function gameOver() {
  gGame.isOn = false
  clearInterval(gTimerIntervalId)
  gTimerIntervalId = null
  revealMines(gBoard, 'ALL')
}

function undoStep() {
  if (gGameSteps.length === 0) return

  const previousState = gGameSteps.pop()
  gBoard = previousState.board
  gGame.shownCount = previousState.shownCount

  renderBoard(gBoard)
  updateStatusBtn() // in case gameOver(Mine blowed), otherwise it doesn't matter

  if (!gTimerIntervalId) startTimer() // continue timer in case of mine blow
  gGame.isOn = true // in case gameOver(Mine blowed), otherwise it doesn't matter
}

function saveStep() {
  const board = []
  for (let i = 0; i < gBoard.length; i++) {

    board.push([])
    for (let j = 0; j < gBoard[0].length; j++) {
      board[i][j] = { ...gBoard[i][j] }
    }
  }
  gGameSteps.push({ shownCount: gGame.shownCount, board })
}

function expandShown(board, rowIdx, colIdx) {
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      var currCell = board[i][j]

      // if isShown and minesAroundCount are falsy(holds false or "0") make the expand
      // OR if minesAroundCount holds a number(not falsy) and its not mine, make the expand
      if (!currCell.isShown && !currCell.minesAroundCount ||
           currCell.minesAroundCount &&!currCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        cellClicked(elCell, i, j)
      }
    }
  }
}

function setManualMode(elManual) {
  gGame.isManualMode = !gGame.isManualMode
  if (gGame.isManualMode) {
    elManual.classList.add('active')
  } else {
    // prepareBoard by change isShown to false
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

/**
 * Updates face status button
 * @param {*} status 'SMILE' | 'HAPPY' | 'SAD'
 */
 function updateStatusBtn(status = 'SMILE') {
  switch (status) {
    case 'SAD': status = SAD_ICON
      break;
    case 'HAPPY': status = HAPPY_ICON
      break;
    case 'SMILE':
    default:
      status = SMILE_ICON
  }

  renderElValue('.status-btn', status)
}

function updateLivesLeft() {
  renderElValue('.lives', '❤'.repeat(gGame.lives))
}

function onLevelChange(elLevel, level, mines) {
  gLevel.SIZE = level
  gLevel.MINES = mines

  const elLevels = document.querySelector('.levels').children
  for (let i = 0; i < elLevels.length; i++) {
    const levelElement = elLevels[i]
    levelElement.classList.remove('active')
    if (levelElement === elLevel) {
      elLevel.classList.add('active')
    }
  }
  initGame()

  if (level === 4) gGame.lives = 1
  else if (level === 8) gGame.lives = 2
  else if (level === 12) gGame.lives = 3
  updateLivesLeft()
}
