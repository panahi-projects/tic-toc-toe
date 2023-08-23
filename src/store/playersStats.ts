import { IPlayer, TSymbol } from '../interfaces/index.js';

let instance: any;
let players: IPlayer[] = [];

class PlayersStats {
    constructor() {
        if (!instance) throw new Error('New instance cannot be created!');
        instance = this;
    }
    updatePlayer(newPlayer: IPlayer) {
        const foundPlayerIndex = players.findIndex((p) => p.id !== newPlayer.id);
        if (foundPlayerIndex < 0) {
            players.push(newPlayer);
        }
        players.splice(foundPlayerIndex, 1, newPlayer);
        return players;
    }
    getPlayerById(id: string): IPlayer {
        let foundPlayer: IPlayer = players.find((p) => p.id === id) || ({} as IPlayer);
        return foundPlayer;
    }
    getPlayerBySymbol(symbol: TSymbol): IPlayer {
        let foundPlayer: IPlayer = players.find((p) => p.symbol === symbol) || ({} as IPlayer);
        return foundPlayer;
    }
    getAllPlayers(): IPlayer[] {
        return players;
    }
}
const playerStatsInstance = Object.freeze(new PlayersStats());
export default playerStatsInstance;
