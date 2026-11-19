// ==================================================
// am.1:30 メインアプリケーション（共通基盤）
// ==================================================

const GAME_CATALOG = [
  { id: '1', title: '01. RGB Color Match', desc: '完璧な色合いを直感で当てはめるカラーパズル' },
  { id: '2', title: '02. Midnight Snake', desc: '星を食べながら夜の隙間を泳ぐレトロアクション' },
  { id: '3', title: '03. Lights Out', desc: 'マスを切り替えて盤面をそろえる思考系パズル' },
  { id: '4', title: '04. Color Tile', desc: '同色の交差を狙う思考系パズル' },
  { id: '5', title: '05. Minesweeper', desc: '地雷を避けて全マスを開ける王道ゲーム' },
  { id: '6', title: '06. Midnight Constellation', desc: '光る星の順を記憶し一筆書きで星座を結ぶパズル' },
  { id: '7', title: '07. Moonlight Drop', desc: '落ちてくる月光をキャッチするタイミングアクション' },
  { id: '8', title: '08. Lunar Phase Sequence', desc: '月齢の光と静かな和音の響く順番を覚える記憶パズル' },
  { id: '9', title: '09. Moonlight 2048', desc: '数字を重ねて月満ちる大数を作るスライドパズル' },
  { id: '10', title: '10. Planet Tower', desc: '惑星や星の欠片を崩さないよう積むバランスゲーム' },
  { id: '11', title: '11. Sudoku', desc: '夜長に没頭して数字の法則を解き明かすナンプレ' },
  { id: '12', title: '12. Solitaire', desc: '思考を静かに巡らせる定番トランプパズル' },
  { id: '13', title: '13. Cosmic Match 3', desc: '月夜のジュエルが舞い落ちる連鎖アクションパズル' },
  { id: '14', title: '14. Shooting Star Aim', desc: '夜空を横切る流星に向けて光の矢を撃ち放つアクション' },
  { id: '15', title: '15. Zen Card Pair', desc: '月影と星座のカードを合わせる静かな記憶パズル' }
];

const STORAGE_KEY = 'am130_records_v1';
let activeGameId = null;

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initClock();
  initModalEvents();
  startPlayTimeTracker();
  showMenu();
});

// ==================================================
// 星空と流れ星の生成（聖域：変更不可）
// ==================================================
function initStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  container.innerHTML = '';

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

  for (let i = 0; i < 2; i++) {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.top = `${Math.random() * 50}%`;
    shootingStar.style.right = `${Math.random() * 20}%`;
    shootingStar.style.animationDelay = `${i * 4 + Math.random() * 2}s`;
    container.appendChild(shootingStar);
  }
}

// ==================================================
// デジタル時計（am./pm.表記） ＆ プレイ時間記録
// ==================================================
function initClock() {
  const clockEl = document.getElementById('digital-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const rawHours = now.getHours();
    const period = rawHours >= 12 ? 'pm.' : 'am.';
    const h12 = rawHours % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${period}${h12}:${m}`;
  }
  update();
  setInterval(update, 10000);

  clockEl.addEventListener('click', openPlayTimeModal);
}

function getRecords() {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let data = {
    todayKey,
    todaySec: 0,
    monthKey,
    monthSec: 0,
    playCounts: {},
    highScores: {}
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      data = { ...data, ...saved };
      if (data.todayKey !== todayKey) {
        data.todayKey = todayKey;
        data.todaySec = 0;
      }
      if (data.monthKey !== monthKey) {
        data.monthKey = monthKey;
        data.monthSec = 0;
      }
    }
  } catch (e) {}

  return data;
}

function saveRecords(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function startPlayTimeTracker() {
  setInterval(() => {
    if (document.hidden) return;
    const data = getRecords();
    data.todaySec += 1;
    data.monthSec += 1;
    saveRecords(data);
  }, 1000);
}

function recordGameScore(gameId, score, unit = 'pt', lowerIsBetter = false) {
  const data = getRecords();
  const id = String(gameId);
  if (!data.highScores[id]) data.highScores[id] = [];

  data.highScores[id].push({ score: Number(score), unit });
  data.highScores[id].sort((a, b) => lowerIsBetter ? a.score - b.score : b.score - a.score);
  data.highScores[id] = data.highScores[id].slice(0, 5);
  saveRecords(data);

  if (activeGameId === id) {
    renderInGameRanking(id);
  }
}

function formatDuration(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}時間 ${m}分`;
  if (m > 0) return `${m}分 ${s}秒`;
  return `${s}秒`;
}

// ==================================================
// モーダル表示（プレイ時間・タップ開閉式ランキング・デイリー準備枠）
// ==================================================
function initModalEvents() {
  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => modal.classList.remove('is-open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('is-open');
  });
}

