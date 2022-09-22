'use strict'

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function convertLvlToLabel(level) {
  switch (level) {
    case 12: return 'Expert'
    case 8: return 'Medium'
    default:
      return 'Beginner'
  }
}

/**
 * convert seconds to readable time
 * @param seconds seconds in number, not miliseconds!
 * @returns readable string like "6min, 4s"
 */
function convertSecToTime(seconds) {
  const minute = Math.floor(seconds / 60)
  const sec = seconds % 60
  return minute ? `${minute}min, ${sec}s` : `${sec}s`
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
