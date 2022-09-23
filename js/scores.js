'use strict'

function renderScores() {
  const bestScores = getScores()
  var strHTML = '<ul>'
  for (let i = 0; i < bestScores.length; i++) {
    const score = bestScores[i]
    strHTML += `<li>${score.level}: ${convertSecToTime(score.score)}</li>`
  }
  strHTML += '</ul>'

  renderElValue('.scores', 'BEST SCORES: ' + strHTML)
}

function getScores() {
  const levels = ['Beginner', 'Medium', 'Expert']
  const scores = []
  for (let i = 0; i < levels.length; i++) {
    const higestScore = JSON.parse(localStorage.getItem(levels[i]))
    if (!higestScore) continue
    scores.push({ level: levels[i], score: higestScore })
  }
  return scores
}

function getHigestScore() {
  const currLevel = convertLvlToLabel(gLevel.SIZE)
  const higestScore = JSON.parse(localStorage.getItem(currLevel))
  return higestScore || Infinity
}

function saveHigestScore() {
  const currLevel = convertLvlToLabel(gLevel.SIZE)
  localStorage.setItem(currLevel, gGame.secsPassed)
}
