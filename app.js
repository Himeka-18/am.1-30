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
  { id: '8', title: '08. Starlight Reversi', desc: '光と影の石を挟んで盤面を満たす思考ボードゲーム' },
  { id: '9', title: '09. Moonlight 2048', desc: '数字を重ねて月満ちる大数を作るスライドパズル' },
  { id: '10', title: '10. Planet Merge', desc: '同じ星をくっつけて進化させ、大きな満月を作る合体パズル' },
  { id: '11', title: '11. Sudoku', desc: '夜長に没頭して数字の法則を解き明かすナンプレ' },
  { id: '12', title: '12. Solitaire', desc: '思考を静かに巡らせる定番トランプパズル' },
  { id: '13', title: '13. Cosmic Match 3', desc: '月夜のジュエルが舞い落ちる連鎖アクションパズル' },
  { id: '14', title: '14. Shooting Star Aim', desc: '夜空を横切る流星に向けて光の矢を撃ち放つアクション' },
  { id: '15', title: '15. Zen Card Pair', desc: '月影と星座のカードを合わせる静かな記憶パズル' },
  { id: '16', title: '16. Astro Block', desc: '夜空から舞い降りる星屑のブロックを積み重ねるパズル' },
  { id: '17', title: '17. Starlight Nonogram', desc: '数字のヒントを頼りに夜空の星座を浮かび上がらせるロジック' },
  { id: '18', title: '18. Moonlit Ripple', desc: '月の波紋が重なる静かな瞬間にタップするタイミングゲーム' },
  { id: '19', title: '19. Nebula Cat Fit', desc: 'かわいい夜猫のブロックを盤面に敷き詰めるパズル' },
  { id: '20', title: '20. Starlight FreeCell', desc: 'すべての札を見通して組み立てる戦略トランプパズル' }
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
    case '16': initAstroBlockGame(view); break;
    case '17': initNonogramGame(view); break;
    case '18': initMoonlitRippleGame(view); break;
    case '19': initCatFitGame(view); break;
    case '20': initFreeCellGame(view); break;
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

// ==================================================
// 08. Starlight Reversi (夜空の光と影のリバーシ)
// ==================================================
function initLunarSequenceGame(container) {
  const SIZE = 8;
  const EMPTY = 0;
  const PLAYER = 1; // 光（白銀）
  const AI = 2;     // 影（群青）

  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  const WEIGHTS = [
    [ 120, -25,  20,   5,   5,  20, -25, 120],
    [ -25, -45,  -5,  -5,  -5,  -5, -45, -25],
    [  20,  -5,  15,   3,   3,  15,  -5,  20],
    [   5,  -5,   3,   3,   3,   3,  -5,   5],
    [   5,  -5,   3,   3,   3,   3,  -5,   5],
    [  20,  -5,  15,   3,   3,  15,  -5,  20],
    [ -25, -45,  -5,  -5,  -5,  -5, -45, -25],
    [ 120, -25,  20,   5,   5,  20, -25, 120]
  ];

  let difficulty = 'NORMAL';
  let board = [];
  let turn = PLAYER;
  let showHints = true;
  let isGameOver = false;
  let aiTimer = null;
  let lastMove = null;
  let flippedSet = new Set();

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">08. Starlight Reversi</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">相手の影を光の石で挟み、盤面を星明かりで満たそう</p>

    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); justify-content:center;">
      <button class="rev-diff-btn" data-diff="EASY" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EASY</button>
      <button class="rev-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL</button>
      <button class="rev-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD</button>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:360px; font-size:0.85rem; color:#8192b4; margin-bottom:10px; background:rgba(10,15,32,0.7); padding:8px 12px; border-radius:10px; border:1px solid rgba(160,185,255,0.16);">
      <div style="display:flex; align-items:center; gap:7px;">
        <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fffef5, #c8d8ff); box-shadow:0 0 8px rgba(243,212,99,0.5);"></span>
        <span>YOU: <strong id="rev-p-score" style="color:#f3d463; font-size:1rem;">2</strong></span>
      </div>
      <span id="rev-turn-label" style="font-size:0.76rem; letter-spacing:1px; color:#a0c8ff;">YOUR TURN</span>
      <div style="display:flex; align-items:center; gap:7px;">
        <span>AI: <strong id="rev-ai-score" style="color:#a0b8ff; font-size:1rem;">2</strong></span>
        <span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #2b3c6e, #0c1226); border:1px solid rgba(140,170,255,0.45);"></span>
      </div>
    </div>

    <div style="position:relative; width:100%; max-width:360px; aspect-ratio:1 / 1; background:linear-gradient(145deg, #101933 0%, #0b1124 100%); border:1.5px solid rgba(160, 185, 255, 0.32); border-radius:12px; padding:6px; box-shadow:0 10px 30px rgba(0,0,0,0.55); box-sizing:border-box;">
      <div id="rev-grid" style="display:grid; grid-template-columns:repeat(8, 1fr); grid-template-rows:repeat(8, 1fr); gap:3px; width:100%; height:100%; user-select:none;"></div>
      <div id="rev-toast" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(8,12,26,0.92); color:#f3d463; border:1px solid rgba(243,212,99,0.45); padding:8px 20px; border-radius:20px; font-size:0.85rem; letter-spacing:1.5px; pointer-events:none; opacity:0; transition:opacity 0.25s; z-index:20;"></div>
      <div id="rev-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.88); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center; border-radius:12px; z-index:30;">
        <h3 id="rev-overlay-title" style="color:#f3d463; font-size:1.35rem; letter-spacing:2px; font-weight:300;"></h3>
        <p id="rev-overlay-desc" style="color:#8192b4; font-size:0.86rem; line-height:1.65;"></p>
        <button id="rev-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">PLAY AGAIN</button>
      </div>
    </div>

    <div style="display:flex; gap:8px; margin-top:12px; width:100%; max-width:360px; justify-content:center;">
      <button id="rev-hint-toggle" style="background:rgba(160,200,255,0.16); color:#a0c8ff; border:1px solid rgba(160,200,255,0.35); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:0.78rem;">✦ ガイド: ON</button>
      <button id="rev-new-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:0.78rem;">最初からやり直す</button>
    </div>
  `;

  const gridEl = document.getElementById('rev-grid');
  const pScoreEl = document.getElementById('rev-p-score');
  const aiScoreEl = document.getElementById('rev-ai-score');
  const turnLabelEl = document.getElementById('rev-turn-label');
  const toastEl = document.getElementById('rev-toast');
  const overlayEl = document.getElementById('rev-overlay');
  const overlayTitleEl = document.getElementById('rev-overlay-title');
  const overlayDescEl = document.getElementById('rev-overlay-desc');
  const hintToggleBtn = document.getElementById('rev-hint-toggle');

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    setTimeout(() => { if (toastEl) toastEl.style.opacity = '0'; }, 1100);
  }

  function cloneBoard(b) { return b.map(row => [...row]); }

  function getFlips(b, r, c, side) {
    if (b[r][c] !== EMPTY) return [];
    const opp = side === PLAYER ? AI : PLAYER;
    const flips = [];
    for (const [dr, dc] of DIRS) {
      let nr = r + dr, nc = c + dc;
      const line = [];
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === opp) {
        line.push([nr, nc]);
        nr += dr; nc += dc;
      }
      if (line.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc] === side) {
        flips.push(...line);
      }
    }
    return flips;
  }

  function getValidMoves(b, side) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const flips = getFlips(b, r, c, side);
        if (flips.length > 0) moves.push({ r, c, flips });
      }
    }
    return moves;
  }

  function countDiscs(b) {
    let p = 0, a = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === PLAYER) p++;
        else if (b[r][c] === AI) a++;
      }
    }
    return { p, a };
  }

  function evaluateBoard(b, side) {
    const opp = side === PLAYER ? AI : PLAYER;
    let score = 0, emptyCount = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === EMPTY) { emptyCount++; continue; }
        const w = emptyCount <= 14 ? 10 : WEIGHTS[r][c];
        score += b[r][c] === side ? w : -w;
      }
    }
    const corners = [
      [0, 0, [[0, 1], [1, 0], [1, 1]]],
      [0, 7, [[0, 6], [1, 7], [1, 6]]],
      [7, 0, [[6, 0], [7, 1], [6, 1]]],
      [7, 7, [[6, 7], [7, 6], [6, 6]]]
    ];
    for (const [cr, cc, adj] of corners) {
      if (b[cr][cc] === side) {
        for (const [ar, ac] of adj) if (b[ar][ac] === side) score += 35;
      }
    }
    score += (getValidMoves(b, side).length - getValidMoves(b, opp).length) * 6;
    return score;
  }

  function minimax(b, depth, alpha, beta, maximizing, aiSide) {
    const humanSide = aiSide === AI ? PLAYER : AI;
    const curSide = maximizing ? aiSide : humanSide;
    const valid = getValidMoves(b, curSide);
    if (depth === 0) return evaluateBoard(b, aiSide);
    if (valid.length === 0) {
      if (getValidMoves(b, maximizing ? humanSide : aiSide).length === 0) {
        const { p, a } = countDiscs(b);
        return (aiSide === AI ? (a - p) : (p - a)) * 500;
      }
      return minimax(b, depth - 1, alpha, beta, !maximizing, aiSide);
    }
    if (maximizing) {
      let maxEval = -Infinity;
      for (const m of valid) {
        const nextB = cloneBoard(b);
        nextB[m.r][m.c] = aiSide;
        for (const [fr, fc] of m.flips) nextB[fr][fc] = aiSide;
        maxEval = Math.max(maxEval, minimax(nextB, depth - 1, alpha, beta, false, aiSide));
        alpha = Math.max(alpha, maxEval);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of valid) {
        const nextB = cloneBoard(b);
        nextB[m.r][m.c] = humanSide;
        for (const [fr, fc] of m.flips) nextB[fr][fc] = humanSide;
        minEval = Math.min(minEval, minimax(nextB, depth - 1, alpha, beta, true, aiSide));
        beta = Math.min(beta, minEval);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function chooseAIMove() {
    const valid = getValidMoves(board, AI);
    if (valid.length === 0) return null;
    if (difficulty === 'EASY') {
      const corners = valid.filter(m => (m.r === 0 || m.r === 7) && (m.c === 0 || m.c === 7));
      if (corners.length > 0 && Math.random() < 0.5) return corners[Math.floor(Math.random() * corners.length)];
      return valid[Math.floor(Math.random() * valid.length)];
    }
    if (difficulty === 'NORMAL') {
      let bestScore = -Infinity, bestMoves = [];
      for (const m of valid) {
        const nextB = cloneBoard(board);
        nextB[m.r][m.c] = AI;
        for (const [fr, fc] of m.flips) nextB[fr][fc] = AI;
        const sc = evaluateBoard(nextB, AI) + (Math.random() * 14 - 7);
        if (sc > bestScore) { bestScore = sc; bestMoves = [m]; }
        else if (Math.abs(sc - bestScore) < 2) bestMoves.push(m);
      }
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    const { p, a } = countDiscs(board);
    const searchDepth = (64 - (p + a)) <= 10 ? 5 : 3;
    let bestScore = -Infinity, bestMove = valid[0];
    for (const m of valid) {
      const nextB = cloneBoard(board);
      nextB[m.r][m.c] = AI;
      for (const [fr, fc] of m.flips) nextB[fr][fc] = AI;
      const sc = minimax(nextB, searchDepth - 1, -Infinity, Infinity, false, AI);
      if (sc > bestScore) { bestScore = sc; bestMove = m; }
    }
    return bestMove;
  }

  function applyMove(r, c, side) {
    const flips = getFlips(board, r, c, side);
    if (flips.length === 0) return false;
    board[r][c] = side;
    lastMove = `${r},${c}`;
    flippedSet = new Set(flips.map(([fr, fc]) => `${fr},${fc}`));
    for (const [fr, fc] of flips) board[fr][fc] = side;
    return true;
  }

  function checkEndOrNextTurn() {
    renderBoard();
    const pMoves = getValidMoves(board, PLAYER);
    const aiMoves = getValidMoves(board, AI);
    if (pMoves.length === 0 && aiMoves.length === 0) { finishGame(); return; }

    if (turn === PLAYER) {
      if (aiMoves.length > 0) {
        turn = AI;
        turnLabelEl.textContent = 'AI THINKING...';
        turnLabelEl.style.color = '#8192b4';
        renderBoard();
        aiTimer = setTimeout(runAITurn, 420);
      } else {
        showToast('AI PASS — YOUR TURN');
        turn = PLAYER;
        turnLabelEl.textContent = 'YOUR TURN';
        turnLabelEl.style.color = '#f3d463';
        renderBoard();
      }
    } else {
      if (pMoves.length > 0) {
        turn = PLAYER;
        turnLabelEl.textContent = 'YOUR TURN';
        turnLabelEl.style.color = '#f3d463';
        renderBoard();
      } else {
        showToast('NO MOVES — PASS');
        turn = AI;
        turnLabelEl.textContent = 'AI THINKING...';
        turnLabelEl.style.color = '#8192b4';
        renderBoard();
        aiTimer = setTimeout(runAITurn, 750);
      }
    }
  }

  function runAITurn() {
    if (!document.getElementById('rev-grid') || isGameOver) return;
    const move = chooseAIMove();
    if (move) applyMove(move.r, move.c, AI);
    checkEndOrNextTurn();
  }

  function finishGame() {
    isGameOver = true;
    const { p, a } = countDiscs(board);
    turnLabelEl.textContent = 'GAME SET';
    if (p > a) {
      recordGameScore('8', p, `stones (${difficulty})`);
      overlayTitleEl.textContent = 'STARLIGHT VICTORY';
      overlayTitleEl.style.color = '#f3d463';
      overlayDescEl.innerHTML = `夜空が美しい星明かりで満たされました！<br>獲得石数: <strong style="color:#f3d463; font-size:1.3rem; font-weight:400;">${p}</strong> <span style="color:#7a8ba9;">vs ${a}</span><br><span style="font-size:0.78rem;">難易度: ${difficulty}</span>`;
    } else if (p < a) {
      overlayTitleEl.textContent = 'ECLIPSED BY SHADOW';
      overlayTitleEl.style.color = '#ff8a8a';
      overlayDescEl.innerHTML = `影の石が盤面を覆いました。<br>最終スコア: <strong style="color:#e1e6f0;">${p}</strong> vs <strong style="color:#a0b8ff;">${a}</strong>`;
    } else {
      overlayTitleEl.textContent = 'EQUINOX DRAW';
      overlayTitleEl.style.color = '#a0c8ff';
      overlayDescEl.innerHTML = `光と影が完全に均衡しました（引き分け）。<br>最終スコア: <strong style="color:#e1e6f0;">${p} vs ${a}</strong>`;
    }
    setTimeout(() => { if (overlayEl) overlayEl.style.display = 'flex'; }, 350);
  }

  function renderBoard() {
    const { p, a } = countDiscs(board);
    pScoreEl.textContent = p;
    aiScoreEl.textContent = a;
    const validMap = new Map();
    if (!isGameOver && turn === PLAYER && showHints) {
      for (const m of getValidMoves(board, PLAYER)) validMap.set(`${m.r},${m.c}`, m.flips.length);
    }
    gridEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const key = `${r},${c}`;
        const cell = document.createElement('div');
        const isLast = lastMove === key;
        cell.style.cssText = `
          background: ${isLast ? 'rgba(243, 212, 99, 0.14)' : 'rgba(22, 33, 66, 0.72)'};
          border: 1px solid ${isLast ? 'rgba(243, 212, 99, 0.45)' : 'rgba(160, 185, 255, 0.12)'};
          border-radius: 5px; display: flex; align-items: center; justify-content: center;
          position: relative; cursor: ${board[r][c] === EMPTY && turn === PLAYER && !isGameOver ? 'pointer' : 'default'};
        `;
        const val = board[r][c];
        if (val !== EMPTY) {
          const disc = document.createElement('div');
          const isFlipped = flippedSet.has(key);
          disc.style.cssText = val === PLAYER
            ? `width:78%; height:78%; border-radius:50%; background:radial-gradient(circle at 32% 30%, #ffffff 0%, #dce6ff 55%, #9eb4e8 100%); box-shadow:0 2px 8px rgba(220,235,255,0.45); transform:${isFlipped ? 'scale(1.08)' : 'scale(1)'}; transition:transform 0.28s;`
            : `width:78%; height:78%; border-radius:50%; background:radial-gradient(circle at 32% 30%, #384e8a 0%, #162042 60%, #090d1c 100%); border:1px solid rgba(140,170,255,0.38); box-shadow:0 3px 8px rgba(0,0,0,0.65); transform:${isFlipped ? 'scale(1.08)' : 'scale(1)'}; transition:transform 0.28s;`;
          cell.appendChild(disc);
        } else if (validMap.has(key)) {
          const dot = document.createElement('div');
          dot.style.cssText = 'width:26%; height:26%; border-radius:50%; background:rgba(243,212,99,0.55); box-shadow:0 0 8px rgba(243,212,99,0.6); pointer-events:none;';
          cell.appendChild(dot);
        }
        cell.addEventListener('click', () => {
          if (isGameOver || turn !== PLAYER) return;
          if (applyMove(r, c, PLAYER)) checkEndOrNextTurn();
        });
        gridEl.appendChild(cell);
      }
    }
  }

  function startNewGame() {
    if (aiTimer) clearTimeout(aiTimer);
    isGameOver = false; turn = PLAYER; lastMove = null; flippedSet = new Set();
    overlayEl.style.display = 'none';
    turnLabelEl.textContent = 'YOUR TURN'; turnLabelEl.style.color = '#f3d463';
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
    board[3][3] = PLAYER; board[4][4] = PLAYER; board[3][4] = AI; board[4][3] = AI;
    renderBoard();
  }

  hintToggleBtn.addEventListener('click', () => {
    showHints = !showHints;
    hintToggleBtn.textContent = showHints ? '✦ ガイド: ON' : '✦ ガイド: OFF';
    renderBoard();
  });
  document.getElementById('rev-new-btn').addEventListener('click', startNewGame);
  document.getElementById('rev-retry-btn').addEventListener('click', startNewGame);
  document.querySelectorAll('.rev-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.rev-diff-btn').forEach(b => { b.style.background = 'transparent'; b.style.color = '#7a8ba9'; });
      e.target.style.background = 'rgba(160,180,255,0.2)'; e.target.style.color = '#fff';
      difficulty = e.target.dataset.diff;
      startNewGame();
    });
  });

  startNewGame();
}

