let instance;
const stats = [];
class GameStats {
    constructor() {
        if (instance) {
            throw new Error('New instance cannot be created!');
        }
        instance = this;
    }
    setStats(newStat) {
        stats.push(newStat);
    }
    updateStats(stat) {
        let foundStatIndex = stats.findIndex((s) => s.contestId === stat.contestId);
        if (foundStatIndex) {
            stats.splice(foundStatIndex, 1, stat);
        }
        return stats;
    }
    getAllStats() {
        return stats;
    }
    getLastStats() {
        return stats[stats.length - 1];
    }
    addScore(playerSymbol, newValue) {
        let lastStat = { ...this.getLastStats() };
        if (lastStat.player1.symbol === playerSymbol) {
            lastStat.player1.score = newValue;
        }
        else {
            lastStat.player2.score = newValue;
        }
        this.updateStats(lastStat);
    }
}
const gameStatsInstance = Object.freeze(new GameStats());
export default gameStatsInstance;
//# sourceMappingURL=gameStats.js.map