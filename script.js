const { Engine, Render, Runner, World, Bodies, Events } = Matter;

const canvasEl = document.getElementById("gameCanvas");
const gameWrap = document.getElementById("gameWrap");
const leftCol = document.getElementById("leftCol");
const rightCol = document.getElementById("rightCol");
const mobileStats = document.getElementById("mobileStats");
const aimLine = document.getElementById("aimLine");
const floatingPreview = document.getElementById("floatingPreview");
const previewImg = document.getElementById("previewImg");

const nextImgDom = document.getElementById("nextImg");
const scoreDom = document.getElementById("score");
const bestScoreDom = document.getElementById("bestScore");
const nextImgMobileDom = document.getElementById("nextImgMobile");
const scoreMobileDom = document.getElementById("scoreMobile");
const bestScoreMobileDom = document.getElementById("bestScoreMobile");

const comboBadge = document.getElementById("comboBadge");
const goalListDom = document.getElementById("goalList");
const gameOverModal = document.getElementById("gameOverModal");
const closeOverBtn = document.getElementById("closeOverBtn");
const restartBtn = document.getElementById("restartBtn");
const heartContainer = document.getElementById("heartContainer");
const floatLayer = document.getElementById("floatLayer");
const panelTag = document.getElementById("panelTag");
const panelTagWrap = document.getElementById("panelTagWrap");
const soundToggle = document.getElementById("soundToggle");

const finalScoreBigDom = document.getElementById("finalScoreBig");
const finalComboDom = document.getElementById("finalCombo");
const finalMergesDom = document.getElementById("finalMerges");
const finalTimeDom = document.getElementById("finalTime");
const finalBestDom = document.getElementById("finalBest");
const finalQuoteDom = document.getElementById("finalQuote");
const overEmojiDom = document.getElementById("overEmoji");

const openScoreCardBtn = document.getElementById("openScoreCardBtn");
const scoreCardModal = document.getElementById("scoreCardModal");
const scoreCardImg = document.getElementById("scoreCardImg");
const closeScoreCardBtn = document.getElementById("closeScoreCardBtn");
const restartFromCardBtn = document.getElementById("restartFromCardBtn");

const loveTransition = document.getElementById("loveTransition");
const loveImg = document.getElementById("loveImg");
const loveBurst = document.getElementById("loveBurst");

const callTransition = document.getElementById("callTransition");
const callImg = document.getElementById("callImg");
const callBurst = document.getElementById("callBurst");

/* 内部坐标系 */
const BASE_W = 320;
const BASE_H = 480;

/* 触摸设备识别 */
const isTouchDevice = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

/* 每级图片颜色（fallback 用） */
const FALLBACK_COLORS = [
  { light: "#ffe0ec", dark: "#ffb3ce" },
  { light: "#ffc9dd", dark: "#ff8fb1" },
  { light: "#ffb3ce", dark: "#ff6b95" },
  { light: "#ff97b9", dark: "#ff4d7e" },
  { light: "#ff7ea4", dark: "#e55b84" },
  { light: "#ec6689", dark: "#d94a76" },
  { light: "#d94a76", dark: "#c73a66" },
  { light: "#c73a66", dark: "#a82a55" }
];

const LEVEL = [
  { radius: 16, score: 1, src: "img/0.png" },
  { radius: 24, score: 2, src: "img/1.png" },
  { radius: 32, score: 3, src: "img/2.png" },
  { radius: 40, score: 4, src: "img/3.png" },
  { radius: 48, score: 5, src: "img/4.png" },
  { radius: 56, score: 6, src: "img/5.png" },
  { radius: 64, score: 7, src: "img/6.png" },
  { radius: 76, score: 100, src: "img/7.png" }
];

/* 方案 7：合成气泡文案 */
const BUBBLE_TEXTS = [
  "贴贴", "抱抱", "好想你", "亲亲", "爱你", "么么哒",
  "花宝宝", "想你了", "在呢", "抱紧你", "蹭蹭", "嘿嘿"
];

/* 方案 3：动态情话库 */
const QUOTES_LOW = [
  "花宝宝，慢慢来，我等你",
  "花宝宝，不急，我们有的是时间",
  "花宝宝，这局先热身",
  "花宝宝，我陪你一球一球来"
];
const QUOTES_MID = [
  "花宝宝，今天也超级想你",
  "花宝宝，想和你贴贴",
  "花宝宝，今天也很喜欢你",
  "花宝宝，抱着你就好了",
  "花宝宝，你爱我，我也爱你，凑巧了"
];
const QUOTES_HIGH = [
  "花宝宝，你也太厉害了吧！",
  "花宝宝，这波操作满分！",
  "花宝宝，我为你骄傲！",
  "花宝宝，你就是我的神！",
  "花宝宝，这局稳了！"
];
const QUOTES_NIGHT = [
  "花宝宝，夜深了，早点睡",
  "花宝宝，该睡觉啦",
  "花宝宝，梦里也要想我哦"
];
const QUOTES_MORNING = [
  "花宝宝，早安，今天也要开心",
  "花宝宝，早上好呀",
  "花宝宝，新的一天也要想我"
];

