// ==================================================
// am.1:30 メインアプリケーション (元デザイン対応版)
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initClock();
  showMenu();
});

// 星空と流れ星の生成（元デザインのCSSアニメーション用）
function initStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  container.innerHTML = '';

  // 星をランダム生成
  const starCount = 60;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
    star.style.setProperty('--init-opacity', `${Math.random() * 0.7 + 0.2}`);
    container.appendChild(star);
  }

  // 流れ星を生成
  for (let i = 0; i < 2; i++) {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.top = `${Math.random() * 50}%`;
    shootingStar.style.right = `${Math.random() * 20}%`;
    shootingStar.style.animationDelay = `${i * 4 + Math.random() * 2}s`;
    container.appendChild(shootingStar);
  }
}

// 時計機能
function initClock() {
  const clockEl = document.getElementById('digital-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${h}:${m}`;
  }
  update();
  setInterval(update, 10000);
}

// ==================================================
// ナビゲーション・ルーティング
// ==================================================
function showMenu() {
  const container = document.getElementById('game-container');
  if (!container) return;

  container.innerHTML = `
    <h2 class="title">am.1:30</h2>
    <p class="subtitle">夜長に遊ぶ、静かな10のミニゲーム</p>

    <div class="game-grid">
      <div class="card" data-game="1">
        <span class="card-title">01. RGB Color Match</span>
        <span class="card-desc">完璧な色合いを直感で当てるカラーパズル</span>
      </div>
      <div class="card" data-game="2">
        <span class="card-title">02. Midnight Snake</span>
        <span class="card-desc">星を食べながら夜の隙間を泳ぐレトロアクション</span>
      </div>
      <div class="card" data-game="3">
        <span class="card-title">03. Lights Out</span>
        <span class="card-desc">マスを切り替えて盤面をそろえる思考系パズル</span>
      </div>
      <div class="card" data-game="4">
        <span class="card-title">04. Color Tile</span>
        <span class="card-desc">同色の交差を狙う思考系パズル</span>
      </div>
      <div class="card" data-game="5">
        <span class="card-title">05. Minesweeper</span>
        <span class="card-desc">地雷を避けて全マスを開ける王道ゲーム</span>
      </div>
      <div class="card" data-game="6">
        <span class="card-title">06. 2048</span>
        <span class="card-desc">数字を重ねて大きな数を作る時間泥棒</span>
      </div>
      <div class="card" data-game="7">
        <span class="card-title">07. Starlight Timing</span>
        <span class="card-desc">回転する光をタイミングよく合わせる集中ゲーム</span>
      </div>
      <div class="card" data-game="8">
        <span class="card-title">08. Planet Tower</span>
        <span class="card-desc">ブロックを崩さないように積み上げるバランスゲーム</span>
      </div>
      <div class="card" data-game="9">
        <span class="card-title">09. Sudoku</span>
        <span class="card-desc">夜長に没頭するナンプレ</span>
      </div>
      <div class="card" data-game="10">
        <span class="card-title">10. Solitaire</span>
        <span class="card-desc">じっくり遊べるトランプパズル</span>
      </div>
    </div>
  `;

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const gameId = card.dataset.game;
      loadGame(gameId);
    });
  });
}

function loadGame(gameId) {
  const container = document.getElementById('game-container');
  if (!container) return;

  container.innerHTML = `
    <button class="back-btn" onclick="showMenu()">← メニューに戻る</button>
    <div class="game-container" id="game-view"></div>
  `;

  const view = document.getElementById('game-view');

  switch (gameId) {
    case '1': initRgbGame(view); break;
    case '2': initSnakeGame(view); break;
    case '3': initLightsOutGame(view); break;
    case '4': initColorTileGame(view); break;
    case '5': initMinesweeperGame(view); break;
    case '6': init2048Game(view); break;
    case '7': initStarlightTimingGame(view); break;
    case '8': initPlanetTowerGame(view); break;
    case '9': initSudokuGame(view); break;
    case '10': initSolitaireGame(view); break;
    default: showMenu();
  }
}

