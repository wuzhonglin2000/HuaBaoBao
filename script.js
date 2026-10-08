{\rtf1\ansi\ansicpg936\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww12720\viewh7800\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const \{ Engine, Render, Runner, World, Bodies, Events \} = Matter;\
\
const canvasEl = document.getElementById("gameCanvas");\
const gameWrap = document.getElementById("gameWrap");\
const aimLine = document.getElementById("aimLine");\
const floatingPreview = document.getElementById("floatingPreview");\
const previewImg = document.getElementById("previewImg");\
const nextImgDom = document.getElementById("nextImg");\
const scoreDom = document.getElementById("score");\
const bestScoreDom = document.getElementById("bestScore");\
const comboBadge = document.getElementById("comboBadge");\
const goalListDom = document.getElementById("goalList");\
const gameOverModal = document.getElementById("gameOverModal");\
const closeOverBtn = document.getElementById("closeOverBtn");\
const restartBtn = document.getElementById("restartBtn");\
const heartContainer = document.getElementById("heartContainer");\
const floatLayer = document.getElementById("floatLayer");\
const panelTag = document.getElementById("panelTag");\
const panelTagWrap = document.getElementById("panelTagWrap");\
const soundToggle = document.getElementById("soundToggle");\
\
const finalScoreBigDom = document.getElementById("finalScoreBig");\
const finalComboDom = document.getElementById("finalCombo");\
const finalMergesDom = document.getElementById("finalMerges");\
const finalTimeDom = document.getElementById("finalTime");\
const finalBestDom = document.getElementById("finalBest");\
const finalQuoteDom = document.getElementById("finalQuote");\
const overEmojiDom = document.getElementById("overEmoji");\
\
const loveTransition = document.getElementById("loveTransition");\
const loveImg = document.getElementById("loveImg");\
const loveBurst = document.getElementById("loveBurst");\
\
const callTransition = document.getElementById("callTransition");\
const callImg = document.getElementById("callImg");\
const callBurst = document.getElementById("callBurst");\
\
const BASE_W = 320;\
const BASE_H = 520;\
\
let width = BASE_W;\
let height = BASE_H;\
\
const LOVE_QUOTES = [\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u20170 \u22825 \u20063 \u36229 \u32423 \u24819 \u20320 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u24819 \u25226 \u20320 \u25571 \u20828 \u37324 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u24819 \u21644 \u20320 \u36148 \u36148 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u20170 \u22825 \u20063 \u24456 \u21916 \u27426 \u20320 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25265 \u30528 \u20320 \u23601 \u22909 \u20102 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25105 \u19981 \u22256 \u65292 \u25105 \u21482 \u26159 \u24819 \u30561 \u35273 \u32780 \u24050 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25105 \u25968 \u20102 \u25968 \u65292 \u20320 \u30340 \u25163 \u25351 \u22836 \u21018 \u22909 \u21313 \u26681 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25105 \u36825 \u20010 \u20154 \u27809 \u20160 \u20040 \u20248 \u28857 \u65292 \u23601 \u26159 \u20248 \u28857 \u19981 \u22810 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25105 \u27809 \u20160 \u20040 \u29233 \u22909 \u65292 \u23601 \u26159 \u29233 \u22909 \u20320 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u25105 \u20445 \u35777 \u65292 \u36825 \u26159 \u25105 \u26368 \u21518 \u19968 \u27425 \u20445 \u35777 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u20320 \u29233 \u25105 \u65292 \u25105 \u20063 \u29233 \u20320 \u65292 \u20945 \u24039 \u20102 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u20320 \u21916 \u27426 \u25105 \u65292 \u25105 \u20063 \u21916 \u27426 \u20320 \u65292 \u22825 \u20316 \u20043 \u21512 ",\
  "\uc0\u33457 \u23453 \u23453 \u65292 \u20320 \u38382 \u25105 \u21916 \u27426 \u20320 \u21738 \u37324 \u65292 \u25105 \u21738 \u37117 \u21916 \u27426 "\
];\
\
function pickFinalQuote(scoreVal) \{\
  if (scoreVal >= 300) return "\uc0\u33457 \u23453 \u23453 \u65292 \u20320 \u27704 \u36828 \u26159 \u25105 \u30340 \u28385 \u20998 \u31572 \u26696 \u55357 \u56495 ";\
  if (scoreVal >= 150) return "\uc0\u33457 \u23453 \u23453 \u65292 \u36825 \u19968 \u23616 \u20063 \u22909 \u24819 \u25265 \u25265 \u20320  \u55358 \u56599 ";\
  if (scoreVal >= 50)  return "\uc0\u33457 \u23453 \u23453 \u65292 \u19981 \u31649 \u20960 \u20998 \u37117 \u26368 \u21916 \u27426 \u20320  \u55357 \u56469 ";\
  return "\uc0\u33457 \u23453 \u23453 \u65292 \u20998 \u25968 \u19981 \u37325 \u35201 \u65292 \u20320 \u26368 \u37325 \u35201  \u55356 \u57144 ";\
\}\
\
function rollQuote() \{\
  const q = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];\
  panelTag.textContent = q;\
  if (panelTagWrap) \{\
    panelTagWrap.style.animation = "none";\
    void panelTagWrap.offsetWidth;\
    panelTagWrap.style.animation = "";\
  \}\
\}\
\
const COMBO_NAMES = ["", "", "\uc0\u26292 \u20987 ", "\u36830 \u20987 ", "\u36229 \u31070 ", "\u26080 \u21452 ", "\u20256 \u35828 ", "\u31070 \u36857 "];\
function comboName(n) \{\
  return COMBO_NAMES[Math.min(n, COMBO_NAMES.length - 1)] || "\uc0\u26292 \u20987 ";\
\}\
\
function computeDisplaySize() \{\
  const vw = window.innerWidth;\
  const vh = window.innerHeight;\
  const ratio = BASE_W / BASE_H;\
  const isNarrow = vw <= 860;\
\
  if (isNarrow) \{\
    const maxW = vw - 40;\
    const maxH = vh * 0.42;\
    let w = maxW;\
    let h = w / ratio;\
    if (h > maxH) \{\
      h = maxH;\
      w = h * ratio;\
    \}\
    return \{ w: Math.round(w), h: Math.round(h) \};\
  \}\
  return \{ w: 375, h: Math.round(375 / ratio) \};\
\}\
\
function applyDisplaySize() \{\
  const size = computeDisplaySize();\
  canvasEl.style.width = size.w + "px";\
  canvasEl.style.height = size.h + "px";\
  if (canvasEl.width !== BASE_W) canvasEl.width = BASE_W;\
  if (canvasEl.height !== BASE_H) canvasEl.height = BASE_H;\
\}\
\
let deadLineY = 100;\
function computeDeadLine() \{\
  return Math.round(BASE_H * (100 / 520));\
\}\
\
const LEVEL = [\
  \{ radius: 16, score: 1, src: "img/0.png" \},\
  \{ radius: 24, score: 2, src: "img/1.png" \},\
  \{ radius: 32, score: 3, src: "img/2.png" \},\
  \{ radius: 40, score: 4, src: "img/3.png" \},\
  \{ radius: 48, score: 5, src: "img/4.png" \},\
  \{ radius: 56, score: 6, src: "img/5.png" \},\
  \{ radius: 64, score: 7, src: "img/6.png" \},\
  \{ radius: 76, score: 100, src: "img/7.png" \}\
];\
\
const BASE_WEIGHTS = [30, 25, 20, 14, 8, 3, 0, 0];\
\
function getWeights() \{\
  const t = Math.min(1, score / 300);\
  return BASE_WEIGHTS.map((w, i) => \{\
    if (w === 0) return 0;\
    if (i === 0) return Math.max(14, w - 8 * t);\
    if (i === 1) return w + 2 * t;\
    return w + 4 * t;\
  \});\
\}\
\
function pickNext() \{\
  const weights = getWeights();\
  const total = weights.reduce((a, b) => a + b, 0);\
  let r = Math.random() * total;\
  for (let i = 0; i < weights.length; i++) \{\
    r -= weights[i];\
    if (r <= 0) \{\
      nextLevelIndex = i;\
      return;\
    \}\
  \}\
  nextLevelIndex = 0;\
\}\
\
let engine, render, runner;\
let balls = [];\
let score = 0;\
let nextLevelIndex = 0;\
let gameRunning = true;\
let isClickLocked = false;\
let overLineTimer = 0;\
let loveHideTimer = null;\
let callShown = false;\
\
let combo = 0;\
let maxCombo = 0;\
let comboTimer = null;\
\
let mergeCount = 0;\
let startTime = 0;\
let goals = [];\
\
let soundOn = localStorage.getItem("flowerSoundOn") !== "off";\
\
const SPAWN_PROTECT_MS = 800;\
const OVER_LINE_GRACE_MS = 1000;\
\
let bestScore = Number(localStorage.getItem("flowerBestScore"));\
if (isNaN(bestScore) || bestScore < 0 || bestScore > 999999) \{\
  bestScore = 0;\
  localStorage.setItem("flowerBestScore", 0);\
\}\
bestScoreDom.textContent = bestScore;\
\
let audioCtx = null;\
function ensureAudio() \{\
  if (!audioCtx) \{\
    try \{\
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();\
    \} catch (e) \{\
      audioCtx = null;\
    \}\
  \}\
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();\
\}\
\
function playTone(freq, duration, type, gainVal, delay) \{\
  if (!soundOn || !audioCtx) return;\
  const t0 = audioCtx.currentTime + (delay || 0);\
  const osc = audioCtx.createOscillator();\
  const gain = audioCtx.createGain();\
  osc.type = type || "sine";\
  osc.frequency.setValueAtTime(freq, t0);\
  gain.gain.setValueAtTime(0.0001, t0);\
  gain.gain.exponentialRampToValueAtTime(gainVal || 0.12, t0 + 0.01);\
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (duration || 0.12));\
  osc.connect(gain).connect(audioCtx.destination);\
  osc.start(t0);\
  osc.stop(t0 + (duration || 0.12) + 0.05);\
\}\
\
function sfxMerge(level) \{\
  const base = 440 + level * 60;\
  playTone(base, 0.12, "sine", 0.14, 0);\
  playTone(base * 1.5, 0.1, "sine", 0.08, 0.04);\
\}\
\
function sfxCombo(n) \{\
  const base = 520;\
  const times = Math.min(n, 5);\
  for (let i = 0; i < times; i++) \{\
    playTone(base * Math.pow(1.12, i), 0.08, "triangle", 0.1, i * 0.05);\
  \}\
\}\
\
function sfxOver() \{\
  playTone(440, 0.18, "sine", 0.12, 0);\
  playTone(330, 0.18, "sine", 0.12, 0.14);\
  playTone(220, 0.35, "sine", 0.14, 0.28);\
\}\
\
function haptic(ms) \{\
  try \{\
    if (navigator.vibrate) navigator.vibrate(ms || 12);\
  \} catch (e) \{\}\
\}\
\
function preloadImages() \{\
  return new Promise((resolve) => \{\
    let count = 0;\
    LEVEL.forEach((item) => \{\
      const img = new Image();\
      img.src = item.src;\
      img.onload = () => \{\
        count++;\
        if (count >= LEVEL.length) resolve(true);\
      \};\
      img.onerror = () => \{\
        count++;\
        console.warn("\uc0\u22270 \u29255 \u21152 \u36733 \u22833 \u36133 \u65306 ", item.src);\
        if (count >= LEVEL.length) resolve(true);\
      \};\
    \});\
  \});\
\}\
\
function drawDeadLine() \{\
  if (!render || !render.context) return;\
  const ctx = render.context;\
  const y = deadLineY;\
\
  ctx.save();\
\
  const grad = ctx.createLinearGradient(0, y - 40, 0, y);\
  grad.addColorStop(0, "rgba(255, 180, 210, 0)");\
  grad.addColorStop(1, "rgba(255, 180, 210, 0.18)");\
  ctx.fillStyle = grad;\
  ctx.fillRect(0, y - 40, width, 40);\
\
  ctx.beginPath();\
  ctx.strokeStyle = "rgba(255, 140, 175, 0.55)";\
  ctx.lineWidth = 2;\
  ctx.shadowColor = "rgba(255, 140, 175, 0.5)";\
  ctx.shadowBlur = 8;\
  ctx.moveTo(14, y);\
  ctx.lineTo(width - 14, y);\
  ctx.stroke();\
\
  ctx.beginPath();\
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";\
  ctx.lineWidth = 1;\
  ctx.shadowBlur = 0;\
  ctx.moveTo(14, y);\
  ctx.lineTo(width - 14, y);\
  ctx.stroke();\
\
  const capR = 6;\
  const capGrad = ctx.createRadialGradient(14, y, 0, 14, y, capR);\
  capGrad.addColorStop(0, "rgba(255, 150, 180, 0.9)");\
  capGrad.addColorStop(1, "rgba(255, 150, 180, 0)");\
  ctx.fillStyle = capGrad;\
  ctx.beginPath();\
  ctx.arc(14, y, capR, 0, Math.PI * 2);\
  ctx.fill();\
\
  const capGrad2 = ctx.createRadialGradient(width - 14, y, 0, width - 14, y, capR);\
  capGrad2.addColorStop(0, "rgba(255, 150, 180, 0.9)");\
  capGrad2.addColorStop(1, "rgba(255, 150, 180, 0)");\
  ctx.fillStyle = capGrad2;\
  ctx.beginPath();\
  ctx.arc(width - 14, y, capR, 0, Math.PI * 2);\
  ctx.fill();\
\
  ctx.restore();\
\}\
\
function generateGoals() \{\
  const pool = [\
    \{ id: "score50",  text: "\uc0\u21333 \u23616 \u36798 \u21040  50 \u20998 ",  target: 50,  get: () => score,      reward: 15 \},\
    \{ id: "score150", text: "\uc0\u21333 \u23616 \u36798 \u21040  150 \u20998 ", target: 150, get: () => score,      reward: 40 \},\
    \{ id: "combo3",   text: "\uc0\u35302 \u21457 \u19968 \u27425  3 \u36830 \u20987 ", target: 3,   get: () => maxCombo,   reward: 20 \},\
    \{ id: "combo5",   text: "\uc0\u35302 \u21457 \u19968 \u27425  5 \u36830 \u20987 ", target: 5,   get: () => maxCombo,   reward: 35 \},\
    \{ id: "merge10",  text: "\uc0\u21512 \u25104  10 \u27425 ",      target: 10,  get: () => mergeCount, reward: 25 \},\
    \{ id: "merge20",  text: "\uc0\u21512 \u25104  20 \u27425 ",      target: 20,  get: () => mergeCount, reward: 50 \}\
  ];\
\
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);\
  goals = shuffled.slice(0, 3).map((g) => (\{ ...g, done: false \}));\
  renderGoals();\
\}\
\
function renderGoals() \{\
  goalListDom.innerHTML = "";\
  goals.forEach((g) => \{\
    const cur = Math.min(g.get(), g.target);\
    const pct = Math.min(100, (cur / g.target) * 100);\
    const div = document.createElement("div");\
    div.className = "goal-item" + (g.done ? " done" : "");\
    div.innerHTML =\
      '<div class="goal-row">' +\
        '<span>' + (g.done ? "\uc0\u9989  " : "") + g.text + '</span>' +\
        '<span class="goal-progress">' + (g.done ? "\uc0\u23436 \u25104 " : cur + "/" + g.target) + '</span>' +\
      '</div>' +\
      '<div class="goal-bar"><i style="width:' + pct + '%"></i></div>';\
    goalListDom.appendChild(div);\
  \});\
\}\
\
function checkGoals() \{\
  let changed = false;\
  goals.forEach((g) => \{\
    if (!g.done && g.get() >= g.target) \{\
      g.done = true;\
      changed = true;\
      score += g.reward;\
      scoreDom.textContent = score;\
      bumpScore();\
      showFloatText(window.innerWidth / 2, 160, "\uc0\u9989  \u30446 \u26631 \u23436 \u25104  +" + g.reward, false, false);\
      sfxCombo(3);\
    \}\
  \});\
  if (changed) updateBestScore();\
  renderGoals();\
\}\
\
function showFloatText(clientX, clientY, text, isCombo, isScore) \{\
  const div = document.createElement("div");\
  let cls = "float-text";\
  if (isCombo) cls += " combo";\
  else if (isScore) cls += " score";\
  div.className = cls;\
  div.textContent = text;\
  div.style.left = clientX + "px";\
  div.style.top = clientY + "px";\
  floatLayer.appendChild(div);\
  setTimeout(() => div.remove(), 1000);\
\}\
\
function canvasToClient(x, y) \{\
  const rect = canvasEl.getBoundingClientRect();\
  const scaleX = rect.width / BASE_W;\
  const scaleY = rect.height / BASE_H;\
  return \{ x: rect.left + x * scaleX, y: rect.top + y * scaleY \};\
\}\
\
const PARTICLE_EMOJI = ["\uc0\u55356 \u57144 ", "\u55357 \u56469 ", "\u10024 ", "\u55357 \u56470 ", "\u55356 \u57143 "];\
\
function spawnBurstAtCanvas(x, y) \{\
  const pos = canvasToClient(x, y);\
  const n = 10;\
  for (let i = 0; i < n; i++) \{\
    const p = document.createElement("div");\
    p.className = "burst-particle";\
    p.textContent = PARTICLE_EMOJI[Math.floor(Math.random() * PARTICLE_EMOJI.length)];\
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;\
    const dist = 40 + Math.random() * 50;\
    const dx = Math.cos(angle) * dist;\
    const dy = Math.sin(angle) * dist;\
    p.style.left = pos.x + "px";\
    p.style.top = pos.y + "px";\
    p.style.setProperty("--dx", dx + "px");\
    p.style.setProperty("--dy", dy + "px");\
    floatLayer.appendChild(p);\
    setTimeout(() => p.remove(), 750);\
  \}\
\}\
\
function spawnFlashAtCanvas(x, y) \{\
  const pos = canvasToClient(x, y);\
  const flash = document.createElement("div");\
  flash.className = "merge-flash";\
  flash.style.left = pos.x + "px";\
  flash.style.top = pos.y + "px";\
  floatLayer.appendChild(flash);\
  setTimeout(() => flash.remove(), 520);\
\}\
\
function spawnClickPulseAtCanvas(x, y) \{\
  const pos = canvasToClient(x, y);\
  const ring = document.createElement("div");\
  ring.className = "click-pulse";\
  ring.style.left = pos.x + "px";\
  ring.style.top = pos.y + "px";\
  floatLayer.appendChild(ring);\
  setTimeout(() => ring.remove(), 650);\
\}\
\
function triggerCombo() \{\
  combo += 1;\
  maxCombo = Math.max(maxCombo, combo);\
\
  if (combo >= 2) \{\
    const name = comboName(combo);\
    comboBadge.style.display = "block";\
    comboBadge.textContent =\
      name + " \'d7" + combo + "  \uc0\u20998 \u25968  \'d7" + (1 + (combo - 1) * 0.2).toFixed(1);\
    sfxCombo(combo);\
  \}\
\
  if (comboTimer) clearTimeout(comboTimer);\
  comboTimer = setTimeout(() => \{\
    combo = 0;\
    comboBadge.style.display = "none";\
  \}, 2000);\
\}\
\
function comboMultiplier() \{\
  return 1 + Math.max(0, combo - 1) * 0.2;\
\}\
\
function shakeScreen() \{\
  gameWrap.classList.remove("shake");\
  void gameWrap.offsetWidth;\
  gameWrap.classList.add("shake");\
\}\
\
function bumpScore() \{\
  scoreDom.classList.remove("pop");\
  void scoreDom.offsetWidth;\
  scoreDom.classList.add("pop");\
\}\
\
function updateBestScore() \{\
  if (score > bestScore) \{\
    bestScore = score;\
    localStorage.setItem("flowerBestScore", bestScore);\
    bestScoreDom.textContent = bestScore;\
  \}\
\}\
\
function refreshSoundToggle() \{\
  if (soundOn) \{\
    soundToggle.textContent = "\uc0\u55357 \u56586 ";\
    soundToggle.classList.remove("off");\
  \} else \{\
    soundToggle.textContent = "\uc0\u55357 \u56583 ";\
    soundToggle.classList.add("off");\
  \}\
\}\
\
soundToggle.onclick = (e) => \{\
  e.stopPropagation();\
  soundOn = !soundOn;\
  localStorage.setItem("flowerSoundOn", soundOn ? "on" : "off");\
  refreshSoundToggle();\
  if (soundOn) \{\
    ensureAudio();\
    playTone(660, 0.08, "sine", 0.1, 0);\
  \}\
\};\
\
async function initGame() \{\
  await preloadImages();\
\
  applyDisplaySize();\
  deadLineY = computeDeadLine();\
\
  score = 0;\
  balls = [];\
  gameRunning = true;\
  isClickLocked = false;\
  overLineTimer = 0;\
  callShown = false;\
  loveHideTimer = null;\
  combo = 0;\
  maxCombo = 0;\
  mergeCount = 0;\
  startTime = Date.now();\
\
  if (comboTimer) clearTimeout(comboTimer);\
  comboBadge.style.display = "none";\
  scoreDom.textContent = "0";\
\
  rollQuote();\
  refreshSoundToggle();\
\
  if (engine) \{\
    Events.off(engine);\
    World.clear(engine.world, false);\
    Engine.clear(engine);\
  \}\
  if (render) Render.stop(render);\
  if (runner) Runner.stop(runner);\
\
  engine = Engine.create();\
  engine.world.gravity.y = 1;\
\
  render = Render.create(\{\
    canvas: canvasEl,\
    engine: engine,\
    options: \{\
      width: BASE_W,\
      height: BASE_H,\
      wireframes: false,\
      background: "#fff9ec",\
      pixelRatio: window.devicePixelRatio || 1\
    \}\
  \});\
\
  Render.run(render);\
  runner = Runner.create();\
  Runner.run(runner, engine);\
\
  const ground = Bodies.rectangle(BASE_W / 2, BASE_H + 20, BASE_W, 40, \{\
    isStatic: true, label: "ground"\
  \});\
  const leftWall = Bodies.rectangle(-10, BASE_H / 2, 20, BASE_H, \{\
    isStatic: true, label: "wallLeft"\
  \});\
  const rightWall = Bodies.rectangle(BASE_W + 10, BASE_H / 2, 20, BASE_H, \{\
    isStatic: true, label: "wallRight"\
  \});\
\
  World.add(engine.world, [ground, leftWall, rightWall]);\
\
  Events.on(render, "afterRender", drawDeadLine);\
\
  generateGoals();\
  pickNext();\
  updatePreview();\
\
  function handlePointerMove(clientX) \{\
    if (!gameRunning) return;\
    const rect = canvasEl.getBoundingClientRect();\
    const scaleX = rect.width / BASE_W;\
    const mx = (clientX - rect.left) / scaleX;\
    const x = Math.max(10, Math.min(BASE_W - 10, mx));\
\
    const wrapRect = gameWrap.getBoundingClientRect();\
    const canvasOffsetLeft = rect.left - wrapRect.left;\
    const canvasOffsetTop = rect.top - wrapRect.top;\
    const visualScale = rect.width / BASE_W;\
\
    aimLine.style.display = "block";\
    aimLine.style.left = canvasOffsetLeft + x * visualScale + "px";\
    aimLine.style.top = canvasOffsetTop + "px";\
    aimLine.style.height = deadLineY * visualScale + "px";\
\
    floatingPreview.style.display = "block";\
    floatingPreview.style.left = canvasOffsetLeft + x * visualScale - 27 + "px";\
    floatingPreview.style.top = canvasOffsetTop + deadLineY * visualScale - 28 + "px";\
  \}\
\
  canvasEl.onmousemove = (e) => handlePointerMove(e.clientX);\
\
  canvasEl.onmouseleave = () => \{\
    aimLine.style.display = "none";\
    floatingPreview.style.display = "none";\
  \};\
\
  canvasEl.ontouchstart = (e) => \{\
    ensureAudio();\
    const touch = e.touches[0];\
    if (touch) handlePointerMove(touch.clientX);\
  \};\
\
  canvasEl.ontouchmove = (e) => \{\
    e.preventDefault();\
    const touch = e.touches[0];\
    if (touch) handlePointerMove(touch.clientX);\
  \};\
\
  canvasEl.ontouchend = (e) => \{\
    e.preventDefault();\
    if (!gameRunning || isClickLocked) return;\
    const touch = e.changedTouches[0];\
    if (!touch) return;\
    const rect = canvasEl.getBoundingClientRect();\
    const scaleX = rect.width / BASE_W;\
    let mx = (touch.clientX - rect.left) / scaleX;\
    mx = Math.max(20, Math.min(BASE_W - 20, mx));\
    doDrop(mx);\
  \};\
\
  canvasEl.onclick = (e) => \{\
    ensureAudio();\
    if (!gameRunning || isClickLocked) return;\
    const rect = canvasEl.getBoundingClientRect();\
    const scaleX = rect.width / BASE_W;\
    let mx = (e.clientX - rect.left) / scaleX;\
    mx = Math.max(20, Math.min(BASE_W - 20, mx));\
    doDrop(mx);\
  \};\
\
  function doDrop(mx) \{\
    isClickLocked = true;\
    spawnClickPulseAtCanvas(mx, deadLineY);\
    spawnBall(mx, nextLevelIndex);\
    pickNext();\
    updatePreview();\
    aimLine.style.display = "none";\
    floatingPreview.style.display = "none";\
    setTimeout(() => \{\
      isClickLocked = false;\
    \}, 300);\
  \}\
\
  Events.on(engine, "collisionStart", (e) => \{\
    const pairs = e.pairs;\
    for (const pair of pairs) \{\
      const a = pair.bodyA;\
      const b = pair.bodyB;\
      if (a.level === undefined || b.level === undefined) continue;\
      if (a.level !== b.level) continue;\
      if (a.level >= LEVEL.length - 1) continue;\
      if (a.merged || b.merged) continue;\
\
      const newLevel = a.level + 1;\
      const newX = (a.position.x + b.position.x) / 2;\
      const newY = (a.position.y + b.position.y) / 2;\
\
      a.merged = true;\
      b.merged = true;\
\
      World.remove(engine.world, [a, b]);\
      balls = balls.filter((x) => x !== a && x !== b);\
\
      spawnBurstAtCanvas(newX, newY);\
      spawnFlashAtCanvas(newX, newY);\
      shakeScreen();\
      sfxMerge(newLevel);\
      haptic(12);\
\
      mergeCount++;\
      triggerCombo();\
\
      const mult = comboMultiplier();\
      createMergedBall(newX, newY, newLevel, mult);\
\
      if (combo >= 2) \{\
        const pos = canvasToClient(newX, newY);\
        showFloatText(pos.x, pos.y - 30, comboName(combo) + " \'d7" + combo, true, false);\
      \}\
\
      checkGoals();\
    \}\
  \});\
\
  Events.on(engine, "afterUpdate", () => \{\
    if (!gameRunning) return;\
    const now = Date.now();\
    let anyOverLine = false;\
    for (const b of balls) \{\
      if (b.birthTime && now - b.birthTime < SPAWN_PROTECT_MS) continue;\
      const ballTop = b.position.y - b.circleRadius;\
      if (ballTop < deadLineY) \{\
        anyOverLine = true;\
        break;\
      \}\
    \}\
    if (anyOverLine) \{\
      overLineTimer += engine.timing.lastDelta || 16.6;\
      if (overLineTimer >= OVER_LINE_GRACE_MS) gameOver();\
    \} else \{\
      overLineTimer = 0;\
    \}\
  \});\
\}\
\
function spawnBall(x, levelIndex) \{\
  const lv = LEVEL[levelIndex];\
  const scale = (lv.radius / 250) * 1.0;\
  const ball = Bodies.circle(x, -60, lv.radius, \{\
    restitution: 0.35,\
    label: "ball",\
    level: levelIndex,\
    merged: false,\
    birthTime: Date.now(),\
    render: \{\
      sprite: \{\
        texture: lv.src,\
        xScale: scale,\
        yScale: scale\
      \}\
    \}\
  \});\
  World.add(engine.world, ball);\
  balls.push(ball);\
\}\
\
function createMergedBall(x, y, levelIndex, mult) \{\
  const lv = LEVEL[levelIndex];\
  const scale = (lv.radius / 250) * 1.0;\
  const ball = Bodies.circle(x, y, lv.radius, \{\
    restitution: 0.35,\
    label: "ball",\
    level: levelIndex,\
    merged: false,\
    birthTime: Date.now(),\
    render: \{\
      sprite: \{\
        texture: lv.src,\
        xScale: scale,\
        yScale: scale\
      \}\
    \}\
  \});\
  World.add(engine.world, ball);\
  balls.push(ball);\
\
  const multiplier = mult || comboMultiplier();\
  const gained = Math.round(lv.score * multiplier);\
\
  setTimeout(() => \{\
    score += gained;\
    scoreDom.textContent = score;\
    bumpScore();\
    updateBestScore();\
\
    const pos = canvasToClient(x, y);\
    showFloatText(pos.x, pos.y + 30, "+" + gained, false, true);\
\
    checkGoals();\
  \}, 80);\
\
  const maxDead = Math.round(BASE_H * 0.25);\
  const baseDead = computeDeadLine();\
  const newDeadLine = Math.min(maxDead, baseDead + Math.floor(score / 150) * 8);\
  if (newDeadLine !== deadLineY) deadLineY = newDeadLine;\
\
  if (levelIndex === LEVEL.length - 1) \{\
    setTimeout(showLoveTransition, 350);\
  \}\
\
  if (levelIndex === 6 && !callShown) \{\
    callShown = true;\
    setTimeout(showCallTransition, 350);\
  \}\
\}\
\
function updatePreview() \{\
  nextImgDom.src = LEVEL[nextLevelIndex].src;\
  previewImg.src = LEVEL[nextLevelIndex].src;\
\}\
\
function gameOver() \{\
  if (!gameRunning) return;\
  gameRunning = false;\
  sfxOver();\
  haptic(30);\
\
  const usedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));\
  const emoji = score >= 300 ? "\uc0\u55358 \u56617 " : score >= 150 ? "\u55357 \u56842 " : score >= 50 ? "\u55357 \u56848 " : "\u55357 \u56866 ";\
  overEmojiDom.textContent = emoji;\
  finalScoreBigDom.textContent = score;\
  finalComboDom.textContent = maxCombo;\
  finalMergesDom.textContent = mergeCount;\
  finalTimeDom.textContent = usedSec + "s";\
  finalBestDom.textContent = bestScore;\
  finalQuoteDom.textContent = pickFinalQuote(score);\
