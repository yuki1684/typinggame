// ゲームの単語リスト
const words = [
    'typing', 'javascript', 'game', 'battle', 'challenge',
    'keyboard', 'speed', 'accuracy', 'combat', 'warrior',
    'magic', 'dragon', 'adventure', 'quest', 'monster',
    'victory', 'defeat', 'champion', 'skill', 'training',
    'program', 'computer', 'code', 'function', 'array',
    'database', 'network', 'server', 'client', 'browser'
];

// ゲーム状態
const gameState = {
    playerHP: 100,
    enemyHP: 100,
    maxHP: 100,
    currentWord: '',
    correctCount: 0,
    missCount: 0,
    gameOver: false,
    playerWon: false
};

// 変更: DOM要素取得（メニュー、ゲームコンテナ、タイマー、画像、統計）
const menuScreen = document.getElementById('menuScreen');
const gameContainer = document.getElementById('gameContainer');
const beginnerBtn = document.getElementById('beginnerBtn');
const advancedBtn = document.getElementById('advancedBtn');
const timerEl = document.getElementById('timer');

const userInput = document.getElementById('userInput');
const currentWordDisplay = document.querySelector('.current-word');
const playerHPValue = document.querySelector('.player-hp-value');
const playerHPFill = document.querySelector('.player-hp .hp-fill');
const enemyHPValue = document.querySelector('.enemy-hp-value');
const enemyHPFill = document.querySelector('.enemy-hp .hp-fill');

const correctCountDisplay = document.querySelector('.correct-count');
const missCountDisplay = document.querySelector('.miss-count');

const playerImg = document.getElementById('playerImg');
const enemyImg = document.getElementById('enemyImg');

const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalCorrect = document.getElementById('finalCorrect');
const finalMiss = document.getElementById('finalMiss');
const restartBtn = document.getElementById('restartBtn');

// 追加: 画像ファイルパス（必要に応じてファイル名を調整）
const PLAYER_BATTLE_IMG = 'youmu-batoru.png';
const PLAYER_DAMAGE_IMG = 'youmu-dame-ji.png';
const ENEMY_BATTLE_IMG = 'huran-batoru.png';
const ENEMY_DAMAGE_IMG = 'huran-same-ji.png';

// タイマー管理
let timerIntervalId = null;
let timerRemaining = 0; // seconds
let timerMode = null; // 'beginner' | 'advanced' | null

// ゲーム初期化
function initGame(mode = 'beginner') {
    timerMode = mode;
    gameState.playerHP = 100;
    gameState.enemyHP = 100;
    gameState.correctCount = 0;
    gameState.missCount = 0;
    gameState.gameOver = false;
    gameState.playerWon = false;
    userInput.value = '';
    userInput.disabled = false;
    gameOverModal.classList.remove('show');

    // メニューを隠してゲーム表示
    menuScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    // タイマー設定（上級者は2分）
    clearInterval(timerIntervalId);
    if (mode === 'advanced') {
        timerRemaining = 120;
        timerEl.textContent = formatTime(timerRemaining);
        timerEl.setAttribute('aria-hidden', 'false');
        timerIntervalId = setInterval(() => {
            timerRemaining -= 1;
            if (timerRemaining <= 0) {
                clearInterval(timerIntervalId);
                endGame(false); // 時間切れは敗北扱い
            }
            timerEl.textContent = formatTime(timerRemaining);
        }, 1000);
    } else {
        timerEl.textContent = '—';
        timerEl.setAttribute('aria-hidden', 'true');
    }

    selectNewWord();
    updateDisplay();
    userInput.focus();

    // reset images to battle poses
    playerImg.src = PLAYER_BATTLE_IMG;
    enemyImg.src = ENEMY_BATTLE_IMG;
}

// フォーマット関数
function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// 新しい単語を選択
function selectNewWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    gameState.currentWord = words[randomIndex];
    currentWordDisplay.textContent = gameState.currentWord;
}

// 入力チェック
function checkInput() {
    const input = userInput.value.trim().toLowerCase();
    const word = gameState.currentWord.toLowerCase();

    // 完全一致したか
    if (input === word) {
        handleCorrect();
    } else if (input.length > 0 && !word.startsWith(input)) {
        // 入力された文字が単語の先頭と一致しない場合（ミス）
        handleIncorrect();
    }
}

// 正解時の処理（敵にダメージ） - 画像差し替えと移動を追加
function handleCorrect() {
    gameState.correctCount++;
    gameState.enemyHP = Math.max(0, gameState.enemyHP - 20);

    // 敵にダメージ表現
    enemyImg.src = ENEMY_DAMAGE_IMG;
    enemyImg.classList.add('damaged');
    setTimeout(() => {
        enemyImg.classList.remove('damaged');
        enemyImg.src = ENEMY_BATTLE_IMG;
    }, 300);

    userInput.value = '';
    selectNewWord();
    updateDisplay();

    // 敵のHP確認
    if (gameState.enemyHP === 0) {
        endGame(true);
    }

    userInput.focus();
}

// 間違い時の処理（プレイヤーにダメージ） - 画像差し替えと移動を追加
function handleIncorrect() {
    gameState.missCount++;
    gameState.playerHP = Math.max(0, gameState.playerHP - 10);

    // プレイヤーにダメージ表現
    playerImg.src = PLAYER_DAMAGE_IMG;
    playerImg.classList.add('damaged');
    setTimeout(() => {
        playerImg.classList.remove('damaged');
        playerImg.src = PLAYER_BATTLE_IMG;
    }, 300);

    userInput.value = '';
    updateDisplay();

    // プレイヤーのHP確認
    if (gameState.playerHP === 0) {
        endGame(false);
    }

    userInput.focus();
}

// 表示更新（統計部分の反映を追加）
function updateDisplay() {
    playerHPValue.textContent = gameState.playerHP;
    enemyHPValue.textContent = gameState.enemyHP;

    const playerHPPercent = (gameState.playerHP / gameState.maxHP) * 100;
    const enemyHPPercent = (gameState.enemyHP / gameState.maxHP) * 100;

    playerHPFill.style.width = playerHPPercent + '%';
    enemyHPFill.style.width = enemyHPPercent + '%';

    if (correctCountDisplay) correctCountDisplay.textContent = gameState.correctCount;
    if (missCountDisplay) missCountDisplay.textContent = gameState.missCount;
}

// ゲーム終了
function endGame(playerWon) {
    gameState.gameOver = true;
    userInput.disabled = true;

    // タイマー停止
    clearInterval(timerIntervalId);

    if (playerWon) {
        gameOverTitle.textContent = '🎉 勝利! 🎉';
        gameOverMessage.textContent = '敵を倒しました!';
    } else {
        gameOverTitle.textContent = '💀 敗北 💀';
        gameOverMessage.textContent = 'ゲームオーバー...';
    }

    finalCorrect.textContent = gameState.correctCount;
    finalMiss.textContent = gameState.missCount;
    gameOverModal.classList.add('show');
}

// メニューからゲーム開始のハンドラ
beginnerBtn.addEventListener('click', () => initGame('beginner'));
advancedBtn.addEventListener('click', () => initGame('advanced'));

// Restart ボタンはメニューを再表示（再挑戦前にモードを選べる）
restartBtn.addEventListener('click', () => {
    gameOverModal.classList.remove('show');
    menuScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    clearInterval(timerIntervalId);
});

// 入力イベント（既存）
userInput.addEventListener('input', checkInput);

// 初期表示はメニュー（initGameを直接呼ばない）