// ==================================================
// 01. RGB Color Match
// ==================================================
function initRgbGame(container) {
  let targetR = Math.floor(Math.random() * 256);
  let targetG = Math.floor(Math.random() * 256);
  let targetB = Math.floor(Math.random() * 256);

  container.innerHTML = `
    <h2 style="margin-bottom:6px;">01. RGB Color Match</h2>
    <p style="color:#9aa8c7; font-size:0.85rem; margin-bottom:20px;">スライダーを動かして目標の色を作り出そう</p>

    <div style="display:flex; gap:20px; margin-bottom:24px;">
      <div style="text-align:center;">
        <div style="width:110px; height:110px; border-radius:12px; background:rgb(${targetR},${targetG},${targetB}); box-shadow:0 4px 15px rgba(0,0,0,0.4);"></div>
        <span style="font-size:0.75rem; color:#9aa8c7; margin-top:8px; display:block;">TARGET</span>
      </div>
      <div style="text-align:center;">
        <div id="user-box" style="width:110px; height:110px; border-radius:12px; background:rgb(128,128,128); box-shadow:0 4px 15px rgba(0,0,0,0.4);"></div>
        <span style="font-size:0.75rem; color:#9aa8c7; margin-top:8px; display:block;">YOUR COLOR</span>
      </div>
    </div>

    <div style="width:100%; max-width:300px; display:flex; flex-direction:column; gap:14px; margin-bottom:24px;">
      <div>
        <label style="color:#ff6b6b; font-size:0.8rem; font-weight:bold;">R: <span id="val-r">128</span></label>
        <input type="range" id="slider-r" min="0" max="255" value="128" style="width:100%;">
      </div>
      <div>
        <label style="color:#51cf66; font-size:0.8rem; font-weight:bold;">G: <span id="val-g">128</span></label>
        <input type="range" id="slider-g" min="0" max="255" value="128" style="width:100%;">
      </div>
      <div>
        <label style="color:#339af0; font-size:0.8rem; font-weight:bold;">B: <span id="val-b">128</span></label>
        <input type="range" id="slider-b" min="0" max="255" value="128" style="width:100%;">
      </div>
    </div>

    <button id="check-btn" style="background:rgba(140,170,255,0.25); color:#fff; border:1px solid rgba(160,180,255,0.5); padding:10px 28px; border-radius:6px; cursor:pointer; font-size:0.95rem;">判定する</button>
    <div id="result-text" style="margin-top:16px; font-size:1.1rem; font-weight:bold; min-height:28px;"></div>
    <button id="retry-btn" style="display:none; background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:8px 20px; border-radius:6px; cursor:pointer; font-size:0.85rem; margin-top:10px;">次の色へ</button>
  `;

  const sr = document.getElementById('slider-r');
  const sg = document.getElementById('slider-g');
  const sb = document.getElementById('slider-b');
  const vr = document.getElementById('val-r');
  const vg = document.getElementById('val-g');
  const vb = document.getElementById('val-b');
  const userBox = document.getElementById('user-box');
  const checkBtn = document.getElementById('check-btn');
  const resultText = document.getElementById('result-text');
  const retryBtn = document.getElementById('retry-btn');

  function updateColor() {
    vr.textContent = sr.value;
    vg.textContent = sg.value;
    vb.textContent = sb.value;
    userBox.style.background = `rgb(${sr.value},${sg.value},${sb.value})`;
  }

  [sr, sg, sb].forEach(s => s.addEventListener('input', updateColor));

  checkBtn.addEventListener('click', () => {
    const dr = Math.abs(targetR - sr.value);
    const dg = Math.abs(targetG - sg.value);
    const db = Math.abs(targetB - sb.value);
    const diff = Math.sqrt(dr * dr + dg * dg + db * db);
    const score = Math.max(0, Math.round(100 - (diff / 441.67) * 100));

    resultText.innerHTML = `一致度: <span style="color:#ffd43b;">${score}%</span> (Target: ${targetR}, ${targetG}, ${targetB})`;
    checkBtn.style.display = 'none';
    retryBtn.style.display = 'inline-block';
  });

  retryBtn.addEventListener('click', () => initRgbGame(container));
}

