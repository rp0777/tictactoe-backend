// Medium Difficulty Bot Move
function getMediumMove(board, botSymbol, opponentSymbol) {
    // Check for winning move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = botSymbol;
            if (checkWin(board, botSymbol)) {
                return i;
            }
            board[i] = null;
        }
    }

    // Block opponent's winning move
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = opponentSymbol;
            if (checkWin(board, opponentSymbol)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }

    // Make a random move
    return getRandomMove(board);
}

// Hard Difficulty Bot Move (Minimax Algorithm)
function getBestMove(board, botSymbol) {
    const opponentSymbol = botSymbol === 'O' ? 'X' : 'O';
    const bestMove = minimax(board, botSymbol, opponentSymbol);
    return bestMove.index;
}

function minimax(board, playerSymbol, opponentSymbol) {
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

    // Check for terminal state
    if (checkWin(board, playerSymbol)) return { score: 10 };
    if (checkWin(board, opponentSymbol)) return { score: -10 };
    if (availableMoves.length === 0) return { score: 0 };

    const moves = [];

    for (let move of availableMoves) {
        board[move] = playerSymbol;
        const result = minimax(board, opponentSymbol, playerSymbol);
        board[move] = null;
        moves.push({ index: move, score: result.score });
    }

    let bestMove;
    if (playerSymbol === 'O') {
        bestMove = moves.reduce((best, move) => move.score > best.score ? move : best, { score: -Infinity });
    } else {
        bestMove = moves.reduce((best, move) => move.score < best.score ? move : best, { score: Infinity });
    }

    return bestMove;
}

// Random Move Helper Function
function getRandomMove(board) {
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}
