'use strict'

const FLAG_ICON = '<img src="assets/images/flag-48x48.png" />'
const MINE_ICON = '<img src="assets/images/mine-48x48.png" />'

const SMILE_ICON = '<img src="assets/images/smile.png" />'
const SAD_ICON   = '<img src="assets/images/sad.png" />'
const HAPPY_ICON = '<img src="assets/images/happy.png" />'

const boomSound  = new Audio('assets/sounds/boom.mp3')
boomSound.volume = 0.7

var gBoard = []
var gLevel = {
  SIZE: 4,
  MINES: 2
}
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
}
var gTimerIntervalId

function initGame() {
  updateStatusBtn()

  gGame.shownCount  = 0
  gGame.markedCount = 0
  gGame.secsPassed  = 0
  gBoard = buildBoard()
  renderBoard(gBoard)

  gGame.isOn = true
}

function onLevelChange(elLevel, level, mines) {
  gLevel.SIZE = +level
  gLevel.MINES = +mines

  const elLevels = document.querySelector('.levels').children
  for (let i = 0; i < elLevels.length; i++) {
    const levelElement = elLevels[i]
    levelElement.classList.remove('active')
    if (levelElement === elLevel) {
      elLevel.classList.add('active')
    }
  }

  initGame()
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
    isMarked: false
  }
}

function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {

      strHTML += '<tr>'
      for (var j = 0; j < board[0].length; j++) {
          const cell = board[i][j]
          let className = `cell cell-${i}-${j} `
          className += cell.isShown ? 'shown' : ''
          strHTML += `<td class="${className}"
            onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(event, ${i}, ${j})">${getCellIcon(cell)}</td>`
      }
      strHTML += '</tr>'
  }
  
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
  const cell = gBoard[i][j]
  if (cell.isShown || cell.isMarked || !gGame.isOn) return
  if (cell.isMine) blowMine()
  
  cell.isShown = true
  gGame.shownCount++
  elCell.classList.add('shown')
  if (!cell.minesAroundCount && gGame.shownCount !== 1) expandShown(gBoard, i, j)
  if (gGame.shownCount === 1) {
    placeMines(gBoard) // on first click
    gTimerIntervalId = setInterval(renderTime, 1000)
  }

  renderCell({ i, j }, getCellIcon(cell))
}

function cellMarked(event, i, j) {
  event.preventDefault()
  const cell = gBoard[i][j]
  if (cell.isShown) return
  if (!cell.isMarked && gGame.markedCount === gLevel.MINES) return

  cell.isMarked = !cell.isMarked
  cell.isMarked ? gGame.markedCount++ : gGame.markedCount--

  renderCell({ i, j }, getCellIcon(cell))
}

function renderTime() {
  const elTime = document.querySelector('.time')
  elTime.innerText = 'Time: ' + ++gGame.secsPassed
}

function blowMine() {
  boomSound.play()
  updateStatusBtn('SAD')
  gameOver()
}

function checkGameOver() {

}

function gameOver() {
  gGame.isOn = false
  clearInterval(gTimerIntervalId)
  revealMines(gBoard)
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

  document.querySelector('.status-btn').innerHTML = status
}

function expandShown(board, rowIdx, colIdx) {
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      var currCell = board[i][j]

      // isShown and 0 around or 1++ around and its not a mine
      if (!currCell.isShown && !currCell.minesAroundCount ||
           currCell.minesAroundCount &&!currCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        cellClicked(elCell, i, j)
      }
    }
  }
}