// ==================================================
// 02. Midnight Snake (キーボード操作修復版)
// ==================================================
function initSnakeGame(container) {
  let gridSize = 15;
  let currentDifficulty = 'NORMAL';
  let snake = [];
  let food = { x: 0, y: 0 };
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let score = 0;
  let highScore = localStorage.getItem('snake_highscore') || 0;
  let gameInterval = null;
  let isGameOver = false;
  let isGameStarted = false;
  let isRedFlashing = false;

  container.innerHTML = `
    <h2 style="margin-bottom:6px;">02. Midnight Snake</h2>
    <p style="color:#9aa8c7; font-size:0.85rem; margin-bottom:16px;">星を食べながら夜の隙間を泳ごう</p>

    <div style="display:flex; gap:8px; margin-bottom:16px;">
      <button class="diff-btn active" data-diff="NORMAL" data-size="15" style="background:rgba(160,180,255,0.2); color:#fff; border:1px solid rgba(160,180,255,0.4); padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem;">NORMAL</button>
      <button class="diff-btn" data-diff="HARD" data-size="20" style="background:rgba(255,255,255,0.05); color:#9aa8c7; border:1px solid rgba(255,255,255,0.1); padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem;">HARD</button>
      <button class="diff-btn" data-diff="EXPERT" data-size="25" style="background:rgba(255,255,255,0.05); color:#9aa8c7; border:1px solid rgba(255,255,255,0.1); padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem;">EXPERT</button>
    </div>

    <div style="display:flex; justify-content:space-between; width:100%; max-width:300px; font-size:0.85rem; color:#9aa8c7; margin-bottom:12px;">
      <span>SCORE: <strong id="snake-score" style="color:#fff;">0</strong></span>
      <span>HIGH SCORE: <strong id="snake-highscore" style="color:#ffd43b;">${highScore}</strong></span>
    </div>

    <div style="position:relative; width:100%; max-width:300px; display:flex; justify-content:center;">
      <canvas id="snake-canvas" width="300" height="300" style="background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.15); border-radius:10px; transition: transform 0.05s ease;"></canvas>
      
      <div id="snake-overlay" style="position:absolute; top:0; left:50%; transform:translateX(-50%); width:300px; height:300px; background:rgba(10,14,28,0.85); border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(4px); transition: opacity 0.3s ease;">
        <h3 id="overlay-title" style="color:#a0c8ff; font-size:1.3rem; letter-spacing:1px;">MIDNIGHT SNAKE</h3>
        <p id="overlay-desc" style="color:#ffd43b; font-size:1.1rem; font-weight:600; min-height:24px;"></p>
        <button id="snake-action-btn" style="background:rgba(140,170,255,0.25); color:#fff; border:1px solid rgba(160,180,255,0.5); padding:10px 24px; border-radius:6px; cursor:pointer; font-size:0.95rem; margin-top:8px;">START</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 42px); gap:6px; margin-top:16px;">
      <div></div>
      <button id="btn-up" style="height:42px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:1.1rem; cursor:pointer;">▲</button>
      <div></div>
      <button id="btn-left" style="height:42px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:1.1rem; cursor:pointer;">◀</button>
      <button id="btn-down" style="height:42px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:1.1rem; cursor:pointer;">▼</button>
      <button id="btn-right" style="height:42px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:1.1rem; cursor:pointer;">▶</button>
    </div>
  `;

  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('snake-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayDesc = document.getElementById('overlay-desc');
  const actionBtn = document.getElementById('snake-action-btn');
  const scoreDisplay = document.getElementById('snake-score');
  const highScoreDisplay = document.getElementById('snake-highscore');

  function setupGame() {
    if (gameInterval) clearInterval(gameInterval);

    const startPos = Math.floor(gridSize / 2);
    snake = [
      { x: startPos, y: startPos },
      { x: startPos - 1, y: startPos },
      { x: startPos - 2, y: startPos }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    isGameOver = false;
    isGameStarted = false;
    isRedFlashing = false;

    scoreDisplay.textContent = score;
    spawnFood();
    draw();

    overlayTitle.textContent = 'MIDNIGHT SNAKE';
    overlayTitle.style.color = '#a0c8ff';
    overlayDesc.textContent = '';
    actionBtn.textContent = 'START';
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }

  function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    isGameStarted = true;
    isGameOver = false;
    overlay.style.display = 'none';

    const speed = currentDifficulty === 'EXPERT' ? 110 : (currentDifficulty === 'HARD' ? 140 : 180);
    gameInterval = setInterval(gameLoop, speed);
  }

  function spawnFood() {
    while (true) {
      food.x = Math.floor(Math.random() * gridSize);
      food.y = Math.floor(Math.random() * gridSize);
      if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        break;
      }
    }
  }

  function gameLoop() {
    if (isGameOver || !isGameStarted) return;

    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
      triggerCrashEffect();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreDisplay.textContent = score;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('snake_highscore', highScore);
      }
      spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function triggerCrashEffect() {
    isGameOver = true;
    clearInterval(gameInterval);
    isRedFlashing = true;

    canvas.style.transform = 'translateX(-6px)';
    setTimeout(() => { canvas.style.transform = 'translateX(6px)'; }, 50);
    setTimeout(() => { canvas.style.transform = 'translateX(-3px)'; }, 100);
    setTimeout(() => { canvas.style.transform = 'translateX(0)'; }, 150);

    draw();

    setTimeout(() => {
      overlayTitle.textContent = 'GAME OVER';
      overlayTitle.style.color = '#ff6b6b';
      overlayDesc.textContent = `SCORE: ${score}`;
      actionBtn.textContent = 'RETRY';
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
    }, 500);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tileSize = canvas.width / gridSize;

    const cx = food.x * tileSize + tileSize / 2;
    const cy = food.y * tileSize + tileSize / 2;
    const rOuter = tileSize * 0.45;
    const rInner = tileSize * 0.15;

    ctx.fillStyle = '#fff5a0';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const angle = (i * Math.PI) / 4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((segment, index) => {
      if (isRedFlashing) {
        ctx.fillStyle = index === 0 ? '#ff4d4d' : 'rgba(255, 99, 99, 0.7)';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = index === 0 ? 12 : 0;
      } else if (index === 0) {
        ctx.fillStyle = '#a0c8ff';
        ctx.shadowColor = '#80b0ff';
        ctx.shadowBlur = 8;
      } else {
        const alpha = Math.max(0.3, 1 - index / snake.length);
        ctx.fillStyle = `rgba(140, 170, 255, ${alpha})`;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(
        segment.x * tileSize + 1,
        segment.y * tileSize + 1,
        tileSize - 2,
        tileSize - 2,
        4
      );
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  function setDirection(dx, dy) {
    if (dir.x + dx !== 0 || dir.y + dy !== 0) {
      nextDir = { x: dx, y: dy };
    }
  }

  // キーボードイベントハンドラ
  function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
      e.preventDefault(); // 画面スクロールを防ぐ
    }
    
    if (!isGameStarted || isGameOver) {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (isGameOver) {
          setupGame();
        }
        startGame();
        return;
      }
    }

    if (e.code === 'ArrowUp' || e.code === 'KeyW') setDirection(0, -1);
    if (e.code === 'ArrowDown' || e.code === 'KeyS') setDirection(0, 1);
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') setDirection(-1, 0);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') setDirection(1, 0);
  }

  // キーボードの登録
  window.addEventListener('keydown', handleKeyDown);

  // 難易度切り替え
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.05)';
        b.style.color = '#9aa8c7';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDifficulty = target.dataset.diff;
      gridSize = parseInt(target.dataset.size);
      setupGame();
    });
  });

  // オン画面ボタン操作
  document.getElementById('btn-up').addEventListener('click', () => setDirection(0, -1));
  document.getElementById('btn-down').addEventListener('click', () => setDirection(0, 1));
  document.getElementById('btn-left').addEventListener('click', () => setDirection(-1, 0));
  document.getElementById('btn-right').addEventListener('click', () => setDirection(1, 0));

  actionBtn.addEventListener('click', () => {
    if (isGameOver) {
      setupGame();
    }
    startGame();
  });

  setupGame();
}

