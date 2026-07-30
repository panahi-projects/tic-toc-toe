import { IMove, IPlayer, IPlayerMove, TSymbol, TType } from '../interfaces/index.js';

let instance: any;
let moves: IMove = {
    x: {
        player: {} as IPlayer,
        selectedCells: []
    },
    o: {
        player: {} as IPlayer,
        selectedCells: []
    }
} as IMove;
let currentTurn: TSymbol = 'x';
let isGameOver: boolean = false;

class Moves {
    constructor() {
        if (instance) throw new Error('New instance cannot be created!');
        instance = this;
    }
    resetMoves() {
        moves = {
            x: {
                player: {} as IPlayer,
                selectedCells: []
            },
            o: {
                player: {} as IPlayer,
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
    setGameOver(value: boolean) {
        isGameOver = value;
    }
    doesExistAnyMove() {
        if (moves?.o?.selectedCells?.length > 0 || moves?.x?.selectedCells?.length > 0) return true;
        return false;
    }
    getMoves() {
        return moves;
    }
    updateMoves(playerMove: IPlayerMove) {
        if (playerMove.player.symbol === 'x') {
            moves.x.player = playerMove.player;
            moves.x.selectedCells.concat(playerMove.selectedCells);
        } else if (playerMove.player.symbol === 'o') {
            moves.o.player = playerMove.player;
            moves.o.selectedCells.concat(playerMove.selectedCells);
        }
        return moves;
    }
    currentTurn() {
        return currentTurn;
    }
    updateTurn(turn: TSymbol) {
        currentTurn = turn;
    }
}

const movesInstance = Object.freeze(new Moves());
export default movesInstance;
