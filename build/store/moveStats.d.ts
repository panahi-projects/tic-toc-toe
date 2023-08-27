import { IMove, IPlayerMove, TSymbol } from '../interfaces/index.js';
declare class Moves {
    constructor();
    resetMoves(): void;
    doesExistAnyMove(): boolean;
    getMoves(): IMove;
    updateMoves(playerMove: IPlayerMove): IMove;
    getCurrentTurn(): TSymbol;
    updateTurn(turn: TSymbol): void;
}
declare const movesInstance: Readonly<Moves>;
export default movesInstance;