// ==================================================
// 09. Moonlight 2048 (完成版: スライド演出付き)
// ==================================================
function initMoonlight2048Game(container) {
  const DIFFICULTY_SETTINGS = {
    NORMAL: { size: 4, target: 2048, obstacles: 0 },
    HARD: { size: 3, target: 512, obstacles: 0 },
    EXPERT: { size: 5, target: 4096, obstacles: 2 }
  };

  const TILE_STYLES = {
    2: { bg: 'rgba(130, 160, 220, 0.16)', color: '#c8d8f8', border: 'rgba(160, 190, 255, 0.25)', glow: 'none' },
    4: { bg: 'rgba(120, 175, 240, 0.24)', color: '#dceaff', border: 'rgba(160, 205, 255, 0.35)', glow: 'none' },
    8: { bg: 'rgba(105, 190, 235, 0.34)', color: '#ffffff', border: 'rgba(130, 215, 255, 0.48)', glow: '0 0 10px rgba(105, 190, 235, 0.25)' },
    16: { bg: 'rgba(115, 210, 200, 0.38)', color: '#ffffff', border: 'rgba(140, 235, 220, 0.52)', glow: '0 0 12px rgba(115, 210, 200, 0.3)' },
    32: { bg: 'rgba(155, 160, 245, 0.44)', color: '#ffffff', border: 'rgba(185, 190, 255, 0.58)', glow: '0 0 14px rgba(155, 160, 245, 0.35)' },
    64: { bg: 'rgba(195, 155, 240, 0.50)', color: '#ffffff', border: 'rgba(220, 185, 255, 0.62)', glow: '0 0 16px rgba(195, 155, 240, 0.4)' },
    128: { bg: 'rgba(235, 200, 110, 0.48)', color: '#fff9db', border: 'rgba(243, 212, 99, 0.68)', glow: '0 0 18px rgba(243, 212, 99, 0.45)' },
    256: { bg: 'rgba(243, 212, 99, 0.60)', color: '#fffdf0', border: 'rgba(255, 230, 130, 0.82)', glow: '0 0 22px rgba(243, 212, 99, 0.55)' },
    512: { bg: 'rgba(248, 218, 105, 0.74)', color: '#1a2038', border: '#fff2b2', glow: '0 0 26px rgba(243, 212, 99, 0.7)' },
    1024: { bg: 'rgba(255, 226, 120, 0.86)', color: '#14192e', border: '#ffffff', glow: '0 0 30px rgba(255, 230, 130, 0.85)' },
    2048: { bg: 'linear-gradient(135deg, #fff6c2, #f3d463)', color: '#101528', border: '#ffffff', glow: '0 0 36px rgba(255, 240, 150, 0.95)' }
  };

  let currentDiff = 'NORMAL';
  let size = 4;
  let targetVal = 2048;
  let board = []; // 0=空, -1=星雲岩(障害物), 2..=数字
  let score = 0;
  let hasReachedTarget = false;
  let isGameOver = false;
  let isAnimating = false;

  container.innerHTML = `
    <style>
      .m2048-bg-cell {
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .m2048-tile {
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        letter-spacing: 0.5px;
        user-select: none;
        box-sizing: border-box;
        transition: transform 0.13s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }
      @keyframes m2048SpawnPop {
        0% { opacity: 0; transform: var(--tile-pos) scale(0.4); }
        70% { opacity: 1; transform: var(--tile-pos) scale(1.07); }
        100% { opacity: 1; transform: var(--tile-pos) scale(1); }
      }
      @keyframes m2048MergePop {
        0% { transform: var(--tile-pos) scale(1); }
        45% { transform: var(--tile-pos) scale(1.14); }
        100% { transform: var(--tile-pos) scale(1); }
      }
      .m2048-spawn {
        animation: m2048SpawnPop 0.18s ease-out forwards;
      }
      .m2048-merge {
        animation: m2048MergePop 0.2s ease-out forwards;
      }
    </style>

    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">09. Moonlight 2048</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:14px;">同じ光の数字を重ね、満月（<span id="m2048-target-label">2048</span>）の輝きを目指そう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:12px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
      <button class="m2048-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL (4x4)</button>
      <button class="m2048-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD (3x3)</button>
      <button class="m2048-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT (5x5)</button>
    </div>

    <!-- スコア＆リセット -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:400px; font-size:0.85rem; color:#8192b4; margin-bottom:10px;">
      <span>SCORE: <strong id="m2048-score" style="color:#f3d463; font-size:1rem;">0</strong></span>
      <button id="m2048-reset-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:4px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">やり直す</button>
    </div>

    <!-- 盤面エリア -->
    <div id="m2048-board-wrap" style="position:relative; width:100%; max-width:400px; aspect-ratio:1 / 1; background:rgba(10, 14, 28, 0.72); border:1px solid rgba(160, 180, 255, 0.18); border-radius:16px; padding:10px; box-sizing:border-box; touch-action:none;">
      <!-- 背景グリッド -->
      <div id="m2048-bg-grid" style="display:grid; gap:8px; width:100%; height:100%;"></div>
      <!-- スライドするタイルレイヤー -->
      <div id="m2048-tile-layer" style="position:absolute; inset:10px; pointer-events:none;"></div>

      <!-- オーバーレイ -->
      <div id="m2048-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.86); border-radius:16px; display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(7px); padding:20px; text-align:center; z-index:10;">
        <h3 id="m2048-overlay-title" style="color:#f3d463; font-size:1.3rem; letter-spacing:2px; font-weight:300;">FULL MOON!</h3>
        <p id="m2048-overlay-desc" style="color:#8192b4; font-size:0.85rem; line-height:1.65;"></p>
        <div style="display:flex; gap:10px; margin-top:6px;">
          <button id="m2048-continue-btn" style="display:none; background:rgba(243,212,99,0.2); color:#f3d463; border:1px solid rgba(243,212,99,0.45); padding:8px 20px; border-radius:6px; cursor:pointer; font-size:0.85rem;">続ける</button>
          <button id="m2048-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 24px; border-radius:6px; cursor:pointer; font-size:0.85rem;">NEW GAME</button>
        </div>
      </div>
    </div>
    <p style="color:#657696; font-size:0.75rem; margin-top:10px;">スワイプ または 矢印キー（WASD）でスライド</p>
  `;

  const boardWrapEl = document.getElementById('m2048-board-wrap');
  const bgGridEl = document.getElementById('m2048-bg-grid');
  const tileLayerEl = document.getElementById('m2048-tile-layer');
  const scoreEl = document.getElementById('m2048-score');
  const targetLabelEl = document.getElementById('m2048-target-label');
  const overlayEl = document.getElementById('m2048-overlay');
  const overlayTitleEl = document.getElementById('m2048-overlay-title');
  const overlayDescEl = document.getElementById('m2048-overlay-desc');
  const continueBtn = document.getElementById('m2048-continue-btn');
  const retryBtn = document.getElementById('m2048-retry-btn');

  // 現在のタイル1マスのサイズと座標(px)を計算
  function getCellMetrics() {
    const layerWidth = tileLayerEl.clientWidth || 360;
    const gap = size === 5 ? 6 : 8;
    const cellSize = (layerWidth - gap * (size - 1)) / size;
    return { cellSize, gap };
  }

  function getPosTranslate(r, c, cellSize, gap) {
    const x = c * (cellSize + gap);
    const y = r * (cellSize + gap);
    return `translate(${x}px, ${y}px)`;
  }

  function createTileElement(val, r, c, cellSize, gap, extraClass = '') {
    const tile = document.createElement('div');
    tile.className = `m2048-tile ${extraClass}`.trim();
    const posStr = getPosTranslate(r, c, cellSize, gap);
    tile.style.width = `${cellSize}px`;
    tile.style.height = `${cellSize}px`;
    tile.style.transform = posStr;
    tile.style.setProperty('--tile-pos', posStr);

    const baseFontSize = size === 5 ? '1.05rem' : size === 3 ? '1.55rem' : '1.3rem';
    tile.style.fontSize = val >= 1000 ? (size === 5 ? '0.88rem' : '1.08rem') : baseFontSize;

    if (val === -1) {
      tile.style.background = 'rgba(90, 75, 120, 0.25)';
      tile.style.border = '1px dashed rgba(180, 150, 220, 0.3)';
      tile.style.color = '#9a86b8';
      tile.textContent = '☁';
    } else {
      const style = TILE_STYLES[val] || TILE_STYLES[2048];
      tile.style.background = style.bg;
      tile.style.color = style.color;
      tile.style.border = `1px solid ${style.border}`;
      tile.style.boxShadow = style.glow;
      tile.textContent = val;
    }

    return tile;
  }

  function setupGame() {
    const config = DIFFICULTY_SETTINGS[currentDiff];
    size = config.size;
    targetVal = config.target;
    score = 0;
    hasReachedTarget = false;
    isGameOver = false;
    isAnimating = false;

    scoreEl.textContent = '0';
    targetLabelEl.textContent = targetVal;
    overlayEl.style.display = 'none';
    continueBtn.style.display = 'none';

    const gap = size === 5 ? 6 : 8;
    bgGridEl.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    bgGridEl.style.gap = `${gap}px`;
    bgGridEl.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
      const bgCell = document.createElement('div');
      bgCell.className = 'm2048-bg-cell';
      bgGridEl.appendChild(bgCell);
    }

    board = Array.from({ length: size }, () => Array(size).fill(0));

    if (config.obstacles > 0) {
      let placed = 0;
      while (placed < config.obstacles) {
        const r = 1 + Math.floor(Math.random() * (size - 2));
        const c = 1 + Math.floor(Math.random() * (size - 2));
        if (board[r][c] === 0) {
          board[r][c] = -1;
          placed++;
        }
      }
    }

    const s1 = spawnRandomTile();
    const s2 = spawnRandomTile();
    renderStaticBoard([s1, s2].filter(Boolean), []);
  }

  function spawnRandomTile() {
    const empty = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length === 0) return null;
    const chosen = empty[Math.floor(Math.random() * empty.length)];
    board[chosen.r][chosen.c] = Math.random() < 0.88 ? 2 : 4;
    return chosen;
  }

  function renderStaticBoard(spawnedList = [], mergedList = []) {
    tileLayerEl.innerHTML = '';
    const { cellSize, gap } = getCellMetrics();

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const val = board[r][c];
        if (val === 0) continue;

        const isSpawned = spawnedList.some(p => p.r === r && p.c === c);
        const isMerged = mergedList.some(p => p.r === r && p.c === c);
        const extraClass = isSpawned ? 'm2048-spawn' : isMerged ? 'm2048-merge' : '';

        const tile = createTileElement(val, r, c, cellSize, gap, extraClass);
        tileLayerEl.appendChild(tile);
      }
    }
  }

  // 1行を左方向へスライド計算し、移動元インデックスの追跡情報(movements)も返す
  function computeLineSlideLeft(line) {
    let moved = false;
    let gained = 0;
    const result = [...line];
    const movements = []; // { fromIdx, toIdx, val, merged }

    let segmentStart = 0;
    for (let i = 0; i <= size; i++) {
      if (i === size || result[i] === -1) {
        if (i < size && result[i] === -1) {
          movements.push({ fromIdx: i, toIdx: i, val: -1, merged: false });
        }

        // この区間内のタイルを抽出
        const items = [];
        for (let k = segmentStart; k < i; k++) {
          if (result[k] > 0) items.push({ origIdx: k, val: result[k] });
        }

        let writeIdx = segmentStart;
        for (let j = 0; j < items.length; j++) {
          if (j + 1 < items.length && items[j].val === items[j + 1].val) {
            const newVal = items[j].val * 2;
            movements.push({ fromIdx: items[j].origIdx, toIdx: writeIdx, val: items[j].val, merged: true });
            movements.push({ fromIdx: items[j + 1].origIdx, toIdx: writeIdx, val: items[j + 1].val, merged: true });
            result[writeIdx] = newVal;
            if (items[j].origIdx !== writeIdx || items[j + 1].origIdx !== writeIdx) moved = true;
            gained += newVal;
            writeIdx++;
            j++;
          } else {
            movements.push({ fromIdx: items[j].origIdx, toIdx: writeIdx, val: items[j].val, merged: false });
            result[writeIdx] = items[j].val;
            if (items[j].origIdx !== writeIdx) moved = true;
            writeIdx++;
          }
        }
        while (writeIdx < i) {
          result[writeIdx] = 0;
          writeIdx++;
        }

        segmentStart = i + 1;
      }
    }

    return { line: result, moved, gained, movements };
  }

  function move(direction) {
    if (isGameOver || isAnimating || overlayEl.style.display === 'flex') return;

    let anyMoved = false;
    let totalGained = 0;
    const allMovements = []; // { fromR, fromC, toR, toC, val, merged }
    const nextBoard = Array.from({ length: size }, () => Array(size).fill(0));

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < size; r++) {
        let row = [...board[r]];
        if (direction === 'RIGHT') row.reverse();
        const { line, moved, gained, movements } = computeLineSlideLeft(row);
        if (direction === 'RIGHT') line.reverse();
        if (moved) anyMoved = true;
        totalGained += gained;
        nextBoard[r] = line;

        movements.forEach(m => {
          const fromC = direction === 'RIGHT' ? size - 1 - m.fromIdx : m.fromIdx;
          const toC = direction === 'RIGHT' ? size - 1 - m.toIdx : m.toIdx;
          allMovements.push({ fromR: r, fromC, toR: r, toC, val: m.val, merged: m.merged });
        });
      }
    } else {
      for (let c = 0; c < size; c++) {
        let col = [];
        for (let r = 0; r < size; r++) col.push(board[r][c]);
        if (direction === 'DOWN') col.reverse();
        const { line, moved, gained, movements } = computeLineSlideLeft(col);
        if (direction === 'DOWN') line.reverse();
        if (moved) anyMoved = true;
        totalGained += gained;
        for (let r = 0; r < size; r++) nextBoard[r][c] = line[r];

        movements.forEach(m => {
          const fromR = direction === 'DOWN' ? size - 1 - m.fromIdx : m.fromIdx;
          const toR = direction === 'DOWN' ? size - 1 - m.toIdx : m.toIdx;
          allMovements.push({ fromR, fromC: c, toR, toC: c, val: m.val, merged: m.merged });
        });
      }
    }

    if (!anyMoved) return;

    isAnimating = true;
    const { cellSize, gap } = getCellMetrics();

    // 1. まず移動元の位置に全タイルを描画
    tileLayerEl.innerHTML = '';
    const tileNodes = allMovements.map(m => {
      const el = createTileElement(m.val, m.fromR, m.fromC, cellSize, gap);
      tileLayerEl.appendChild(el);
      return { el, m };
    });

    // 2. 次フレームで移動先座標へスライドアニメーション実行
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tileNodes.forEach(({ el, m }) => {
          el.style.transform = getPosTranslate(m.toR, m.toC, cellSize, gap);
        });
      });
    });

    // 3. スライド完了後（135ms後）に盤面確定・合体ポップ＆新規出現
    setTimeout(() => {
      if (!document.getElementById('m2048-tile-layer')) return;
      board = nextBoard;
      score += totalGained;
      scoreEl.textContent = score;

      const mergedCoords = allMovements
        .filter(m => m.merged)
        .map(m => ({ r: m.toR, c: m.toC }));
      const spawned = spawnRandomTile();

      renderStaticBoard(spawned ? [spawned] : [], mergedCoords);
      isAnimating = false;

      checkPostMoveState();
    }, 135);
  }

  function checkPostMoveState() {
    if (!hasReachedTarget) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c] >= targetVal) {
            hasReachedTarget = true;
            overlayTitleEl.textContent = `${targetVal} REACHED!`;
            overlayTitleEl.style.color = '#f3d463';
            overlayDescEl.innerHTML = `満月の輝きに到達しました！<br>SCORE: <strong style="color:#f3d463;">${score}</strong><br>このままハイスコアを目指して続けられます。`;
            continueBtn.style.display = 'inline-block';
            overlayEl.style.display = 'flex';
            return;
          }
        }
      }
    }

    if (!canMove()) {
      isGameOver = true;
      if (score > 0) {
        recordGameScore('9', score, `pt (${currentDiff})`);
      }
      overlayTitleEl.textContent = 'NIGHT STILLNESS';
      overlayTitleEl.style.color = '#a0c8ff';
      overlayDescEl.innerHTML = `これ以上動かせる星がありません。<br>FINAL SCORE: <strong style="color:#f3d463; font-size:1.2rem; font-weight:400;">${score} pt</strong>`;
      continueBtn.style.display = 'none';
      overlayEl.style.display = 'flex';
    }
  }

  function canMove() {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = board[r][c];
        if (v === 0) return true;
        if (v === -1) continue;
        if (c + 1 < size && board[r][c + 1] === v) return true;
        if (r + 1 < size && board[r + 1][c] === v) return true;
      }
    }
    return false;
  }

  function handleKeyDown(e) {
    if (!document.getElementById('m2048-bg-grid')) {
      window.removeEventListener('keydown', handleKeyDown);
      return;
    }
    const keyMap = {
      ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
      ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT',
      ArrowUp: 'UP', w: 'UP', W: 'UP',
      ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN'
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      move(keyMap[e.key]);
    }
  }
  window.addEventListener('keydown', handleKeyDown);

  let touchStartX = 0;
  let touchStartY = 0;
  boardWrapEl.addEventListener('pointerdown', (e) => {
    touchStartX = e.clientX;
    touchStartY = e.clientY;
  });
  boardWrapEl.addEventListener('pointerup', (e) => {
    const dx = e.clientX - touchStartX;
    const dy = e.clientY - touchStartY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      move(dy > 0 ? 'DOWN' : 'UP');
    }
  });

  window.addEventListener('resize', () => {
    if (document.getElementById('m2048-tile-layer') && !isAnimating) {
      renderStaticBoard([], []);
    }
  });

  document.querySelectorAll('.m2048-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.m2048-diff-btn').forEach(b => {
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

  continueBtn.addEventListener('click', () => {
    overlayEl.style.display = 'none';
  });
  retryBtn.addEventListener('click', setupGame);
  document.getElementById('m2048-reset-btn').addEventListener('click', setupGame);

  setupGame();
}

// ==================================================
// 10. Planet Merge (スイカゲーム風・リアル天体合体パズル)
// ==================================================
function initPlanetTowerGame(container) {
  // 落とす範囲（ボックス幅）を本家のようにスリムで戦略的な幅に調整
  const DIFFICULTY_SETTINGS = {
    NORMAL: { boxW: 235, maxDropTier: 3 },
    HARD: { boxW: 205, maxDropTier: 4 },
    EXPERT: { boxW: 190, maxDropTier: 4 }
  };

  // 半径をコンパクトな黄金比に調整（最大満月でもr=62で画面を覆いすぎない）
  const PLANET_TIERS = [
    { tier: 0, name: '星屑', r: 12, color: '#cfe2ff', glow: 'rgba(207, 226, 255, 0.5)', score: 2 },
    { tier: 1, name: '小惑星', r: 16, color: '#8fa4c7', glow: 'rgba(143, 164, 199, 0.45)', score: 6 },
    { tier: 2, name: '水星', r: 21, color: '#7cc9c9', glow: 'rgba(124, 201, 201, 0.45)', score: 14 },
    { tier: 3, name: '火星', r: 26, color: '#e07a5f', glow: 'rgba(224, 122, 95, 0.5)', score: 28 },
    { tier: 4, name: '金星', r: 32, color: '#f2cc8f', glow: 'rgba(242, 204, 143, 0.5)', score: 50 },
    { tier: 5, name: '地球', r: 38, color: '#4ea8de', glow: 'rgba(78, 168, 222, 0.55)', score: 85 },
    { tier: 6, name: '海王星', r: 44, color: '#5e60ce', glow: 'rgba(94, 96, 206, 0.55)', score: 130 },
    { tier: 7, name: '土星', r: 50, color: '#f3d463', glow: 'rgba(243, 212, 99, 0.6)', score: 200 },
    { tier: 8, name: '太陽', r: 56, color: '#ff8c42', glow: 'rgba(255, 140, 66, 0.7)', score: 320 },
    { tier: 9, name: '満月', r: 62, color: '#ffe875', glow: 'rgba(255, 232, 117, 0.85)', score: 500 }
  ];

  let currentDiff = 'NORMAL';
  let planets = [];
  let effects = [];
  let nextId = 1;
  let currentTier = 0;
  let nextTier = 1;
  let aimX = 180;
  let dropCooldown = 0;
  let score = 0;
  let isGameOver = false;
  let animFrameId = null;

  const WORLD_W = 360;
  const WORLD_H = 480;
  const FLOOR_Y = 454;
  const DEADLINE_Y = 116;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">10. Planet Merge</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">同じ星をくっつけて進化させ、大きな満月を作ろう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
      <button class="pm-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL</button>
      <button class="pm-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD</button>
      <button class="pm-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT</button>
    </div>

    <!-- スコア＆NEXT表示 -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:390px; font-size:0.85rem; color:#8192b4; margin-bottom:8px;">
      <span>SCORE: <strong id="pm-score" style="color:#f3d463; font-size:1.05rem;">0</strong></span>
      <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem;">
        <span>NEXT:</span>
        <span id="pm-next-dot" style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#8fa4c7; box-shadow:0 0 8px rgba(143,164,199,0.6);"></span>
        <strong id="pm-next-name" style="color:#dceaff;">小惑星</strong>
      </div>
      <button id="pm-reset-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">やり直す</button>
    </div>

    <!-- キャンバスエリア -->
    <div style="position:relative; width:100%; max-width:390px; aspect-ratio:3 / 4; background:linear-gradient(180deg, rgba(8, 12, 28, 0.95) 0%, rgba(16, 24, 48, 0.92) 100%); border:1px solid rgba(160, 180, 255, 0.18); border-radius:16px; overflow:hidden; box-shadow:inset 0 0 30px rgba(0,0,0,0.65);">
      <canvas id="pm-canvas" style="width:100%; height:100%; display:block; touch-action:none; cursor:pointer;"></canvas>

      <!-- ゲームオーバーオーバーレイ -->
      <div id="pm-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.86); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center;">
        <h3 style="color:#ff8a8a; font-size:1.25rem; letter-spacing:2px; font-weight:300;">ORBIT OVERFLOW</h3>
        <p id="pm-overlay-desc" style="color:#8192b4; font-size:0.85rem; line-height:1.65;"></p>
        <button id="pm-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">PLAY AGAIN</button>
      </div>
    </div>

    <!-- 進化ガイドバー -->
    <div id="pm-evo-bar" style="display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px; flex-wrap:wrap; max-width:390px;"></div>
  `;

  const canvas = document.getElementById('pm-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('pm-score');
  const nextDotEl = document.getElementById('pm-next-dot');
  const nextNameEl = document.getElementById('pm-next-name');
  const overlayEl = document.getElementById('pm-overlay');
  const overlayDescEl = document.getElementById('pm-overlay-desc');
  const retryBtn = document.getElementById('pm-retry-btn');
  const evoBarEl = document.getElementById('pm-evo-bar');

  PLANET_TIERS.forEach((p, idx) => {
    const dot = document.createElement('span');
    const sz = 8 + idx * 1.0;
    dot.title = p.name;
    dot.style.cssText = `display:inline-block; width:${sz}px; height:${sz}px; border-radius:50%; background:${p.color}; box-shadow:0 0 6px ${p.glow};`;
    evoBarEl.appendChild(dot);
    if (idx < PLANET_TIERS.length - 1) {
      const arrow = document.createElement('span');
      arrow.textContent = '›';
      arrow.style.cssText = 'color:#556688; font-size:0.75rem;';
      evoBarEl.appendChild(arrow);
    }
  });

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }

  function getBoxBounds() {
    const boxW = DIFFICULTY_SETTINGS[currentDiff].boxW;
    const left = (WORLD_W - boxW) / 2;
    const right = (WORLD_W + boxW) / 2;
    return { left, right, boxW };
  }

  function pickDropTier() {
    const maxT = DIFFICULTY_SETTINGS[currentDiff].maxDropTier;
    return Math.floor(Math.random() * (maxT + 1));
  }

  function updateNextUI() {
    const info = PLANET_TIERS[nextTier];
    nextDotEl.style.background = info.color;
    nextDotEl.style.boxShadow = `0 0 8px ${info.glow}`;
    nextNameEl.textContent = info.name;
  }

  function clampAimX(rawX) {
    const { left, right } = getBoxBounds();
    const r = PLANET_TIERS[currentTier].r;
    return Math.max(left + r + 2, Math.min(right - r - 2, rawX));
  }

  function startNewGame() {
    planets = [];
    effects = [];
    nextId = 1;
    score = 0;
    isGameOver = false;
    dropCooldown = 0;

    scoreEl.textContent = '0';
    overlayEl.style.display = 'none';

    currentTier = pickDropTier();
    nextTier = pickDropTier();
    aimX = WORLD_W / 2;
    updateNextUI();
  }

  function dropPlanet() {
    if (isGameOver || dropCooldown > 0) return;

    const info = PLANET_TIERS[currentTier];
    const safeX = clampAimX(aimX);

    planets.push({
      id: nextId++,
      x: safeX,
      y: 66,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 1.5,
      angle: (Math.random() - 0.5) * 0.4,
      vAngle: 0,
      tier: currentTier,
      r: info.r,
      scale: 1,
      overflowFrames: 0
    });

    currentTier = nextTier;
    nextTier = pickDropTier();
    aimX = clampAimX(aimX);
    updateNextUI();
    dropCooldown = 22;
  }

  function spawnMergeEffect(x, y, color, gainScore, isSuper = false) {
    effects.push({
      type: 'ring',
      x, y,
      r: 8,
      maxR: isSuper ? 85 : 44,
      alpha: 0.9,
      color
    });
    effects.push({
      type: 'text',
      x, y: y - 10,
      vy: -0.9,
      alpha: 1,
      color: isSuper ? '#ffe875' : '#ffffff',
      text: `+${gainScore}`
    });
    const sparkCount = isSuper ? 18 : 9;
    for (let i = 0; i < sparkCount; i++) {
      const a = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.3;
      const spd = 1.2 + Math.random() * (isSuper ? 3.5 : 2.2);
      effects.push({
        type: 'spark',
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        alpha: 1,
        size: isSuper ? 2.6 : 1.8,
        color
      });
    }
  }

  function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;

    if (score > 0) {
      recordGameScore('10', score, `pt (${currentDiff})`);
    }

    overlayDescEl.innerHTML = `星々が軌道から溢れました。<br>FINAL SCORE: <strong style="color:#f3d463; font-size:1.3rem; font-weight:400;">${score} pt</strong><br><span style="font-size:0.78rem;">難易度: ${currentDiff}</span>`;
    overlayEl.style.display = 'flex';
  }

  function updatePhysics() {
    if (isGameOver) return;

    if (dropCooldown > 0) dropCooldown--;

    const { left, right } = getBoxBounds();
    const SUBSTEPS = 6;
    const dt = 1 / SUBSTEPS;
    const gravity = 0.42;

    for (let step = 0; step < SUBSTEPS; step++) {
      for (const p of planets) {
        p.vy += gravity * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.992, dt);
        p.vAngle = p.vx / Math.max(10, p.r);

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.vAngle * dt;

        if (p.scale > 1) {
          p.scale = Math.max(1, p.scale - 0.04 * dt);
        }

        if (p.x - p.r < left) {
          p.x = left + p.r;
          p.vx = Math.abs(p.vx) * 0.25;
        } else if (p.x + p.r > right) {
          p.x = right - p.r;
          p.vx = -Math.abs(p.vx) * 0.25;
        }

        if (p.y + p.r > FLOOR_Y) {
          p.y = FLOOR_Y - p.r;
          if (p.vy > 0) p.vy = -p.vy * 0.14;
          p.vx *= 0.92;
        }
      }

      const mergedIds = new Set();
      const newPlanets = [];

      for (let i = 0; i < planets.length; i++) {
        const a = planets[i];
        if (mergedIds.has(a.id)) continue;

        for (let j = i + 1; j < planets.length; j++) {
          const b = planets[j];
          if (mergedIds.has(b.id)) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r;

          if (dist < minDist) {
            if (a.tier === b.tier) {
              mergedIds.add(a.id);
              mergedIds.add(b.id);

              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;

              if (a.tier < PLANET_TIERS.length - 1) {
                const nextInfo = PLANET_TIERS[a.tier + 1];
                score += nextInfo.score;
                scoreEl.textContent = score;
                spawnMergeEffect(midX, midY, nextInfo.color, nextInfo.score, false);

                newPlanets.push({
                  id: nextId++,
                  x: Math.max(left + nextInfo.r, Math.min(right - nextInfo.r, midX)),
                  y: Math.min(FLOOR_Y - nextInfo.r, midY),
                  vx: (a.vx + b.vx) * 0.3,
                  vy: -1.1,
                  angle: (a.angle + b.angle) * 0.5,
                  vAngle: 0,
                  tier: nextInfo.tier,
                  r: nextInfo.r,
                  scale: 1.22,
                  overflowFrames: 0
                });
              } else {
                const superBonus = 1000;
                score += superBonus;
                scoreEl.textContent = score;
                spawnMergeEffect(midX, midY, '#ffe875', superBonus, true);
              }
              break;
            } else {
              const overlap = minDist - dist;
              const nx = dist > 0.0001 ? dx / dist : 0;
              const ny = dist > 0.0001 ? dy / dist : -1;

              const massA = a.r * a.r;
              const massB = b.r * b.r;
              const totalMass = massA + massB;
              const ratioA = massB / totalMass;
              const ratioB = massA / totalMass;

              const correction = overlap * 0.65;
              a.x -= nx * correction * ratioA;
              a.y -= ny * correction * ratioA;
              b.x += nx * correction * ratioB;
              b.y += ny * correction * ratioB;

              const rvx = b.vx - a.vx;
              const rvy = b.vy - a.vy;
              const velAlongNormal = rvx * nx + rvy * ny;

              if (velAlongNormal < 0) {
                const restitution = 0.12;
                const impulse = -(1 + restitution) * velAlongNormal;
                a.vx -= impulse * nx * ratioA;
                a.vy -= impulse * ny * ratioA;
                b.vx += impulse * nx * ratioB;
                b.vy += impulse * ny * ratioB;

                const tx = -ny;
                const velTangent = rvx * tx + rvy * nx;
                a.vx += velTangent * tx * 0.04 * ratioA;
                b.vx -= velTangent * tx * 0.04 * ratioB;
              }
            }
          }
        }
      }

      if (mergedIds.size > 0) {
        planets = planets.filter(p => !mergedIds.has(p.id)).concat(newPlanets);
      }
    }

    for (const p of planets) {
      if (p.y - p.r < DEADLINE_Y && Math.abs(p.vy) < 1.2) {
        p.overflowFrames++;
        if (p.overflowFrames > 90) {
          triggerGameOver();
          return;
        }
      } else {
        p.overflowFrames = Math.max(0, p.overflowFrames - 2);
      }
    }

    for (let i = effects.length - 1; i >= 0; i--) {
      const ef = effects[i];
      if (ef.type === 'ring') {
        ef.r += (ef.maxR - ef.r) * 0.16;
        ef.alpha -= 0.04;
      } else if (ef.type === 'text') {
        ef.y += ef.vy;
        ef.alpha -= 0.025;
      } else {
        ef.x += ef.vx;
        ef.y += ef.vy;
        ef.vx *= 0.95;
        ef.vy *= 0.95;
        ef.alpha -= 0.035;
      }
      if (ef.alpha <= 0) effects.splice(i, 1);
    }
  }

  // 本物の天体らしい模様・テクスチャを描き込む関数
  function drawPlanet(x, y, tier, scale = 1, alpha = 1, angle = 0) {
    const info = PLANET_TIERS[tier];
    const r = info.r * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    // 外周の大気・コロナ発光
    ctx.shadowColor = info.glow;
    ctx.shadowBlur = tier >= 7 ? 18 : 10;

    // ベース球体描画（クリップして内部模様を描く）
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    if (tier === 0) {
      // 0: 星屑（輝く光のコア＋十字のきらめき）
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.5, '#cfe2ff');
      g.addColorStop(1, '#5b82c4');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, 0); ctx.lineTo(r * 0.65, 0);
      ctx.moveTo(0, -r * 0.65); ctx.lineTo(0, r * 0.65);
      ctx.stroke();
    } else if (tier === 1) {
      // 1: 小惑星（岩石の陰影と小さなクレーター）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
      g.addColorStop(0, '#c8d6eb');
      g.addColorStop(0.6, '#7a8fb3');
      g.addColorStop(1, '#394661');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(40, 50, 75, 0.35)';
      ctx.beginPath();
      ctx.arc(-r * 0.25, r * 0.2, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.3, -r * 0.15, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else if (tier === 2) {
      // 2: 水星（青緑の濃淡＋クレーター環）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
      g.addColorStop(0, '#d8f7f5');
      g.addColorStop(0.6, '#62b6b7');
      g.addColorStop(1, '#2b5866');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.strokeStyle = 'rgba(220, 255, 250, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(r * 0.2, r * 0.2, r * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tier === 3) {
      // 3: 火星（赤い砂漠の模様＋北極の白い極冠）
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, 2, 0, 0, r);
      g.addColorStop(0, '#f4a261');
      g.addColorStop(0.55, '#d65a31');
      g.addColorStop(1, '#6b2416');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      // 暗い岩盤模様
      ctx.fillStyle = 'rgba(90, 25, 15, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.15, r * 0.1, r * 0.45, r * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // 極冠（氷）
      ctx.fillStyle = 'rgba(255, 245, 238, 0.75)';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.85, r * 0.38, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (tier === 4) {
      // 4: 金星（渦巻く黄金の厚い雲の縞模様）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 3, 0, 0, r);
      g.addColorStop(0, '#fff3d6');
      g.addColorStop(0.6, '#e09f3e');
      g.addColorStop(1, '#7f4f24');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.strokeStyle = 'rgba(255, 245, 210, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.25);
      ctx.quadraticCurveTo(0, -r * 0.05, r, -r * 0.3);
      ctx.moveTo(-r, r * 0.25);
      ctx.quadraticCurveTo(0, r * 0.45, r, r * 0.2);
      ctx.stroke();
    } else if (tier === 5) {
      // 5: 地球（深い青い海＋大陸シルエット＋白い雲）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 3, 0, 0, r);
      g.addColorStop(0, '#90e0ef');
      g.addColorStop(0.55, '#1d70b8');
      g.addColorStop(1, '#0b2545');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      // 緑の大陸
      ctx.fillStyle = 'rgba(106, 190, 117, 0.78)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.25, -r * 0.15, r * 0.36, r * 0.24, 0.4, 0, Math.PI * 2);
      ctx.ellipse(r * 0.32, r * 0.22, r * 0.28, r * 0.32, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // 白い雲の流れ
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.4);
      ctx.quadraticCurveTo(0, -r * 0.2, r * 0.6, -r * 0.45);
      ctx.stroke();
    } else if (tier === 6) {
      // 6: 海王星（群青の縞＋大暗斑）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
      g.addColorStop(0, '#9d9eff');
      g.addColorStop(0.6, '#4346b8');
      g.addColorStop(1, '#1b1d5e');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(20, 22, 85, 0.5)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.2, r * 0.15, r * 0.26, r * 0.15, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tier === 7) {
      // 7: 土星本体（クリーム〜黄金の縞模様）
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 4, 0, 0, r);
      g.addColorStop(0, '#fff9db');
      g.addColorStop(0.6, '#e6b84c');
      g.addColorStop(1, '#7a5918');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(130, 90, 20, 0.22)';
      ctx.fillRect(-r, -r * 0.2, r * 2, r * 0.16);
      ctx.fillRect(-r, r * 0.22, r * 2, r * 0.14);
    } else if (tier === 8) {
      // 8: 太陽（燃えるコロナと粒状斑）
      const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      g.addColorStop(0, '#fff8d6');
      g.addColorStop(0.5, '#ff9f1c');
      g.addColorStop(0.85, '#e71d36');
      g.addColorStop(1, '#800f2f');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(255, 240, 150, 0.35)';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.2, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.28, r * 0.18, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (tier === 9) {
      // 9: 満月（リアルな月の海模様とクレーター）
      const g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.65, '#f7dc6f');
      g.addColorStop(1, '#b7950b');
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      // 月の海（静かの海・嵐の大洋の陰影）
      ctx.fillStyle = 'rgba(155, 130, 45, 0.26)';
      ctx.beginPath();
      ctx.arc(-r * 0.22, -r * 0.18, r * 0.26, 0, Math.PI * 2);
      ctx.arc(r * 0.18, -r * 0.24, r * 0.18, 0, Math.PI * 2);
      ctx.arc(-r * 0.05, r * 0.18, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.28, r * 0.16, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // クレーターの縁
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-r * 0.32, r * 0.35, r * 0.11, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore(); // クリップ解除

    // 球体の輪郭ハイライト
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // 土星（tier 7）は球体の外側に手前の二重リングを描画
    if (tier === 7) {
      ctx.save();
      ctx.rotate(angle - 0.25);
      ctx.strokeStyle = 'rgba(255, 245, 190, 0.85)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.28, r * 0.32, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(230, 190, 100, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.15, r * 0.26, 0, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function renderLoop() {
    if (!document.getElementById('pm-canvas')) {
      cancelAnimationFrame(animFrameId);
      return;
    }

    updatePhysics();

    const dpr = window.devicePixelRatio || 1;
    const scaleX = (canvas.width / dpr) / WORLD_W;
    const scaleY = (canvas.height / dpr) / WORLD_H;

    ctx.save();
    ctx.scale(dpr * scaleX, dpr * scaleY);
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);

    const { left, right, boxW } = getBoxBounds();

    // 宇宙ボックス（スリムで遊びやすいコンテナ）
    ctx.save();
    ctx.fillStyle = 'rgba(12, 18, 38, 0.58)';
    ctx.beginPath();
    ctx.roundRect(left, DEADLINE_Y - 12, boxW, FLOOR_Y - DEADLINE_Y + 12, [0, 0, 14, 14]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(160, 185, 255, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, DEADLINE_Y - 12);
    ctx.lineTo(left, FLOOR_Y - 10);
    ctx.quadraticCurveTo(left, FLOOR_Y, left + 10, FLOOR_Y);
    ctx.lineTo(right - 10, FLOOR_Y);
    ctx.quadraticCurveTo(right, FLOOR_Y, right, FLOOR_Y - 10);
    ctx.lineTo(right, DEADLINE_Y - 12);
    ctx.stroke();
    ctx.restore();

    // デッドライン
    const isDanger = planets.some(p => p.overflowFrames > 15);
    ctx.save();
    ctx.strokeStyle = isDanger ? 'rgba(255, 110, 110, 0.78)' : 'rgba(243, 212, 99, 0.28)';
    ctx.lineWidth = isDanger ? 1.8 : 1.2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(left + 4, DEADLINE_Y);
    ctx.lineTo(right - 4, DEADLINE_Y);
    ctx.stroke();
    ctx.restore();

    // 落下ガイド線＆操作中の惑星プレビュー
    if (!isGameOver) {
      const safeX = clampAimX(aimX);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(safeX, 66);
      ctx.lineTo(safeX, FLOOR_Y);
      ctx.stroke();
      ctx.restore();

      const previewAlpha = dropCooldown > 0 ? 0.35 : 0.94;
      drawPlanet(safeX, 66, currentTier, 1, previewAlpha, 0);
    }

    // 積み上がった全惑星を描画
    for (const p of planets) {
      drawPlanet(p.x, p.y, p.tier, p.scale, 1, p.angle);
    }

    // 合体エフェクト描画
    for (const ef of effects) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ef.alpha);
      if (ef.type === 'ring') {
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ef.type === 'text') {
        ctx.fillStyle = ef.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ef.text, ef.x, ef.y);
      } else {
        ctx.fillStyle = ef.color;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, ef.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
    animFrameId = requestAnimationFrame(renderLoop);
  }

  function updateAimFromClientX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const norm = (clientX - rect.left) / rect.width;
    aimX = clampAimX(norm * WORLD_W);
  }

  let pointerDown = false;
  canvas.addEventListener('pointerdown', (e) => {
    if (isGameOver) return;
    pointerDown = true;
    updateAimFromClientX(e.clientX);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (isGameOver) return;
    if (pointerDown || e.pointerType === 'mouse') {
      updateAimFromClientX(e.clientX);
    }
  });
  window.addEventListener('pointerup', () => {
    if (pointerDown) {
      pointerDown = false;
      dropPlanet();
    }
  });

  function onKeyDown(e) {
    if (!document.getElementById('pm-canvas') || isGameOver) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      aimX = clampAimX(aimX - 14);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      aimX = clampAimX(aimX + 14);
    } else if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      dropPlanet();
    }
  }
  window.addEventListener('keydown', onKeyDown);

  document.querySelectorAll('.pm-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pm-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDiff = target.dataset.diff;
      startNewGame();
    });
  });

  retryBtn.addEventListener('click', startNewGame);
  document.getElementById('pm-reset-btn').addEventListener('click', startNewGame);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  startNewGame();
  animFrameId = requestAnimationFrame(renderLoop);
}

// ==================================================
// 11. Sudoku (夜空の静寂に浸るロジックパズル + 数字固定＆ヒント制限)
// ==================================================
function initSudokuGame(container) {
  const DIFFICULTY_SETTINGS = {
    NORMAL: { emptyCount: 34, maxHints: 3, label: 'NORMAL' },
    HARD: { emptyCount: 44, maxHints: 2, label: 'HARD' },
    EXPERT: { emptyCount: 52, maxHints: 1, label: 'EXPERT' }
  };

  let currentDiff = 'NORMAL';
  let solution = [];
  let board = [];
  let fixed = [];
  let notes = [];
  let selected = { r: 4, c: 4 };
  let isMemoMode = false;
  let isNumberLock = false;
  let lockedNum = null;
  let mistakes = 0;
  const MAX_MISTAKES = 3;
  let hintsLeft = 3;
  let elapsedSec = 0;
  let timerId = null;
  let isGameOver = false;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">11. Sudoku</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">縦・横・3×3のブロックに1〜9の数字を重複なく埋めよう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:12px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; justify-content:center;">
      <button class="sdk-diff-btn active" data-diff="NORMAL" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL</button>
      <button class="sdk-diff-btn" data-diff="HARD" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD</button>
      <button class="sdk-diff-btn" data-diff="EXPERT" style="background:transparent; color:#7a8ba9; border:none; padding:5px 12px; border-radius:6px; cursor:pointer; font-size:0.78rem;">EXPERT</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:360px; font-size:0.85rem; color:#8192b4; margin-bottom:10px;">
      <span>MISTAKE: <strong id="sdk-mistake" style="color:#ff8a8a;">0 / 3</strong></span>
      <span>TIME: <strong id="sdk-time" style="color:#f3d463;">00:00</strong></span>
      <button id="sdk-new-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">新しい盤面</button>
    </div>

    <!-- 9x9 盤面エリア -->
    <div style="position:relative; width:100%; max-width:360px; aspect-ratio:1 / 1; background:rgba(10, 15, 32, 0.92); border:1.5px solid rgba(160, 185, 255, 0.35); border-radius:10px; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.5);">
      <div id="sdk-grid" style="display:grid; grid-template-columns:repeat(9, 1fr); grid-template-rows:repeat(9, 1fr); width:100%; height:100%; user-select:none;"></div>

      <!-- クリア / ゲームオーバーオーバーレイ -->
      <div id="sdk-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.88); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center;">
        <h3 id="sdk-overlay-title" style="color:#f3d463; font-size:1.3rem; letter-spacing:2px; font-weight:300;"></h3>
        <p id="sdk-overlay-desc" style="color:#8192b4; font-size:0.85rem; line-height:1.65;"></p>
        <button id="sdk-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">NEXT PUZZLE</button>
      </div>
    </div>

    <!-- ツールボタン -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-top:12px; width:100%; max-width:360px;">
      <button id="sdk-lock-btn" style="background:rgba(255,255,255,0.05); color:#8192b4; border:1px solid rgba(255,255,255,0.12); padding:7px 4px; border-radius:8px; cursor:pointer; font-size:0.75rem;">🔒 固定: OFF</button>
      <button id="sdk-memo-btn" style="background:rgba(255,255,255,0.05); color:#8192b4; border:1px solid rgba(255,255,255,0.12); padding:7px 4px; border-radius:8px; cursor:pointer; font-size:0.75rem;">✎ メモ: OFF</button>
      <button id="sdk-erase-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:7px 4px; border-radius:8px; cursor:pointer; font-size:0.75rem;">⌫ 消去</button>
      <button id="sdk-hint-btn" style="background:rgba(243,212,99,0.12); color:#f3d463; border:1px solid rgba(243,212,99,0.3); padding:7px 4px; border-radius:8px; cursor:pointer; font-size:0.75rem;">✦ ヒント (3)</button>
    </div>

    <!-- 数字入力パッド (1〜9) -->
    <div id="sdk-numpad" style="display:grid; grid-template-columns:repeat(9, 1fr); gap:5px; width:100%; max-width:360px; margin-top:10px;"></div>
  `;

  const gridEl = document.getElementById('sdk-grid');
  const numpadEl = document.getElementById('sdk-numpad');
  const mistakeEl = document.getElementById('sdk-mistake');
  const timeEl = document.getElementById('sdk-time');
  const lockBtn = document.getElementById('sdk-lock-btn');
  const memoBtn = document.getElementById('sdk-memo-btn');
  const hintBtn = document.getElementById('sdk-hint-btn');
  const overlayEl = document.getElementById('sdk-overlay');
  const overlayTitleEl = document.getElementById('sdk-overlay-title');
  const overlayDescEl = document.getElementById('sdk-overlay-desc');

  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.dataset.num = n;
    btn.style.cssText = `
      aspect-ratio: 1 / 1.15;
      background: rgba(160, 185, 255, 0.1);
      color: #e1e6f0;
      border: 1px solid rgba(160, 185, 255, 0.22);
      border-radius: 7px;
      font-size: 1.05rem;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, transform 0.1s;
    `;
    btn.addEventListener('click', () => {
      if (isGameOver) return;
      if (isNumberLock) {
        lockedNum = (lockedNum === n) ? null : n;
        renderBoard();
      } else {
        handleNumberInput(n);
      }
    });
    numpadEl.appendChild(btn);
  }

  function updateHintButtonUI() {
    hintBtn.textContent = `✦ ヒント (${hintsLeft})`;
    if (hintsLeft <= 0) {
      hintBtn.disabled = true;
      hintBtn.style.opacity = '0.35';
      hintBtn.style.cursor = 'not-allowed';
      hintBtn.style.background = 'rgba(255,255,255,0.03)';
      hintBtn.style.color = '#7a8ba9';
      hintBtn.style.borderColor = 'rgba(255,255,255,0.08)';
    } else {
      hintBtn.disabled = false;
      hintBtn.style.opacity = '1';
      hintBtn.style.cursor = 'pointer';
      hintBtn.style.background = 'rgba(243,212,99,0.12)';
      hintBtn.style.color = '#f3d463';
      hintBtn.style.borderColor = 'rgba(243,212,99,0.3)';
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function isSafe(grid, r, c, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num || grid[i][c] === num) return false;
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[br + i][bc + j] === num) return false;
      }
    }
    return true;
  }

  function fillSolvedBoard(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const n of nums) {
            if (isSafe(grid, r, c, n)) {
              grid[r][c] = n;
              if (fillSolvedBoard(grid)) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function countSolutions(grid, limit = 2) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          let count = 0;
          for (let n = 1; n <= 9; n++) {
            if (isSafe(grid, r, c, n)) {
              grid[r][c] = n;
              count += countSolutions(grid, limit);
              grid[r][c] = 0;
              if (count >= limit) return count;
            }
          }
          return count;
        }
      }
    }
    return 1;
  }

  function generatePuzzle(emptyTarget) {
    const full = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillSolvedBoard(full);
    solution = full.map(row => [...row]);

    const puzzle = full.map(row => [...row]);
    const coords = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) coords.push([r, c]);
    }
    shuffle(coords);

    let removed = 0;
    for (const [r, c] of coords) {
      if (removed >= emptyTarget) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;

      const copy = puzzle.map(row => [...row]);
      if (countSolutions(copy, 2) !== 1) {
        puzzle[r][c] = backup;
      } else {
        removed++;
      }
    }

    board = puzzle.map(row => [...row]);
    fixed = puzzle.map(row => row.map(v => v !== 0));
    notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    elapsedSec = 0;
    timeEl.textContent = '00:00';
    timerId = setInterval(() => {
      if (!document.getElementById('sdk-grid')) {
        clearInterval(timerId);
        return;
      }
      if (!isGameOver) {
        elapsedSec++;
        timeEl.textContent = formatTime(elapsedSec);
      }
    }, 1000);
  }

  function startNewGame() {
    isGameOver = false;
    mistakes = 0;
    hintsLeft = DIFFICULTY_SETTINGS[currentDiff].maxHints;
    mistakeEl.textContent = `0 / ${MAX_MISTAKES}`;
    overlayEl.style.display = 'none';
    selected = { r: 4, c: 4 };

    updateHintButtonUI();
    generatePuzzle(DIFFICULTY_SETTINGS[currentDiff].emptyCount);
    startTimer();
    renderBoard();
  }

  function clearPeerNotes(r, c, num) {
    for (let i = 0; i < 9; i++) {
      notes[r][i].delete(num);
      notes[i][c].delete(num);
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        notes[br + i][bc + j].delete(num);
      }
    }
  }

  function checkVictory() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }

  function finishGame(isWin) {
    isGameOver = true;
    clearInterval(timerId);

    if (isWin) {
      recordGameScore('11', elapsedSec, `sec (${currentDiff})`);
      overlayTitleEl.textContent = 'CONSTELLATION COMPLETE';
      overlayTitleEl.style.color = '#f3d463';
      overlayDescEl.innerHTML = `すべての数字が美しく調和しました。<br>クリアタイム: <strong style="color:#f3d463; font-size:1.25rem; font-weight:400;">${formatTime(elapsedSec)}</strong><br><span style="font-size:0.78rem;">難易度: ${currentDiff} / ミス: ${mistakes}回</span>`;
    } else {
      overlayTitleEl.textContent = 'ORBIT DISRUPTED';
      overlayTitleEl.style.color = '#ff8a8a';
      overlayDescEl.innerHTML = `ミスが上限に達しました。<br>もう一度落ち着いて挑戦してみましょう。`;
    }
    overlayEl.style.display = 'flex';
  }

  function handleNumberInput(num) {
    if (isGameOver) return;
    const { r, c } = selected;
    if (fixed[r][c]) return;

    if (isMemoMode) {
      if (board[r][c] !== 0) return;
      if (notes[r][c].has(num)) {
        notes[r][c].delete(num);
      } else {
        notes[r][c].add(num);
      }
      renderBoard();
      return;
    }

    if (isNumberLock && board[r][c] === num) {
      board[r][c] = 0;
      renderBoard();
      return;
    }

    if (board[r][c] === solution[r][c]) return;

    board[r][c] = num;
    notes[r][c].clear();

    if (num !== solution[r][c]) {
      mistakes++;
      mistakeEl.textContent = `${mistakes} / ${MAX_MISTAKES}`;
      renderBoard();
      if (mistakes >= MAX_MISTAKES) {
        finishGame(false);
      }
      return;
    }

    clearPeerNotes(r, c, num);
    renderBoard();

    if (checkVictory()) {
      finishGame(true);
    }
  }

  function handleErase() {
    if (isGameOver) return;
    const { r, c } = selected;
    if (fixed[r][c] || board[r][c] === solution[r][c]) return;
    board[r][c] = 0;
    notes[r][c].clear();
    renderBoard();
  }

  function handleHint() {
    if (isGameOver || hintsLeft <= 0) return;
    const { r, c } = selected;
    if (fixed[r][c] || board[r][c] === solution[r][c]) {
      const empties = [];
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] !== solution[i][j]) empties.push([i, j]);
        }
      }
      if (empties.length === 0) return;
      const [tr, tc] = empties[Math.floor(Math.random() * empties.length)];
      selected = { r: tr, c: tc };
    }

    hintsLeft--;
    updateHintButtonUI();

    const { r: sr, c: sc } = selected;
    const ans = solution[sr][sc];
    board[sr][sc] = ans;
    fixed[sr][sc] = true;
    notes[sr][sc].clear();
    clearPeerNotes(sr, sc, ans);
    renderBoard();

    if (checkVictory()) {
      finishGame(true);
    }
  }

  function renderBoard() {
    gridEl.innerHTML = '';

    const highlightNum = (isNumberLock && lockedNum !== null)
      ? lockedNum
      : board[selected.r][selected.c];

    const selBoxR = Math.floor(selected.r / 3);
    const selBoxC = Math.floor(selected.c / 3);

    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === solution[r][c]) counts[board[r][c]]++;
      }
    }

    numpadEl.querySelectorAll('button').forEach(btn => {
      const n = Number(btn.dataset.num);
      const isDone = counts[n] >= 9;
      const isLockedTarget = isNumberLock && lockedNum === n;

      btn.style.opacity = isDone && !isLockedTarget ? '0.28' : '1';
      if (isLockedTarget) {
        btn.style.background = 'rgba(243, 212, 99, 0.28)';
        btn.style.borderColor = '#f3d463';
        btn.style.color = '#fff4c2';
        btn.style.boxShadow = '0 0 10px rgba(243, 212, 99, 0.35)';
      } else {
        btn.style.background = 'rgba(160, 185, 255, 0.1)';
        btn.style.borderColor = 'rgba(160, 185, 255, 0.22)';
        btn.style.color = '#e1e6f0';
        btn.style.boxShadow = 'none';
      }
    });

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        const val = board[r][c];
        const isSel = r === selected.r && c === selected.c;
        const isPeer = !isSel && (
          r === selected.r ||
          c === selected.c ||
          (Math.floor(r / 3) === selBoxR && Math.floor(c / 3) === selBoxC)
        );
        const isSameNum = val !== 0 && highlightNum !== 0 && val === highlightNum;
        const hasLockedNote = val === 0 && highlightNum !== 0 && notes[r][c].has(highlightNum);
        const isWrong = val !== 0 && val !== solution[r][c];

        let bg = 'transparent';
        if (isNumberLock && lockedNum !== null) {
          if (isSameNum) bg = 'rgba(243, 212, 99, 0.32)';
          else if (hasLockedNote) bg = 'rgba(243, 212, 99, 0.14)';
          else if (isSel) bg = 'rgba(160, 185, 255, 0.16)';
        } else {
          if (isSel) bg = 'rgba(243, 212, 99, 0.24)';
          else if (isSameNum) bg = 'rgba(160, 200, 255, 0.24)';
          else if (isPeer) bg = 'rgba(160, 185, 255, 0.08)';
        }

        const borderRight = (c === 2 || c === 5)
          ? '1.5px solid rgba(160, 185, 255, 0.42)'
          : (c === 8 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)');
        const borderBottom = (r === 2 || r === 5)
          ? '1.5px solid rgba(160, 185, 255, 0.42)'
          : (r === 8 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)');

        cell.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${bg};
          border-right: ${borderRight};
          border-bottom: ${borderBottom};
          cursor: pointer;
          position: relative;
          font-size: 1.15rem;
          font-weight: ${fixed[r][c] || isSameNum ? '600' : '400'};
          color: ${isWrong ? '#ff7b7b' : (isSameNum && isNumberLock ? '#fff4b8' : (fixed[r][c] ? '#e1e6f0' : '#8ce6d8'))};
        `;

        if (val !== 0) {
          cell.textContent = val;
        } else if (notes[r][c].size > 0) {
          const noteGrid = document.createElement('div');
          noteGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); width:88%; height:88%; font-size:0.55rem; color:#7a8ba9; line-height:1; place-items:center;';
          for (let n = 1; n <= 9; n++) {
            const s = document.createElement('span');
            if (notes[r][c].has(n)) {
              s.textContent = n;
              if (n === highlightNum) {
                s.style.color = '#f3d463';
                s.style.fontWeight = 'bold';
              }
            }
            noteGrid.appendChild(s);
          }
          cell.appendChild(noteGrid);
        }

        cell.addEventListener('click', () => {
          selected = { r, c };
          if (isNumberLock && lockedNum !== null) {
            handleNumberInput(lockedNum);
          } else {
            renderBoard();
          }
        });

        gridEl.appendChild(cell);
      }
    }
  }

  function onKeyDown(e) {
    if (!document.getElementById('sdk-grid') || isGameOver) return;
    if (e.key >= '1' && e.key <= '9') {
      const n = Number(e.key);
      if (isNumberLock) {
        lockedNum = (lockedNum === n) ? null : n;
        renderBoard();
      } else {
        handleNumberInput(n);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleErase();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected.r = (selected.r + 8) % 9;
      renderBoard();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected.r = (selected.r + 1) % 9;
      renderBoard();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selected.c = (selected.c + 8) % 9;
      renderBoard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selected.c = (selected.c + 1) % 9;
      renderBoard();
    } else if (e.key === 'm' || e.key === 'M') {
      memoBtn.click();
    } else if (e.key === 'l' || e.key === 'L') {
      lockBtn.click();
    }
  }
  window.addEventListener('keydown', onKeyDown);

  lockBtn.addEventListener('click', () => {
    isNumberLock = !isNumberLock;
    if (isNumberLock) {
      const curVal = board[selected.r][selected.c];
      lockedNum = curVal !== 0 ? curVal : 1;
      lockBtn.textContent = '🔒 固定: ON';
      lockBtn.style.background = 'rgba(243, 212, 99, 0.22)';
      lockBtn.style.color = '#f3d463';
      lockBtn.style.borderColor = 'rgba(243, 212, 99, 0.45)';
    } else {
      lockedNum = null;
      lockBtn.textContent = '🔒 固定: OFF';
      lockBtn.style.background = 'rgba(255,255,255,0.05)';
      lockBtn.style.color = '#8192b4';
      lockBtn.style.borderColor = 'rgba(255,255,255,0.12)';
    }
    renderBoard();
  });

  memoBtn.addEventListener('click', () => {
    isMemoMode = !isMemoMode;
    memoBtn.textContent = isMemoMode ? '✎ メモ: ON' : '✎ メモ: OFF';
    memoBtn.style.background = isMemoMode ? 'rgba(160, 200, 255, 0.2)' : 'rgba(255,255,255,0.05)';
    memoBtn.style.color = isMemoMode ? '#a0c8ff' : '#8192b4';
    memoBtn.style.borderColor = isMemoMode ? 'rgba(160, 200, 255, 0.4)' : 'rgba(255,255,255,0.12)';
  });

  document.getElementById('sdk-erase-btn').addEventListener('click', handleErase);
  hintBtn.addEventListener('click', handleHint);
  document.getElementById('sdk-new-btn').addEventListener('click', startNewGame);
  document.getElementById('sdk-retry-btn').addEventListener('click', startNewGame);

  document.querySelectorAll('.sdk-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sdk-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentDiff = target.dataset.diff;
      startNewGame();
    });
  });

  startNewGame();
}

// ==================================================
// 12. Solitaire (夜空のクロンダイク・ソリティア / 詰み判定＆滑らかアニメーション対応)
// ==================================================
function initSolitaireGame(container) {
  const SUITS = [
    { id: 'spade', symbol: '♠', color: 'black' },
    { id: 'heart', symbol: '♥', color: 'red' },
    { id: 'club', symbol: '♣', color: 'black' },
    { id: 'diamond', symbol: '♦', color: 'red' }
  ];

  let drawCount = 1;
  let stock = [];
  let waste = [];
  let foundations = [[], [], [], []];
  let tableau = [[], [], [], [], [], [], []];
  let selected = null;
  let history = [];
  let moves = 0;
  let elapsedSec = 0;
  let timerId = null;
  let isGameOver = false;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">12. Solitaire</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">黒と赤を交互に重ね、4つのスートをAからKまで揃えよう</p>

    <!-- 難易度選択 -->
    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); justify-content:center;">
      <button class="sol-diff-btn active" data-draw="1" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">NORMAL (1枚めくり)</button>
      <button class="sol-diff-btn" data-draw="3" style="background:transparent; color:#7a8ba9; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">HARD (3枚めくり)</button>
    </div>

    <!-- ステータス＆操作ボタン -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:440px; font-size:0.82rem; color:#8192b4; margin-bottom:10px; gap:6px;">
      <span>MOVES: <strong id="sol-moves" style="color:#e1e6f0;">0</strong></span>
      <span>TIME: <strong id="sol-time" style="color:#f3d463;">00:00</strong></span>
      <div style="display:flex; gap:5px;">
        <button id="sol-undo-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 9px; border-radius:6px; cursor:pointer; font-size:0.75rem;">↩ 戻す</button>
        <button id="sol-new-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 9px; border-radius:6px; cursor:pointer; font-size:0.75rem;">配り直す</button>
      </div>
    </div>

    <!-- メイン盤面 -->
    <div id="sol-board-wrap" style="position:relative; width:100%; max-width:440px; min-height:430px; background:rgba(10, 15, 32, 0.85); border:1px solid rgba(160, 185, 255, 0.22); border-radius:14px; padding:12px 8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); user-select:none;">
      
      <!-- 上段: 山札(1列) + めくり札ファン表示(2〜3列) + 組札4枠(4〜7列) -->
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; margin-bottom:14px;">
        <div id="sol-stock" style="aspect-ratio:2.4 / 3.4; border-radius:6px; border:1px dashed rgba(160,185,255,0.3); display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative;"></div>
        <div id="sol-waste" style="grid-column: span 2; position:relative; height:100%;"></div>
        <div class="sol-found" data-fidx="0" style="aspect-ratio:2.4 / 3.4; border-radius:6px; border:1px solid rgba(160,185,255,0.2); background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; color:rgba(160,185,255,0.25); font-size:1.1rem; cursor:pointer; position:relative;">♠</div>
        <div class="sol-found" data-fidx="1" style="aspect-ratio:2.4 / 3.4; border-radius:6px; border:1px solid rgba(160,185,255,0.2); background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; color:rgba(255,140,140,0.25); font-size:1.1rem; cursor:pointer; position:relative;">♥</div>
        <div class="sol-found" data-fidx="2" style="aspect-ratio:2.4 / 3.4; border-radius:6px; border:1px solid rgba(160,185,255,0.2); background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; color:rgba(160,185,255,0.25); font-size:1.1rem; cursor:pointer; position:relative;">♣</div>
        <div class="sol-found" data-fidx="3" style="aspect-ratio:2.4 / 3.4; border-radius:6px; border:1px solid rgba(160,185,255,0.2); background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; color:rgba(255,140,140,0.25); font-size:1.1rem; cursor:pointer; position:relative;">♦</div>
      </div>

      <!-- 下段: 7列の場札 -->
      <div id="sol-tableau" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; min-height:290px;"></div>

      <!-- 自動クリアボタン -->
      <button id="sol-auto-btn" style="display:none; position:absolute; bottom:14px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, rgba(243,212,99,0.28), rgba(160,185,255,0.28)); color:#fff4c2; border:1px solid #f3d463; padding:8px 22px; border-radius:20px; cursor:pointer; font-size:0.85rem; letter-spacing:1px; box-shadow:0 4px 16px rgba(0,0,0,0.6); z-index:20;">✦ 自動クリア</button>

      <!-- クリア / ゲームオーバーオーバーレイ -->
      <div id="sol-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.88); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center; border-radius:14px; z-index:30;">
        <h3 id="sol-overlay-title" style="color:#f3d463; font-size:1.3rem; letter-spacing:2px; font-weight:300;"></h3>
        <p id="sol-overlay-desc" style="color:#8192b4; font-size:0.85rem; line-height:1.65;"></p>
        <div style="display:flex; gap:10px; margin-top:6px; flex-wrap:wrap; justify-content:center;">
          <button id="sol-overlay-undo-btn" style="display:none; background:rgba(255,255,255,0.08); color:#a0c8ff; border:1px solid rgba(160,180,255,0.3); padding:8px 20px; border-radius:6px; cursor:pointer; font-size:0.85rem;">↩ 1手戻す</button>
          <button id="sol-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 26px; border-radius:6px; cursor:pointer; font-size:0.88rem;">PLAY AGAIN</button>
        </div>
      </div>
    </div>

    <p style="color:#5c6d8c; font-size:0.75rem; margin-top:8px; text-align:center;">操作: PC・スマホ共通でダブルクリック（2回タップ）すると組札へ自動移動します</p>
  `;

  const boardWrapEl = document.getElementById('sol-board-wrap');
  const stockEl = document.getElementById('sol-stock');
  const wasteEl = document.getElementById('sol-waste');
  const tableauEl = document.getElementById('sol-tableau');
  const movesEl = document.getElementById('sol-moves');
  const timeEl = document.getElementById('sol-time');
  const autoBtn = document.getElementById('sol-auto-btn');
  const overlayEl = document.getElementById('sol-overlay');
  const overlayTitleEl = document.getElementById('sol-overlay-title');
  const overlayDescEl = document.getElementById('sol-overlay-desc');
  const overlayUndoBtn = document.getElementById('sol-overlay-undo-btn');

  function rankLabel(rank) {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return String(rank);
  }

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    elapsedSec = 0;
    timeEl.textContent = '00:00';
    timerId = setInterval(() => {
      if (!document.getElementById('sol-tableau')) {
        clearInterval(timerId);
        return;
      }
      if (!isGameOver) {
        elapsedSec++;
        timeEl.textContent = formatTime(elapsedSec);
      }
    }, 1000);
  }

  function captureCardPositions() {
    const map = new Map();
    const stockRect = stockEl.getBoundingClientRect();
    map.set('__STOCK__', stockRect);

    boardWrapEl.querySelectorAll('[data-card-id]').forEach(el => {
      map.set(el.dataset.cardId, el.getBoundingClientRect());
    });
    return map;
  }

  function animateCardTransitions(prevPositions, fromStockIds = new Set()) {
    if (!prevPositions) return;
    const stockRect = prevPositions.get('__STOCK__');

    boardWrapEl.querySelectorAll('[data-card-id]').forEach(el => {
      const id = el.dataset.cardId;
      const oldRect = fromStockIds.has(id) ? stockRect : prevPositions.get(id);
      if (!oldRect) return;

      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const origZ = el.style.zIndex;
        el.style.zIndex = '50';
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;

        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';
          el.style.transform = 'translate(0, 0)';
          setTimeout(() => {
            if (el) el.style.zIndex = origZ;
          }, 250);
        });
      }
    });
  }

  function saveHistory() {
    history.push(JSON.stringify({
      stock,
      waste,
      foundations,
      tableau,
      moves
    }));
    if (history.length > 30) history.shift();
  }

  function undoMove() {
    if (history.length === 0) return;
    // ゲームオーバー状態から1手戻す場合も復帰可能にする
    if (isGameOver) {
      isGameOver = false;
      overlayEl.style.display = 'none';
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        if (!document.getElementById('sol-tableau')) {
          clearInterval(timerId);
          return;
        }
        if (!isGameOver) {
          elapsedSec++;
          timeEl.textContent = formatTime(elapsedSec);
        }
      }, 1000);
    }

    const prevPos = captureCardPositions();
    const prev = JSON.parse(history.pop());
    stock = prev.stock;
    waste = prev.waste;
    foundations = prev.foundations;
    tableau = prev.tableau;
    moves = prev.moves;
    selected = null;
    movesEl.textContent = moves;
    renderBoard();
    animateCardTransitions(prevPos);
  }

  function startNewGame() {
    isGameOver = false;
    moves = 0;
    selected = null;
    history = [];
    movesEl.textContent = '0';
    overlayEl.style.display = 'none';
    overlayUndoBtn.style.display = 'none';
    autoBtn.style.display = 'none';

    const deck = [];
    for (let s = 0; s < 4; s++) {
      for (let r = 1; r <= 13; r++) {
        deck.push({
          id: `${s}-${r}`,
          suitIdx: s,
          symbol: SUITS[s].symbol,
          color: SUITS[s].color,
          rank: r,
          faceUp: false
        });
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    waste = [];

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.pop();
        if (row === col) card.faceUp = true;
        tableau[col].push(card);
      }
    }
    stock = deck;

    startTimer();
    renderBoard();

    const dealIds = new Set(tableau.flat().map(c => c.id));
    const stockPos = captureCardPositions();
    animateCardTransitions(stockPos, dealIds);
  }

  function canMoveToFoundation(card, fIdx) {
    if (card.suitIdx !== fIdx) return false;
    const pile = foundations[fIdx];
    if (pile.length === 0) return card.rank === 1;
    return pile[pile.length - 1].rank === card.rank - 1;
  }

  function canMoveToTableau(card, colIdx) {
    const col = tableau[colIdx];
    if (col.length === 0) return card.rank === 13;
    const top = col[col.length - 1];
    return top.faceUp && top.color !== card.color && top.rank === card.rank + 1;
  }

  // 有効な移動手段がまだ残っているか判定
  function hasAnyValidMoves() {
    // 1. 現在のめくり札トップが場札または組札へ移動できるか
    if (waste.length > 0) {
      const wTop = waste[waste.length - 1];
      if (canMoveToFoundation(wTop, wTop.suitIdx)) return true;
      for (let c = 0; c < 7; c++) {
        if (canMoveToTableau(wTop, c)) return true;
      }
    }

    // 2. 山札またはめくり札を回して、今後めくられるカードの中に動かせるものがあるか
    const combinedCycle = [...waste, ...[...stock].reverse()];
    if (combinedCycle.length > 0) {
      if (drawCount === 1) {
        // 1枚めくりならすべてのカードをトップに出せる
        for (const card of combinedCycle) {
          if (canMoveToFoundation(card, card.suitIdx)) return true;
          for (let c = 0; c < 7; c++) {
            if (canMoveToTableau(card, c)) return true;
          }
        }
      } else {
        // 3枚めくり（現状のstock残り＋リサイクル後の3枚刻みトップ候補をチェック）
        const reachable = new Set();
        // 今の山札から順番にめくった時のトップ
        for (let i = stock.length - 1; i >= 0; i -= 3) {
          const idx = Math.max(0, i - 2);
          reachable.add(stock[idx]);
        }
        // リサイクル後に最初からめくった時のトップ
        for (let i = 0; i < combinedCycle.length; i += 3) {
          const idx = Math.min(combinedCycle.length - 1, i + 2);
          reachable.add(combinedCycle[idx]);
        }
        for (const card of reachable) {
          if (canMoveToFoundation(card, card.suitIdx)) return true;
          for (let c = 0; c < 7; c++) {
            if (canMoveToTableau(card, c)) return true;
          }
        }
      }
    }

    // 3. 場札の移動（組札へ移動 / 裏向きカードをめくれる移動 / 空列へのK移動）
    const emptyColCount = tableau.filter(col => col.length === 0).length;
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      const col = tableau[colIdx];
      if (col.length === 0) continue;

      // 一番下のカードが組札へ行くか
      const bottomCard = col[col.length - 1];
      if (canMoveToFoundation(bottomCard, bottomCard.suitIdx)) return true;

      // 表向きカードの束の開始位置を探す
      const firstFaceUpIdx = col.findIndex(c => c.faceUp);
      if (firstFaceUpIdx === -1) continue;

      const leadCard = col[firstFaceUpIdx];
      const hasFaceDownBelow = firstFaceUpIdx > 0;

      // 表向き束の先頭カードを他の列へ動かせるか
      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (targetCol === colIdx) continue;
        if (tableau[targetCol].length === 0) {
          // 空列にKを移すのは、下に裏向きカードがある時だけ意味のある前進
          if (leadCard.rank === 13 && hasFaceDownBelow) return true;
        } else if (canMoveToTableau(leadCard, targetCol)) {
          // 裏向きカードがめくれる、または元の列が空になるなら有効手
          if (hasFaceDownBelow || firstFaceUpIdx === 0) return true;
        }
      }

      // 束の途中のカードが組札へ移動することで、その上のカードが解放されるケース
      for (let k = firstFaceUpIdx + 1; k < col.length; k++) {
        const midCard = col[k];
        // 下のカードを別の列へ退避できるなら有効
        for (let targetCol = 0; targetCol < 7; targetCol++) {
          if (targetCol !== colIdx && canMoveToTableau(midCard, targetCol)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function triggerStalemateGameOver() {
    isGameOver = true;
    clearInterval(timerId);
    const modeName = drawCount === 1 ? 'NORMAL' : 'HARD';
    overlayTitleEl.textContent = 'NO MORE MOVES';
    overlayTitleEl.style.color = '#ff8a8a';
    overlayDescEl.innerHTML = `これ以上動かせるカードがありません（手詰まり）。<br>手数: <strong style="color:#e1e6f0;">${moves}回</strong> / タイム: <strong style="color:#f3d463;">${formatTime(elapsedSec)}</strong><br><span style="font-size:0.78rem;">モード: ${modeName}</span>`;
    overlayUndoBtn.style.display = history.length > 0 ? 'inline-block' : 'none';
    overlayEl.style.display = 'flex';
  }

  function drawFromStock() {
    if (isGameOver) return;
    const prevPos = captureCardPositions();
    const drawnIds = new Set();

    selected = null;
    saveHistory();

    if (stock.length === 0) {
      if (waste.length === 0) {
        history.pop();
        return;
      }
      while (waste.length > 0) {
        const c = waste.pop();
        c.faceUp = false;
        stock.push(c);
      }
    } else {
      const count = Math.min(drawCount, stock.length);
      for (let i = 0; i < count; i++) {
        const c = stock.pop();
        c.faceUp = true;
        drawnIds.add(c.id);
        waste.push(c);
      }
    }
    moves++;
    movesEl.textContent = moves;
    renderBoard();
    animateCardTransitions(prevPos, drawnIds);

    if (!hasAnyValidMoves()) {
      setTimeout(triggerStalemateGameOver, 300);
    }
  }

  function getSelectedCards() {
    if (!selected) return null;
    if (selected.source === 'waste') {
      return waste.length > 0 ? [waste[waste.length - 1]] : null;
    }
    if (selected.source === 'foundation') {
      const f = foundations[selected.colIdx];
      return f.length > 0 ? [f[f.length - 1]] : null;
    }
    if (selected.source === 'tableau') {
      return tableau[selected.colIdx].slice(selected.cardIdx);
    }
    return null;
  }

  function removeSelectedCards() {
    if (!selected) return;
    if (selected.source === 'waste') {
      waste.pop();
    } else if (selected.source === 'foundation') {
      foundations[selected.colIdx].pop();
    } else if (selected.source === 'tableau') {
      tableau[selected.colIdx].splice(selected.cardIdx);
      const col = tableau[selected.colIdx];
      if (col.length > 0 && !col[col.length - 1].faceUp) {
        col[col.length - 1].faceUp = true;
      }
    }
  }

  function tryAutoToFoundation(source, colIdx, cardIdx) {
    let card = null;
    if (source === 'waste' && waste.length > 0) {
      card = waste[waste.length - 1];
    } else if (source === 'tableau') {
      const col = tableau[colIdx];
      if (cardIdx === col.length - 1) card = col[cardIdx];
    }
    if (!card) return false;

    const fIdx = card.suitIdx;
    if (canMoveToFoundation(card, fIdx)) {
      const prevPos = captureCardPositions();
      saveHistory();
      selected = { source, colIdx, cardIdx };
      removeSelectedCards();
      foundations[fIdx].push(card);
      selected = null;
      moves++;
      movesEl.textContent = moves;
      afterMoveCheck(prevPos);
      return true;
    }
    return false;
  }

  function afterMoveCheck(prevPos = null) {
    renderBoard();
    if (prevPos) animateCardTransitions(prevPos);

    if (foundations.every(f => f.length === 13)) {
      isGameOver = true;
      clearInterval(timerId);
      const modeName = drawCount === 1 ? 'NORMAL' : 'HARD';
      recordGameScore('12', elapsedSec, `sec (${modeName})`);
      overlayTitleEl.textContent = 'STARLIGHT SOLITAIRE CLEAR';
      overlayTitleEl.style.color = '#f3d463';
      overlayDescEl.innerHTML = `すべてのカードが夜空の星座へと還りました。<br>クリアタイム: <strong style="color:#f3d463; font-size:1.25rem; font-weight:400;">${formatTime(elapsedSec)}</strong><br><span style="font-size:0.78rem;">手数: ${moves}回 / ${modeName}</span>`;
      overlayUndoBtn.style.display = 'none';
      overlayEl.style.display = 'flex';
      return;
    }

    const allFaceUp = stock.length === 0 && waste.length === 0 &&
      tableau.every(col => col.every(c => c.faceUp));
    autoBtn.style.display = allFaceUp ? 'block' : 'none';

    if (!allFaceUp && !hasAnyValidMoves()) {
      setTimeout(triggerStalemateGameOver, 300);
    }
  }

  function runAutoComplete() {
    autoBtn.style.display = 'none';
    const stepTimer = setInterval(() => {
      if (!document.getElementById('sol-tableau') || isGameOver) {
        clearInterval(stepTimer);
        return;
      }
      let moved = false;
      for (let col = 0; col < 7; col++) {
        const pile = tableau[col];
        if (pile.length > 0) {
          const top = pile[pile.length - 1];
          if (canMoveToFoundation(top, top.suitIdx)) {
            const prevPos = captureCardPositions();
            pile.pop();
            foundations[top.suitIdx].push(top);
            moves++;
            movesEl.textContent = moves;
            afterMoveCheck(prevPos);
            moved = true;
            break;
          }
        }
      }
      if (!moved || isGameOver) clearInterval(stepTimer);
    }, 95);
  }

  function createCardElement(card, isSelected = false, isDimmed = false) {
    const el = document.createElement('div');
    if (card.id) el.dataset.cardId = card.id;

    if (!card.faceUp) {
      el.style.cssText = `
        width: 100%;
        aspect-ratio: 2.4 / 3.4;
        border-radius: 6px;
        background: linear-gradient(135deg, #1a264a 0%, #0f162e 100%);
        border: 1px solid rgba(160, 185, 255, 0.25);
        box-shadow: 0 2px 6px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      el.innerHTML = `<span style="color:rgba(243,212,99,0.25); font-size:0.75rem;">✦</span>`;
      return el;
    }

    const isRed = card.color === 'red';
    const textColor = isRed ? '#ff8585' : '#dce8ff';
    el.style.cssText = `
      width: 100%;
      aspect-ratio: 2.4 / 3.4;
      border-radius: 6px;
      background: ${isSelected ? 'linear-gradient(180deg, #2b3a67 0%, #1c2747 100%)' : 'linear-gradient(180deg, #1b2440 0%, #12182c 100%)'};
      border: ${isSelected ? '1.5px solid #f3d463' : '1px solid rgba(180, 200, 255, 0.28)'};
      box-shadow: ${isSelected ? '0 0 12px rgba(243, 212, 99, 0.45)' : '0 2px 6px rgba(0,0,0,0.5)'};
      color: ${textColor};
      padding: 3px 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: ${isDimmed ? 'default' : 'pointer'};
      opacity: ${isDimmed ? '0.78' : '1'};
      box-sizing: border-box;
      position: relative;
      transform: ${isSelected ? 'translateY(-3px)' : 'none'};
    `;

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.74rem; font-weight:600; line-height:1;">
        <span>${rankLabel(card.rank)}</span>
        <span style="font-size:0.7rem;">${card.symbol}</span>
      </div>
      <div style="text-align:center; font-size:1.15rem; opacity:0.85; line-height:1;">${card.symbol}</div>
      <div style="height:4px;"></div>
    `;
    return el;
  }

  function renderBoard() {
    stockEl.innerHTML = '';
    if (stock.length > 0) {
      const back = createCardElement({ faceUp: false });
      back.style.position = 'relative';
      const badge = document.createElement('span');
      badge.textContent = stock.length;
      badge.style.cssText = 'position:absolute; bottom:3px; right:4px; font-size:0.62rem; color:#8192b4;';
      back.appendChild(badge);
      stockEl.appendChild(back);
    } else {
      stockEl.innerHTML = `<span style="color:rgba(160,185,255,0.4); font-size:1.1rem;">↻</span>`;
    }

    wasteEl.innerHTML = '';
    if (waste.length > 0) {
      const visibleCount = drawCount === 3 ? Math.min(3, waste.length) : 1;
      const startIdx = waste.length - visibleCount;

      for (let i = 0; i < visibleCount; i++) {
        const card = waste[startIdx + i];
        const isTopCard = (i === visibleCount - 1);
        const isSel = isTopCard && selected && selected.source === 'waste';

        const cardEl = createCardElement(card, isSel, !isTopCard);
        cardEl.style.position = 'absolute';
        cardEl.style.top = '0';
        cardEl.style.width = 'calc((100% - 5px) / 2)';
        cardEl.style.left = drawCount === 3 ? `${i * 22}px` : '0px';
        cardEl.style.zIndex = i + 1;

        if (isTopCard) {
          cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGameOver) return;
            if (isSel) {
              if (!tryAutoToFoundation('waste', 0, 0)) {
                selected = null;
                renderBoard();
              }
            } else {
              selected = { source: 'waste', colIdx: 0, cardIdx: waste.length - 1 };
              renderBoard();
            }
          });
          cardEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (isGameOver) return;
            tryAutoToFoundation('waste', 0, 0);
          });
        }

        wasteEl.appendChild(cardEl);
      }
    }

    document.querySelectorAll('.sol-found').forEach((fEl, fIdx) => {
      const pile = foundations[fIdx];
      const suit = SUITS[fIdx];
      if (pile.length === 0) {
        fEl.innerHTML = suit.symbol;
      } else {
        fEl.innerHTML = '';
        const top = pile[pile.length - 1];
        const isSel = selected && selected.source === 'foundation' && selected.colIdx === fIdx;
        const cardEl = createCardElement(top, isSel);
        cardEl.style.position = 'absolute';
        cardEl.style.inset = '0';
        fEl.appendChild(cardEl);
      }

      fEl.onclick = (e) => {
        e.stopPropagation();
        if (isGameOver) return;
        const moving = getSelectedCards();
        if (moving && moving.length === 1 && canMoveToFoundation(moving[0], fIdx)) {
          const prevPos = captureCardPositions();
          saveHistory();
          removeSelectedCards();
          foundations[fIdx].push(moving[0]);
          selected = null;
          moves++;
          movesEl.textContent = moves;
          afterMoveCheck(prevPos);
        } else if (pile.length > 0) {
          if (selected && selected.source === 'foundation' && selected.colIdx === fIdx) {
            selected = null;
          } else {
            selected = { source: 'foundation', colIdx: fIdx, cardIdx: pile.length - 1 };
          }
          renderBoard();
        }
      };
    });

    tableauEl.innerHTML = '';
    for (let colIdx = 0; colIdx < 7; colIdx++) {
      const colWrap = document.createElement('div');
      colWrap.style.cssText = 'position:relative; min-height:280px; border-radius:6px; border:1px dashed rgba(255,255,255,0.06);';

      const col = tableau[colIdx];

      colWrap.addEventListener('click', () => {
        if (isGameOver) return;
        const moving = getSelectedCards();
        if (moving && col.length === 0 && canMoveToTableau(moving[0], colIdx)) {
          const prevPos = captureCardPositions();
          saveHistory();
          removeSelectedCards();
          tableau[colIdx].push(...moving);
          selected = null;
          moves++;
          movesEl.textContent = moves;
          afterMoveCheck(prevPos);
        }
      });

      let offsetY = 0;
      col.forEach((card, cardIdx) => {
        const isSel = selected &&
          selected.source === 'tableau' &&
          selected.colIdx === colIdx &&
          cardIdx >= selected.cardIdx;

        const cardEl = createCardElement(card, isSel);
        cardEl.style.position = 'absolute';
        cardEl.style.top = `${offsetY}px`;
        cardEl.style.left = '0';
        cardEl.style.zIndex = cardIdx + 1;

        offsetY += card.faceUp ? 22 : 11;

        if (card.faceUp) {
          cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isGameOver) return;

            if (selected && selected.source === 'tableau' && selected.colIdx === colIdx && selected.cardIdx === cardIdx) {
              if (!tryAutoToFoundation('tableau', colIdx, cardIdx)) {
                selected = null;
                renderBoard();
              }
              return;
            }

            const moving = getSelectedCards();
            if (moving && !(selected.source === 'tableau' && selected.colIdx === colIdx)) {
              if (canMoveToTableau(moving[0], colIdx)) {
                const prevPos = captureCardPositions();
                saveHistory();
                removeSelectedCards();
                tableau[colIdx].push(...moving);
                selected = null;
                moves++;
                movesEl.textContent = moves;
                afterMoveCheck(prevPos);
                return;
              }
            }

            selected = { source: 'tableau', colIdx, cardIdx };
            renderBoard();
          });

          cardEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (isGameOver) return;
            tryAutoToFoundation('tableau', colIdx, cardIdx);
          });
        }

        colWrap.appendChild(cardEl);
      });

      tableauEl.appendChild(colWrap);
    }
  }

  stockEl.addEventListener('click', drawFromStock);
  document.getElementById('sol-undo-btn').addEventListener('click', undoMove);
  overlayUndoBtn.addEventListener('click', undoMove);
  document.getElementById('sol-new-btn').addEventListener('click', startNewGame);
  document.getElementById('sol-retry-btn').addEventListener('click', startNewGame);
  autoBtn.addEventListener('click', runAutoComplete);

  document.querySelectorAll('.sol-diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sol-diff-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      drawCount = Number(target.dataset.draw);
      startNewGame();
    });
  });

  startNewGame();
}