function openModal(title, htmlContent) {
  const modal = document.getElementById('info-modal');
  const modalCard = modal ? modal.querySelector('.modal-card') : null;
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!modal || !modalCard || !titleEl || !bodyEl) return;

  // モーダル内に瞬く星を生成（流れ星なし）
  let starsLayer = modalCard.querySelector('.modal-stars');
  if (!starsLayer) {
    starsLayer = document.createElement('div');
    starsLayer.className = 'modal-stars';
    modalCard.prepend(starsLayer);
  }
  starsLayer.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
    star.style.setProperty('--init-opacity', `${Math.random() * 0.7 + 0.2}`);
    starsLayer.appendChild(star);
  }

  titleEl.textContent = title;
  bodyEl.innerHTML = htmlContent;
  modal.classList.add('is-open');
}

function openPlayTimeModal() {
  const data = getRecords();
  openModal('夜の滞在・プレイ時間', `
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-label">今日遊んだ時間</div>
        <div class="stat-value">${formatDuration(data.todaySec)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">今月の累計時間</div>
        <div class="stat-value">${formatDuration(data.monthSec)}</div>
      </div>
    </div>
  `);
}

function openRankingModal() {
  const data = getRecords();
  let topGameTitle = 'まだ記録がありません';
  let maxPlays = 0;

  GAME_CATALOG.forEach(g => {
    const count = data.playCounts[g.id] || 0;
    if (count > maxPlays) {
      maxPlays = count;
      topGameTitle = `${g.title}（${count}回プレイ）`;
    }
  });

  const itemsHtml = GAME_CATALOG.map(g => {
    const scores = data.highScores[g.id] || [];
    const scoreRows = scores.length > 0
      ? scores.map((s, idx) => `<li>${idx + 1}位：${s.score}${s.unit || ''}</li>`).join('')
      : '<li>記録なし</li>';
    return `
      <div class="ranking-item" onclick="this.classList.toggle('is-open')">
        <div class="ranking-item-header">
          <span>${g.title}</span>
          <span>プレイ数: ${data.playCounts[g.id] || 0}回 <span class="ranking-toggle-icon">▼</span></span>
        </div>
        <ul class="ranking-scores">${scoreRows}</ul>
      </div>
    `;
  }).join('');

  openModal('総合記録 ＆ トップ5ランキング', `
    <div class="stat-box">
      <div class="stat-label">一番遊んでいるゲーム</div>
      <div class="stat-value" style="font-size:1.05rem;">${topGameTitle}</div>
    </div>
    <p style="font-size:0.75rem; color:#7e8eb0; text-align:center; margin-top:12px;">※ゲームをタップするとトップ5が開きます</p>
    <div class="ranking-list">${itemsHtml}</div>
  `);
}

function openDailyChallengeModal() {
  openModal('デイリーチャレンジ（準備中）', `
    <p style="color:#9aa8c7; font-size:0.9rem; line-height:1.6;">
      全15ゲームの完成後に開放されます。<br>
      毎日ランダムに選ばれる3つのゲームと固定難易度で夜の挑戦を楽しめます。
    </p>
  `);
}

// ==================================================
// 各ゲーム画面内のTOP5表示
// ==================================================
function renderInGameRanking(gameId) {
  const box = document.getElementById('in-game-ranking-box');
  if (!box) return;

  const data = getRecords();
  const id = String(gameId);
  const scores = data.highScores[id] || [];
  const playCount = data.playCounts[id] || 0;

  const listHtml = scores.length > 0
    ? scores.map((s, idx) => `<li><span>${idx + 1}位</span><span>${s.score}${s.unit || ''}</span></li>`).join('')
    : '<li style="color:#7e8eb0; justify-content:center;">まだスコア記録がありません</li>';

  box.innerHTML = `
    <div class="in-game-ranking-title">
      <span>PERSONAL TOP 5</span>
      <span>プレイ回数: ${playCount}回</span>
    </div>
    <ul class="in-game-ranking-list">${listHtml}</ul>
  `;
}

