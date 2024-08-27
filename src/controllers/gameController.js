import { getMediumMove, getBestMove } from '../services/botService.js';
import { updatePoints, findOpponent, addUser, removeUser, updateUserStatus } from '../services/userService.js';
import { checkWin } from '../utils/helpers.js';

const games = {}; // Store ongoing games in-memory

export function setupGameController(io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        addUser(socket.id);
        io.emit('activeUsers', Object.keys(games).length);

        socket.on('createGame', async (difficulty) => {
            await updateUserStatus(socket.id, 'in-game');
            const opponent = await findOpponent(socket.id);

            const botSymbol = Math.random() < 0.5 ? 'X' : 'O';
            const userSymbol = botSymbol === 'X' ? 'O' : 'X';
``
            if (opponent) {
                const gameId = Math.random().toString(36).substr(2, 9);
                games[gameId] = {
                    players: [socket.id, opponent],
                    board: Array(9).fill(null),
                    currentTurn: 'X'
                };
                socket.join(gameId);
                io.to(opponent).socketsJoin(gameId);
                io.to(gameId).emit('gameStarted', { gameId });
            } else {
                const gameId = Math.random().toString(36).substr(2, 9);
                games[gameId] = {
                    players: [socket.id, 'bot'],
                    board: Array(9).fill(null),
                    currentTurn: 'X',
                    difficulty,
                    botSymbol,
                    userSymbol
                };
                socket.join(gameId);
                io.to(gameId).emit('gameStarted', { gameId });
                playBotMove(gameId);
            }
        });

        socket.on('makeMove', async ({ gameId, index }) => {
            const game = games[gameId];
            if (game) {
                const currentPlayer = game.players[game.currentTurn === 'X' ? 0 : 1];
                if (socket.id === currentPlayer && game.board[index] === null) {
                    game.board[index] = game.currentTurn;
                    game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
                    io.to(gameId).emit('moveMade', { board: game.board });

                    if (checkWin(game.board, socket.id)) {
                        const winner = socket.id;
                        const loser = game.players.find(playerId => playerId !== winner);
                        await updatePoints(winner, 'win');
                        if (loser !== 'bot') await updatePoints(loser, 'lose');
                        io.to(gameId).emit('gameOver', { winner });
                        endGame(gameId);
                    } else if (game.board.every(cell => cell !== null)) {
                        io.to(gameId).emit('gameOver', { winner: null });
                        endGame(gameId);
                    } else if (game.players[game.currentTurn === 'X' ? 0 : 1] === 'bot') {
                        playBotMove(gameId);
                    }
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);
            await removeUser(socket.id);
            io.emit('activeUsers', Object.keys(games).length);
        });
    });
}

async function playBotMove(gameId) {
    const game = games[gameId];
    const move = game.difficulty === 'hard' ? getBestMove(game.board, game.botSymbol) : getMediumMove(game.board, game.botSymbol, game.userSymbol);
    if (game.board[move] === null) {
        game.board[move] = game.currentTurn;
        game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
        io.to(gameId).emit('moveMade', { board: game.board });

        if (checkWin(game.board, 'bot')) {
            io.to(gameId).emit('gameOver', { winner: 'bot' });
            await updatePoints('bot', 'win');
            await updatePoints(game.players[0] === 'bot' ? game.players[1] : game.players[0], 'lose');
            endGame(gameId);
        } else if (game.board.every(cell => cell !== null)) {
            io.to(gameId).emit('gameOver', { winner: null });
            endGame(gameId);
        }
    }
}

function endGame(gameId) {
    const game = games[gameId];
    game.players.forEach(async playerId => {
        await updateUserStatus(playerId, 'available');
    });
    delete games[gameId];
}
