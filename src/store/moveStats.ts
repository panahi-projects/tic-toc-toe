import { IMove, IPlayer, IPlayerMove, TSymbol, TType } from '../interfaces/index.js';
import GameStatsInstance from './gameStats.js';

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

class Moves {
    constructor() {
        if (instance) throw new Error('New instance cannot be created!');
        instance = this;
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
    getCurrentTurn() {
        return currentTurn;
    }
    updateTurn(turn: TSymbol) {
        currentTurn = turn;
    }
}

const movesInstance = Object.freeze(new Moves());
export default movesInstance;
