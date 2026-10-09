/* ===== 花宝宝消消乐 ===== */
(function () {
  "use strict";

  const SIZE = 6;
  const MAX_LEVEL = 7; // 0~7 共 8 级
  const START_MOVES = 30;

  const LEVEL_SRCS = [
    "img/0.png", "img/1.png", "img/2.png", "img/3.png",
    "img/4.png", "img/5.png", "img/6.png", "img/7.png"
  ];

  const BUBBLE_TEXTS = [
    "贴贴", "抱抱", "好想你", "亲亲", "爱你", "么么哒",
    "花宝宝", "想你了", "在呢", "抱紧你", "蹭蹭", "嘿嘿"
  ];

  const overlay = document.getElementById("matchGameOverlay");
  const boardEl = document.getElementById("matchBoard");
  const scoreEl = document.getElementById("matchScore");
  const movesEl = document.getElementById("matchMoves");
  const bestEl = document.getElementById("matchBest");
  const restartBtn = document.getElementById("matchRestartBtn");
  const exitBtn = document.getElementById("matchExitBtn");
  const openBtn = document.getElementById("openMatchGameBtn");

  let board = [];
  let score = 0;
  let moves = START_MOVES;
  let running = false;
  let selected = null;
  let busy = false;

  /* 音效（复用主游戏的全局函数，如果没有则静默） */
  const sfxMerge = (lv) => {
    if (typeof window.sfxMerge === "function") window.sfxMerge(lv);
  };
  const sfxCombo = (n) => {
    if (typeof window.sfxCombo === "function") window.sfxCombo(n);
  };
  const haptic = (ms) => {
    try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {}
  };

  /* 最高分（分开存） */
  let best = Number(localStorage.getItem("flowerMatchBest")) || 0;
  bestEl.textContent = best;

  /* ===== 初始化棋盘 ===== */
  function initBoard() {
    board = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) {
        row.push({ level: randLevel(), el: null });
      }
      board.push(row);
    }

    let guard = 0;
    while ((findMatches().length > 0 || !hasPossibleMove()) && guard < 200) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          board[r][c].level = randLevel();
        }
      }
      guard++;
    }
  }

  function randLevel() {
    const weights = [30, 26, 20, 14, 7, 2, 1, 0];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return 0;
  }

  /* ===== 渲染 ===== */
  function renderBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = board[r][c];
        const el = document.createElement("div");
        el.style.cssText = `
          position:relative;
          border-radius:12px;
          background:linear-gradient(180deg,#fff 0%,#fff8fb 100%);
          box-shadow:inset 0 0 0 1px rgba(255,210,225,0.7);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          transition:transform 0.15s ease, box-shadow 0.15s ease;
          overflow:hidden;
          touch-action:none;
          user-select:none;
          -webkit-user-select:none;
        `;
        el.dataset.r = r;
        el.dataset.c = c;

        if (cell) {
          const img = document.createElement("img");
          img.src = LEVEL_SRCS[cell.level];
          img.style.cssText = `
            width:78%;
            height:78%;
            object-fit:contain;
            pointer-events:none;
            filter:drop-shadow(0 2px 4px rgba(255,140,180,0.35));
          `;
          el.appendChild(img);
          cell.el = el;
        }

        boardEl.appendChild(el);
      }
    }
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const all = boardEl.children;
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      const r = Number(el.dataset.r);
      const c = Number(el.dataset.c);
      if (selected && selected.r === r && selected.c === c) {
        el.style.boxShadow =
          "inset 0 0 0 2px #ff6b95, 0 0 12px rgba(255,107,149,0.6)";
        el.style.transform = "scale(1.06)";
      } else {
        el.style.boxShadow = "inset 0 0 0 1px rgba(255,210,225,0.7)";
        el.style.transform = "scale(1)";
      }
    }
  }

  /* ===== 输入 ===== */
  function getCellFromEvent(e) {
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = boardEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellW = rect.width / SIZE;
    const cellH = rect.height / SIZE;
    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return null;
    return { r, c };
  }

  function onCellClick(r, c) {
    if (!running || busy) return;
    if (!selected) {
      selected = { r, c };
      updateSelectionUI();
      return;
    }
    const a = selected;
    const b = { r, c };
    if (a.r === b.r && a.c === b.c) {
      selected = null;
      updateSelectionUI();
      return;
    }
    const dist = Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
    if (dist !== 1) {
      selected = { r, c };
      updateSelectionUI();
      return;
    }
    selected = null;
    updateSelectionUI();
    trySwap(a, b);
  }

  boardEl.addEventListener("click", (e) => {
    const cell = getCellFromEvent(e);
    if (cell) onCellClick(cell.r, cell.c);
  });

  boardEl.addEventListener("touchstart", (e) => {
    e.preventDefault();
  }, { passive: false });

  boardEl.addEventListener("touchend", (e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (cell) onCellClick(cell.r, cell.c);
  }, { passive: false });

  /* ===== 交换 ===== */
  function trySwap(a, b) {
    if (busy) return;
    busy = true;

    swapCells(a, b);
    renderBoard();

    const matches = findMatches();
    if (matches.length === 0) {
      setTimeout(() => {
        swapCells(a, b);
        renderBoard();
        busy = false;
      }, 220);
      return;
    }

    moves -= 1;
    movesEl.textContent = moves;

    resolveAll().then(() => {
      busy = false;
      if (moves <= 0) {
        endGame();
        return;
      }
      if (!hasPossibleMove()) {
        shuffleBoard();
        renderBoard();
      }
    });
  }

  function swapCells(a, b) {
    const tmp = board[a.r][a.c];
    board[a.r][a.c] = board[b.r][b.c];
    board[b.r][b.c] = tmp;
  }

  /* ===== 三连检测 ===== */
  function findMatches() {
    const result = [];
    for (let r = 0; r < SIZE; r++) {
      let run = 1;
      for (let c = 1; c <= SIZE; c++) {
        const same =
          c < SIZE &&
          board[r][c] &&
          board[r][c - 1] &&
          board[r][c].level === board[r][c - 1].level;
        if (same) {
          run++;
        } else {
          if (run >= 3) {
            result.push({ dir: "h", r, c: c - run, len: run });
          }
          run = 1;
        }
      }
    }
    for (let c = 0; c < SIZE; c++) {
      let run = 1;
      for (let r = 1; r <= SIZE; r++) {
        const same =
          r < SIZE &&
          board[r][c] &&
          board[r - 1][c] &&
          board[r][c].level === board[r - 1][c].level;
        if (same) {
          run++;
        } else {
          if (run >= 3) {
            result.push({ dir: "v", r: r - run, c, len: run });
          }
          run = 1;
        }
      }
    }
    return result;
  }

  /* ===== 消除 + 合成 + 连锁 ===== */
  let chainCount = 0;

  function resolveAll() {
    return new Promise((resolve) => {
      chainCount = 0;
      const step = () => {
        const matches = findMatches();
        if (matches.length === 0) {
          resolve();
          return;
        }
        chainCount++;
        applyMatches(matches);
        setTimeout(() => {
          dropAndRefill();
          renderBoard();
          setTimeout(step, 180);
        }, 200);
      };
      step();
    });
  }

  function applyMatches(matches) {
    const toClear = new Set();
    const mergeMap = new Map();

    matches.forEach((m) => {
      const cells = [];
      if (m.dir === "h") {
        for (let i = 0; i < m.len; i++) cells.push({ r: m.r, c: m.c + i });
      } else {
        for (let i = 0; i < m.len; i++) cells.push({ r: m.r + i, c: m.c });
      }

      const mid = cells[Math.floor(cells.length / 2)];
      const baseLevel = board[mid.r][mid.c].level;
      let newLevel = baseLevel + 1;
      if (m.len >= 5) newLevel = baseLevel + 2;
      newLevel = Math.min(newLevel, MAX_LEVEL);

      let targetKey = `${mid.r},${mid.c}`;
      if (mergeMap.has(targetKey) || toClear.has(targetKey)) {
        for (const cell of cells) {
          const key = `${cell.r},${cell.c}`;
          if (!mergeMap.has(key) && !toClear.has(key)) {
            targetKey = key;
            break;
          }
        }
      }

      mergeMap.set(targetKey, newLevel);

      cells.forEach((cell) => {
        const key = `${cell.r},${cell.c}`;
        if (key !== targetKey) toClear.add(key);
      });
    });

    toClear.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const cell = board[r][c];
      if (cell && cell.el) {
        cell.el.style.transform = "scale(0)";
        cell.el.style.opacity = "0";
      }
      board[r][c] = null;
    });

    mergeMap.forEach((newLevel, key) => {
      const [r, c] = key.split(",").map(Number);
      const cell = board[r][c];
      if (cell) {
        cell.level = newLevel;
        if (cell.el) {
          cell.el.style.transform = "scale(1.2)";
          setTimeout(() => {
            if (cell.el) cell.el.style.transform = "scale(1)";
          }, 160);
        }
      }
    });

    const baseScore = matches.reduce((sum, m) => sum + m.len * 10, 0);
    const chainMult = 1 + (chainCount - 1) * 0.5;
    const gained = Math.round(baseScore * chainMult);
    score += gained;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("flowerMatchBest", best);
      bestEl.textContent = best;
    }

    const firstMatch = matches[0];
    const lv = board[firstMatch.r] && board[firstMatch.r][firstMatch.c]
      ? board[firstMatch.r][firstMatch.c].level
      : 1;
    sfxMerge(lv);
    haptic(10);

    if (chainCount >= 2) {
      sfxCombo(chainCount);
      showFloatText(
        window.innerWidth / 2,
        160,
        "连锁 ×" + chainCount + "  +" + gained,
        true
      );
    }

    if (typeof window.spawnSpeechBubbleAtClient === "function") {
      const rect = boardEl.getBoundingClientRect();
      const cellW = rect.width / SIZE;
      const cellH = rect.height / SIZE;
      const cx = rect.left + (firstMatch.c + 0.5) * cellW;
      const cy = rect.top + (firstMatch.r + 0.5) * cellH;
      const text = BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)];
      window.spawnSpeechBubbleAtClient(cx, cy, text);
    }
  }

  /* ===== 掉落 + 补球 ===== */
  function dropAndRefill() {
    for (let c = 0; c < SIZE; c++) {
      let writeRow = SIZE - 1;
      for (let r = SIZE - 1; r >= 0; r--) {
        if (board[r][c] !== null) {
          if (writeRow !== r) {
            board[writeRow][c] = board[r][c];
            board[r][c] = null;
          }
          writeRow--;
        }
      }
      for (let r = writeRow; r >= 0; r--) {
        board[r][c] = { level: randLevel(), el: null };
      }
    }
  }

  /* ===== 死局检测 ===== */
  function hasPossibleMove() {
    const test = (a, b) => {
      swapCells(a, b);
      const ok = findMatches().length > 0;
      swapCells(a, b);
      return ok;
    };
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (c < SIZE - 1 && test({ r, c }, { r, c: c + 1 })) return true;
        if (r < SIZE - 1 && test({ r, c }, { r: r + 1, c })) return true;
      }
    }
    return false;
  }

  function shuffleBoard() {
    const levels = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        levels.push(board[r][c] ? board[r][c].level : randLevel());
      }
    }
    for (let i = levels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levels[i], levels[j]] = [levels[j], levels[i]];
    }
    let idx = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        board[r][c] = { level: levels[idx++], el: null };
      }
    }
    let guard = 0;
    while ((findMatches().length > 0 || !hasPossibleMove()) && guard < 100) {
      shuffleLevels(levels);
      let i2 = 0;
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          board[r][c] = { level: levels[i2++], el: null };
        }
      }
      guard++;
    }
  }

  function shuffleLevels(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /* ===== 飘字 ===== */
  function showFloatText(clientX, clientY, text, isCombo) {
    const layer = document.getElementById("floatLayer");
    if (!layer) return;
    const div = document.createElement("div");
    div.className = "float-text" + (isCombo ? " combo" : "");
    div.textContent = text;
    div.style.left = clientX + "px";
    div.style.top = clientY + "px";
    layer.appendChild(div);
    setTimeout(() => div.remove(), 1000);
  }

  /* ===== 开始 / 结束 ===== */
  function startGame() {
    score = 0;
    moves = START_MOVES;
    running = true;
    busy = false;
    selected = null;
    scoreEl.textContent = "0";
    movesEl.textContent = String(moves);
    bestEl.textContent = String(best);
    initBoard();
    renderBoard();
  }

  function endGame() {
    running = false;
    busy = true;

    if (score > best) {
      best = score;
      localStorage.setItem("flowerMatchBest", best);
      bestEl.textContent = best;
    }

    setTimeout(() => {
      const emoji = score >= 500 ? "🤩" : score >= 200 ? "😊" : "😢";
      const tip = score >= 500
        ? "花宝宝，你也太厉害了吧！"
        : score >= 200
        ? "花宝宝，这局不错哦"
        : "花宝宝，再来一局嘛";
      alert(`${emoji} 消消乐结束\n本局得分：${score}\n历史最高：${best}\n${tip}`);
      startGame();
    }, 300);
  }

  /* ===== 入口 / 退出 ===== */
  function openGame() {
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    startGame();
  }

  function closeGame() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    running = false;
  }

  if (openBtn) openBtn.addEventListener("click", openGame);
  if (exitBtn) exitBtn.addEventListener("click", closeGame);
  if (restartBtn) restartBtn.addEventListener("click", startGame);

  /* 暴露给主游戏，让合成时也能弹气泡 */
  window.spawnSpeechBubbleAtClient = function (clientX, clientY, text) {
    const layer = document.getElementById("floatLayer");
    if (!layer) return;
    const bubble = document.createElement("div");
    bubble.className = "speech-bubble";
    bubble.textContent = text;

    const estimatedW = text.length * 12 + 24;
    const halfW = estimatedW / 2;
    const minX = halfW + 8;
    const maxX = window.innerWidth - halfW - 8;
    const clampedX = Math.max(minX, Math.min(maxX, clientX));

    bubble.style.left = clampedX + "px";
    bubble.style.top = Math.max(60, clientY - 30) + "px";
    layer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2100);
  };
})();