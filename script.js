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

const loveTransition = document.getElementById("loveTransition");
const loveImg = document.getElementById("loveImg");
const loveBurst = document.getElementById("loveBurst");

const callTransition = document.getElementById("callTransition");
const callImg = document.getElementById("callImg");
const callBurst = document.getElementById("callBurst");

const BASE_W = 320;
const BASE_H = 520;

/* =========================================================
   ★ 关键 1：sprite 强制渲染成 2r × 2r 正方形
   ========================================================= */
const imageDims = {};

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

function preloadImages() {
  return Promise.all(
    LEVEL.map((item) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = item.src;
        img.onload = () => {
          imageDims[item.src] = {
            w: img.naturalWidth || 500,
            h: img.naturalHeight || 500
          };
          resolve(true);
        };
        img.onerror = () => {
          console.warn("图片加载失败：", item.src);
          imageDims[item.src] = { w: 500, h: 500 };
          resolve(true);
        };
      })
    )
  );
}

function makeSpriteConfig(lv) {
  const dim = imageDims[lv.src] || { w: 500, h: 500 };
  const targetSize = lv.radius * 2;
  return {
    texture: lv.src,
    xScale: targetSize / dim.w,
    yScale: targetSize / dim.h
  };
}

/* =========================================================
   ★ 关键 2：严格 320:520 比例
   ========================================================= */
function computeDisplaySize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ratio = BASE_W / BASE_H;

  if (vw <= 860) {
    // 手机：先按宽度算，再用高度限制
    // 预留：卡片(约55) + 面板(约100) + 间距(约18) + body padding(12)
    const reserved = 200;
    const maxW = vw - 12;
    const maxH = vh - reserved;

    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return { w: Math.round(w), h: Math.round(h) };
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

/* =========================================================
   状态变量
   ========================================================= */
let deadLineY = 100;
const computeDeadLine = () => Math.round(BASE_H * (100 / 520));

const LOVE_QUOTES = [
  "花宝宝，今天也超级想你",
  "花宝宝，想把你揣兜里",
  "花宝宝，想和你贴贴",
  "花宝宝，今天也很喜欢你",
  "花宝宝，抱着你就好了",
  "花宝宝，我不困，我只是想睡觉而已",
  "花宝宝，我数了数，你的手指头刚好十根",
  "花宝宝，我这个人没什么优点，就是优点不多",
  "花宝宝，我没什么爱好，就是爱好你",
  "花宝宝，我保证，这是我最后一次保证",
  "花宝宝，你爱我，我也爱你，凑巧了",
  "花宝宝，你喜欢我，我也喜欢你，天作之合",
  "花宝宝，你问我喜欢你哪里，我哪都喜欢"
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
let callShown = false;

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

/* =========================================================
   音效
   ========================================================= */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audioCtx = null; }
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
  try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {}
};

/* =========================================================
   同步 UI
   ========================================================= */
const syncScore = (v) => {
  if (scoreDom) scoreDom.textContent = v;
  if (scoreMobileDom) scoreMobileDom.textContent = v;
};
const syncBest = (v) => {
  if (bestScoreDom) bestScoreDom.textContent = v;
  if (bestScoreMobileDom) bestScoreMobileDom.textContent = v;
};
const syncNext = (src) => {
  if (nextImgDom) nextImgDom.src = src;
  if (nextImgMobileDom) nextImgMobileDom.src = src;
};

const rollQuote = () => {
  const q = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
  panelTag.textContent = q;
  if (panelTagWrap) {
    panelTagWrap.style.animation = "none";
    void panelTagWrap.offsetWidth;
    panelTagWrap.style.animation = "";
  }
};

const getWeights = () => {
  const t = Math.min(1, score / 300);
  return BASE_WEIGHTS.map((w, i) => {
    if (w === 0) return 0;
    if (i === 0) return Math.max(14, w - 8 * t);
    if (i === 1) return w + 2 * t;
    return w + 4 * t;
  });
};

const COMBO_NAMES = ["", "", "暴击", "连击", "超神", "无双", "传说", "神迹"];
const comboName = (n) =>
  COMBO_NAMES[Math.min(n, COMBO_NAMES.length - 1)] || "暴击";

/* =========================================================
   死亡线
   ========================================================= */
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

/* =========================================================
   目标
   ========================================================= */
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

/* =========================================================
   飘字 / 粒子
   ========================================================= */
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
  if (!card) return;
  card.classList.remove("score-pop");
  void card.offsetWidth;
  card.classList.add("score-pop");
  const tip = document.createElement("div");
  tip.className = "score-tip";
  tip.textContent = text;
  card.appendChild(tip);
  setTimeout(() => tip.remove(), 900);
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