// ==================================================
// 03. Lights Out
// ==================================================
function initLightsOutGame(container) {
  let gridSize = 4;
  let targetMode = 'OFF';
  let grid = [];
  let moves = 0;
  let isCleared = false;
  let initialBoardState = [];

  container.innerHTML = `
    <h2 style="margin-bottom:6px;">03. Lights Out</h2>
    <p style="color:#9aa8c7; font-size:0.85rem; margin-bottom:14px;">マスを切り替えて盤面をそろえよう</p>

    <div style="display:flex; flex-direction:column; align-items:center; gap:10px; margin-bottom:16px;">
      <div style="display:flex; gap:6px;">
        <button class="lo-diff-btn active" data-size="4" style="background:rgba(160,180,255,0.2); color:#fff; border:1px solid rgba(160,180,255,0.4); padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;">NORMAL (4x4)</button>
        <button class="lo-diff-btn" data-size="5" style="background:rgba(255,255,255,0.05); color:#9aa8c7; border:1px solid rgba(255,255,255,0.1); padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;">HARD (5x5)</button>
        <button class="lo-diff-btn" data-size="6" style="background:rgba(255,255,255,0.05); color:#9aa8c7; border:1px solid rgba(255,255,255,0.1); padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;">EXPERT (6x6)</button>
      </div>
      <div style="display:flex; gap:6px; background:rgba(0,0,0,0.2); padding:3px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
        <button class="lo-mode-btn active" data-mode="OFF" style="background:rgba(160,180,255,0.25); color:#fff; border:none; padding:4px 14px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:600;">ALL OFF (全消灯)</button>
        <button class="lo-mode-btn" data-mode="ON" style="background:transparent; color:#9aa8c7; border:none; padding:4px 14px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:600;">ALL ON (全点灯)</button>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; width:100%; max-width:300px; font-size:0.85rem; color:#9aa8c7; margin-bottom:14px;">
      <span>MOVES: <strong id="lo-moves" style="color:#fff;">0</strong></span>
      <span id="lo-status" style="color:#ffd43b;">目標: すべて<span id="lo-target-text">OFF</span>にする</span>
    </div>

    <div style="position:relative; width:100%; max-width:300px; min-height:280px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
      <div id="lo-grid-container" style="display:grid; gap:8px; padding:16px; background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.15); border-radius:12px; transition: box-shadow 0.5s ease, border-color 0.5s ease;"></div>

      <div id="lo-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(10,14,28,0.85); border-radius:12px; display:none; flex-direction:column; align-items:center; justify-content:center; gap:10px; backdrop-filter:blur(5px); transition: opacity 0.4s ease;">
        <h3 id="lo-clear-title" style="font-size:1.6rem; letter-spacing:2px;">CLEAR!</h3>
        <p id="lo-clear-sub" style="color:#9aa8c7; font-size:0.85rem;"></p>
        <p id="lo-clear-moves" style="color:#ffd43b; font-size:1.1rem; font-weight:600; margin-top:4px;"></p>
        <button id="lo-next-btn" style="background:rgba(140,170,255,0.25); color:#fff; border:1px solid rgba(160,180,255,0.5); padding:10px 24px; border-radius:6px; cursor:pointer; font-size:0.95rem; margin-top:8px;">次の問題に進む</button>
      </div>
    </div>

    <div style="display:flex; gap:12px; margin-top:18px;">
      <button id="lo-reset-btn" style="background:rgba(255,255,255,0.08); color:#e1e6f0; border:1px solid rgba(255,255,255,0.15); padding:8px 16px; border-radius:6px; cursor:pointer; font-size:0.85rem;">最初からやり直す</button>
      <button id="lo-new-btn" style="background:rgba(160,180,255,0.15); color:#fff; border:1px solid rgba(160,180,255,0.3); padding:8px 16px; border-radius:6px; cursor:pointer; font-size:0.85rem;">新しい問題</button>
    </div>
  `;

  const gridContainer = document.getElementById('lo-grid-container');
  const movesDisplay = document.getElementById('lo-moves');
  const overlay = document.getElementById('lo-overlay');
  const clearTitle = document.getElementById('lo-clear-title');
  const clearSub = document.getElementById('lo-clear-sub');
  const clearMovesDisplay = document.getElementById('lo-clear-moves');
  const targetText = document.getElementById('lo-target-text');

  function setupGame() {
    moves = 0;
    isCleared = false;
    movesDisplay.textContent = moves;
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    gridContainer.style.boxShadow = 'none';
    gridContainer.style.borderColor = 'rgba(255,255,255,0.15)';
    targetText.textContent = targetMode === 'OFF' ? 'OFF' : 'ON';

    const initialVal = targetMode === 'ON';
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(initialVal));

    const randomSteps = gridSize * 3;
    for (let i = 0; i < randomSteps; i++) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      toggleTile(r, c, false);
    }

    if (checkWinCondition()) {
      toggleTile(0, 0, false);
    }

    initialBoardState = JSON.parse(JSON.stringify(grid));
    renderGrid();
  }

  function toggleTile(r, c, recordMove = true) {
    const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        grid[nr][nc] = !grid[nr][nc];
      }
    });

    if (recordMove) {
      moves++;
      movesDisplay.textContent = moves;
    }
  }

  function handleTileClick(r, c) {
    if (isCleared) return;
    toggleTile(r, c, true);
    renderGrid();

    if (checkWinCondition()) {
      triggerClearEffect();
    }
  }

  function triggerClearEffect() {
    isCleared = true;
    const tiles = gridContainer.querySelectorAll('button');

    if (targetMode === 'ON') {
      gridContainer.style.borderColor = '#ffd43b';
      gridContainer.style.boxShadow = '0 0 30px rgba(255, 212, 59, 0.8)';
      tiles.forEach(tile => {
        tile.style.background = 'radial-gradient(circle, #ffffff 0%, #ffd43b 60%, #ffa500 100%)';
        tile.style.boxShadow = '0 0 20px rgba(255, 212, 59, 0.9)';
      });
      clearTitle.textContent = 'FULL BLOOM';
      clearTitle.style.color = '#ffd43b';
      clearTitle.style.textShadow = '0 0 14px rgba(255,212,59,0.7)';
      clearSub.textContent = '満天の星が輝きました';
    } else {
      gridContainer.style.borderColor = '#a0c8ff';
      gridContainer.style.boxShadow = '0 0 25px rgba(160, 200, 255, 0.6)';
      tiles.forEach(tile => {
        tile.style.background = 'rgba(160, 200, 255, 0.2)';
        tile.style.borderColor = 'rgba(160, 200, 255, 0.4)';
      });
      clearTitle.textContent = 'SILENCE';
      clearTitle.style.color = '#a0c8ff';
      clearTitle.style.textShadow = '0 0 14px rgba(160,200,255,0.7)';
      clearSub.textContent = '夜に静けさが戻りました';
    }

    setTimeout(() => {
      clearMovesDisplay.textContent = `MOVES: ${moves}`;
      overlay.style.display = 'flex';
      setTimeout(() => { overlay.style.opacity = '1'; }, 50);
    }, 400);
  }

  function checkWinCondition() {
    const targetVal = targetMode === 'ON';
    return grid.every(row => row.every(cell => cell === targetVal));
  }

  function renderGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    const tileSize = gridSize === 6 ? 36 : (gridSize === 5 ? 44 : 54);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const isOn = grid[r][c];
        const tile = document.createElement('button');
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.borderRadius = '8px';
        tile.style.cursor = 'pointer';
        tile.style.transition = 'all 0.2s ease';
        tile.style.border = '1px solid rgba(255,255,255,0.15)';

        if (isOn) {
          tile.style.background = 'radial-gradient(circle, #fff7b3 0%, #ffd43b 70%, #e6b800 100%)';
          tile.style.boxShadow = '0 0 12px rgba(255, 212, 59, 0.6)';
          tile.style.transform = 'scale(0.96)';
        } else {
          tile.style.background = 'rgba(255, 255, 255, 0.04)';
          tile.style.boxShadow = 'none';
          tile.style.transform = 'scale(1)';
        }

        tile.addEventListener('click', () => handleTileClick(r, c));
        gridContainer.appendChild(tile);
      }
    }
  }

  document.querySelectorAll('.lo-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lo-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.05)';
        b.style.color = '#9aa8c7';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      gridSize = parseInt(target.dataset.size);
      setupGame();
    });
  });

  document.querySelectorAll('.lo-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lo-mode-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#9aa8c7';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.25)';
      target.style.color = '#fff';

      targetMode = target.dataset.mode;
      setupGame();
    });
  });

  document.getElementById('lo-reset-btn').addEventListener('click', () => {
    grid = JSON.parse(JSON.stringify(initialBoardState));
    moves = 0;
    isCleared = false;
    movesDisplay.textContent = moves;
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    renderGrid();
  });

  document.getElementById('lo-new-btn').addEventListener('click', setupGame);
  document.getElementById('lo-next-btn').addEventListener('click', setupGame);

  setupGame();
}