const FINAL_QUOTES = [
  "花宝宝，你永远是我的满分答案💯",
  "花宝宝，这一局也好想抱抱你 🤗",
  "花宝宝，不管几分都最喜欢你 💕",
  "花宝宝，分数不重要，你最重要 🌸"
];
const pickFinalQuote = () =>
  FINAL_QUOTES[Math.floor(Math.random() * FINAL_QUOTES.length)];

const BASE_WEIGHTS = [30, 25, 20, 14, 8, 3, 0, 0];

let engine, render, runner;
let balls = [];
let score = 0;
let nextLevelIndex = 0;
let gameRunning = true;
let isClickLocked = false;
let overLineTimer = 0;
let loveHideTimer = null;

/* 叫爸爸：每次合成到 6 级都触发，用冷却防止连触 */
let callCooldown = false;

let combo = 0;
let maxCombo = 0;
let comboTimer = null;

let mergeCount = 0;
let startTime = 0;
let goals = [];

let soundOn = localStorage.getItem("flowerSoundOn") !== "off";

const SPAWN_PROTECT_MS = 800;
const OVER_LINE_GRACE_MS = 1000;

let bestScore = Number(localStorage.getItem("flowerBestScore"));
if (isNaN(bestScore) || bestScore < 0 || bestScore > 999999) {
  bestScore = 0;
  localStorage.setItem("flowerBestScore", 0);
}

/* 音效 */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, duration, type, gainVal, delay) {
  if (!soundOn || !audioCtx) return;
  const t0 = audioCtx.currentTime + (delay || 0);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainVal || 0.12, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (duration || 0.12));
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + (duration || 0.12) + 0.05);
}

const sfxMerge = (level) => {
  const base = 440 + level * 60;
  playTone(base, 0.12, "sine", 0.14, 0);
  playTone(base * 1.5, 0.1, "sine", 0.08, 0.04);
};
const sfxCombo = (n) => {
  const base = 520;
  for (let i = 0; i < Math.min(n, 5); i++) {
    playTone(base * Math.pow(1.12, i), 0.08, "triangle", 0.1, i * 0.05);
  }
};
const sfxOver = () => {
  playTone(440, 0.18, "sine", 0.12, 0);
  playTone(330, 0.18, "sine", 0.12, 0.14);
  playTone(220, 0.35, "sine", 0.14, 0.28);
};
const haptic = (ms) => {
  try {
    if (navigator.vibrate) navigator.vibrate(ms || 12);
  } catch (e) {}
};

/* UI 同步 */
const syncScore = (v) => {
  if (scoreDom) scoreDom.textContent = v;
  if (scoreMobileDom) scoreMobileDom.textContent = v;
};
const syncBest = (v) => {
  if (bestScoreDom) bestScoreDom.textContent = v;
  if (bestScoreMobileDom) bestScoreMobileDom.textContent = v;
};
const syncNext = (src) => {
  const realSrc = finalSrc[src] || src;
  if (nextImgDom) nextImgDom.src = realSrc;
  if (nextImgMobileDom) nextImgMobileDom.src = realSrc;
};

/* 方案 3：动态情话 */
function rollQuote() {
  const hour = new Date().getHours();
  let pool;
  if (hour >= 23 || hour < 6) {
    pool = QUOTES_NIGHT;
  } else if (hour >= 6 && hour < 10) {
    pool = QUOTES_MORNING;
  } else if (score >= 200) {
    pool = QUOTES_HIGH;
  } else if (score >= 60) {
    pool = QUOTES_MID;
  } else {
    pool = QUOTES_LOW;
  }
  const q = pool[Math.floor(Math.random() * pool.length)];
  panelTag.textContent = q;
  if (panelTagWrap) {
    panelTagWrap.style.animation = "none";
    void panelTagWrap.offsetWidth;
    panelTagWrap.style.animation = "";
  }
}

const getWeights = () => {
  const t = Math.min(1, score / 300);
  return BASE_WEIGHTS.map((w, i) => {
    if (w === 0) return 0;
    if (i === 0) return Math.max(14, w - 8 * t);
    if (i === 1) return w + 2 * t;
    return w + 4 * t;
  });
};

function pickNext() {
  const weights = getWeights();
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      nextLevelIndex = i;
      return;
    }
  }
  nextLevelIndex = 0;
}

/* 方案 3：连击 emoji */
const COMBO_EMOJI = ["", "", "😊", "😍", "🤩", "🥳", "🔥", "👑"];
const COMBO_NAMES = ["", "", "暴击", "连击", "超神", "无双", "传说", "神迹"];
const comboName = (n) =>
  COMBO_NAMES[Math.min(n, COMBO_NAMES.length - 1)] || "暴击";
const comboEmoji = (n) =>
  COMBO_EMOJI[Math.min(n, COMBO_EMOJI.length - 1)] || "🔥";