// ==================================================
// 13. Cosmic Match 3 (月夜のジュエルが舞い落ちる連鎖アクションパズル)
// ==================================================
function initCosmicMatchGame(container) {
  const ROWS = 8;
  const COLS = 8;
  const GEMS = [
    { id: 0, icon: '✦', color: '#f3d463', bg: 'rgba(243, 212, 99, 0.16)', border: 'rgba(243, 212, 99, 0.45)' }, // 星の金
    { id: 1, icon: '☾', color: '#8ce6d8', bg: 'rgba(140, 230, 216, 0.16)', border: 'rgba(140, 230, 216, 0.45)' }, // 月の碧
    { id: 2, icon: '♦', color: '#ff8a9e', bg: 'rgba(255, 138, 158, 0.16)', border: 'rgba(255, 138, 158, 0.45)' }, // 紅の雫
    { id: 3, icon: '❖', color: '#9eb8ff', bg: 'rgba(158, 184, 255, 0.16)', border: 'rgba(158, 184, 255, 0.45)' }, // 蒼の結晶
    { id: 4, icon: '✿', color: '#d49eff', bg: 'rgba(212, 158, 255, 0.16)', border: 'rgba(212, 158, 255, 0.45)' }, // 紫苑の星花
    { id: 5, icon: '☀', color: '#ffb870', bg: 'rgba(255, 184, 112, 0.16)', border: 'rgba(255, 184, 112, 0.45)' }  // 琥珀の光
  ];

  let mode = 'MOVES'; // 'MOVES' (30手) | 'TIME' (60秒)
  let grid = [];
  let selected = null;
  let score = 0;
  let movesLeft = 30;
  let timeLeft = 60;
  let timerId = null;
  let isBusy = false;
  let isGameOver = false;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">13. Cosmic Match 3</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">隣り合うジュエルを入れ替えて縦・横に3つ以上揃えよう</p>

    <!-- モード選択 -->
    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); justify-content:center;">
      <button class="cm3-mode-btn active" data-mode="MOVES" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">30 MOVES</button>
      <button class="cm3-mode-btn" data-mode="TIME" style="background:transparent; color:#7a8ba9; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">60s TIME ATTACK</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:360px; font-size:0.85rem; color:#8192b4; margin-bottom:10px; background:rgba(10,15,32,0.7); padding:8px 14px; border-radius:10px; border:1px solid rgba(160,185,255,0.16);">
      <span>SCORE: <strong id="cm3-score" style="color:#f3d463; font-size:1.05rem;">0</strong></span>
      <span id="cm3-limit-wrap">MOVES: <strong id="cm3-limit" style="color:#a0c8ff; font-size:1.05rem;">30</strong></span>
      <button id="cm3-new-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">リセット</button>
    </div>

    <!-- 8x8 ジュエル盤面 -->
    <div style="position:relative; width:100%; max-width:360px; aspect-ratio:1 / 1; background:rgba(10, 15, 32, 0.9); border:1.5px solid rgba(160, 185, 255, 0.32); border-radius:12px; padding:6px; box-shadow:0 10px 30px rgba(0,0,0,0.55); box-sizing:border-box;">
      <div id="cm3-grid" style="display:grid; grid-template-columns:repeat(8, 1fr); grid-template-rows:repeat(8, 1fr); gap:4px; width:100%; height:100%; user-select:none;"></div>

      <!-- 連鎖（CHAIN）ポップアップ -->
      <div id="cm3-chain-toast" style="position:absolute; top:14px; right:14px; background:rgba(243,212,99,0.22); color:#fff4b8; border:1px solid #f3d463; padding:4px 12px; border-radius:14px; font-size:0.82rem; font-weight:600; letter-spacing:1px; pointer-events:none; opacity:0; transition:opacity 0.2s, transform 0.2s; transform:translateY(4px); z-index:20;"></div>

      <!-- リザルトオーバーレイ -->
      <div id="cm3-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.88); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center; border-radius:12px; z-index:30;">
        <h3 style="color:#f3d463; font-size:1.35rem; letter-spacing:2px; font-weight:300;">STARDUST HARVEST</h3>
        <p id="cm3-overlay-desc" style="color:#8192b4; font-size:0.86rem; line-height:1.65;"></p>
        <button id="cm3-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">PLAY AGAIN</button>
      </div>
    </div>

    <p style="color:#5c6d8c; font-size:0.75rem; margin-top:8px; text-align:center;">操作: ジュエルをタップして上下左右の隣と入れ替え（ドラッグ操作も対応）</p>
  `;

  const gridEl = document.getElementById('cm3-grid');
  const scoreEl = document.getElementById('cm3-score');
  const limitWrapEl = document.getElementById('cm3-limit-wrap');
  const chainToastEl = document.getElementById('cm3-chain-toast');
  const overlayEl = document.getElementById('cm3-overlay');
  const overlayDescEl = document.getElementById('cm3-overlay-desc');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function showChainToast(text) {
    chainToastEl.textContent = text;
    chainToastEl.style.opacity = '1';
    chainToastEl.style.transform = 'translateY(0)';
    setTimeout(() => {
      if (chainToastEl) {
        chainToastEl.style.opacity = '0';
        chainToastEl.style.transform = 'translateY(4px)';
      }
    }, 850);
  }

  function updateStatusUI() {
    scoreEl.textContent = score.toLocaleString();
    if (mode === 'MOVES') {
      limitWrapEl.innerHTML = `MOVES: <strong style="color:${movesLeft <= 5 ? '#ff8a8a' : '#a0c8ff'}; font-size:1.05rem;">${movesLeft}</strong>`;
    } else {
      limitWrapEl.innerHTML = `TIME: <strong style="color:${timeLeft <= 10 ? '#ff8a8a' : '#a0c8ff'}; font-size:1.05rem;">${timeLeft}s</strong>`;
    }
  }

  function randomGem() {
    return Math.floor(Math.random() * GEMS.length);
  }

  // 初期盤面生成（最初から揃っている状態と手詰まりを防ぐ）
  function createInitialBoard() {
    do {
      grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          let g;
          do {
            g = randomGem();
          } while (
            (c >= 2 && grid[r][c - 1] === g && grid[r][c - 2] === g) ||
            (r >= 2 && grid[r - 1][c] === g && grid[r - 2][c] === g)
          );
          grid[r][c] = g;
        }
      }
    } while (!hasPossibleMove());
  }

  function findMatches() {
    const matched = new Set();

    // 横チェック
    for (let r = 0; r < ROWS; r++) {
      let runStart = 0;
      for (let c = 1; c <= COLS; c++) {
        if (c < COLS && grid[r][c] === grid[r][runStart] && grid[r][c] !== -1) {
          continue;
        }
        if (c - runStart >= 3) {
          for (let k = runStart; k < c; k++) matched.add(`${r},${k}`);
        }
        runStart = c;
      }
    }

    // 縦チェック
    for (let c = 0; c < COLS; c++) {
      let runStart = 0;
      for (let r = 1; r <= ROWS; r++) {
        if (r < ROWS && grid[r][c] === grid[runStart][c] && grid[r][c] !== -1) {
          continue;
        }
        if (r - runStart >= 3) {
          for (let k = runStart; k < r; k++) matched.add(`${k},${c}`);
        }
        runStart = r;
      }
    }

    return matched;
  }

  function hasPossibleMove() {
    const dirs = [[0, 1], [1, 0]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= ROWS || nc >= COLS) continue;
          // 仮入れ替え
          [grid[r][c], grid[nr][nc]] = [grid[nr][nc], grid[r][c]];
          const hasMatch = findMatches().size > 0;
          [grid[r][c], grid[nr][nc]] = [grid[nr][nc], grid[r][c]];
          if (hasMatch) return true;
        }
      }
    }
    return false;
  }

  function applyGravityAndRefill() {
    const newGems = new Set();
    for (let c = 0; c < COLS; c++) {
      let writeRow = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c] !== -1) {
          grid[writeRow][c] = grid[r][c];
          if (writeRow !== r) newGems.add(`${writeRow},${c}`);
          writeRow--;
        }
      }
      while (writeRow >= 0) {
        grid[writeRow][c] = randomGem();
        newGems.add(`${writeRow},${c}`);
        writeRow--;
      }
    }
    return newGems;
  }

  function renderBoard(matchedSet = new Set(), fallingSet = new Set()) {
    gridEl.innerHTML = '';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r},${c}`;
        const gemId = grid[r][c];
        const gem = GEMS[gemId] || GEMS[0];
        const isSel = selected && selected.r === r && selected.c === c;
        const isMatched = matchedSet.has(key);
        const isFalling = fallingSet.has(key);

        const cell = document.createElement('div');
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.style.cssText = `
          background: ${isSel ? 'rgba(243, 212, 99, 0.28)' : gem.bg};
          border: ${isSel ? '1.5px solid #f3d463' : `1px solid ${gem.border}`};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: ${gem.color};
          text-shadow: 0 0 10px ${gem.color}88;
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s, background 0.15s;
          transform: ${isMatched ? 'scale(0.15)' : (isSel ? 'scale(1.08)' : 'scale(1)')};
          opacity: ${isMatched ? '0.1' : '1'};
          box-shadow: ${isSel ? '0 0 12px rgba(243, 212, 99, 0.45)' : 'inset 0 1px 0 rgba(255,255,255,0.08)'};
        `;

        if (isFalling) {
          cell.style.transform = 'translateY(-14px)';
          requestAnimationFrame(() => {
            if (cell) cell.style.transform = 'translateY(0)';
          });
        }

        cell.textContent = gem.icon;

        // タップ＆スワイプ（ドラッグ）操作対応
        let startX = 0;
        let startY = 0;
        cell.addEventListener('pointerdown', (e) => {
          if (isBusy || isGameOver) return;
          startX = e.clientX;
          startY = e.clientY;
        });

        cell.addEventListener('pointerup', (e) => {
          if (isBusy || isGameOver) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          if (Math.abs(dx) > 18 || Math.abs(dy) > 18) {
            // スワイプ方向へ隣接入れ替え
            let tr = r;
            let tc = c;
            if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1;
            else tr += dy > 0 ? 1 : -1;

            if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
              selected = null;
              trySwap(r, c, tr, tc);
            }
          } else {
            handleCellClick(r, c);
          }
        });

        gridEl.appendChild(cell);
      }
    }
  }

  async function trySwap(r1, c1, r2, c2) {
    if (isBusy || isGameOver) return;
    isBusy = true;

    // 入れ替え実行
    [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
    renderBoard();
    await sleep(170);

    let matches = findMatches();
    if (matches.size === 0) {
      // 揃わなければ元に戻す
      [grid[r1][c1], grid[r2][c2]] = [grid[r2][c2], grid[r1][c1]];
      renderBoard();
      isBusy = false;
      return;
    }

    // 有効な手だったので手数を消費
    if (mode === 'MOVES') {
      movesLeft--;
      updateStatusUI();
    }

    // 連鎖ループ
    let chain = 1;
    while (matches.size > 0) {
      const bonus = matches.size >= 4 ? (matches.size - 3) * 40 : 0;
      const gained = (matches.size * 30 + bonus) * chain;
      score += gained;
      updateStatusUI();

      if (chain >= 2) {
        showChainToast(`✦ ${chain} CHAIN! +${gained}`);
      } else if (matches.size >= 4) {
        showChainToast(`✦ ${matches.size} MATCH! +${gained}`);
      }

      // 消滅アニメーション
      renderBoard(matches);
      await sleep(210);

      for (const key of matches) {
        const [mr, mc] = key.split(',').map(Number);
        grid[mr][mc] = -1;
      }

      const fallingSet = applyGravityAndRefill();
      renderBoard(new Set(), fallingSet);
      await sleep(210);

      matches = findMatches();
      chain++;
    }

    // 手詰まりチェック＆自動シャッフル
    if (!hasPossibleMove()) {
      showChainToast('✦ SHUFFLE');
      await sleep(400);
      createInitialBoard();
      renderBoard();
    }

    isBusy = false;

    if (mode === 'MOVES' && movesLeft <= 0) {
      finishGame();
    }
  }

  function handleCellClick(r, c) {
    if (isBusy || isGameOver) return;

    if (!selected) {
      selected = { r, c };
      renderBoard();
      return;
    }

    if (selected.r === r && selected.c === c) {
      selected = null;
      renderBoard();
      return;
    }

    const isAdjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;
    if (isAdjacent) {
      const prev = selected;
      selected = null;
      trySwap(prev.r, prev.c, r, c);
    } else {
      selected = { r, c };
      renderBoard();
    }
  }

  function finishGame() {
    if (isGameOver) return;
    isGameOver = true;
    if (timerId) clearInterval(timerId);

    const modeLabel = mode === 'MOVES' ? '30 MOVES' : '60s TIME';
    recordGameScore('13', score, `pts (${modeLabel})`);

    overlayDescEl.innerHTML = `夜空に美しい星の輝きが降り注ぎました！<br>最終スコア: <strong style="color:#f3d463; font-size:1.35rem; font-weight:400;">${score.toLocaleString()}</strong> <span style="font-size:0.8rem;">pts</span><br><span style="font-size:0.78rem;">モード: ${modeLabel}</span>`;
    overlayEl.style.display = 'flex';
  }

  function startNewGame() {
    if (timerId) clearInterval(timerId);
    isBusy = false;
    isGameOver = false;
    selected = null;
    score = 0;
    movesLeft = 30;
    timeLeft = 60;
    overlayEl.style.display = 'none';

    updateStatusUI();
    createInitialBoard();
    renderBoard();

    if (mode === 'TIME') {
      timerId = setInterval(() => {
        if (!document.getElementById('cm3-grid')) {
          clearInterval(timerId);
          return;
        }
        if (!isGameOver) {
          timeLeft--;
          updateStatusUI();
          if (timeLeft <= 0) {
            finishGame();
          }
        }
      }, 1000);
    }
  }

  document.getElementById('cm3-new-btn').addEventListener('click', startNewGame);
  document.getElementById('cm3-retry-btn').addEventListener('click', startNewGame);

  document.querySelectorAll('.cm3-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cm3-mode-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      mode = target.dataset.mode;
      startNewGame();
    });
  });

  startNewGame();
}

