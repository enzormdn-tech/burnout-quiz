// ─── Config ──────────────────────────────────────────────────────────
const WEBHOOK_URL = 'http://localhost:5678/webhook/quiz-burnout'

// ─── Questions ───────────────────────────────────────────────────────
// dim P = personnel (Q1-6, max 24), W = travail (Q7-11, max 20), D = retrait (Q12-13, max 8)
const QUESTIONS = [
  { id: 1,  text: "Le matin, avant même de commencer ta journée, tu te sens déjà à plat.",                    dim: "P" },
  { id: 2,  text: "Ton corps est lourd — pas à cause d'un effort physique. Juste lourd.",                     dim: "P" },
  { id: 3,  text: "Tu te sens vidé même après une nuit de sommeil.",                                           dim: "P" },
  { id: 4,  text: "Tu tombes plus facilement malade, ou tu sens que tu résistes moins bien.",                  dim: "P" },
  { id: 5,  text: "Tu rentres et tu n'as plus rien à donner à personne.",                                      dim: "P" },
  { id: 6,  text: "Il t'arrive de penser \"je ne peux plus\" sans savoir exactement pourquoi.",                dim: "P" },
  { id: 7,  text: "Tu te sens irritable, à fleur de peau, pour des choses qui avant ne t'affectaient pas.",   dim: "W" },
  { id: 8,  text: "Tu te sens déconnecté de toi-même — comme si tu regardais ta vie de loin.",                dim: "W" },
  { id: 9,  text: "Le dimanche soir, tu appréhendes déjà le lendemain.",                                       dim: "W" },
  { id: 10, text: "Chaque heure au travail te coûte — même les heures \"faciles\".",                           dim: "W" },
  { id: 11, text: "Ton travail te frustre ou te laisse un sentiment d'inutilité.",                             dim: "W" },
  { id: 12, text: "Tu fais les choses en mode automatique, sans vraiment être présent.",                       dim: "D" },
  { id: 13, text: "Tu t'es éloigné des gens ou des activités qui te ressourçaient avant.",                    dim: "D" },
]

const SCALE = [
  { label: "Jamais",    value: 0 },
  { label: "Rarement",  value: 1 },
  { label: "Parfois",   value: 2 },
  { label: "Souvent",   value: 3 },
  { label: "Toujours",  value: 4 },
]

// ─── State ───────────────────────────────────────────────────────────
const state = {
  current: 0,
  answers: [],
  scores:  null,
  prenom:  '',
  email:   '',
}

// ─── DOM refs ────────────────────────────────────────────────────────
const screens = {
  intro:   document.getElementById('screen-intro'),
  quiz:    document.getElementById('screen-quiz'),
  teaser:  document.getElementById('screen-teaser'),
  confirm: document.getElementById('screen-confirm'),
}

// ─── Helpers ─────────────────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => {
    s.classList.remove('active', 'visible')
    s.style.display = 'none'
  })
  const target = screens[name]
  target.style.display = 'flex'
  target.classList.add('active')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add('visible'))
  })
  window.scrollTo(0, 0)
}

function calcScores() {
  let personal = 0, work = 0, retrait = 0
  QUESTIONS.forEach((q, i) => {
    const val = state.answers[i] ?? 0
    if (q.dim === 'P') personal += val
    else if (q.dim === 'W') work += val
    else retrait += val
  })
  return { personal, work, retrait, total: personal + work + retrait }
}

function getLevel(total) {
  if (total <= 16) return { label: 'Surchauffe précoce', cls: 'green',  pct: Math.round((total / 52) * 100) }
  if (total <= 30) return { label: 'Burnout silencieux', cls: 'yellow', pct: Math.round((total / 52) * 100) }
  if (total <= 44) return { label: 'Burnout profond',    cls: 'orange', pct: Math.round((total / 52) * 100) }
  return              { label: 'État critique',          cls: 'red',    pct: Math.round((total / 52) * 100) }
}

function getMirrorText(level) {
  switch (level.cls) {
    case 'green':
      return "Tu fonctionnes encore normalement. Mais certains matins, tu sens que quelque chose a changé — une légèreté qui s'est effritée. Les signaux sont là, discrets. C'est exactement le bon moment pour regarder."
    case 'yellow':
      return "Tu tiens. Mais tu tiens moins bien qu'avant. Tu récupères plus lentement, tu donnes avec plus d'effort. Ce que tu vis n'est pas de la fatigue ordinaire — c'est un système sous pression qui envoie des signaux clairs."
    case 'orange':
      return "Tu fonctionnes encore — mais c'est le mode automatique qui te porte, pas ton énergie. La distance s'est installée. Ce que tu vivais avec engagement est devenu lourd. Ton profil révèle quelque chose de précis."
    case 'red':
      return "Ce que révèlent tes réponses est sérieux. Pas pour t'alarmer — mais pour nommer honnêtement ce qui se passe. Tu as besoin d'un regard extérieur, précis, maintenant."
    default:
      return "Ton profil est prêt. L'analyse complète te donnera la précision nécessaire pour agir au bon endroit."
  }
}

