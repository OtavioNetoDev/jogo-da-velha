// ==================== MULTIPLAYER MODULE ====================

class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerSymbol = null;
        this.opponentUsername = null;
        this.username = null;
        this.isConnected = false;
    }

    /**
     * Initialize Socket.IO connection
     */
    init() {
        // Connect to server (adjust URL for production)
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        this.socket = io(serverUrl);
        this.setupSocketListeners();
    }

    /**
     * Setup all socket event listeners
     */
    setupSocketListeners() {
        // Connection established
        this.socket.on('connect', () => {
            console.log('✅ Conectado ao servidor');
            this.isConnected = true;
        });

        // Waiting for opponent
        this.socket.on('waiting-for-opponent', () => {
            this.showStatus('⏳ Procurando oponente...', 'waiting');
        });

        // Match found
        this.socket.on('match-found', (data) => {
            this.roomId = data.roomId;
            this.playerSymbol = data.yourSymbol;
            this.opponentUsername = data.opponentUsername;
            
            this.showStatus(`✅ Partida encontrada!`, 'connected');
            this.showOpponentInfo(data.opponentUsername);
            
            // Initialize online game
            GameState.gameMode = 'online';
            GameState.currentPlayer = data.gameState.currentPlayer;
            resetGame();
            
            // Update turn indicator with player names
            updateTurnIndicator();
            
            // Update UI
            document.getElementById('findMatchBtn').textContent = '🚪 Sair da Partida';
            document.getElementById('chatContainer').style.display = 'block';
        });

        // Move made by opponent
        this.socket.on('move-made', (data) => {
            const { index, player } = data;
            
            if (player !== this.playerSymbol) {
                // Opponent's move
                GameState.board[index] = player;
                updateCell(index, player);
                
                const result = checkWinner();
                if (result) {
                    handleGameEnd(result);
                    this.socket.emit('check-winner', { 
                        roomId: this.roomId, 
                        winner: result 
                    });
                } else {
                    GameState.currentPlayer = this.playerSymbol;
                    updateTurnIndicator();
                }
            } else {
                // Own move confirmation - just update turn indicator
                GameState.currentPlayer = data.gameState.currentPlayer;
                updateTurnIndicator();
            }
        });

        // Game ended
        this.socket.on('game-ended', (data) => {
            // Game already ended locally, just sync
        });

        // Game reset
        this.socket.on('game-reset', (gameState) => {
            resetGame();
            GameState.currentPlayer = gameState.currentPlayer;
            updateTurnIndicator();
        });

        // Opponent left
        this.socket.on('opponent-left', () => {
            this.showStatus('❌ Oponente saiu da partida', 'error');
            setTimeout(() => {
                alert('Oponente desconectou. Você voltará ao menu.');
                this.leaveRoom();
            }, 1000);
        });

        // Opponent disconnected
        this.socket.on('opponent-disconnected', () => {
            this.showStatus('❌ Oponente desconectou', 'error');
            setTimeout(() => {
                alert('Oponente desconectou. Você voltará ao menu.');
                this.leaveRoom();
            }, 1000);
        });

        // Chat message received
        this.socket.on('chat-message', (data) => {
            this.addChatMessage(data.message, data.username, data.senderId === this.socket.id);
        });

        // Error
        this.socket.on('error', (message) => {
            console.error('Socket error:', message);
            this.showStatus(`❌ Erro: ${message}`, 'error');
        });

        // Disconnect
        this.socket.on('disconnect', () => {
            console.log('❌ Desconectado do servidor');
            this.isConnected = false;
            this.showStatus('❌ Desconectado do servidor', 'error');
        });
    }

    /**
     * Find a match
     */
    findMatch(username) {
        if (!username || username.trim() === '') {
            alert('Por favor, digite seu nome!');
            return;
        }

        this.username = username.trim();
        this.socket.emit('find-match', this.username);
        
        document.getElementById('usernameInput').disabled = true;
        document.getElementById('findMatchBtn').disabled = true;
    }

    /**
     * Make a move
     */
    makeMove(index, player) {
        if (this.roomId && player === this.playerSymbol) {
            this.socket.emit('make-move', {
                roomId: this.roomId,
                index,
                player
            });
        }
    }

    /**
     * Reset game
     */
    resetGame() {
        if (this.roomId) {
            this.socket.emit('reset-game', this.roomId);
        }
    }

    /**
     * Leave room
     */
    leaveRoom() {
        if (this.roomId) {
            this.socket.emit('leave-room', this.roomId);
            this.roomId = null;
            this.playerSymbol = null;
            this.opponentUsername = null;
        }

        // Reset UI
        document.getElementById('usernameInput').disabled = false;
        document.getElementById('usernameInput').value = '';
        document.getElementById('findMatchBtn').disabled = false;
        document.getElementById('findMatchBtn').textContent = '🔍 Buscar Partida';
        document.getElementById('onlineStatus').innerHTML = '';
        document.getElementById('opponentInfo').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'none';
        document.getElementById('chatMessages').innerHTML = '';

        // Return to AI mode
        GameState.gameMode = 'ai';
        resetGame();
    }

    /**
     * Send chat message
     */
    sendChatMessage(message) {
        if (!message || message.trim() === '' || !this.roomId) {
            return;
        }

        this.socket.emit('chat-message', {
            roomId: this.roomId,
            message: message.trim(),
            username: this.username
        });

        // Clear input
        document.getElementById('chatInput').value = '';
    }

    /**
     * Add chat message to UI
     */
    addChatMessage(message, username, isOwn) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
        
        messageDiv.innerHTML = `
            <div class="username">${username}</div>
            <div class="text">${this.escapeHtml(message)}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show online status
     */
    showStatus(message, type = 'waiting') {
        const statusEl = document.getElementById('onlineStatus');
        statusEl.textContent = message;
        statusEl.className = `online-status ${type}`;
        statusEl.style.display = 'block';
    }

    /**
     * Show opponent info
     */
    showOpponentInfo(opponentName) {
        const opponentInfo = document.getElementById('opponentInfo');
        const opponentNameEl = document.getElementById('opponentName');
        
        opponentNameEl.textContent = opponentName;
        opponentInfo.style.display = 'block';
    }

    /**
     * Can make move (check if it's player's turn)
     */
    canMakeMove() {
        return this.playerSymbol === GameState.currentPlayer;
    }
}

// Create global instance
const multiplayer = new MultiplayerManager();
