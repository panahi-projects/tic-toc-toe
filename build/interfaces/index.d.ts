export type TType = 'Mankind' | 'AI';
export type TSymbol = 'x' | 'o';
export interface IPlayer {
    id: string;
    username: string;
    name?: string;
    type: TType;
    symbol: TSymbol;
    score: number;
}
export interface IStat {
    contestId: string;
    timestamp: number;
    player1: IPlayer;
    player2: IPlayer;
}
export interface IPlayground {
    id: string;
    tag: string;
    className: string;
    childNodes: HTMLElement[];
}
export interface IPlayerMove {
    selectedCells: number[];
    player: IPlayer;
}
export interface IMove {
    x: IPlayerMove;
    o: IPlayerMove;
}
export interface IMatrix {
    [key: number]: number[];
}
export interface IFireworkParticle {
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}
export interface IFireworkRocket {
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    targetY: number;
    color: string;
}
