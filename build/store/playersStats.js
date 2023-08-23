let instance;
let players = [];
class PlayersStats {
    constructor() {
        if (!instance)
            throw new Error('New instance cannot be created!');
        instance = this;
    }
    updatePlayer(newPlayer) {
        const foundPlayerIndex = players.findIndex((p) => p.id !== newPlayer.id);
        if (foundPlayerIndex < 0) {
            players.push(newPlayer);
        }
        players.splice(foundPlayerIndex, 1, newPlayer);
        return players;
    }
    getPlayerById(id) {
        let foundPlayer = players.find((p) => p.id === id) || {};
        return foundPlayer;
    }
    getPlayerBySymbol(symbol) {
        let foundPlayer = players.find((p) => p.symbol === symbol) || {};
        return foundPlayer;
    }
    getAllPlayers() {
        return players;
    }
}
const playerStatsInstance = Object.freeze(new PlayersStats());
export default playerStatsInstance;
//# sourceMappingURL=playersStats.js.map