// ==================================================
// ナビゲーション・ルーティング
// ==================================================
function showMenu() {
  activeGameId = null;
  document.body.classList.remove('require-landscape');

  const clockSection = document.getElementById('clock-section');
  if (clockSection) clockSection.style.display = 'flex';

  const container = document.getElementById('game-container');
  if (!container) return;

  const cardsHtml = GAME_CATALOG.map(g => `
    <div class="card" data-game="${g.id}" onclick="launchGame('${g.id}')">
      <span class="card-title">${g.title}</span>
      <span class="card-desc">${g.desc}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="game-grid">${cardsHtml}</div>
    <div class="menu-footer-actions">
      <button class="glass-action-btn" type="button" onclick="openRankingModal()">記録・ランキングを見る</button>
      <button class="glass-action-btn" type="button" onclick="openDailyChallengeModal()">デイリーチャレンジ</button>
    </div>
  `;
}

function launchGame(gameId) {
  const id = String(gameId);
  activeGameId = id;

  const data = getRecords();
  data.playCounts[id] = (data.playCounts[id] || 0) + 1;
  saveRecords(data);

  if (id === '4') {
    document.body.classList.add('require-landscape');
  } else {
    document.body.classList.remove('require-landscape');
  }

  const clockSection = document.getElementById('clock-section');
  if (clockSection) clockSection.style.display = 'none';

  const container = document.getElementById('game-container');
  if (!container) return;

  container.innerHTML = `
    <button class="back-btn" onclick="showMenu()">← メニューに戻る</button>
    <div class="game-container" id="game-view"></div>
    <div class="in-game-ranking" id="in-game-ranking-box"></div>
  `;

  renderInGameRanking(id);

  const view = document.getElementById('game-view');

  switch (id) {
    case '1': initRgbGame(view); break;
    case '2': initSnakeGame(view); break;
    case '3': initLightsOutGame(view); break;
    case '4': initColorTileGame(view); break;
    case '5': initMinesweeperGame(view); break;
    case '6': initConstellationGame(view); break;
    case '7': initMoonlightDropGame(view); break;
    case '8': initLunarSequenceGame(view); break;
    case '9': initMoonlight2048Game(view); break;
    case '10': initPlanetTowerGame(view); break;
    case '11': initSudokuGame(view); break;
    case '12': initSolitaireGame(view); break;
    case '13': initCosmicMatchGame(view); break;
    case '14': initShootingStarGame(view); break;
    case '15': initZenCardPairGame(view); break;
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
    recordGameScore('1', score, '%'); // ★この1行を追加！
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
      recordGameScore('2', score, `pt (${currentDifficulty})`);
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
      recordGameScore('3', moves, `手 (${targetMode})`, true);
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
      <div style="position:relative; width:100%; max-width:min(90vw, 65vh); display:flex; justify-content:center;">
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
    const modeLabel = currentMode === 'TIME_ATTACK' ? 'タイムアタック' : '無制限';
    if (titleText === 'ALL CLEAR' && currentMode === 'TIME_ATTACK') {
      const clearSec = 60 - timeLeft;
      recordGameScore('4', 100000 - clearSec, `pt / 全消し ${clearSec}秒 (${modeLabel})`);
    } else if (titleText === 'ALL CLEAR') {
      recordGameScore('4', 100000 + score, `pt / 全消し達成 (${modeLabel})`);
    } else {
      recordGameScore('4', score, `pt (${modeLabel})`);
    }
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
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border-radius: 3px;
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
      @media screen and (max-width: 600px) {
        .ms-cell.compact {
          font-size: 0.58rem !important;
          border-radius: 2px;
        }
      }
    </style>

    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">05. Minesweeper</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:14px;">暗雲を避け、夜空の月明かりを開拓しよう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:14px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
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
    <div style="position:relative; width:100%; max-width:min(100%, 540px); display:flex; justify-content:center;">
      <div id="ms-grid" style="display:grid; gap:4px; padding:12px; background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.12); border-radius:14px; width:100%; box-sizing:border-box; position:relative;"></div>

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

    // スマホでも枠からはみ出さないようにminmax(0, 1fr)と余白調整
    gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    if (cols > 15) {
      gridEl.style.gap = '2px';
      gridEl.style.padding = '6px';
    } else {
      gridEl.style.gap = '4px';
      gridEl.style.padding = '12px';
    }

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

    if (win) {
      recordGameScore('5', timer, `秒 (${currentDiff})`, true);
    }

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
        if (cols > 15) {
          cell.style.fontSize = '0.7rem';
          cell.classList.add('compact');
        }

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

// ==================================================
// プレースホルダー表示用
// ==================================================
function createPlaceholder(container, title, desc) {
  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">${title}</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:20px;">${desc}</p>
    <div style="width:100%; max-width:min(90vw, 65vh); height:280px; background:rgba(10, 14, 28, 0.6); border:1px solid rgba(255,255,255,0.12); border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
      <span style="font-size:2.5rem; opacity:0.6;">🌙</span>
      <p style="color:#8192b4; font-size:0.85rem;">COMING SOON...</p>
    </div>
  `;
}

// ==================================================
// 06. Midnight Constellation (完成版: NORMAL / HARD / EXPERT)
// ==================================================
function initConstellationGame(container) {
  const DIFFICULTY_SETTINGS = {
    NORMAL: { starCount: 7, startLen: 3, stepMs: 780 },
    HARD: { starCount: 10, startLen: 4, stepMs: 580 },
    EXPERT: { starCount: 14, startLen: 5, stepMs: 440 }
  };

  // 静かな夜空に響くペンタトニック音階 (Hz)
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

  let currentDiff = 'NORMAL';
  let stage = 1;
  let stars = []; // { id, x, y, size, phase }
  let sequence = []; // 正解の星インデックス配列
  let userPath = []; // プレイヤーが結んだ星インデックス配列
  let phase = 'IDLE'; // 'IDLE' | 'SHOWING' | 'INPUT' | 'CLEAR' | 'GAMEOVER'
  let activeStarIdx = -1;
  let isPointerDown = false;
  let soundEnabled = true;
  let audioCtx = null;
  let showTimers = [];
  let animFrameId = null;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">06. Midnight Constellation</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:14px;">光る星の軌跡を覚え、夜空に星座を結ぼう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:12px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
      <button class="mc-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL (7星)</button>
      <button class="mc-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD (10星)</button>
      <button class="mc-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT (14星)</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:440px; font-size:0.85rem; color:#8192b4; margin-bottom:10px;">
      <span>STAGE: <strong id="mc-stage" style="color:#f3d463;">1</strong></span>
      <span id="mc-status-text" style="color:#a0c8ff; font-size:0.82rem; letter-spacing:1px;">READY</span>
      <button id="mc-sound-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">SOUND: ON</button>
    </div>

    <!-- 夜空キャンバスエリア -->
    <div style="position:relative; width:100%; max-width:440px; aspect-ratio:1 / 1; background:radial-gradient(circle at 50% 35%, rgba(22, 34, 68, 0.85), rgba(8, 11, 22, 0.95)); border:1px solid rgba(160, 180, 255, 0.18); border-radius:16px; overflow:hidden; box-shadow:inset 0 0 30px rgba(0,0,0,0.6);">
      <canvas id="mc-canvas" style="width:100%; height:100%; display:block; touch-action:none; cursor:pointer;"></canvas>

      <!-- オーバーレイ -->
      <div id="mc-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.84); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center;">
        <h3 id="mc-overlay-title" style="color:#a0c8ff; font-size:1.25rem; letter-spacing:2px; font-weight:300;">MIDNIGHT CONSTELLATION</h3>
        <p id="mc-overlay-desc" style="color:#8192b4; font-size:0.84rem; line-height:1.6;">
          順番に輝く星を記憶し、<br>タップまたはなぞって星座を結んでください。
        </p>
        <button id="mc-start-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">START</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('mc-canvas');
  const ctx = canvas.getContext('2d');
  const stageEl = document.getElementById('mc-stage');
  const statusEl = document.getElementById('mc-status-text');
  const soundBtn = document.getElementById('mc-sound-btn');
  const overlay = document.getElementById('mc-overlay');
  const overlayTitle = document.getElementById('mc-overlay-title');
  const overlayDesc = document.getElementById('mc-overlay-desc');
  const startBtn = document.getElementById('mc-start-btn');

  // 高解像度キャンバス調整
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // やさしいオルゴール風の音を鳴らす
  function playStarTone(starIndex) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freq = NOTES[starIndex % NOTES.length];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.68);
    } catch (e) {}
  }

  function clearTimers() {
    showTimers.forEach(t => clearTimeout(t));
    showTimers = [];
  }

  // 重ならないように夜空へ星を配置
  function generateStars(count) {
    const result = [];
    const margin = 0.14;
    const minDist = count >= 14 ? 0.15 : count >= 10 ? 0.18 : 0.22;

    let attempts = 0;
    while (result.length < count && attempts < 2000) {
      attempts++;
      const x = margin + Math.random() * (1 - margin * 2);
      const y = margin + Math.random() * (1 - margin * 2);

      const tooClose = result.some(s => Math.hypot(s.x - x, s.y - y) < minDist);
      if (!tooClose) {
        result.push({
          id: result.length,
          x,
          y,
          size: 3.5 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    return result;
  }

  // 新規ゲーム初期化
  function initNewGame() {
    clearTimers();
    stage = 1;
    stageEl.textContent = stage;
    const config = DIFFICULTY_SETTINGS[currentDiff];
    stars = generateStars(config.starCount);
    sequence = [];
    userPath = [];
    activeStarIdx = -1;
    overlay.style.display = 'none';
    startNextStage(true);
  }

  // ステージ開始（既存の星配置を活かして軌跡を1つ伸ばす、または新規生成）
  function startNextStage(isFirst = false) {
    clearTimers();
    const config = DIFFICULTY_SETTINGS[currentDiff];
    userPath = [];
    activeStarIdx = -1;

    if (isFirst) {
      sequence = [];
      for (let i = 0; i < config.startLen; i++) {
        sequence.push(pickNextStarIndex(sequence[sequence.length - 1]));
      }
    } else {
      // 3ステージごとに星の位置を新しくシャッフルして新鮮さを保つ
      if ((stage - 1) % 3 === 0) {
        stars = generateStars(config.starCount);
        sequence = [];
        const targetLen = config.startLen + (stage - 1);
        for (let i = 0; i < targetLen; i++) {
          sequence.push(pickNextStarIndex(sequence[sequence.length - 1]));
        }
      } else {
        sequence.push(pickNextStarIndex(sequence[sequence.length - 1]));
      }
    }

    playSequence();
  }

  // 直前と同じ星が連続しないように次の星を選ぶ
  function pickNextStarIndex(prevIdx) {
    if (stars.length <= 1) return 0;
    let next = Math.floor(Math.random() * stars.length);
    while (next === prevIdx) {
      next = Math.floor(Math.random() * stars.length);
    }
    return next;
  }

  // お手本の光と線を再生
  function playSequence() {
    phase = 'SHOWING';
    statusEl.textContent = '記憶してください...';
    statusEl.style.color = '#f3d463';
    userPath = [];

    const config = DIFFICULTY_SETTINGS[currentDiff];
    const stepMs = config.stepMs;

    sequence.forEach((starIdx, step) => {
      const t = setTimeout(() => {
        if (!document.getElementById('mc-canvas')) return;
        activeStarIdx = starIdx;
        userPath.push(starIdx);
        playStarTone(starIdx);
      }, 450 + step * stepMs);
      showTimers.push(t);
    });

    const endTimer = setTimeout(() => {
      if (!document.getElementById('mc-canvas')) return;
      activeStarIdx = -1;
      userPath = [];
      phase = 'INPUT';
      statusEl.textContent = `星座を結ぶ (0 / ${sequence.length})`;
      statusEl.style.color = '#a0c8ff';
    }, 450 + sequence.length * stepMs + 350);
    showTimers.push(endTimer);
  }

  // 星が選択されたときの判定
  function selectStar(starIdx) {
    if (phase !== 'INPUT') return;

    // すでに直前に選んだ星と同じなら無視（なぞり操作中の連続反応防止）
    if (userPath.length > 0 && userPath[userPath.length - 1] === starIdx) {
      return;
    }

    const expectedIdx = sequence[userPath.length];
    activeStarIdx = starIdx;
    playStarTone(starIdx);

    if (starIdx === expectedIdx) {
      userPath.push(starIdx);
      statusEl.textContent = `星座を結ぶ (${userPath.length} / ${sequence.length})`;

      // ステージクリア判定
      if (userPath.length === sequence.length) {
        phase = 'CLEAR';
        statusEl.textContent = 'CONSTELLATION COMPLETE!';
        statusEl.style.color = '#7be68d';

        const t = setTimeout(() => {
          if (!document.getElementById('mc-canvas')) return;
          stage++;
          stageEl.textContent = stage;
          startNextStage(false);
        }, 950);
        showTimers.push(t);
      }
    } else {
      // ミス：ゲームオーバー
      userPath.push(starIdx);
      phase = 'GAMEOVER';
      isPointerDown = false;
      statusEl.textContent = 'MISSED';
      statusEl.style.color = '#ff6b6b';

      const clearedStages = stage - 1;
      if (clearedStages > 0) {
        recordGameScore('6', clearedStages, `ステージ達成 (${currentDiff})`);
      }

      const t = setTimeout(() => {
        if (!document.getElementById('mc-canvas')) return;
        overlayTitle.textContent = 'STARLIGHT FADED';
        overlayTitle.style.color = '#ff8a8a';
        overlayDesc.innerHTML = `到達ステージ: <strong style="color:#f3d463; font-size:1.1rem;">STAGE ${stage}</strong><br>（クリア数: ${clearedStages} / 難易度: ${currentDiff}）`;
        startBtn.textContent = 'RETRY';
        overlay.style.display = 'flex';
      }, 650);
      showTimers.push(t);
    }
  }

  // 座標から最も近い星を探す
  function getStarAtPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const hitRadius = currentDiff === 'EXPERT' ? 24 : 30;

    let closestIdx = -1;
    let closestDist = Infinity;

    stars.forEach((s, idx) => {
      const sx = s.x * rect.width;
      const sy = s.y * rect.height;
      const dist = Math.hypot(px - sx, py - sy);
      if (dist <= hitRadius && dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    return closestIdx;
  }

  // ポインター操作（タップ＆スワイプ一筆書き両対応）
  canvas.addEventListener('pointerdown', (e) => {
    if (phase !== 'INPUT') return;
    isPointerDown = true;
    const idx = getStarAtPoint(e.clientX, e.clientY);
    if (idx !== -1) selectStar(idx);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isPointerDown || phase !== 'INPUT') return;
    const idx = getStarAtPoint(e.clientX, e.clientY);
    if (idx !== -1) selectStar(idx);
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  // 描画ループ
  function drawLoop(now) {
    if (!document.getElementById('mc-canvas')) {
      cancelAnimationFrame(animFrameId);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const timeSec = now * 0.002;

    // 結ばれた星座の線を描画
    if (userPath.length > 1) {
      ctx.save();
      ctx.beginPath();
      userPath.forEach((starIdx, i) => {
        const s = stars[starIdx];
        if (!s) return;
        const sx = s.x * w;
        const sy = s.y * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });

      if (phase === 'GAMEOVER') {
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.75)';
        ctx.shadowColor = 'rgba(255, 107, 107, 0.8)';
      } else if (phase === 'CLEAR') {
        ctx.strokeStyle = 'rgba(123, 230, 141, 0.9)';
        ctx.shadowColor = 'rgba(123, 230, 141, 0.9)';
      } else {
        ctx.strokeStyle = 'rgba(160, 200, 255, 0.75)';
        ctx.shadowColor = 'rgba(160, 200, 255, 0.8)';
      }

      ctx.lineWidth = phase === 'CLEAR' ? 2.8 : 2;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // 星々を描画
    stars.forEach((s, idx) => {
      const sx = s.x * w;
      const sy = s.y * h;
      const isSelected = userPath.includes(idx);
      const isCurrentActive = activeStarIdx === idx;
      const twinkle = 0.75 + 0.25 * Math.sin(timeSec + s.phase);

      // 外側の光の輪（光っている時や選択済みの時）
      if (isCurrentActive || isSelected || phase === 'CLEAR') {
        ctx.save();
        const glowRadius = isCurrentActive ? 22 : 14;
        const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, glowRadius);
        if (phase === 'GAMEOVER' && isCurrentActive) {
          grad.addColorStop(0, 'rgba(255, 107, 107, 0.85)');
          grad.addColorStop(1, 'rgba(255, 107, 107, 0)');
        } else if (isCurrentActive) {
          grad.addColorStop(0, 'rgba(243, 212, 99, 0.9)');
          grad.addColorStop(1, 'rgba(243, 212, 99, 0)');
        } else {
          grad.addColorStop(0, 'rgba(160, 200, 255, 0.55)');
          grad.addColorStop(1, 'rgba(160, 200, 255, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 星の本体
      ctx.save();
      ctx.beginPath();
      const radius = isCurrentActive ? s.size * 1.45 : s.size;
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentActive
        ? '#fff6cc'
        : isSelected
        ? '#d6e6ff'
        : `rgba(210, 225, 255, ${0.45 * twinkle})`;
      ctx.fill();

      // 待機中の星に薄いガイドリングを表示
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected
        ? 'rgba(160, 200, 255, 0.35)'
        : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    animFrameId = requestAnimationFrame(drawLoop);
  }

  // 難易度切り替え
  document.querySelectorAll('.mc-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mc-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDiff = target.dataset.diff;
      initNewGame();
    });
  });

  // サウンド切り替え
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    soundBtn.style.color = soundEnabled ? '#a0c8ff' : '#7a8ba9';
  });

  startBtn.addEventListener('click', initNewGame);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  stars = generateStars(DIFFICULTY_SETTINGS[currentDiff].starCount);
  animFrameId = requestAnimationFrame(drawLoop);
}

// ==================================================
// 07. Moonlight Drop (完成版: NORMAL / HARD / EXPERT)
// ==================================================
function initMoonlightDropGame(container) {
  const DIFFICULTY_SETTINGS = {
    NORMAL: { spawnInterval: 950, baseSpeed: 2.1, darkRatio: 0.22, goldRatio: 0.16 },
    HARD: { spawnInterval: 700, baseSpeed: 2.9, darkRatio: 0.30, goldRatio: 0.18 },
    EXPERT: { spawnInterval: 500, baseSpeed: 3.7, darkRatio: 0.38, goldRatio: 0.20 }
  };

  let currentDiff = 'NORMAL';
  let score = 0;
  let combo = 0;
  let lives = 3;
  let isPlaying = false;
  let animFrameId = null;
  let lastSpawnTime = 0;

  let trayX = 0.5; // 0.0 ~ 1.0
  const trayWidthRatio = 0.23;
  let drops = []; // { x, y, speed, radius, type: 'moon' | 'gold' | 'dark', angle, rotSpeed }
  let ripples = []; // { x, y, radius, alpha, color }
  let keys = { left: false, right: false };

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">07. Moonlight Drop</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:14px;">夜空から舞い降りる星の雫を、三日月の器で受け止めよう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:12px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
      <button class="md-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL</button>
      <button class="md-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD</button>
      <button class="md-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:420px; font-size:0.85rem; color:#8192b4; margin-bottom:10px;">
      <span>SCORE: <strong id="md-score" style="color:#f3d463;">0</strong> <span id="md-combo" style="color:#a0c8ff; font-size:0.78rem;"></span></span>
      <span id="md-lives" style="color:#f3d463; letter-spacing:3px; font-size:0.95rem;">☽ ☽ ☽</span>
    </div>

    <!-- 夜空キャンバス -->
    <div style="position:relative; width:100%; max-width:420px; aspect-ratio:3 / 4; background:linear-gradient(180deg, rgba(10, 15, 34, 0.92) 0%, rgba(18, 28, 58, 0.88) 100%); border:1px solid rgba(160, 180, 255, 0.18); border-radius:16px; overflow:hidden; box-shadow:inset 0 0 30px rgba(0,0,0,0.65);">
      <canvas id="md-canvas" style="width:100%; height:100%; display:block; touch-action:none; cursor:ew-resize;"></canvas>

      <!-- オーバーレイ -->
      <div id="md-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.84); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center;">
        <h3 id="md-overlay-title" style="color:#a0c8ff; font-size:1.25rem; letter-spacing:2px; font-weight:300;">MOONLIGHT DROP</h3>
        <p id="md-overlay-desc" style="color:#8192b4; font-size:0.84rem; line-height:1.65;">
          青白い月星（+10）と金色の宵星（+30）を三日月で集めよう。<br>
          赤紫の暗雲星に触れると月が欠けてしまいます。
        </p>
        <button id="md-start-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">START</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('md-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('md-score');
  const comboEl = document.getElementById('md-combo');
  const livesEl = document.getElementById('md-lives');
  const overlay = document.getElementById('md-overlay');
  const overlayTitle = document.getElementById('md-overlay-title');
  const overlayDesc = document.getElementById('md-overlay-desc');
  const startBtn = document.getElementById('md-start-btn');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateLivesDisplay() {
    let str = '';
    for (let i = 0; i < 3; i++) {
      str += i < lives ? '☽ ' : '<span style="opacity:0.22;">☽</span> ';
    }
    livesEl.innerHTML = str.trim();
  }

  function startGame() {
    score = 0;
    combo = 0;
    lives = 3;
    drops = [];
    ripples = [];
    trayX = 0.5;
    isPlaying = true;
    lastSpawnTime = performance.now();

    scoreEl.textContent = '0';
    comboEl.textContent = '';
    updateLivesDisplay();
    overlay.style.display = 'none';
  }

  function endGame() {
    isPlaying = false;
    if (score > 0) {
      recordGameScore('7', score, `pt (${currentDiff})`);
    }
    overlayTitle.textContent = 'NIGHT REST';
    overlayTitle.style.color = '#a0c8ff';
    overlayDesc.innerHTML = `集めた星の輝き<br><strong style="color:#f3d463; font-size:1.25rem; font-weight:400;">${score} pt</strong><br><span style="font-size:0.78rem;">難易度: ${currentDiff}</span>`;
    startBtn.textContent = 'RETRY';
    overlay.style.display = 'flex';
  }

  function spawnDrop() {
    const config = DIFFICULTY_SETTINGS[currentDiff];
    const r = Math.random();
    let type = 'moon';
    if (r < config.darkRatio) {
      type = 'dark';
    } else if (r < config.darkRatio + config.goldRatio) {
      type = 'gold';
    }

    const speedBonus = Math.min(1.8, score * 0.0008);
    drops.push({
      x: 0.08 + Math.random() * 0.84,
      y: -0.04,
      speed: (config.baseSpeed + speedBonus) * (type === 'gold' ? 1.22 : 1.0),
      radius: type === 'gold' ? 9.5 : type === 'dark' ? 10 : 9,
      type,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05
    });
  }

  function addRipple(x, y, color) {
    ripples.push({ x, y, radius: 6, alpha: 0.85, color });
  }

  // 星形を描画するヘルパー関数
  function drawStarShape(cx, cy, spikes, outerRadius, innerRadius, rotation) {
    let rot = (Math.PI / 2) * 3 + rotation;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.closePath();
  }

  // 三日月の器を描画するヘルパー関数（上向きの三日月クレセント）
  function drawCrescentMoonTray(cx, cy, halfWidth) {
    ctx.save();
    ctx.shadowColor = 'rgba(243, 212, 99, 0.7)';
    ctx.shadowBlur = 16;

    const grad = ctx.createLinearGradient(cx - halfWidth, cy, cx + halfWidth, cy);
    grad.addColorStop(0, '#f3d463');
    grad.addColorStop(0.5, '#fff4bd');
    grad.addColorStop(1, '#f3d463');
    ctx.fillStyle = grad;

    // 外側の弧（下側の膨らみ）と内側の弧（上側のくぼみ）で三日月シルエットを作る
    const tipLeftX = cx - halfWidth;
    const tipRightX = cx + halfWidth;
    const tipY = cy - 6;

    ctx.beginPath();
    ctx.moveTo(tipLeftX, tipY);
    // 外側（下側）の深いカーブ
    ctx.quadraticCurveTo(cx, cy + 22, tipRightX, tipY);
    // 内側（上側）の浅いカーブ（真ん中に厚みを持たせる）
    ctx.quadraticCurveTo(cx, cy + 9, tipLeftX, tipY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ポインター操作（ドラッグ / タップ移動）
  function updateTrayFromPointer(clientX) {
    const rect = canvas.getBoundingClientRect();
    const normX = (clientX - rect.left) / rect.width;
    const halfTray = trayWidthRatio / 2;
    trayX = Math.max(halfTray, Math.min(1 - halfTray, normX));
  }

  let isDragging = false;
  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    updateTrayFromPointer(e.clientX);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging && e.pointerType === 'touch') return;
    if (isPlaying) updateTrayFromPointer(e.clientX);
  });
  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // キーボード操作
  function onKeyDown(e) {
    if (!document.getElementById('md-canvas')) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  }
  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function gameLoop(now) {
    if (!document.getElementById('md-canvas')) {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // 淡い夜空の軌道ライン装飾
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.88);
    ctx.lineTo(w, h * 0.88);
    ctx.stroke();
    ctx.restore();

    if (isPlaying) {
      const halfTray = trayWidthRatio / 2;
      if (keys.left) trayX = Math.max(halfTray, trayX - 0.015);
      if (keys.right) trayX = Math.min(1 - halfTray, trayX + 0.015);

      const config = DIFFICULTY_SETTINGS[currentDiff];
      const dynamicInterval = Math.max(320, config.spawnInterval - score * 0.15);
      if (now - lastSpawnTime > dynamicInterval) {
        spawnDrop();
        lastSpawnTime = now;
      }

      const trayCenterPx = trayX * w;
      const trayYPx = h * 0.87;
      const trayHalfWidthPx = (trayWidthRatio * w) / 2;

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.speed / h;
        d.angle += d.rotSpeed;
        const dx = d.x * w;
        const dy = d.y * h;

        const hitY = Math.abs(dy - trayYPx) < 16;
        const hitX = Math.abs(dx - trayCenterPx) < trayHalfWidthPx + d.radius * 0.55;

        if (hitY && hitX) {
          if (d.type === 'dark') {
            combo = 0;
            comboEl.textContent = '';
            lives--;
            updateLivesDisplay();
            addRipple(dx, trayYPx, 'rgba(255, 107, 107, 0.85)');
            drops.splice(i, 1);
            if (lives <= 0) {
              endGame();
              break;
            }
          } else {
            combo++;
            const basePt = d.type === 'gold' ? 30 : 10;
            const bonus = Math.min(20, Math.floor(combo / 5) * 5);
            score += basePt + bonus;
            scoreEl.textContent = score;
            comboEl.textContent = combo >= 2 ? `(${combo} COMBO)` : '';
            addRipple(dx, trayYPx, d.type === 'gold' ? 'rgba(243, 212, 99, 0.9)' : 'rgba(160, 200, 255, 0.85)');
            drops.splice(i, 1);
          }
          continue;
        }

        if (dy > h + 20) {
          if (d.type !== 'dark') {
            combo = 0;
            comboEl.textContent = '';
          }
          drops.splice(i, 1);
        }
      }
    }

    // 波紋エフェクト
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.radius += 1.6;
      rp.alpha -= 0.03;
      if (rp.alpha <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = rp.color.replace(/[\d.]+\)$/, `${rp.alpha})`);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 星の描画
    drops.forEach(d => {
      const dx = d.x * w;
      const dy = d.y * h;
      ctx.save();

      // グロー
      const glow = ctx.createRadialGradient(dx, dy, 1, dx, dy, d.radius * 2.2);
      if (d.type === 'gold') {
        glow.addColorStop(0, 'rgba(243, 212, 99, 0.85)');
        glow.addColorStop(1, 'rgba(243, 212, 99, 0)');
      } else if (d.type === 'dark') {
        glow.addColorStop(0, 'rgba(220, 90, 130, 0.72)');
        glow.addColorStop(1, 'rgba(220, 90, 130, 0)');
      } else {
        glow.addColorStop(0, 'rgba(160, 200, 255, 0.8)');
        glow.addColorStop(1, 'rgba(160, 200, 255, 0)');
      }
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dx, dy, d.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 星本体（5芒星）
      drawStarShape(dx, dy, 5, d.radius, d.radius * 0.44, d.angle);
      ctx.fillStyle = d.type === 'gold' ? '#fff0a8' : d.type === 'dark' ? '#c84b78' : '#dceaff';
      ctx.fill();
      ctx.restore();
    });

    // 三日月の器を描画
    const cx = trayX * w;
    const cy = h * 0.87;
    const rw = (trayWidthRatio * w) / 2;
    drawCrescentMoonTray(cx, cy, rw);

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // 難易度切り替え
  document.querySelectorAll('.md-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.md-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDiff = target.dataset.diff;
      startGame();
    });
  });

  startBtn.addEventListener('click', startGame);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  animFrameId = requestAnimationFrame(gameLoop);
}

function initLunarSequenceGame(container) {
  createPlaceholder(container, "08. Lunar Phase Sequence", "月齢の光と静かな和音の記憶パズル");
}

function initMoonlight2048Game(container) {
  createPlaceholder(container, "09. Moonlight 2048", "数字を重ねて月満ちる大数を作るスライドパズル");
}

function initPlanetTowerGame(container) {
  createPlaceholder(container, "10. Planet Tower", "惑星や星の欠片を崩さないよう積むバランスゲーム");
}

function initSudokuGame(container) {
  createPlaceholder(container, "11. Sudoku", "夜長に没頭して数字の法則を解き明かすナンプレ");
}

function initSolitaireGame(container) {
  createPlaceholder(container, "12. Solitaire", "思考を静かに巡らせる定番トランプパズル");
}

function initCosmicMatchGame(container) {
  createPlaceholder(container, "13. Cosmic Match 3", "月夜のジュエルが舞い落ちる連鎖アクションパズル");
}

function initShootingStarGame(container) {
  createPlaceholder(container, "14. Shooting Star Aim", "夜空を横切る流星に向けて光の矢を撃ち放つ");
}

function initZenCardPairGame(container) {
  createPlaceholder(container, "15. Zen Card Pair", "月影と星座のカードを合わせる静かな記憶パズル");
}