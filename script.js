// ==================== GAME STATE ====================
const GameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X', // X = Human, O = AI
    gameActive: true,
    gameMode: 'ai', // 'ai' or 'online'
    difficulty: 'easy',
    history: [],
    historyIndex: -1,
    scores: {
        player: 0,
        ai: 0,
        draws: 0
    }
};

// ==================== DOM ELEMENTS ====================
const cells = document.querySelectorAll('.cell');
const turnText = document.getElementById('turnText');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const drawScoreEl = document.getElementById('drawScore');
const resetBtn = document.getElementById('resetBtn');
const clearScoreBtn = document.getElementById('clearScoreBtn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalBtn = document.getElementById('modalBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const historyInfo = document.getElementById('historyInfo');
const gameBoard = document.querySelector('.game-board');

// Online mode elements
const modeBtns = document.querySelectorAll('.mode-btn');
const difficultyContainer = document.getElementById('difficultyContainer');
const onlineControls = document.getElementById('onlineControls');
const usernameInput = document.getElementById('usernameInput');
const findMatchBtn = document.getElementById('findMatchBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

// ==================== WINNING COMBINATIONS ====================
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// ==================== INITIALIZATION ====================
/**
 * Initialize the game
 */
function init() {
    loadScores();
    updateScoreboard();
    setupEventListeners();
    updateHistoryUI();
    
    // Initialize multiplayer if socket.io is available
    if (typeof io !== 'undefined') {
        multiplayer.init();
    }
}

// ==================== EVENT LISTENERS ====================
/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Cell clicks and keyboard navigation
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCellClick(index);
            }
        });
        cell.addEventListener('mouseenter', () => showPreview(index));
        cell.addEventListener('mouseleave', () => hidePreview(index));
    });

    // Control buttons
    resetBtn.addEventListener('click', resetGame);
    clearScoreBtn.addEventListener('click', clearScores);
    modalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        resetGame();
    });

    // Difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => changeDifficulty(btn.dataset.level));
    });

    // History controls
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // Mode selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => changeGameMode(btn.dataset.mode));
    });

    // Online mode controls
    findMatchBtn.addEventListener('click', handleFindMatch);
    
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleFindMatch();
        }
    });

    sendChatBtn.addEventListener('click', () => {
        const message = chatInput.value;
        multiplayer.sendChatMessage(message);
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value;
            multiplayer.sendChatMessage(message);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// ==================== GAME LOGIC ====================
/**
 * Handle cell click event
 * @param {number} index - Cell index (0-8)
 */
function handleCellClick(index) {
    if (!GameState.gameActive || GameState.board[index]) {
        return;
    }

    if (GameState.gameMode === 'ai') {
        // AI mode - only allow player X
        if (GameState.currentPlayer !== 'X') {
            return;
        }
        makeMove(index, 'X');
        
        if (GameState.gameActive) {
            setTimeout(() => aiMove(), 600);
        }
    } else if (GameState.gameMode === 'online') {
        // Online mode - check if it's player's turn
        if (!multiplayer.canMakeMove()) {
            return;
        }
        
        makeMove(index, multiplayer.playerSymbol);
        multiplayer.makeMove(index, multiplayer.playerSymbol);
    }
}

/**
 * Make a move on the board
 * @param {number} index - Cell index
 * @param {string} player - 'X' or 'O'
 */
function makeMove(index, player) {
    // Save to history (only in AI mode)
    if (GameState.gameMode === 'ai') {
        if (GameState.historyIndex < GameState.history.length - 1) {
            GameState.history = GameState.history.slice(0, GameState.historyIndex + 1);
        }
        
        GameState.history.push({
            board: [...GameState.board],
            player: GameState.currentPlayer
        });
        GameState.historyIndex++;
    }

    // Make the move
    GameState.board[index] = player;
    updateCell(index, player);
    
    const result = checkWinner();
    if (result) {
        handleGameEnd(result);
    } else {
        switchPlayer();
    }

    if (GameState.gameMode === 'ai') {
        updateHistoryUI();
    }
}

/**
 * Update a cell with player mark
 * @param {number} index - Cell index
 * @param {string} player - 'X' or 'O'
 */
function updateCell(index, player) {
    const cell = cells[index];
    cell.classList.add('taken');
    cell.setAttribute('aria-label', `Casa ${index + 1}, ${player}`);
    
    const mark = document.createElement('span');
    mark.className = `mark ${player}`;
    mark.textContent = player;
    cell.appendChild(mark);
}

/**
 * Switch to next player
 */
function switchPlayer() {
    GameState.currentPlayer = GameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

/**
 * Update turn indicator UI
 */
function updateTurnIndicator() {
    if (GameState.gameMode === 'ai') {
        // AI Mode - show "SUA VEZ" or "VEZ DA IA"
        if (GameState.currentPlayer === 'X') {
            turnText.textContent = 'SUA VEZ';
            turnText.style.color = 'var(--cyber-blue)';
        } else {
            turnText.textContent = 'VEZ DA IA';
            turnText.style.color = 'var(--cyber-pink)';
        }
    } else if (GameState.gameMode === 'online') {
        // Online Mode - show player names
        if (GameState.currentPlayer === 'X') {
            // Get X player name
            const xPlayerName = multiplayer.playerSymbol === 'X' 
                ? multiplayer.username 
                : multiplayer.opponentUsername;
            
            turnText.textContent = `VEZ DE ${xPlayerName.toUpperCase()}`;
            turnText.style.color = 'var(--cyber-blue)';
        } else {
            // Get O player name
            const oPlayerName = multiplayer.playerSymbol === 'O' 
                ? multiplayer.username 
                : multiplayer.opponentUsername;
            
            turnText.textContent = `VEZ DE ${oPlayerName.toUpperCase()}`;
            turnText.style.color = 'var(--cyber-pink)';
        }
    }
}

// ==================== AI LOGIC ====================
/**
 * Execute AI move based on difficulty
 */
function aiMove() {
    if (!GameState.gameActive || GameState.currentPlayer !== 'O') return;

    let move;
    
    // Add thinking animation
    const availableCells = GameState.board
        .map((val, idx) => val === null ? idx : null)
        .filter(val => val !== null);
    
    availableCells.forEach(idx => cells[idx].classList.add('thinking'));

    setTimeout(() => {
        availableCells.forEach(idx => cells[idx].classList.remove('thinking'));

        switch (GameState.difficulty) {
            case 'easy':
                move = getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.5 ? getMinimaxMove() : getRandomMove();
                break;
            case 'hard':
                move = getMinimaxMove();
                break;
        }

        if (move !== null) {
            makeMove(move, 'O');
        }
    }, 400);
}

/**
 * Get random available move
 * @returns {number|null} Cell index or null
 */
function getRandomMove() {
    const available = GameState.board
        .map((val, idx) => val === null ? idx : null)
        .filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get best move using Minimax algorithm
 * @returns {number|null} Best cell index or null
 */
function getMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (GameState.board[i] === null) {
            GameState.board[i] = 'O';
            const score = minimax(GameState.board, 0, false);
            GameState.board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

/**
 * Minimax algorithm implementation
 * @param {Array} board - Current board state
 * @param {number} depth - Current depth in tree
 * @param {boolean} isMaximizing - Is maximizing player
 * @returns {number} Score for this move
 */
function minimax(board, depth, isMaximizing) {
    const result = checkWinnerForBoard(board);
    
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        return 0; // Draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// ==================== WIN CHECKING ====================
/**
 * Check if there's a winner on current board
 * @returns {string|null} 'X', 'O', 'draw', or null
 */
function checkWinner() {
    return checkWinnerForBoard(GameState.board);
}

/**
 * Check winner for any board state
 * @param {Array} board - Board to check
 * @returns {string|null} 'X', 'O', 'draw', or null
 */
function checkWinnerForBoard(board) {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== null)) {
        return 'draw';
    }

    return null;
}

/**
 * Get the winning combination indices
 * @returns {Array|null} Winning combination or null
 */
function getWinningCombination() {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (GameState.board[a] && 
            GameState.board[a] === GameState.board[b] && 
            GameState.board[a] === GameState.board[c]) {
            return combination;
        }
    }
    return null;
}

// ==================== GAME END ====================
/**
 * Handle game end
 * @param {string} result - 'X', 'O', or 'draw'
 */
function handleGameEnd(result) {
    GameState.gameActive = false;

    if (result === 'draw') {
        GameState.scores.draws++;
        showModal('EMPATE!', 'Ninguém venceu desta vez.');
    } else {
        const winCombination = getWinningCombination();
        drawWinLine(winCombination);

        if (GameState.gameMode === 'ai') {
            // AI Mode
            if (result === 'X') {
                GameState.scores.player++;
                showModal('VITÓRIA! 🎉', 'Parabéns! Você venceu a IA!');
                createConfetti();
            } else {
                GameState.scores.ai++;
                showModal('DERROTA', 'A IA venceu desta vez.');
            }
        } else if (GameState.gameMode === 'online') {
            // Online Mode - show winner name
            const winnerName = result === 'X' 
                ? (multiplayer.playerSymbol === 'X' ? multiplayer.username : multiplayer.opponentUsername)
                : (multiplayer.playerSymbol === 'O' ? multiplayer.username : multiplayer.opponentUsername);
            
            if (result === multiplayer.playerSymbol) {
                // You won
                GameState.scores.player++;
                showModal('VITÓRIA! 🎉', `Parabéns ${multiplayer.username}! Você venceu!`);
                createConfetti();
            } else {
                // Opponent won
                GameState.scores.ai++;
                showModal('DERROTA', `${multiplayer.opponentUsername} venceu desta vez.`);
            }
        }
    }

    updateScoreboard();
    saveScores();
}

/**
 * Draw winning line animation
 * @param {Array} combination - Winning combination indices
 */
function drawWinLine(combination) {
    const line = document.createElement('div');
    line.className = 'win-line';

    const [a, b, c] = combination;

    // Determine line type and position
    if (a === 0 && b === 1 && c === 2) {
        line.classList.add('horizontal');
        line.style.top = 'calc(var(--cell-size) / 2 + 20px)';
    } else if (a === 3 && b === 4 && c === 5) {
        line.classList.add('horizontal');
        line.style.top = 'calc(var(--cell-size) * 1.5 + 27.5px)';
    } else if (a === 6 && b === 7 && c === 8) {
        line.classList.add('horizontal');
        line.style.top = 'calc(var(--cell-size) * 2.5 + 35px)';
    } else if (a === 0 && b === 3 && c === 6) {
        line.classList.add('vertical');
        line.style.left = 'calc(var(--cell-size) / 2 + 20px)';
    } else if (a === 1 && b === 4 && c === 7) {
        line.classList.add('vertical');
        line.style.left = 'calc(var(--cell-size) * 1.5 + 27.5px)';
    } else if (a === 2 && b === 5 && c === 8) {
        line.classList.add('vertical');
        line.style.left = 'calc(var(--cell-size) * 2.5 + 35px)';
    } else if (a === 0 && b === 4 && c === 8) {
        line.classList.add('diagonal');
        line.style.transform = 'translate(-50%, -50%) rotate(45deg)';
    } else if (a === 2 && b === 4 && c === 6) {
        line.classList.add('diagonal');
        line.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
    }

    gameBoard.appendChild(line);
}

/**
 * Create confetti animation for victory
 */
function createConfetti() {
    const colors = ['var(--cyber-blue)', 'var(--cyber-pink)', 'var(--cyber-purple)', 'var(--cyber-green)'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// ==================== MODAL ====================
/**
 * Show game end modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 */
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('active');
    modalBtn.focus();
}

// ==================== RESET & CLEAR ====================
/**
 * Reset game to initial state
 */
function resetGame() {
    GameState.board = Array(9).fill(null);
    GameState.currentPlayer = 'X';
    GameState.gameActive = true;
    GameState.history = [];
    GameState.historyIndex = -1;

    cells.forEach((cell, index) => {
        cell.innerHTML = '';
        cell.classList.remove('taken');
        cell.setAttribute('aria-label', `Casa ${index + 1}, vazia`);
    });

    const winLine = gameBoard.querySelector('.win-line');
    if (winLine) winLine.remove();

    updateTurnIndicator();
    updateHistoryUI();
}

/**
 * Clear all scores
 */
function clearScores() {
    if (confirm('Deseja realmente zerar o placar?')) {
        GameState.scores = { player: 0, ai: 0, draws: 0 };
        updateScoreboard();
        saveScores();
    }
}

// ==================== DIFFICULTY ====================
/**
 * Change game difficulty
 * @param {string} level - 'easy', 'medium', or 'hard'
 */
function changeDifficulty(level) {
    GameState.difficulty = level;
    
    difficultyBtns.forEach(btn => {
        const isActive = btn.dataset.level === level;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });

    resetGame();
}

// ==================== HISTORY ====================
/**
 * Undo last move
 */
function undo() {
    if (GameState.historyIndex <= 0) return;

    GameState.historyIndex--;
    restoreFromHistory();
}

/**
 * Redo move
 */
function redo() {
    if (GameState.historyIndex >= GameState.history.length - 1) return;

    GameState.historyIndex++;
    restoreFromHistory();
}

/**
 * Restore game state from history
 */
function restoreFromHistory() {
    const state = GameState.history[GameState.historyIndex];
    GameState.board = [...state.board];
    GameState.currentPlayer = state.player;
    GameState.gameActive = true;

    // Update UI
    cells.forEach((cell, index) => {
        cell.innerHTML = '';
        cell.classList.remove('taken');
        
        if (GameState.board[index]) {
            updateCell(index, GameState.board[index]);
        } else {
            cell.setAttribute('aria-label', `Casa ${index + 1}, vazia`);
        }
    });

    const winLine = gameBoard.querySelector('.win-line');
    if (winLine) winLine.remove();

    updateTurnIndicator();
    updateHistoryUI();
}

/**
 * Update history UI controls
 */
function updateHistoryUI() {
    undoBtn.disabled = GameState.historyIndex <= 0;
    redoBtn.disabled = GameState.historyIndex >= GameState.history.length - 1;
    historyInfo.textContent = `Jogada ${GameState.historyIndex + 1}/${GameState.history.length}`;
}

// ==================== PREVIEW ====================
/**
 * Show move preview on hover
 * @param {number} index - Cell index
 */
function showPreview(index) {
    if (GameState.board[index] || !GameState.gameActive || GameState.currentPlayer !== 'X') {
        return;
    }

    cells[index].classList.add('preview');
    cells[index].setAttribute('data-preview', 'X');
}

/**
 * Hide move preview
 * @param {number} index - Cell index
 */
function hidePreview(index) {
    cells[index].classList.remove('preview');
    cells[index].removeAttribute('data-preview');
}

// ==================== SCOREBOARD & STORAGE ====================
/**
 * Update scoreboard display
 */
function updateScoreboard() {
    playerScoreEl.textContent = GameState.scores.player;
    aiScoreEl.textContent = GameState.scores.ai;
    drawScoreEl.textContent = GameState.scores.draws;
}

/**
 * Save scores to localStorage
 */
function saveScores() {
    localStorage.setItem('tictactoe_scores', JSON.stringify(GameState.scores));
}

/**
 * Load scores from localStorage
 */
function loadScores() {
    const saved = localStorage.getItem('tictactoe_scores');
    if (saved) {
        GameState.scores = JSON.parse(saved);
    }
}

// ==================== GAME MODE ====================
/**
 * Change game mode (AI vs Online)
 */
function changeGameMode(mode) {
    GameState.gameMode = mode;
    
    modeBtns.forEach(btn => {
        const isActive = btn.dataset.mode === mode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });

    if (mode === 'ai') {
        // Show difficulty selector, hide online controls
        difficultyContainer.style.display = 'flex';
        onlineControls.style.display = 'none';
        document.getElementById('chatContainer').style.display = 'none';
        
        // Leave online room if in one
        if (multiplayer.roomId) {
            multiplayer.leaveRoom();
        }
        
        // Enable history for AI mode
        document.querySelector('.history').style.display = 'block';
    } else if (mode === 'online') {
        // Hide difficulty selector, show online controls
        difficultyContainer.style.display = 'none';
        onlineControls.style.display = 'block';
        
        // Disable history for online mode
        document.querySelector('.history').style.display = 'none';
    }

    resetGame();
}

/**
 * Handle find match button click
 */
function handleFindMatch() {
    if (multiplayer.roomId) {
        // Already in a room, leave it
        if (confirm('Deseja sair da partida atual?')) {
            multiplayer.leaveRoom();
        }
    } else {
        // Find a new match
        const username = usernameInput.value;
        multiplayer.findMatch(username);
    }
}

// ==================== START GAME ====================
init();
