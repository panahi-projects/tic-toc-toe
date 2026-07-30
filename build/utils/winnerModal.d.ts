import { TSymbol } from '../interfaces/index.js';
export declare const WinnerModal: () => {
    show: (winner: TSymbol | null, xScore: number, oScore: number, onPlayAgain: () => void) => void;
    hide: () => void;
};
