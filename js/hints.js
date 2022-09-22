'use strict'

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

function setHint() {
  if (gGame.hints === 0 || !gGame.isOn) return
  gGame.isHintActive = true
  const elHint = document.querySelector('.hint-btn')
  elHint.querySelector('span').innerText = --gGame.hints
  if (gGame.hints === 0) elHint.setAttribute('disabled', true)
}

function safeClick() {
  if (gGame.safeClicks === 0 || !gGame.isOn) return
  const location = getSafeLocation(gBoard)
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  
  elCell.classList.add('safe-mark')
  setTimeout(() => elCell.classList.remove('safe-mark'), 2000)

  const elSafeBtn = document.querySelector('.safe-btn')
  elSafeBtn.querySelector('span').innerText = --gGame.safeClicks
  if (gGame.safeClicks === 0) elSafeBtn.setAttribute('disabled', true)
}

function setMegaHintMode() {
  if (!gGame.megaHintActiveCount) gGame.isMegaHintActive = true
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
    saveStep()

    revealMines(gBoard, 'MEGA', 2000)
  }
}