// ==================================================
// 04〜10. ダミー関数定義
// ==================================================
// ==================================================
// 04. Color Tile (カスタム配色＆背面後光エフェクト完成版)
// ==================================================
function initColorTileGame(container) {
  const ROWS = 10;
  const COLS = 15;
  
  // ユーザー調整の夜空に映える上品なくすみカラー（7色）
  const COLORS = [
    '#ffffff', // 月光ホワイト
    '#f3d463', // 宵星ゴールド
    '#7be68d', // 夜霧エメラルド
    '#d17ae7', // 虚空パープル
    '#f59292', // 茜ルビー
    '#76b7ec', // 深夜ブルー
    '#eca868'  // 琥珀アンバー
  ];

  let currentMode = 'TIME_ATTACK';
  let grid = [];
  let score = 0;
  let combo = 0;
  let timeLeft = 60;
  let timerInterval = null;
  let isPlaying = false;
  let isGameOver = false;

  container.innerHTML = `
    <style>
      @keyframes tileFadeOut {
        0% {
          transform: scale(1);
          opacity: 1;
          filter: brightness(1.4);
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.8);
        }
        50% {
          transform: scale(1.15);
          opacity: 0.7;
          filter: brightness(1.8);
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
          filter: brightness(0.4);
        }
      }
      .tile-vanishing {
        animation: tileFadeOut 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
        pointer-events: none;
        z-index: 5;
      }
      @keyframes floatScore {
        0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -14px) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -26px) scale(0.9); }
      }
      .floating-score {
        position: absolute;
        color: #f3d463;
        font-size: 0.9rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 10;
        animation: floatScore 0.6s ease-out forwards;
        text-shadow: 0 0 10px rgba(243, 212, 99, 0.8);
      }
    </style>

    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">04. Color Tile</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:16px;">隙間に視線を走らせ、響き合う光を重ねよう</p>

    <!-- モード選択 -->
    <div style="display:flex; gap:8px; margin-bottom:16px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
      <button class="ct-mode-btn active" data-mode="TIME_ATTACK" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:500;">TIME ATTACK (60s)</button>
      <button class="ct-mode-btn" data-mode="RELAX" style="background:transparent; color:#7a8ba9; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:500;">RELAX (無制限)</button>
    </div>

    <!-- スコア・タイマー表示 -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:520px; font-size:0.85rem; color:#8192b4; margin-bottom:12px;">
      <span>SCORE: <strong id="ct-score" style="color:#e1e6f0; font-size:1.1rem; font-weight:400;">0</strong> <span id="ct-combo" style="color:#f3d463; font-size:0.8rem; margin-left:8px; font-style:italic;"></span></span>
      <span id="ct-timer-wrap">TIME: <strong id="ct-timer" style="color:#a0c8ff; font-size:1.1rem; font-weight:400;">60</strong>s</span>
    </div>

    <!-- 盤面エリア -->
    <div style="position:relative; width:100%; max-width:540px; display:flex; justify-content:center;">
      <div id="ct-grid" style="display:grid; grid-template-columns:repeat(${COLS}, 1fr); gap:6px; padding:14px; background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.15); border-radius:14px; width:100%; position:relative;"></div>

      <!-- オーバレイ -->
      <div id="ct-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(8,11,20,0.85); border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(8px); transition: opacity 0.3s ease;">
        <h3 id="ct-overlay-title" style="color:#a0c8ff; font-size:1.3rem; letter-spacing:2px; font-weight:300;">COLOR TILE</h3>
        <p id="ct-overlay-desc" style="color:#8192b4; font-size:0.85rem; text-align:center; line-height:1.6;"></p>
        <button id="ct-start-btn" style="background:rgba(160,180,255,0.15); color:#e1e6f0; border:1px solid rgba(160,180,255,0.3); padding:8px 26px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:8px; transition:0.2s;">START</button>
      </div>
    </div>

    <!-- リセットボタン -->
    <div style="margin-top:16px;">
      <button id="ct-reset-btn" style="background:rgba(255,255,255,0.04); color:#7a8ba9; border:1px solid rgba(255,255,255,0.08); padding:6px 16px; border-radius:6px; cursor:pointer; font-size:0.8rem; transition:0.2s;">やり直す</button>
    </div>
  `;

  const gridEl = document.getElementById('ct-grid');
  const scoreEl = document.getElementById('ct-score');
  const comboEl = document.getElementById('ct-combo');
  const timerEl = document.getElementById('ct-timer');
  const timerWrap = document.getElementById('ct-timer-wrap');
  const overlay = document.getElementById('ct-overlay');
  const overlayTitle = document.getElementById('ct-overlay-title');
  const overlayDesc = document.getElementById('ct-overlay-desc');
  const startBtn = document.getElementById('ct-start-btn');

  function setupGame() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    score = 0;
    combo = 0;
    timeLeft = 60;
    isPlaying = false;
    isGameOver = false;

    scoreEl.textContent = '0';
    comboEl.textContent = '';
    timerEl.textContent = '60';

    timerWrap.style.display = currentMode === 'RELAX' ? 'none' : 'inline';

    grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        const isBlank = Math.random() < 0.18;
        if (isBlank) {
          row.push(null);
        } else {
          const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          row.push(randomColor);
        }
      }
      grid.push(row);
    }

    renderGrid();

    overlayTitle.textContent = currentMode === 'TIME_ATTACK' ? 'TIME ATTACK' : 'RELAX MODE';
    overlayDesc.innerHTML = currentMode === 'TIME_ATTACK' 
      ? '60秒間、夜の隙間に光を重ねよう。<br>連続で消すと静かなコンボが響きます。' 
      : '時間制限のない静かな夜。<br>自分のペースでゆっくり思考を深めてみてください。';
    startBtn.textContent = 'START';
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }

  function startGame() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    overlay.style.display = 'none';
    isPlaying = true;
    isGameOver = false;

    if (currentMode === 'TIME_ATTACK') {
      timeLeft = 60;
      timerEl.textContent = timeLeft;

      timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          endGame('TIME UP');
        }
      }, 1000);
    }
  }

  function endGame(titleText) {
    isPlaying = false;
    isGameOver = true;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    overlayTitle.textContent = titleText;
    overlayDesc.innerHTML = `SCORE: <strong style="color:#f3d463; font-size:1.2rem; font-weight:400;">${score}</strong>`;
    startBtn.textContent = 'RETRY';
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }

  function handleCellClick(r, c) {
    if (!isPlaying || isGameOver) return;
    if (grid[r][c] !== null) return;

    const targets = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    dirs.forEach(([dr, dc]) => {
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        if (grid[nr][nc] !== null) {
          targets.push({ r: nr, c: nc, color: grid[nr][nc] });
          break;
        }
        nr += dr;
        nc += dc;
      }
    });

    if (targets.length < 2) {
      combo = 0;
      comboEl.textContent = '';
      return;
    }

    const colorGroups = {};
    targets.forEach(t => {
      if (!colorGroups[t.color]) colorGroups[t.color] = [];
      colorGroups[t.color].push(t);
    });

    let erasedTargets = [];
    Object.values(colorGroups).forEach(group => {
      if (group.length >= 2) {
        group.forEach(t => {
          erasedTargets.push(t);
        });
      }
    });

    if (erasedTargets.length > 0) {
      combo++;
      const gainedPoints = (erasedTargets.length * 10) + ((combo - 1) * 5);
      score += gainedPoints;

      scoreEl.textContent = score;
      comboEl.textContent = combo > 1 ? `${combo} echo` : '';

      animateAndErase(r, c, erasedTargets, gainedPoints);
    } else {
      combo = 0;
      comboEl.textContent = '';
    }
  }

  function animateAndErase(clickedR, clickedC, targets, points) {
    const cells = gridEl.children;

    const clickedIdx = clickedR * COLS + clickedC;
    const clickedCell = cells[clickedIdx];
    if (clickedCell) {
      const pop = document.createElement('div');
      pop.className = 'floating-score';
      pop.textContent = `+${points}`;
      pop.style.left = `${clickedCell.offsetLeft + clickedCell.offsetWidth / 2}px`;
      pop.style.top = `${clickedCell.offsetTop}px`;
      gridEl.appendChild(pop);
      setTimeout(() => pop.remove(), 600);
    }

    targets.forEach(t => {
      const idx = t.r * COLS + t.c;
      const cell = cells[idx];
      if (cell) {
        cell.classList.add('tile-vanishing');
      }
      grid[t.r][t.c] = null;
    });

    setTimeout(() => {
      renderGrid();
      checkGameStatus();
    }, 320);
  }

  function checkGameStatus() {
    let hasTiles = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== null) {
          hasTiles = true;
          break;
        }
      }
    }

    if (!hasTiles) {
      endGame('ALL CLEAR');
    }
  }

  // 背面からほのかな光（二重ソフトシャドウ）が溢れる描画処理
  function renderGrid() {
    gridEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.style.aspectRatio = '1 / 1';
        cell.style.borderRadius = '8px';
        cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s ease';

        const color = grid[r][c];
        if (color) {
          cell.style.background = `radial-gradient(circle at 50% 35%, ${color}ee 0%, ${color}b3 70%, ${color}88 100%)`;
          // 二重シャドウで背後に柔らかく広がる後光を表現
          cell.style.boxShadow = `0 0 10px ${color}55, 0 0 3px ${color}88`;
          cell.style.border = '1px solid rgba(255, 255, 255, 0.15)';
          cell.style.transform = 'scale(0.96)';
        } else {
          cell.style.background = 'rgba(255, 255, 255, 0.03)';
          cell.style.border = '1px solid rgba(255, 255, 255, 0.06)';
          cell.style.boxShadow = 'none';
          cell.style.transform = 'scale(1)';
        }

        cell.addEventListener('click', () => handleCellClick(r, c));
        gridEl.appendChild(cell);
      }
    }
  }

  document.querySelectorAll('.ct-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ct-mode-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentMode = target.dataset.mode;
      setupGame();
    });
  });

  startBtn.addEventListener('click', () => {
    if (isGameOver) {
      setupGame();
    }
    startGame();
  });

  document.getElementById('ct-reset-btn').addEventListener('click', setupGame);

  setupGame();
}