/* 死亡线绘制 */
function drawDeadLine() {
  if (!render || !render.context) return;
  const ctx = render.context;
  const y = deadLineY;

  ctx.save();

  const grad = ctx.createLinearGradient(0, y - 40, 0, y);
  grad.addColorStop(0, "rgba(255, 180, 210, 0)");
  grad.addColorStop(1, "rgba(255, 180, 210, 0.18)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y - 40, BASE_W, 40);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 140, 175, 0.55)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(255, 140, 175, 0.5)";
  ctx.shadowBlur = 8;
  ctx.moveTo(14, y);
  ctx.lineTo(BASE_W - 14, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.moveTo(14, y);
  ctx.lineTo(BASE_W - 14, y);
  ctx.stroke();

  const capR = 6;
  const cg1 = ctx.createRadialGradient(14, y, 0, 14, y, capR);
  cg1.addColorStop(0, "rgba(255, 150, 180, 0.9)");
  cg1.addColorStop(1, "rgba(255, 150, 180, 0)");
  ctx.fillStyle = cg1;
  ctx.beginPath();
  ctx.arc(14, y, capR, 0, Math.PI * 2);
  ctx.fill();

  const cg2 = ctx.createRadialGradient(BASE_W - 14, y, 0, BASE_W - 14, y, capR);
  cg2.addColorStop(0, "rgba(255, 150, 180, 0.9)");
  cg2.addColorStop(1, "rgba(255, 150, 180, 0)");
  ctx.fillStyle = cg2;
  ctx.beginPath();
  ctx.arc(BASE_W - 14, y, capR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* 目标 */
function generateGoals() {
  const pool = [
    { id: "score50",  text: "单局达到 50 分",  target: 50,  get: () => score,      reward: 15 },
    { id: "score150", text: "单局达到 150 分", target: 150, get: () => score,      reward: 40 },
    { id: "combo3",   text: "触发一次 3 连击", target: 3,   get: () => maxCombo,   reward: 20 },
    { id: "combo5",   text: "触发一次 5 连击", target: 5,   get: () => maxCombo,   reward: 35 },
    { id: "merge10",  text: "合成 10 次",      target: 10,  get: () => mergeCount, reward: 25 },
    { id: "merge20",  text: "合成 20 次",      target: 20,  get: () => mergeCount, reward: 50 }
  ];
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  goals = shuffled.slice(0, 3).map((g) => ({ ...g, done: false }));
  renderGoals();
}

function renderGoals() {
  if (!goalListDom) return;
  goalListDom.innerHTML = "";
  goals.forEach((g) => {
    const cur = Math.min(g.get(), g.target);
    const pct = Math.min(100, (cur / g.target) * 100);
    const div = document.createElement("div");
    div.className = "goal-item" + (g.done ? " done" : "");
    div.innerHTML =
      '<div class="goal-row">' +
        '<span>' + (g.done ? "✅ " : "") + g.text + '</span>' +
        '<span class="goal-progress">' + (g.done ? "完成" : cur + "/" + g.target) + '</span>' +
      '</div>' +
      '<div class="goal-bar"><i style="width:' + pct + '%"></i></div>';
    goalListDom.appendChild(div);
  });
}

function checkGoals() {
  let changed = false;
  goals.forEach((g) => {
    if (!g.done && g.get() >= g.target) {
      g.done = true;
      changed = true;
      score += g.reward;
      syncScore(score);
      bumpScore();
      showFloatText(window.innerWidth / 2, 160, "✅ 目标完成 +" + g.reward, false);
      sfxCombo(3);
    }
  });
  if (changed) updateBestScore();
  renderGoals();
}

/* 飘字 / 粒子 */
function showFloatText(clientX, clientY, text, isCombo) {
  const div = document.createElement("div");
  let cls = "float-text";
  if (isCombo) cls += " combo";
  div.className = cls;
  div.textContent = text;
  div.style.left = clientX + "px";
  div.style.top = clientY + "px";
  floatLayer.appendChild(div);
  setTimeout(() => div.remove(), 1000);
}

function showScorePop(text) {
  const card = document.querySelector(".mobile-stats .stat-card");
  const box = document.querySelector(".panel-top-stats .stat-box");
  [card, box].forEach((el) => {
    if (!el) return;
    el.classList.remove("score-pop");
    void el.offsetWidth;
    el.classList.add("score-pop");
    const tip = document.createElement("div");
    tip.className = "score-tip";
    tip.textContent = text;
    el.appendChild(tip);
    setTimeout(() => tip.remove(), 900);
  });
}

function canvasToClient(x, y) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = rect.width / BASE_W;
  const scaleY = rect.height / BASE_H;
  return { x: rect.left + x * scaleX, y: rect.top + y * scaleY };
}

const PARTICLE_EMOJI = ["🌸", "💕", "✨", "💖", "🌷"];

function spawnBurstAtCanvas(x, y) {
  const pos = canvasToClient(x, y);
  const n = 10;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "burst-particle";
    p.textContent = PARTICLE_EMOJI[Math.floor(Math.random() * PARTICLE_EMOJI.length)];
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
    const dist = 40 + Math.random() * 50;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.left = pos.x + "px";
    p.style.top = pos.y + "px";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    floatLayer.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function spawnFlashAtCanvas(x, y) {
  const pos = canvasToClient(x, y);
  const flash = document.createElement("div");
  flash.className = "merge-flash";
  flash.style.left = pos.x + "px";
  flash.style.top = pos.y + "px";
  floatLayer.appendChild(flash);
  setTimeout(() => flash.remove(), 520);
}

function spawnClickPulseAtCanvas(x, y) {
  const pos = canvasToClient(x, y);
  const ring = document.createElement("div");
  ring.className = "click-pulse";
  ring.style.left = pos.x + "px";
  ring.style.top = pos.y + "px";
  floatLayer.appendChild(ring);
  setTimeout(() => ring.remove(), 650);
}

/* 方案 7：合成语音气泡（防溢出） */
function spawnSpeechBubbleAtCanvas(x, y, text) {
  const pos = canvasToClient(x, y);
  const bubble = document.createElement("div");
  bubble.className = "speech-bubble";
  bubble.textContent = text;

  const estimatedW = text.length * 12 + 24;
  const halfW = estimatedW / 2;
  const minX = halfW + 8;
  const maxX = window.innerWidth - halfW - 8;
  const clampedX = Math.max(minX, Math.min(maxX, pos.x));

  bubble.style.left = clampedX + "px";
  bubble.style.top = Math.max(60, pos.y - 30) + "px";
  floatLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2100);
}

/* 连击 */
function triggerCombo() {
  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  if (combo >= 2 && comboBadge) {
    comboBadge.style.display = "block";
    comboBadge.textContent =
      comboEmoji(combo) + " " + comboName(combo) + " ×" + combo +
      "  分数 ×" + (1 + (combo - 1) * 0.2).toFixed(1);
    sfxCombo(combo);
  }
  if (comboTimer) clearTimeout(comboTimer);
  comboTimer = setTimeout(() => {
    combo = 0;
    if (comboBadge) comboBadge.style.display = "none";
  }, 2000);
}

const comboMultiplier = () => 1 + Math.max(0, combo - 1) * 0.2;

function shakeScreen() {
  gameWrap.classList.remove("shake");
  void gameWrap.offsetWidth;
  gameWrap.classList.add("shake");
}

function bumpScore() {
  [scoreDom, scoreMobileDom].forEach((el) => {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  });
}

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("flowerBestScore", bestScore);
    syncBest(bestScore);
  }
}

function refreshSoundToggle() {
  if (soundOn) {
    soundToggle.textContent = "🔊";
    soundToggle.classList.remove("off");
  } else {
    soundToggle.textContent = "🔇";
    soundToggle.classList.add("off");
  }
}

soundToggle.onclick = (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  localStorage.setItem("flowerSoundOn", soundOn ? "on" : "off");
  refreshSoundToggle();
  if (soundOn) {
    ensureAudio();
    playTone(660, 0.08, "sine", 0.1, 0);
  }
};

/* 初始化 */
async function initGame() {
  await preloadImages();
  applyImgFallback();

  score = 0;
  balls = [];
  gameRunning = true;
  isClickLocked = false;
  overLineTimer = 0;
  callCooldown = false;
  loveHideTimer = null;
  combo = 0;
  maxCombo = 0;
  mergeCount = 0;
  startTime = Date.now();
  deadLineY = computeDeadLine();

  if (comboTimer) clearTimeout(comboTimer);
  if (comboBadge) comboBadge.style.display = "none";
  syncScore(0);
  syncBest(bestScore);
  rollQuote();
  refreshSoundToggle();

  if (engine) {
    Events.off(engine);
    World.clear(engine.world, false);
    Engine.clear(engine);
  }
  if (render) Render.stop(render);
  if (runner) Runner.stop(runner);

  engine = Engine.create();
  engine.world.gravity.y = 1;

  render = Render.create({
    canvas: canvasEl,
    engine: engine,
    options: {
      width: BASE_W,
      height: BASE_H,
      wireframes: false,
      background: "#fff9ec",
      pixelRatio: window.devicePixelRatio || 1
    }
  });

  Render.run(render);
  runner = Runner.create();
  Runner.run(runner, engine);

  applyDisplaySize();

  const ground = Bodies.rectangle(BASE_W / 2, BASE_H + 20, BASE_W, 40, {
    isStatic: true,
    label: "ground"
  });
  const leftWall = Bodies.rectangle(-10, BASE_H / 2, 20, BASE_H, {
    isStatic: true,
    label: "wallLeft"
  });
  const rightWall = Bodies.rectangle(BASE_W + 10, BASE_H / 2, 20, BASE_H, {
    isStatic: true,
    label: "wallRight"
  });

  World.add(engine.world, [ground, leftWall, rightWall]);

  Events.on(render, "afterRender", drawDeadLine);

  generateGoals();
  pickNext();
  updatePreview();

  /* ===== 方案 1：长按拖拽瞄准 + 松手投放 ===== */
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTime = 0;
  let hasMoved = false;
  let currentAimX = BASE_W / 2;
  let lastDropTime = 0;

  function clientToCanvasX(clientX) {
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = rect.width / BASE_W;
    const mx = (clientX - rect.left) / scaleX;
    return Math.max(20, Math.min(BASE_W - 20, mx));
  }

  function updateAim(clientX) {
    const x = clientToCanvasX(clientX);
    currentAimX = x;

    const rect = canvasEl.getBoundingClientRect();
    const wrapRect = gameWrap.getBoundingClientRect();
    const canvasOffsetLeft = rect.left - wrapRect.left;
    const canvasOffsetTop = rect.top - wrapRect.top;
    const visualScale = rect.width / BASE_W;

    aimLine.style.display = "block";
    aimLine.style.transform = `translateX(${canvasOffsetLeft + x * visualScale}px)`;
    aimLine.style.left = "0";
    aimLine.style.top = canvasOffsetTop + "px";
    aimLine.style.height = deadLineY * visualScale + "px";

    floatingPreview.style.display = "block";
    floatingPreview.style.transform =
      `translate(${canvasOffsetLeft + x * visualScale - 27}px, ${canvasOffsetTop + deadLineY * visualScale - 28}px)`;
    floatingPreview.style.left = "0";
    floatingPreview.style.top = "0";

    return x;
  }

  function hideAim() {
    aimLine.style.display = "none";
    floatingPreview.style.display = "none";
  }

  function doDrop(mx) {
    const now = Date.now();
    if (now - lastDropTime < 250) return;
    lastDropTime = now;

    isClickLocked = true;
    spawnClickPulseAtCanvas(mx, deadLineY);
    spawnBall(mx, nextLevelIndex);
    pickNext();
    updatePreview();
    hideAim();
    setTimeout(() => {
      isClickLocked = false;
    }, 300);
  }

  canvasEl.onmousemove = (e) => {
    if (!gameRunning) return;
    if (isTouchDevice) return;
    updateAim(e.clientX);
  };
  canvasEl.onmouseleave = () => {
    if (isTouchDevice) return;
    hideAim();
  };
  canvasEl.onclick = (e) => {
    ensureAudio();
    if (!gameRunning || isClickLocked) return;
    if (isTouchDevice) return;
    const x = clientToCanvasX(e.clientX);
    doDrop(x);
  };

  canvasEl.addEventListener("touchstart", (e) => {
    if (!gameRunning) return;
    ensureAudio();
    const t = e.touches[0];
    if (!t) return;

    isDragging = true;
    hasMoved = false;
    dragStartX = t.clientX;
    dragStartY = t.clientY;
    dragStartTime = Date.now();

    updateAim(t.clientX);
  }, { passive: true });

  canvasEl.addEventListener("touchmove", (e) => {
    if (!gameRunning || !isDragging) return;
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;

    if (Math.abs(t.clientX - dragStartX) > 4 || Math.abs(t.clientY - dragStartY) > 4) {
      hasMoved = true;
    }
    updateAim(t.clientX);
  }, { passive: false });

  canvasEl.addEventListener("touchend", (e) => {
    if (!gameRunning || !isDragging) return;
    e.preventDefault();
    isDragging = false;

    if (isClickLocked) return;

    const dt = Date.now() - dragStartTime;
    const t = e.changedTouches[0];

    let dropX;
    if (hasMoved || dt > 150) {
      dropX = currentAimX;
    } else if (t) {
      dropX = clientToCanvasX(t.clientX);
    } else {
      dropX = currentAimX;
    }

    doDrop(dropX);
  }, { passive: false });

  canvasEl.addEventListener("touchcancel", () => {
    isDragging = false;
    hideAim();
  });

  /* 碰撞合并 */
  Events.on(engine, "collisionStart", (e) => {
    const pairs = e.pairs;
    for (const pair of pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      if (a.level === undefined || b.level === undefined) continue;
      if (a.level !== b.level) continue;
      if (a.level >= LEVEL.length - 1) continue;
      if (a.merged || b.merged) continue;

      const newLevel = a.level + 1;
      const newX = (a.position.x + b.position.x) / 2;
      const newY = (a.position.y + b.position.y) / 2;

      a.merged = true;
      b.merged = true;

      World.remove(engine.world, [a, b]);
      balls = balls.filter((x) => x !== a && x !== b);

      spawnBurstAtCanvas(newX, newY);
      spawnFlashAtCanvas(newX, newY);
      shakeScreen();
      sfxMerge(newLevel);
      haptic(12);

      mergeCount++;
      triggerCombo();

      const bubbleText = BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)];
      spawnSpeechBubbleAtCanvas(newX, newY, bubbleText);

      const mult = comboMultiplier();
      createMergedBall(newX, newY, newLevel, mult);

      if (combo >= 2) {
        const pos = canvasToClient(newX, newY);
        showFloatText(pos.x, pos.y - 30, comboEmoji(combo) + " " + comboName(combo) + " ×" + combo, true);
      }

      checkGoals();

      if (mergeCount % 3 === 0) rollQuote();
    }
  });

  /* 死亡检测 */
  Events.on(engine, "afterUpdate", () => {
    if (!gameRunning) return;
    const now = Date.now();
    let anyOverLine = false;
    for (const b of balls) {
      if (b.birthTime && now - b.birthTime < SPAWN_PROTECT_MS) continue;
      const ballTop = b.position.y - b.circleRadius;
      if (ballTop < deadLineY) {
        anyOverLine = true;
        break;
      }
    }
    if (anyOverLine) {
      overLineTimer += engine.timing.lastDelta || 16.6;
      if (overLineTimer >= OVER_LINE_GRACE_MS) gameOver();
    } else {
      overLineTimer = 0;
    }
  });
}