// ==================================================
// 14. Shooting Star (夜空を駆ける流れ星キャッチ)
// ==================================================
function initShootingStarGame(container) {
  let mode = 'RELAX'; // 'RELAX' (45s) | 'SHOWER' (30s)
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let caughtCount = 0;
  let timeLeft = 45;
  let isGameOver = false;
  let isPointerDown = false;

  let stars = [];
  let particles = [];
  let floatingTexts = [];
  let bgStars = [];

  let animFrameId = null;
  let timerId = null;
  let lastTime = 0;
  let spawnTimer = 0;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">14. Shooting Star</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">夜空を駆ける流れ星をタップして願いを集めよう（赤い星屑には注意）</p>

    <!-- モード選択 -->
    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); justify-content:center;">
      <button class="ss-mode-btn active" data-mode="RELAX" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">RELAX (45s)</button>
      <button class="ss-mode-btn" data-mode="SHOWER" style="background:transparent; color:#7a8ba9; border:none; padding:5px 14px; border-radius:6px; cursor:pointer; font-size:0.78rem;">METEOR SHOWER (30s)</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:380px; font-size:0.84rem; color:#8192b4; margin-bottom:10px; background:rgba(10,15,32,0.7); padding:8px 14px; border-radius:10px; border:1px solid rgba(160,185,255,0.16);">
      <span>SCORE: <strong id="ss-score" style="color:#f3d463; font-size:1.05rem;">0</strong></span>
      <span>COMBO: <strong id="ss-combo" style="color:#8ce6d8; font-size:1.05rem;">0</strong></span>
      <span>TIME: <strong id="ss-time" style="color:#a0c8ff; font-size:1.05rem;">45s</strong></span>
    </div>

    <!-- 夜空キャンバス -->
    <div style="position:relative; width:100%; max-width:380px; height:420px; background:radial-gradient(ellipse at top, #131d3b 0%, #090d1c 85%); border:1.5px solid rgba(160, 185, 255, 0.3); border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.55); user-select:none; touch-action:none;">
      <canvas id="ss-canvas" width="380" height="420" style="width:100%; height:100%; display:block; cursor:crosshair;"></canvas>

      <!-- リザルトオーバーレイ -->
      <div id="ss-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.88); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center; z-index:20;">
        <h3 style="color:#f3d463; font-size:1.35rem; letter-spacing:2px; font-weight:300;">WISHES GATHERED</h3>
        <p id="ss-overlay-desc" style="color:#8192b4; font-size:0.86rem; line-height:1.7;"></p>
        <button id="ss-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">PLAY AGAIN</button>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:380px; margin-top:8px;">
      <span style="color:#5c6d8c; font-size:0.74rem;">✦ +100 / ☄ +300 / ✹ -150 (タップ＆なぞり対応)</span>
      <button id="ss-reset-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:3px 10px; border-radius:6px; cursor:pointer; font-size:0.74rem;">リセット</button>
    </div>
  `;

  const canvas = document.getElementById('ss-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('ss-score');
  const comboEl = document.getElementById('ss-combo');
  const timeEl = document.getElementById('ss-time');
  const overlayEl = document.getElementById('ss-overlay');
  const overlayDescEl = document.getElementById('ss-overlay-desc');

  // 背景の静かな星空を初期化
  for (let i = 0; i < 45; i++) {
    bgStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2
    });
  }

  function updateHUD() {
    scoreEl.textContent = score.toLocaleString();
    comboEl.textContent = combo;
    timeEl.textContent = `${timeLeft}s`;
    timeEl.style.color = timeLeft <= 10 ? '#ff8a8a' : '#a0c8ff';
  }

  function spawnStar() {
    const roll = Math.random();
    let type = 'NORMAL';
    if (roll < 0.18) type = 'GOLD';
    else if (roll < 0.36) type = 'DARK';

    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? Math.random() * (canvas.width * 0.7) + 20 : Math.random() * (canvas.width * 0.7) + (canvas.width * 0.25);
    const y = -20;

    const speedBase = mode === 'SHOWER' ? 195 : 135;
    const speedMul = type === 'GOLD' ? 1.38 : (type === 'DARK' ? 1.1 : 1.0);
    const speed = (speedBase + Math.random() * 55) * speedMul;

    // 斜めに流れ落ちる角度
    const angle = fromLeft
      ? (Math.PI * 0.34 + Math.random() * 0.16)
      : (Math.PI * 0.5 + Math.random() * 0.16);

    stars.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: type === 'GOLD' ? 16 : 18,
      type,
      trail: [],
      pulse: Math.random() * Math.PI * 2
    });
  }

  function createBurst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const spd = 50 + Math.random() * 95;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 1.0,
        color,
        size: 2 + Math.random() * 2.5
      });
    }
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.0
    });
  }

  function checkCatchAt(px, py) {
    if (isGameOver) return;
    // 判定を少し広めにしてタッチでも快適にキャッチできるようにする
    const hitPadding = 16;

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      const dist = Math.hypot(s.x - px, s.y - py);
      if (dist <= s.radius + hitPadding) {
        stars.splice(i, 1);

        if (s.type === 'DARK') {
          combo = 0;
          score = Math.max(0, score - 150);
          createBurst(s.x, s.y, '#ff6b81', 14);
          addFloatingText(s.x, s.y, '-150', '#ff8a8a');
        } else {
          combo++;
          if (combo > maxCombo) maxCombo = combo;
          caughtCount++;
          const base = s.type === 'GOLD' ? 300 : 100;
          const bonus = Math.min(combo - 1, 10) * 20;
          const total = base + bonus;
          score += total;

          const burstColor = s.type === 'GOLD' ? '#ffe066' : '#a8d8ff';
          createBurst(s.x, s.y, burstColor, s.type === 'GOLD' ? 18 : 12);
          const label = combo >= 2 ? `+${total} (${combo}x)` : `+${total}`;
          addFloatingText(s.x, s.y, label, s.type === 'GOLD' ? '#f3d463' : '#cfe8ff');
        }
        updateHUD();
      }
    }
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    const pos = getCanvasCoords(e);
    checkCatchAt(pos.x, pos.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const pos = getCanvasCoords(e);
    checkCatchAt(pos.x, pos.y);
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  function drawStarShape(cx, cy, spikes, outerR, innerR, rotation) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = rotation + (i * Math.PI) / spikes;
      const sx = cx + Math.cos(angle) * r;
      const sy = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
  }

  function updateAndDraw(now) {
    if (!document.getElementById('ss-canvas')) {
      cancelAnimationFrame(animFrameId);
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 背景のきらめく星々
    for (const bg of bgStars) {
      bg.phase += dt * 2.2;
      const alpha = 0.25 + 0.45 * Math.sin(bg.phase);
      ctx.fillStyle = `rgba(210, 228, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(bg.x, bg.y, bg.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!isGameOver) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnStar();
        spawnTimer = mode === 'SHOWER'
          ? (0.34 + Math.random() * 0.26)
          : (0.55 + Math.random() * 0.35);
      }

      // 2. 流れ星の更新と描画
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 14) s.trail.shift();

        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.pulse += dt * 6;

        // 画面外へ出たら削除（通常の星を逃したらコンボリセット）
        if (s.y > canvas.height + 30 || s.x < -30 || s.x > canvas.width + 30) {
          if (s.type !== 'DARK' && combo > 0) {
            combo = 0;
            updateHUD();
          }
          stars.splice(i, 1);
          continue;
        }

        // 尾（トレイル）の描画
        for (let t = 0; t < s.trail.length; t++) {
          const pt = s.trail[t];
          const ratio = (t + 1) / s.trail.length;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, s.radius * 0.48 * ratio, 0, Math.PI * 2);
          if (s.type === 'GOLD') {
            ctx.fillStyle = `rgba(243, 212, 99, ${(ratio * 0.38).toFixed(2)})`;
          } else if (s.type === 'DARK') {
            ctx.fillStyle = `rgba(255, 100, 125, ${(ratio * 0.35).toFixed(2)})`;
          } else {
            ctx.fillStyle = `rgba(160, 205, 255, ${(ratio * 0.34).toFixed(2)})`;
          }
          ctx.fill();
        }

        // 星本体の描画
        ctx.save();
        if (s.type === 'GOLD') {
          ctx.shadowColor = '#f3d463';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#fff3b0';
          drawStarShape(s.x, s.y, 5, s.radius, s.radius * 0.45, s.pulse * 0.35);
          ctx.fill();
        } else if (s.type === 'DARK') {
          ctx.shadowColor = '#ff5e78';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ff7b92';
          drawStarShape(s.x, s.y, 6, s.radius * 0.92, s.radius * 0.42, -s.pulse * 0.5);
          ctx.fill();
        } else {
          ctx.shadowColor = '#9ec5ff';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#e8f3ff';
          drawStarShape(s.x, s.y, 4, s.radius, s.radius * 0.38, s.pulse * 0.25);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 3. パーティクル更新・描画
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2.2;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 4. スコアポップアップ更新・描画
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 34 * dt;
      ft.life -= dt * 1.4;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    animFrameId = requestAnimationFrame(updateAndDraw);
  }

  function finishGame() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(timerId);

    const modeLabel = mode === 'RELAX' ? 'RELAX' : 'SHOWER';
    recordGameScore('14', score, `pts (${modeLabel})`);

    overlayDescEl.innerHTML = `たくさんの流れ星に願いを託しました。<br>最終スコア: <strong style="color:#f3d463; font-size:1.35rem; font-weight:400;">${score.toLocaleString()}</strong> <span style="font-size:0.8rem;">pts</span><br><span style="font-size:0.78rem;">キャッチ数: ${caughtCount}個 / 最大コンボ: ${maxCombo}x</span>`;
    overlayEl.style.display = 'flex';
  }

  function startNewGame() {
    if (timerId) clearInterval(timerId);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    score = 0;
    combo = 0;
    maxCombo = 0;
    caughtCount = 0;
    timeLeft = mode === 'RELAX' ? 45 : 30;
    isGameOver = false;
    stars = [];
    particles = [];
    floatingTexts = [];
    spawnTimer = 0.2;

    overlayEl.style.display = 'none';
    updateHUD();

    lastTime = performance.now();
    animFrameId = requestAnimationFrame(updateAndDraw);

    timerId = setInterval(() => {
      if (!document.getElementById('ss-canvas')) {
        clearInterval(timerId);
        return;
      }
      if (!isGameOver) {
        timeLeft--;
        updateHUD();
        if (timeLeft <= 0) {
          finishGame();
        }
      }
    }, 1000);
  }

  document.getElementById('ss-reset-btn').addEventListener('click', startNewGame);
  document.getElementById('ss-retry-btn').addEventListener('click', startNewGame);

  document.querySelectorAll('.ss-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ss-mode-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      mode = target.dataset.mode;
      startNewGame();
    });
  });

  startNewGame();
}

