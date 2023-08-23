import { IPlayer, TSymbol } from '../interfaces/index.js';
declare class PlayersStats {
    constructor();
    updatePlayer(newPlayer: IPlayer): IPlayer[];
    getPlayerById(id: string): IPlayer;
    getPlayerBySymbol(symbol: TSymbol): IPlayer;
    getAllPlayers(): IPlayer[];
}
declare const playerStatsInstance: Readonly<PlayersStats>;
export default playerStatsInstance;