/* 生成球 */
function spawnBall(x, levelIndex) {
  const lv = LEVEL[levelIndex];
  const ball = Bodies.circle(x, -60, lv.radius, {
    restitution: 0.35,
    label: "ball",
    level: levelIndex,
    merged: false,
    birthTime: Date.now(),
    render: { sprite: makeSpriteConfig(lv) }
  });
  World.add(engine.world, ball);
  balls.push(ball);
}

/* 合成球 */
function createMergedBall(x, y, levelIndex, mult) {
  const lv = LEVEL[levelIndex];
  const ball = Bodies.circle(x, y, lv.radius, {
    restitution: 0.35,
    label: "ball",
    level: levelIndex,
    merged: false,
    birthTime: Date.now(),
    render: { sprite: makeSpriteConfig(lv) }
  });
  World.add(engine.world, ball);
  balls.push(ball);

  const multiplier = mult || comboMultiplier();
  const gained = Math.round(lv.score * multiplier);

  setTimeout(() => {
    score += gained;
    syncScore(score);
    bumpScore();
    updateBestScore();
    showScorePop("+" + gained);
    checkGoals();
  }, 80);

  const maxDead = Math.round(BASE_H * 0.25);
  const baseDead = computeDeadLine();
  const newDeadLine = Math.min(maxDead, baseDead + Math.floor(score / 150) * 8);
  if (newDeadLine !== deadLineY) deadLineY = newDeadLine;

  if (levelIndex === LEVEL.length - 1) {
    setTimeout(showLoveTransition, 350);
  }

  if (levelIndex === 6 && !callCooldown) {
    callCooldown = true;
    setTimeout(() => {
      showCallTransition();
      setTimeout(() => { callCooldown = false; }, 3200);
    }, 350);
  }
}

