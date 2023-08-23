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
    addScore(playerNum, addedValue) {
        let lastStat = { ...this.getLastStats() };
        if (playerNum === 1) {
            lastStat.player1.score += addedValue;
        }
        else if (playerNum === 2) {
            lastStat.player2.score += addedValue;
        }
        this.updateStats(lastStat);
    }
}
const gameStatsInstance = Object.freeze(new GameStats());
export default gameStatsInstance;
//# sourceMappingURL=gameStats.js.map