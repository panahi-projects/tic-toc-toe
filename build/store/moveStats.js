let instance;
let moves = {
    x: {
        player: {},
        selectedCells: []
    },
    o: {
        player: {},
        selectedCells: []
    }
};
let currentTurn = 'x';
let isGameOver = false;
class Moves {
    constructor() {
        if (instance)
            throw new Error('New instance cannot be created!');
        instance = this;
    }
    resetMoves() {
        moves = {
            x: {
                player: {},
                selectedCells: []
            },
            o: {
                player: {},
                selectedCells: []
            }
        };
        currentTurn = 'x';
        isGameOver = false;
    }
    totalMoves() {
        return (moves?.x?.selectedCells?.length || 0) + (moves?.o?.selectedCells?.length || 0);
    }
    gameOver() {
        return isGameOver;
    }
    setGameOver(value) {
        isGameOver = value;
    }
    doesExistAnyMove() {
        if (moves?.o?.selectedCells?.length > 0 || moves?.x?.selectedCells?.length > 0)
            return true;
        return false;
    }
    getMoves() {
        return moves;
    }
    updateMoves(playerMove) {
        if (playerMove.player.symbol === 'x') {
            moves.x.player = playerMove.player;
            moves.x.selectedCells.concat(playerMove.selectedCells);
        }
        else if (playerMove.player.symbol === 'o') {
            moves.o.player = playerMove.player;
            moves.o.selectedCells.concat(playerMove.selectedCells);
        }
        return moves;
    }
    currentTurn() {
        return currentTurn;
    }
    updateTurn(turn) {
        currentTurn = turn;
    }
}
const movesInstance = Object.freeze(new Moves());
export default movesInstance;
//# sourceMappingURL=moveStats.js.map