function updatePreview() {
  syncNext(LEVEL[nextLevelIndex].src);
  if (previewImg) {
    const real = finalSrc[LEVEL[nextLevelIndex].src] || LEVEL[nextLevelIndex].src;
    previewImg.src = real;
  }
}

/* 结束 / 重开 */
function gameOver() {
  if (!gameRunning) return;
  gameRunning = false;
  sfxOver();
  haptic(30);

  const usedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const emoji = score >= 300 ? "🤩" : score >= 150 ? "😊" : score >= 50 ? "😐" : "😢";
  overEmojiDom.textContent = emoji;
  finalScoreBigDom.textContent = score;
  finalComboDom.textContent = maxCombo;
  finalMergesDom.textContent = mergeCount;
  finalTimeDom.textContent = usedSec + "s";
  finalBestDom.textContent = bestScore;
  finalQuoteDom.textContent = pickFinalQuote();

  gameOverModal.style.display = "flex";
}

function restartGame() {
  if (engine) {
    Events.off(engine);
    World.clear(engine.world, false);
    Engine.clear(engine);
  }
  if (render) Render.stop(render);
  if (runner) Runner.stop(runner);

  aimLine.style.display = "none";
  floatingPreview.style.display = "none";
  loveTransition.classList.remove("show");
  loveBurst.innerHTML = "";
  callTransition.classList.remove("show");
  callBurst.innerHTML = "";
  scoreCardModal.style.display = "none";

  if (loveHideTimer) clearTimeout(loveHideTimer);
  initGame();
}