// ==================================================
// 05. Minesweeper (完成版: NORMAL / HARD / EXPERT)
// ==================================================
function initMinesweeperGame(container) {
  const DIFFICULTY_SETTINGS = {
    NORMAL: { rows: 9, cols: 9, mines: 10 },
    HARD: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 14, cols: 20, mines: 50 }
  };

  let currentDiff = 'NORMAL';
  let rows = 9;
  let cols = 9;
  let mineCount = 10;

  let grid = []; // { isMine, isOpen, isFlagged, count }
  let isFirstClick = true;
  let isGameOver = false;
  let isWin = false;
  let flagMode = false; // モバイル用旗切り替えモード
  let timer = 0;
  let timerInterval = null;

  container.innerHTML = `
    <style>
      .ms-cell {
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        transition: all 0.15s ease;
      }
      .ms-cell.closed {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .ms-cell.closed:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(160, 180, 255, 0.3);
      }
      .ms-cell.open {
        background: rgba(10, 14, 28, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.04);
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
      }
      .ms-cell.mine {
        background: rgba(255, 107, 107, 0.25) !important;
        border-color: rgba(255, 107, 107, 0.5) !important;
      }
    </style>

    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">05. Minesweeper</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:14px;">暗雲を避け、夜空の月明かりを開拓しよう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:14px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
      <button class="ms-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL (9x9)</button>
      <button class="ms-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD (16x16)</button>
      <button class="ms-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT (20x14)</button>
    </div>

    <!-- 情報バー ＆ 旗切り替え -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:520px; font-size:0.85rem; color:#8192b4; margin-bottom:10px;">
      <span>MINES: <strong id="ms-count" style="color:#f3d463;">10</strong></span>
      
      <!-- 旗モード切替ボタン -->
      <button id="ms-flag-mode-btn" style="background:rgba(255,255,255,0.05); color:#7a8ba9; border:1px solid rgba(255,255,255,0.12); padding:4px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem; display:flex; align-items:center; gap:4px;">
        <span>MODE:</span> <span id="ms-mode-label" style="color:#a0c8ff;">開く 🔍</span>
      </button>

      <span>TIME: <strong id="ms-timer" style="color:#a0c8ff;">0</strong>s</span>
    </div>

    <!-- 盤面エリア -->
    <div style="position:relative; width:100%; max-width:540px; display:flex; justify-content:center;">
      <div id="ms-grid" style="display:grid; gap:4px; padding:12px; background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.12); border-radius:14px; width:100%; position:relative;"></div>

      <!-- オーバレイ -->
      <div id="ms-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(8,11,20,0.85); border-radius:14px; display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(8px); transition: opacity 0.3s ease;">
        <h3 id="ms-overlay-title" style="color:#a0c8ff; font-size:1.3rem; letter-spacing:2px; font-weight:300;">CLEAR!</h3>
        <p id="ms-overlay-desc" style="color:#8192b4; font-size:0.85rem; text-align:center; line-height:1.6;"></p>
        <button id="ms-start-btn" style="background:rgba(160,180,255,0.15); color:#e1e6f0; border:1px solid rgba(160,180,255,0.3); padding:8px 26px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:8px;">RETRY</button>
      </div>
    </div>

    <!-- リセットボタン -->
    <div style="margin-top:14px;">
      <button id="ms-reset-btn" style="background:rgba(255,255,255,0.04); color:#7a8ba9; border:1px solid rgba(255,255,255,0.08); padding:6px 16px; border-radius:6px; cursor:pointer; font-size:0.8rem;">やり直す</button>
    </div>
  `;

  const gridEl = document.getElementById('ms-grid');
  const countEl = document.getElementById('ms-count');
  const timerEl = document.getElementById('ms-timer');
  const overlay = document.getElementById('ms-overlay');
  const overlayTitle = document.getElementById('ms-overlay-title');
  const overlayDesc = document.getElementById('ms-overlay-desc');
  const startBtn = document.getElementById('ms-start-btn');
  const flagModeBtn = document.getElementById('ms-flag-mode-btn');
  const modeLabel = document.getElementById('ms-mode-label');

  // ゲーム初期化
  function setupGame() {
    if (timerInterval) clearInterval(timerInterval);
    
    const config = DIFFICULTY_SETTINGS[currentDiff];
    rows = config.rows;
    cols = config.cols;
    mineCount = config.mines;

    isFirstClick = true;
    isGameOver = false;
    isWin = false;
    timer = 0;

    countEl.textContent = mineCount;
    timerEl.textContent = '0';
    overlay.style.display = 'none';

    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // 空盤面の作成
    grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r, c,
          isMine: false,
          isOpen: false,
          isFlagged: false,
          count: 0
        });
      }
      grid.push(row);
    }

    renderGrid();
  }

  // 初手安全な地雷配置
  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < mineCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // 初手マスとその周囲3x3には地雷を置かない
      const isSafeZone = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1;

      if (!grid[r][c].isMine && !isSafeZone) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    // 周囲の地雷数を計算
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].count = count;
        }
      }
    }
  }

  // タイマー開始
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer++;
      timerEl.textContent = timer;
    }, 1000);
  }

  // マスを開く処理
  function openCell(r, c) {
    if (isGameOver || grid[r][c].isOpen || grid[r][c].isFlagged) return;

    if (isFirstClick) {
      isFirstClick = false;
      placeMines(r, c);
      startTimer();
    }

    const cell = grid[r][c];
    cell.isOpen = true;

    // 地雷を踏んだ場合
    if (cell.isMine) {
      endGame(false);
      return;
    }

    // 0のマスは周囲を連鎖開放
    if (cell.count === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].isOpen) {
            openCell(nr, nc);
          }
        }
      }
    }

    renderGrid();
    checkWinCondition();
  }

  // 旗の付け外し
  function toggleFlag(r, c) {
    if (isGameOver || grid[r][c].isOpen) return;

    const cell = grid[r][c];
    cell.isFlagged = !cell.isFlagged;

    // 残り地雷数の表示更新
    let flaggedCount = 0;
    grid.forEach(row => row.forEach(cell => {
      if (cell.isFlagged) flaggedCount++;
    }));
    countEl.textContent = mineCount - flaggedCount;

    renderGrid();
  }

  // セルクリック時の分岐
  function handleCellClick(r, c) {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      openCell(r, c);
    }
  }

  // 勝利判定
  function checkWinCondition() {
    let unopenNonMines = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine && !grid[r][c].isOpen) {
          unopenNonMines++;
        }
      }
    }

    if (unopenNonMines === 0) {
      endGame(true);
    }
  }

  // ゲーム終了処理
  function endGame(win) {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);

    // すべての地雷を開示
    grid.forEach(row => row.forEach(cell => {
      if (cell.isMine) cell.isOpen = true;
    }));

    renderGrid();

    overlayTitle.textContent = win ? 'CLEAR!' : 'GAME OVER';
    overlayTitle.style.color = win ? '#a0c8ff' : '#ff6b6b';
    overlayDesc.innerHTML = win 
      ? `夜空に光が満ちました。<br>TIME: <strong style="color:#f3d463;">${timer}s</strong>`
      : '暗雲に包まれてしまいました。';
    startBtn.textContent = 'RETRY';
    overlay.style.display = 'flex';
  }

  // 盤面描画
  function renderGrid() {
    gridEl.innerHTML = '';

    // 数字ごとの儚い夜光カラー設定
    const NUMBER_COLORS = [
      '', '#76b7ec', '#7be68d', '#f59292', '#d17ae7', 
      '#f3d463', '#eca868', '#ffffff', '#a0c8ff'
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellData = grid[r][c];
        const cell = document.createElement('div');
        cell.className = 'ms-cell';

        // 盤面サイズに応じてフォントサイズ調整
        if (cols > 15) cell.style.fontSize = '0.7rem';

        if (cellData.isOpen) {
          cell.classList.add('open');
          if (cellData.isMine) {
            cell.classList.add('mine');
            cell.textContent = '☁'; // 地雷＝暗雲
          } else if (cellData.count > 0) {
            cell.textContent = cellData.count;
            cell.style.color = NUMBER_COLORS[cellData.count];
            cell.style.textShadow = `0 0 6px ${NUMBER_COLORS[cellData.count]}66`;
          }
        } else {
          cell.classList.add('closed');
          if (cellData.isFlagged) {
            cell.textContent = '★'; // 旗＝宵星
            cell.style.color = '#f3d463';
            cell.style.textShadow = '0 0 8px rgba(243, 212, 99, 0.8)';
          }
        }

        // クリックイベント
        cell.addEventListener('click', () => handleCellClick(r, c));
        
        // 右クリックで旗設置
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        gridEl.appendChild(cell);
      }
    }
  }

  // モード切替ボタン（タップで開く / 旗設置）
  flagModeBtn.addEventListener('click', () => {
    flagMode = !flagMode;
    if (flagMode) {
      modeLabel.textContent = '目印 ★';
      modeLabel.style.color = '#f3d463';
      flagModeBtn.style.background = 'rgba(243, 212, 99, 0.15)';
      flagModeBtn.style.borderColor = 'rgba(243, 212, 99, 0.4)';
    } else {
      modeLabel.textContent = '開く 🔍';
      modeLabel.style.color = '#a0c8ff';
      flagModeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      flagModeBtn.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    }
  });

  // 難易度切替
  document.querySelectorAll('.ms-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ms-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDiff = target.dataset.diff;
      setupGame();
    });
  });

  startBtn.addEventListener('click', setupGame);
  document.getElementById('ms-reset-btn').addEventListener('click', setupGame);

  setupGame();
}

function init2048Game(container) {
  container.innerHTML = `
    <h2>06. 2048</h2>
    <p style="color:#9aa8c7; margin-top:12px;">準備中…</p>
  `;
}

function initStarlightTimingGame(container) {
  container.innerHTML = `
    <h2>07. Starlight Timing</h2>
    <p style="color:#9aa8c7; margin-top:12px;">準備中…</p>
  `;
}

function initPlanetTowerGame(container) {
  container.innerHTML = `
    <h2>08. Planet Tower</h2>
    <p style="color:#9aa8c7; margin-top:12px;">準備中…</p>
  `;
}

function initSudokuGame(container) {
  container.innerHTML = `
    <h2>09. Sudoku</h2>
    <p style="color:#9aa8c7; margin-top:12px;">準備中…</p>
  `;
}

function initSolitaireGame(container) {
  container.innerHTML = `
    <h2>10. Solitaire</h2>
    <p style="color:#9aa8c7; margin-top:12px;">準備中…</p>
  `;
}