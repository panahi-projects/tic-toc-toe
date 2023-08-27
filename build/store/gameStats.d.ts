import { IStat, TSymbol } from '../interfaces/index.js';
declare class GameStats {
    constructor();
    setStats(newStat: IStat): void;
    updateStats(stat: IStat): IStat[];
    getAllStats(): IStat[];
    getLastStats(): IStat;
    addScore(playerSymbol: TSymbol, newValue: number): void;
}
declare const gameStatsInstance: Readonly<GameStats>;
export default gameStatsInstance;