/* 转场 */
function showLoveTransition() {
  if (loveHideTimer) clearTimeout(loveHideTimer);
  loveTransition.classList.remove("show");
  void loveTransition.offsetWidth;

  const lastLv = LEVEL[LEVEL.length - 1];
  loveImg.src = finalSrc[lastLv.src] || lastLv.src;
  loveBurst.innerHTML = "";

  const particles = ["❤️", "💕", "💖", "🌸", "💗", "🌷", "✨"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("div");
    p.className = "love-particle";
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.4;
    const dist = 120 + Math.random() * 160;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() * 720 - 360).toFixed(0) + "deg";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    p.style.setProperty("--rot", rot);
    p.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";
    loveBurst.appendChild(p);
  }

  loveTransition.classList.add("show");

  loveHideTimer = setTimeout(() => {
    loveTransition.classList.remove("show");
    setTimeout(() => {
      loveBurst.innerHTML = "";
      createHeartRain();
    }, 800);
  }, 3600);
}

function showCallTransition() {
  const lv = LEVEL[6];
  callImg.src = finalSrc[lv.src] || lv.src;
  callBurst.innerHTML = "";
  const particles = ["🔥", "👑", "💥", "⭐", "✨"];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.className = "love-particle";
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
    const dist = 110 + Math.random() * 140;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() * 720 - 360).toFixed(0) + "deg";
    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");
    p.style.setProperty("--rot", rot);
    p.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";
    callBurst.appendChild(p);
  }
  callTransition.classList.add("show");
  setTimeout(() => {
    callTransition.classList.remove("show");
    setTimeout(() => {
      callBurst.innerHTML = "";
    }, 700);
  }, 2800);
}