// ==================================================
// 15. Zen Card Pair (静寂の夜空メモリーペア / 神経衰弱)
// ==================================================
function initZenCardPairGame(container) {
  const SYMBOLS = [
    { icon: '☾', label: 'Crescent', color: '#f3d463' },
    { icon: '✦', label: 'Starlight', color: '#a0c8ff' },
    { icon: '✧', label: 'Twinkle', color: '#cfe4ff' },
    { icon: '✵', label: 'Polaris', color: '#ffe58f' },
    { icon: '❂', label: 'Astrolabe', color: '#8ce6d8' },
    { icon: '❖', label: 'Prism', color: '#9ee8f5' },
    { icon: '◈', label: 'Facet', color: '#80d8ff' },
    { icon: '❋', label: 'Snowflake', color: '#b5f5ec' },
    { icon: '✿', label: 'Night Blossom', color: '#e5a8ff' },
    { icon: '❀', label: 'Lotus', color: '#ffadd2' },
    { icon: '❁', label: 'Camellia', color: '#d3adf7' },
    { icon: '✾', label: 'Aster', color: '#b8b8ff' },
    { icon: '✺', label: 'Nova', color: '#ffd280' },
    { icon: '❈', label: 'Frost', color: '#91caff' },
    { icon: '☼', label: 'Eclipse', color: '#ffbb96' },
    { icon: '⬡', label: 'Crystal', color: '#87e8de' },
    { icon: '⍟', label: 'Orbit', color: '#b7eb8f' },
    { icon: '✹', label: 'Corona', color: '#ffd666' }
  ];

  const MODES = {
    '4x4': { cols: 4, rows: 4, label: '4×4' },
    '4x5': { cols: 5, rows: 4, label: '4×5' },
    '6x6': { cols: 6, rows: 6, label: '6×6' }
  };

  let currentMode = '4x4';
  let cards = [];
  let flippedIndices = [];
  let matchedCount = 0;
  let moves = 0;
  let streak = 0;
  let elapsedSec = 0;
  let timerId = null;
  let isLocked = false;
  let isGameOver = false;
  let peekUsed = false;

  container.innerHTML = `
    <h2 style="margin-bottom:4px; font-weight:400; letter-spacing:2px; color:#e1e6f0;">15. Zen Card Pair</h2>
    <p style="color:#7a8ba9; font-size:0.85rem; margin-bottom:12px;">同じ夜空の紋章を2枚ずつ見つけ出し、静かに心を整えよう</p>

    <!-- 盤面サイズ選択 -->
    <div style="display:flex; gap:6px; margin-bottom:10px; background:rgba(0,0,0,0.25); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); justify-content:center;">
      <button class="zcp-mode-btn active" data-mode="4x4" style="background:rgba(160,180,255,0.2); color:#fff; border:none; padding:5px 13px; border-radius:6px; cursor:pointer; font-size:0.78rem;">4×4 (8ペア)</button>
      <button class="zcp-mode-btn" data-mode="4x5" style="background:transparent; color:#7a8ba9; border:none; padding:5px 13px; border-radius:6px; cursor:pointer; font-size:0.78rem;">4×5 (10ペア)</button>
      <button class="zcp-mode-btn" data-mode="6x6" style="background:transparent; color:#7a8ba9; border:none; padding:5px 13px; border-radius:6px; cursor:pointer; font-size:0.78rem;">6×6 (18ペア)</button>
    </div>

    <!-- ステータスバー -->
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:390px; font-size:0.83rem; color:#8192b4; margin-bottom:10px; background:rgba(10,15,32,0.7); padding:8px 14px; border-radius:10px; border:1px solid rgba(160,185,255,0.16);">
      <span>MOVES: <strong id="zcp-moves" style="color:#e1e6f0; font-size:1rem;">0</strong></span>
      <span>PAIRS: <strong id="zcp-pairs" style="color:#8ce6d8; font-size:1rem;">0/8</strong></span>
      <span>TIME: <strong id="zcp-time" style="color:#f3d463; font-size:1rem;">00:00</strong></span>
    </div>

    <!-- カードグリッド盤面 -->
    <div style="position:relative; width:100%; max-width:390px; background:rgba(10, 15, 32, 0.88); border:1.5px solid rgba(160, 185, 255, 0.26); border-radius:14px; padding:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); box-sizing:border-box;">
      <div id="zcp-grid" style="display:grid; gap:7px; width:100%; user-select:none; perspective:900px;"></div>

      <!-- クリアオーバーレイ -->
      <div id="zcp-overlay" style="position:absolute; inset:0; background:rgba(8,11,20,0.9); display:none; flex-direction:column; align-items:center; justify-content:center; gap:12px; backdrop-filter:blur(6px); padding:20px; text-align:center; border-radius:14px; z-index:20;">
        <h3 style="color:#f3d463; font-size:1.35rem; letter-spacing:2px; font-weight:300;">TRANQUIL HARMONY</h3>
        <p id="zcp-overlay-desc" style="color:#8192b4; font-size:0.86rem; line-height:1.7;"></p>
        <button id="zcp-retry-btn" style="background:rgba(160,180,255,0.18); color:#e1e6f0; border:1px solid rgba(160,180,255,0.35); padding:8px 28px; border-radius:6px; cursor:pointer; font-size:0.9rem; margin-top:6px;">PLAY AGAIN</button>
      </div>
    </div>

    <!-- 下部ツールバー -->
    <div style="display:flex; gap:8px; margin-top:11px; width:100%; max-width:390px; justify-content:center;">
      <button id="zcp-peek-btn" style="background:rgba(243,212,99,0.14); color:#f3d463; border:1px solid rgba(243,212,99,0.35); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:0.78rem;">✦ 星の啓示 (残り1回)</button>
      <button id="zcp-reset-btn" style="background:rgba(255,255,255,0.05); color:#a0c8ff; border:1px solid rgba(255,255,255,0.12); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:0.78rem;">シャッフル</button>
    </div>
  `;

  const gridEl = document.getElementById('zcp-grid');
  const movesEl = document.getElementById('zcp-moves');
  const pairsEl = document.getElementById('zcp-pairs');
  const timeEl = document.getElementById('zcp-time');
  const peekBtn = document.getElementById('zcp-peek-btn');
  const overlayEl = document.getElementById('zcp-overlay');
  const overlayDescEl = document.getElementById('zcp-overlay-desc');

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    elapsedSec = 0;
    timeEl.textContent = '00:00';
    timerId = setInterval(() => {
      if (!document.getElementById('zcp-grid')) {
        clearInterval(timerId);
        return;
      }
      if (!isGameOver) {
        elapsedSec++;
        timeEl.textContent = formatTime(elapsedSec);
      }
    }, 1000);
  }

  function updateHUD() {
    const { cols, rows } = MODES[currentMode];
    const totalPairs = (cols * rows) / 2;
    movesEl.textContent = moves;
    pairsEl.textContent = `${matchedCount}/${totalPairs}`;
  }

  function renderGrid() {
    const { cols, rows } = MODES[currentMode];
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridEl.style.gap = cols === 6 ? '5px' : '7px';
    gridEl.innerHTML = '';

    cards.forEach((card, idx) => {
      const cell = document.createElement('div');
      const isShown = card.flipped || card.matched;

      cell.style.cssText = `
        aspect-ratio: ${cols === 6 ? '1 / 1.08' : '1 / 1.15'};
        position: relative;
        cursor: ${isShown || isLocked ? 'default' : 'pointer'};
        transform-style: preserve-3d;
        transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
        transform: ${isShown ? 'rotateY(180deg)' : 'rotateY(0deg)'};
      `;

      // 裏面（夜空の幾何学模様）
      const backFace = document.createElement('div');
      backFace.style.cssText = `
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        border-radius: 8px;
        background: linear-gradient(145deg, #1b284d 0%, #101833 100%);
        border: 1px solid rgba(160, 185, 255, 0.26);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(243, 212, 99, 0.28);
        font-size: ${cols === 6 ? '0.85rem' : '1.05rem'};
      `;
      backFace.innerHTML = '✦';

      // 表面（夜空シンボル）
      const frontFace = document.createElement('div');
      frontFace.style.cssText = `
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        transform: rotateY(180deg);
        border-radius: 8px;
        background: ${card.matched ? 'linear-gradient(180deg, rgba(243,212,99,0.18) 0%, rgba(24,35,68,0.92) 100%)' : 'linear-gradient(180deg, #21305c 0%, #141e3d 100%)'};
        border: ${card.matched ? '1.5px solid rgba(243, 212, 99, 0.65)' : `1.5px solid ${card.color}88`};
        box-shadow: ${card.matched ? '0 0 12px rgba(243, 212, 99, 0.25)' : '0 3px 10px rgba(0,0,0,0.45)'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${card.color};
        font-size: ${cols === 6 ? '1.3rem' : '1.65rem'};
        text-shadow: 0 0 10px ${card.color}66;
      `;
      frontFace.textContent = card.icon;

      cell.appendChild(backFace);
      cell.appendChild(frontFace);

      cell.addEventListener('click', () => handleCardClick(idx));
      gridEl.appendChild(cell);
    });
  }

  function handleCardClick(idx) {
    if (isLocked || isGameOver) return;
    const card = cards[idx];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    flippedIndices.push(idx);
    renderGrid();

    if (flippedIndices.length === 2) {
      isLocked = true;
      moves++;
      updateHUD();

      const [idx1, idx2] = flippedIndices;
      const c1 = cards[idx1];
      const c2 = cards[idx2];

      if (c1.pairId === c2.pairId) {
        // ペア一致
        setTimeout(() => {
          c1.matched = true;
          c2.matched = true;
          matchedCount++;
          streak++;
          flippedIndices = [];
          isLocked = false;
          updateHUD();
          renderGrid();

          const { cols, rows } = MODES[currentMode];
          if (matchedCount === (cols * rows) / 2) {
            finishGame();
          }
        }, 320);
      } else {
        // 不一致なら少し見せてから裏に戻す
        streak = 0;
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          flippedIndices = [];
          isLocked = false;
          renderGrid();
        }, 720);
      }
    }
  }

  function usePeekHint() {
    if (peekUsed || isLocked || isGameOver || flippedIndices.length > 0) return;
    peekUsed = true;
    isLocked = true;
    peekBtn.textContent = '✦ 星の啓示 (使用済)';
    peekBtn.style.opacity = '0.45';
    peekBtn.style.cursor = 'default';

    // 未達成のカードを一時的にすべて表向きにする
    const tempShown = [];
    cards.forEach((c, i) => {
      if (!c.matched && !c.flipped) {
        c.flipped = true;
        tempShown.push(i);
      }
    });
    renderGrid();

    setTimeout(() => {
      tempShown.forEach(i => {
        if (!cards[i].matched) cards[i].flipped = false;
      });
      isLocked = false;
      renderGrid();
    }, 1100);
  }

  function finishGame() {
    isGameOver = true;
    clearInterval(timerId);

    const modeLabel = MODES[currentMode].label;
    recordGameScore('15', moves, `moves (${modeLabel})`);

    overlayDescEl.innerHTML = `すべての紋章が夜空に美しく揃いました。<br>手数: <strong style="color:#f3d463; font-size:1.35rem; font-weight:400;">${moves}</strong> <span style="font-size:0.8rem;">moves</span><br><span style="font-size:0.78rem;">クリアタイム: ${formatTime(elapsedSec)} / サイズ: ${modeLabel}</span>`;
    setTimeout(() => {
      if (overlayEl) overlayEl.style.display = 'flex';
    }, 300);
  }

  function startNewGame() {
    const { cols, rows } = MODES[currentMode];
    const pairCount = (cols * rows) / 2;

    isLocked = false;
    isGameOver = false;
    peekUsed = false;
    flippedIndices = [];
    matchedCount = 0;
    moves = 0;
    streak = 0;

    overlayEl.style.display = 'none';
    peekBtn.textContent = '✦ 星の啓示 (残り1回)';
    peekBtn.style.opacity = '1';
    peekBtn.style.cursor = 'pointer';

    // シンボルをシャッフルして必要ペア数だけ選出
    const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck = [];
    shuffledSymbols.forEach((sym, i) => {
      deck.push({ pairId: i, icon: sym.icon, color: sym.color, flipped: false, matched: false });
      deck.push({ pairId: i, icon: sym.icon, color: sym.color, flipped: false, matched: false });
    });

    // フィッシャー–イェーツのシャッフル
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cards = deck;
    updateHUD();
    startTimer();
    renderGrid();
  }

  peekBtn.addEventListener('click', usePeekHint);
  document.getElementById('zcp-reset-btn').addEventListener('click', startNewGame);
  document.getElementById('zcp-retry-btn').addEventListener('click', startNewGame);

  document.querySelectorAll('.zcp-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.zcp-mode-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#7a8ba9';
      });
      const target = e.target;
      target.classList.add('active');
      target.style.background = 'rgba(160,180,255,0.2)';
      target.style.color = '#fff';

      currentMode = target.dataset.mode;
      startNewGame();
    });
  });

  startNewGame();
}