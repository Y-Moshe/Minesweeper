'use strict'

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function getCellIcon(cell) {
  let icon = cell.isShown ? (cell.minesAroundCount || '') : ''
  if (cell.isShown && cell.isMine) icon = MINE_ICON
  else if (cell.isMarked) icon = FLAG_ICON

  return icon
}

function getEmptyCells(board) {
  const cells = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!board[i][j].trim()) {
        cells.push({ i, j })
      }
    }
  }

  return cells
}

/**
 * get one array contains the matrix cell content(object in our case)
 * @param mat matrix, [[], [], []]...etc
 * @returns array[] of all cells content
 */
function getCellsFromMat(mat) {
  const cells = []
  for (let i = 0; i < mat.length; i++) {
    cells.push( ...mat[i] )
  }

  return cells
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color
}