function createHeartRain() {
  const hearts = ["❤️", "💕", "💖", "🌸", "💗"];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className = "heart";
      div.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      div.style.left = Math.random() * 100 + "vw";
      div.style.animationDuration = 4 + Math.random() * 4 + "s";
      heartContainer.appendChild(div);
      setTimeout(() => div.remove(), 8000);
    }, i * 100);
  }
}

/* ===== 方案 2：竖版成绩卡 ===== */
function generateScoreCard() {
  const W = 600;
  const H = 1000;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fff5f8");
  bg.addColorStop(0.5, "#ffeef5");
  bg.addColorStop(1, "#f7f0ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow1 = ctx.createRadialGradient(120, 120, 20, 120, 120, 320);
  glow1.addColorStop(0, "rgba(255, 200, 220, 0.55)");
  glow1.addColorStop(1, "rgba(255, 200, 220, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W - 100, H - 200, 20, W - 100, H - 200, 360);
  glow2.addColorStop(0, "rgba(210, 220, 255, 0.5)");
  glow2.addColorStop(1, "rgba(210, 220, 255, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("💐", W / 2, 90);

  ctx.fillStyle = "#d94a76";
  ctx.font = "bold 40px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("合成花宝宝", W / 2, 160);

  const lineGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
  lineGrad.addColorStop(0, "rgba(232,138,168,0)");
  lineGrad.addColorStop(0.5, "rgba(232,138,168,1)");
  lineGrad.addColorStop(1, "rgba(232,138,168,0)");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(W / 2 - 120, 195, 240, 2);

  const highest = LEVEL[LEVEL.length - 1];
  const imgSrc = finalSrc[highest.src] || highest.src;
  const img = new Image();
  img.src = imgSrc;

  const drawCardBody = () => {
    const ballSize = 220;
    const ballY = 380;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, ballY, ballSize / 2 + 14, 0, Math.PI * 2);
      const halo = ctx.createRadialGradient(W / 2, ballY, 40, W / 2, ballY, ballSize / 2 + 14);
      halo.addColorStop(0, "rgba(255,255,255,0.95)");
      halo.addColorStop(0.6, "rgba(255,220,235,0.8)");
      halo.addColorStop(1, "rgba(255,180,210,0.1)");
      ctx.fillStyle = halo;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, ballY, ballSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, W / 2 - ballSize / 2, ballY - ballSize / 2, ballSize, ballSize);
      ctx.restore();
    } catch (e) {
      ctx.fillStyle = "#ffb3ce";
      ctx.beginPath();
      ctx.arc(W / 2, ballY, ballSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ff4d7e";
    ctx.font = "bold 130px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(String(score), W / 2, 620);

    ctx.fillStyle = "#c99";
    ctx.font = "22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("本 局 得 分", W / 2, 680);

    const stats = [
      { label: "最高暴击", value: String(maxCombo) },
      { label: "合成次数", value: String(mergeCount) },
      { label: "历史最高", value: String(bestScore) }
    ];
    const statY = 760;
    const statW = 160;
    const gap = 20;
    const totalW = statW * 3 + gap * 2;
    const startX = (W - totalW) / 2;
    stats.forEach((s, i) => {
      const x = startX + i * (statW + gap);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      roundRect(ctx, x, statY, statW, 90, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,210,225,0.9)";
      ctx.lineWidth = 2;
      roundRect(ctx, x, statY, statW, 90, 18);
      ctx.stroke();

      ctx.fillStyle = "#c99";
      ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.fillText(s.label, x + statW / 2, statY + 30);

      ctx.fillStyle = "#d94a76";
      ctx.font = "bold 34px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.fillText(s.value, x + statW / 2, statY + 68);
    });

    const quote = pickFinalQuote();
    ctx.fillStyle = "#d88aa8";
    ctx.font = "24px 'PingFang SC','STKaiti','KaiTi',serif";
    ctx.fillText(quote, W / 2, 920);

    ctx.fillStyle = "#c99";
    ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("花宝宝专属 · 合成花宝宝", W / 2, 960);
  };

  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) {
      drawCardBody();
      resolve(c.toDataURL("image/png"));
    } else {
      const done = () => {
        drawCardBody();
        resolve(c.toDataURL("image/png"));
      };
      img.onload = done;
      img.onerror = done;
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

openScoreCardBtn.onclick = async () => {
  gameOverModal.style.display = "none";
  const dataUrl = await generateScoreCard();
  scoreCardImg.src = dataUrl;
  scoreCardModal.style.display = "flex";
};

closeScoreCardBtn.onclick = () => {
  scoreCardModal.style.display = "none";
  gameOverModal.style.display = "flex";
};

restartFromCardBtn.onclick = () => {
  scoreCardModal.style.display = "none";
  restartGame();
};

closeOverBtn.onclick = () => {
  gameOverModal.style.display = "none";
  restartGame();
};
restartBtn.onclick = restartGame;

/* 图片加载 & fallback */
const finalSrc = {};
const imageDims = {};

function makeFallbackDataURL(idx) {
  const c = document.createElement("canvas");
  c.width = 500;
  c.height = 500;
  const ctx = c.getContext("2d");

  const { light, dark } = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

  const grad = ctx.createRadialGradient(200, 180, 40, 250, 250, 260);
  grad.addColorStop(0, light);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(250, 250, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(170, 170, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(155, 155, 28, 0, Math.PI * 2);
  ctx.fill();

  return c.toDataURL();
}

function preloadImages() {
  return Promise.all(
    LEVEL.map((item, idx) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = item.src;

        img.onload = () => {
          const w = img.naturalWidth || img.width || 0;
          const h = img.naturalHeight || img.height || 0;
          if (w > 0 && h > 0) {
            imageDims[item.src] = { w, h };
            finalSrc[item.src] = item.src;
          } else {
            imageDims[item.src] = { w: 500, h: 500 };
            finalSrc[item.src] = makeFallbackDataURL(idx);
          }
          resolve(true);
        };

        img.onerror = () => {
          console.warn("图片加载失败，使用 fallback：", item.src);
          imageDims[item.src] = { w: 500, h: 500 };
          finalSrc[item.src] = makeFallbackDataURL(idx);
          resolve(true);
        };
      })
    )
  );
}

function makeSpriteConfig(lv) {
  const src = finalSrc[lv.src] || lv.src;
  const dim = imageDims[lv.src] || { w: 500, h: 500 };
  const targetSize = lv.radius * 2;
  return {
    texture: src,
    xScale: targetSize / dim.w,
    yScale: targetSize / dim.h
  };
}

function applyImgFallback() {
  LEVEL.forEach((item) => {
    if (finalSrc[item.src] && finalSrc[item.src] !== item.src) {
      document.querySelectorAll(`img[src="${item.src}"]`).forEach((el) => {
        el.src = finalSrc[item.src];
      });
    }
  });
  const nextSrc = nextImgDom ? nextImgDom.getAttribute("src") : "";
  if (nextSrc && finalSrc[nextSrc] && finalSrc[nextSrc] !== nextSrc) {
    if (nextImgDom) nextImgDom.src = finalSrc[nextSrc];
  }
  const nextSrcMobile = nextImgMobileDom
    ? nextImgMobileDom.getAttribute("src")
    : "";
  if (
    nextSrcMobile &&
    finalSrc[nextSrcMobile] &&
    finalSrc[nextSrcMobile] !== nextSrcMobile
  ) {
    if (nextImgMobileDom) nextImgMobileDom.src = finalSrc[nextSrcMobile];
  }
  const previewSrc = previewImg ? previewImg.getAttribute("src") : "";
  if (previewSrc && finalSrc[previewSrc] && finalSrc[previewSrc] !== previewSrc) {
    if (previewImg) previewImg.src = finalSrc[previewSrc];
  }
}

function computeDisplaySize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ratio = BASE_W / BASE_H;

  if (vw <= 860) {
    const w = vw - 12;
    const h = Math.round(w / ratio);
    return { w: Math.round(w), h };
  }

  const maxW = 360;
  const maxH = vh * 0.78;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { w: Math.round(w), h: Math.round(h) };
}

function applyDisplaySize() {
  const size = computeDisplaySize();
  canvasEl.style.width = size.w + "px";
  canvasEl.style.height = size.h + "px";

  if (window.innerWidth <= 860) {
    if (leftCol) leftCol.style.width = size.w + "px";
    if (rightCol) rightCol.style.width = size.w + "px";
  } else {
    if (leftCol) leftCol.style.width = "";
    if (rightCol) rightCol.style.width = "";
  }
}

function computeDeadLine() {
  return Math.round(BASE_H * (100 / 520));
}

/* 背景花瓣 */
function startAmbientPetals() {
  const petals = ["🌸", "🌷", "💮", "🌺"];
  setInterval(() => {
    if (document.hidden) return;
    const p = document.createElement("div");
    p.className = "ambient-petal";
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 12 + Math.random() * 14 + "px";
    p.style.animationDuration = 10 + Math.random() * 10 + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 22000);
  }, window.innerWidth <= 860 ? 5000 : 1800);
}

let resizeTimer = null;
window.addEventListener("resize", () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyDisplaySize, 100);
});
window.addEventListener("orientationchange", () => {
  setTimeout(applyDisplaySize, 200);
});

initGame();
startAmbientPetals();

/* ===== 把音效函数暴露给消消乐使用 ===== */
window.sfxMerge = sfxMerge;
window.sfxCombo = sfxCombo;
window.playTone = playTone;