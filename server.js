const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game rooms management
const rooms = new Map();
const waitingPlayers = [];

class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
    }

    addPlayer(player) {
        if (this.players.length < 2) {
            this.players.push(player);
            return true;
        }
        return false;
    }

    removePlayer(socketId) {
        this.players = this.players.filter(p => p.id !== socketId);
    }

    isFull() {
        return this.players.length === 2;
    }

    isEmpty() {
        return this.players.length === 0;
    }

    getOpponent(socketId) {
        return this.players.find(p => p.id !== socketId);
    }

    makeMove(index, player) {
        if (this.board[index] === null && this.gameActive) {
            this.board[index] = player;
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            return true;
        }
        return false;
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
    }

    getState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive,
            players: this.players.map(p => ({ id: p.id, symbol: p.symbol, username: p.username }))
        };
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Novo jogador conectado: ${socket.id}`);

    // Player wants to play online
    socket.on('find-match', (username) => {
        console.log(`🎮 ${username} está procurando partida...`);

        // Check if there's a waiting player
        if (waitingPlayers.length > 0) {
            // Match with waiting player
            const opponent = waitingPlayers.shift();
            const roomId = `room_${Date.now()}`;
            const room = new GameRoom(roomId);

            // Assign symbols (first player = X, second = O)
            const player1 = { id: opponent.id, symbol: 'X', username: opponent.username };
            const player2 = { id: socket.id, symbol: 'O', username: username };

            room.addPlayer(player1);
            room.addPlayer(player2);

            // Join both players to the room
            opponent.socket.join(roomId);
            socket.join(roomId);

            // Store room
            rooms.set(roomId, room);

            // Notify both players
            io.to(opponent.id).emit('match-found', {
                roomId,
                yourSymbol: 'X',
                opponentUsername: username,
                gameState: room.getState()
            });

            io.to(socket.id).emit('match-found', {
                roomId,
                yourSymbol: 'O',
                opponentUsername: opponent.username,
                gameState: room.getState()
            });

            console.log(`✅ Partida criada: ${roomId}`);
        } else {
            // Add to waiting list
            waitingPlayers.push({ id: socket.id, username, socket });
            socket.emit('waiting-for-opponent');
            console.log(`⏳ ${username} adicionado à fila de espera`);
        }
    });

    // Player makes a move
    socket.on('make-move', ({ roomId, index, player }) => {
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('error', 'Sala não encontrada');
            return;
        }

        if (room.currentPlayer !== player) {
            socket.emit('error', 'Não é seu turno');
            return;
        }

        if (room.makeMove(index, player)) {
            // Broadcast move to both players
            io.to(roomId).emit('move-made', {
                index,
                player,
                gameState: room.getState()
            });
        }
    });

    // Check winner
    socket.on('check-winner', ({ roomId, winner }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.gameActive = false;
            io.to(roomId).emit('game-ended', { winner });
        }
    });

    // Reset game
    socket.on('reset-game', (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            room.reset();
            io.to(roomId).emit('game-reset', room.getState());
        }
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            room.removePlayer(socket.id);
            socket.leave(roomId);
            
            // Notify opponent
            const opponent = room.getOpponent(socket.id);
            if (opponent) {
                io.to(opponent.id).emit('opponent-left');
            }

            // Clean up empty rooms
            if (room.isEmpty()) {
                rooms.delete(roomId);
                console.log(`🗑️ Sala ${roomId} removida`);
            }
        }
    });

    // Player sends chat message
    socket.on('chat-message', ({ roomId, message, username }) => {
        io.to(roomId).emit('chat-message', { message, username, senderId: socket.id });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`❌ Jogador desconectado: ${socket.id}`);

        // Remove from waiting list
        const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
        if (waitingIndex !== -1) {
            waitingPlayers.splice(waitingIndex, 1);
        }

        // Handle room disconnection
        rooms.forEach((room, roomId) => {
            if (room.players.some(p => p.id === socket.id)) {
                room.removePlayer(socket.id);
                
                const opponent = room.getOpponent(socket.id);
                if (opponent) {
                    io.to(opponent.id).emit('opponent-disconnected');
                }

                if (room.isEmpty()) {
                    rooms.delete(roomId);
                }
            }
        });
    });
});

// API endpoints
app.get('/api/stats', (req, res) => {
    res.json({
        activeRooms: rooms.size,
        waitingPlayers: waitingPlayers.length,
        totalPlayers: (rooms.size * 2) + waitingPlayers.length
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║  🎮 Servidor Jogo da Velha Online    ║
    ║  🚀 Rodando na porta ${PORT}            ║
    ║  🌐 http://localhost:${PORT}            ║
    ╚═══════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
    });
});
