import { IStat } from '../interfaces/index.js';
declare class GameStats {
    constructor();
    setStats(newStat: IStat): void;
    updateStats(stat: IStat): IStat[];
    getAllStats(): IStat[];
    getLastStats(): IStat;
    addScore(playerNum: 1 | 2, addedValue: number): void;
}
declare const gameStatsInstance: Readonly<GameStats>;
export default gameStatsInstance;
