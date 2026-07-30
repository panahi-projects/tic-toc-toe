import { IMove, IPlayerMove, TSymbol } from '../interfaces/index.js';
declare class Moves {
    constructor();
    resetMoves(): void;
    totalMoves(): number;
    gameOver(): boolean;
    setGameOver(value: boolean): void;
    doesExistAnyMove(): boolean;
    getMoves(): IMove;
    updateMoves(playerMove: IPlayerMove): IMove;
    currentTurn(): TSymbol;
    updateTurn(turn: TSymbol): void;
}
declare const movesInstance: Readonly<Moves>;
export default movesInstance;