// ─── Quiz ─────────────────────────────────────────────────────────────
function renderQuestion(index) {
  const q = QUESTIONS[index]

  const pct = (index / QUESTIONS.length) * 100
  document.getElementById('progress-bar').style.width = pct + '%'
  document.getElementById('question-counter').textContent = `${index + 1} / ${QUESTIONS.length}`

  const wrapper = document.getElementById('question-wrapper')
  wrapper.style.animation = 'none'
  wrapper.offsetHeight
  wrapper.style.animation = ''

  document.getElementById('question-text').textContent = q.text

  const container = document.getElementById('answers')
  container.innerHTML = ''
  SCALE.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'answer-btn'
    btn.textContent = opt.label
    if (state.answers[index] !== undefined && state.answers[index] === opt.value) {
      btn.classList.add('selected')
    }
    btn.addEventListener('click', () => onAnswer(index, opt.value, btn))
    container.appendChild(btn)
  })

  document.getElementById('btn-back').disabled = index === 0
}

function onAnswer(index, value, btn) {
  document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'))
  btn.classList.add('selected')
  state.answers[index] = value

  setTimeout(() => {
    if (index + 1 < QUESTIONS.length) {
      state.current = index + 1
      renderQuestion(state.current)
    } else {
      onQuizComplete()
    }
  }, 350)
}

// ─── Teaser ───────────────────────────────────────────────────────────
function onQuizComplete() {
  state.scores = calcScores()
  showScreen('teaser')
  renderTeaser()
}

function renderTeaser() {
  const { scores } = state
  const level = getLevel(scores.total)

  // Badge niveau
  const badge = document.getElementById('level-badge')
  badge.innerHTML = `
    <div class="level-bar">
      <div class="level-bar-fill fill-${level.cls}" style="width: 0%"></div>
    </div>
    <span class="level-text level-${level.cls}">${level.label} — ${scores.total} / 52</span>
  `
  setTimeout(() => {
    badge.querySelector('.level-bar-fill').style.width = level.pct + '%'
  }, 100)

  // Barres dimensions
  const pctPersonal = Math.round((scores.personal / 24) * 100)
  const pctWork     = Math.round((scores.work     / 20) * 100)

  setTimeout(() => {
    document.getElementById('dim-personal-fill').style.width = pctPersonal + '%'
    document.getElementById('dim-work-fill').style.width     = pctWork     + '%'
  }, 100)

  document.getElementById('dim-personal-score').textContent = scores.personal + ' / 24'
  document.getElementById('dim-work-score').textContent     = scores.work     + ' / 20'

  // Texte miroir
  document.getElementById('teaser-text').textContent = getMirrorText(level)
}

// ─── Submit ───────────────────────────────────────────────────────────
document.getElementById('btn-submit-email').addEventListener('click', () => {
  const prenomInput = document.getElementById('prenom-input')
  const emailInput  = document.getElementById('email-input')
  const prenom = prenomInput.value.trim()
  const email  = emailInput.value.trim()

  if (!prenom) {
    prenomInput.style.borderColor = '#c0622a'
    prenomInput.focus()
    return
  }
  prenomInput.style.borderColor = ''

  if (!email || !email.includes('@')) {
    emailInput.style.borderColor = '#c0622a'
    emailInput.focus()
    return
  }
  emailInput.style.borderColor = ''

  state.prenom = prenom
  state.email  = email

  sendWebhook()
  showScreen('confirm')
})

function sendWebhook() {
  const { scores } = state
  const level = getLevel(scores.total)

  const payload = {
    prenom:          state.prenom,
    email:           state.email,
    score_total:     scores.total,
    score_personnel: scores.personal,
    score_travail:   scores.work,
    score_retrait:   scores.retrait,
    stade:           level.label,
    answers: QUESTIONS.map((q, i) => ({
      bloc:      q.dim,
      question:  q.text,
      reponse:   SCALE.find(s => s.value === (state.answers[i] ?? 0))?.label ?? 'Jamais',
      valeur:    state.answers[i] ?? 0,
    })),
  }

  fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(() => {})
}

// ─── Init ─────────────────────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('quiz')
  renderQuestion(0)
})

document.getElementById('btn-back').addEventListener('click', () => {
  if (state.current > 0) {
    state.current--
    renderQuestion(state.current)
  }
})

showScreen('intro')