\
  gameOverModal.style.display = "flex";\
\}\
\
function restartGame() \{\
  if (engine) \{\
    Events.off(engine);\
    World.clear(engine.world, false);\
    Engine.clear(engine);\
  \}\
  if (render) Render.stop(render);\
  if (runner) Runner.stop(runner);\
\
  aimLine.style.display = "none";\
  floatingPreview.style.display = "none";\
  loveTransition.classList.remove("show");\
  loveBurst.innerHTML = "";\
  callTransition.classList.remove("show");\
  callBurst.innerHTML = "";\
\
  if (loveHideTimer) clearTimeout(loveHideTimer);\
\
  initGame();\
\}\
\
function showLoveTransition() \{\
  if (loveHideTimer) clearTimeout(loveHideTimer);\
  loveTransition.classList.remove("show");\
  void loveTransition.offsetWidth;\
\
  loveImg.src = LEVEL[LEVEL.length - 1].src;\
  loveBurst.innerHTML = "";\
\
  const particles = ["\uc0\u10084 \u65039 ", "\u55357 \u56469 ", "\u55357 \u56470 ", "\u55356 \u57144 ", "\u55357 \u56471 ", "\u55356 \u57143 ", "\u10024 "];\
  const count = 26;\
\
  for (let i = 0; i < count; i++) \{\
    const p = document.createElement("div");\
    p.className = "love-particle";\
    p.textContent = particles[Math.floor(Math.random() * particles.length)];\
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;\
    const dist = 120 + Math.random() * 160;\
    const dx = Math.cos(angle) * dist;\
    const dy = Math.sin(angle) * dist;\
    const rot = (Math.random() * 720 - 360).toFixed(0) + "deg";\
    p.style.setProperty("--dx", dx + "px");\
    p.style.setProperty("--dy", dy + "px");\
    p.style.setProperty("--rot", rot);\
    p.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";\
    loveBurst.appendChild(p);\
  \}\
\
  loveTransition.classList.add("show");\
\
  loveHideTimer = setTimeout(() => \{\
    loveTransition.classList.remove("show");\
    setTimeout(() => \{\
      loveBurst.innerHTML = "";\
      createHeartRain();\
    \}, 800);\
  \}, 3600);\
\}\
\
function showCallTransition() \{\
  callImg.src = LEVEL[6].src;\
  callBurst.innerHTML = "";\
\
  const particles = ["\uc0\u55357 \u56613 ", "\u55357 \u56401 ", "\u55357 \u56485 ", "\u11088 ", "\u10024 "];\
  const count = 22;\
\
  for (let i = 0; i < count; i++) \{\
    const p = document.createElement("div");\
    p.className = "love-particle";\
    p.textContent = particles[Math.floor(Math.random() * particles.length)];\
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;\
    const dist = 110 + Math.random() * 140;\
    const dx = Math.cos(angle) * dist;\
    const dy = Math.sin(angle) * dist;\
    const rot = (Math.random() * 720 - 360).toFixed(0) + "deg";\
    p.style.setProperty("--dx", dx + "px");\
    p.style.setProperty("--dy", dy + "px");\
    p.style.setProperty("--rot", rot);\
    p.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";\
    callBurst.appendChild(p);\
  \}\
\
  callTransition.classList.add("show");\
\
  setTimeout(() => \{\
    callTransition.classList.remove("show");\
    setTimeout(() => \{\
      callBurst.innerHTML = "";\
    \}, 700);\
  \}, 2800);\
\}\
\
function createHeartRain() \{\
  const hearts = ["\uc0\u10084 \u65039 ", "\u55357 \u56469 ", "\u55357 \u56470 ", "\u55356 \u57144 ", "\u55357 \u56471 "];\
  for (let i = 0; i < 30; i++) \{\
    setTimeout(() => \{\
      const div = document.createElement("div");\
      div.className = "heart";\
      div.textContent = hearts[Math.floor(Math.random() * hearts.length)];\
      div.style.left = Math.random() * 100 + "vw";\
      div.style.animationDuration = 4 + Math.random() * 4 + "s";\
      heartContainer.appendChild(div);\
      setTimeout(() => div.remove(), 8000);\
    \}, i * 100);\
  \}\
\}\
\
function startAmbientPetals() \{\
  const petals = ["\uc0\u55356 \u57144 ", "\u55356 \u57143 ", "\u55357 \u56494 ", "\u55356 \u57146 "];\
  setInterval(() => \{\
    if (document.hidden) return;\
    const p = document.createElement("div");\
    p.className = "ambient-petal";\
    p.textContent = petals[Math.floor(Math.random() * petals.length)];\
    p.style.left = Math.random() * 100 + "vw";\
    p.style.fontSize = 12 + Math.random() * 14 + "px";\
    p.style.animationDuration = 10 + Math.random() * 10 + "s";\
    document.body.appendChild(p);\
    setTimeout(() => p.remove(), 22000);\
  \}, 1800);\
\}\
\
let resizeTimer = null;\
window.addEventListener("resize", () => \{\
  if (resizeTimer) clearTimeout(resizeTimer);\
  resizeTimer = setTimeout(() => \{\
    applyDisplaySize();\
  \}, 150);\
\});\
\
closeOverBtn.onclick = () => \{\
  gameOverModal.style.display = "none";\
  restartGame();\
\};\
\
restartBtn.onclick = restartGame;\
\
initGame();\
startAmbientPetals();}