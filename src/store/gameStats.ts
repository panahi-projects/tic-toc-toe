import { IPlayer, IStat } from '../interfaces/index.js';

let instance: any;
const stats: IStat[] = [];

class GameStats {
    constructor() {
        if (instance) {
            throw new Error('New instance cannot be created!');
        }
        instance = this;
    }

    setStats(newStat: IStat): void {
        stats.push(newStat);
    }
    updateStats(stat: IStat): IStat[] {
        let foundStatIndex = stats.findIndex((s) => s.contestId === stat.contestId);
        if (foundStatIndex) {
            stats.splice(foundStatIndex, 1, stat);
        }
        return stats;
    }
    getAllStats(): IStat[] {
        return stats;
    }
    getLastStats(): IStat {
        return stats[stats.length - 1];
    }
    addScore(playerNum: 1 | 2, addedValue: number) {
        let lastStat: IStat = { ...this.getLastStats() };
        if (playerNum === 1) {
            lastStat.player1.score += addedValue;
        } else if (playerNum === 2) {
            lastStat.player2.score += addedValue;
        }
        this.updateStats(lastStat);
    }
}

const gameStatsInstance = Object.freeze(new GameStats());
export default gameStatsInstance;
