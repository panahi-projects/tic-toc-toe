import { IMove, TSymbol } from '../interfaces/index.js';
export declare const Scoring: (squareDimension: number, moves: IMove) => {
    horizontalScoring: (symbol: TSymbol) => number;
    verticalScoring: (symbol: TSymbol) => number;
    rightDiagonalScoring: () => void;
    leftDiagonalScoring: () => void;
};