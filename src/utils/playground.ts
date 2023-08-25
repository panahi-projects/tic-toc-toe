import { CreateElement } from './createElement.js';
import { IMove, IPlayer, IPlayerMove, IPlayground, IStat, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';
import { makeMove } from './gamePlay.js';
import MovesInstance from '../store/moveStats.js';
import { Scoring } from '../utils/index.js';

export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);
    const definePlayer = (playerSymbol: TSymbol): IPlayer => {
        const id = generateID(24);
        const player: IPlayer = {
            id,
            name: '',
            username: id.substring(0, 8),
            type: 'Mankind',
            symbol: playerSymbol,
            score: 0
        };
        return player;
    };
    const preInit = () => {
        const player1: IPlayer = definePlayer('x');
        const player2: IPlayer = definePlayer('o');

        let newGameStat: IStat = {
            contestId: generateID(24),
            timestamp: new Date().valueOf(),
            player1,
            player2
        };
        GameStats.setStats(newGameStat);
    };
    const init = () => {
        const playgroundSchema: IPlayground = {
            tag: 'div',
            id: 'playground',
            className: 'playground flexbox',
            childNodes: []
        };
        let cellSchema = {
            id: 0,
            tag: 'section',
            className: 'cell',
            innerHTML: '',
            datasets: [],
            onclick: handleClick
        };
        for (let i = 1; i <= Math.pow(squareDimension, 2); i++) {
            cellSchema.id = i;
            const cell = CreateElement(cellSchema);
            playgroundSchema.childNodes.push(cell);
        }
        const playground = CreateElement(playgroundSchema);
        return parentTag.appendChild(playground);
    };
    const handleClick = (event) => {
        if (!event?.target?.id) throw new Error('Element Id is not recognized!');
        const id = +event.target.id;

        let currentTurn: TSymbol = MovesInstance.getCurrentTurn();
        let lastGameStats = GameStats.getLastStats();
        let currentPlayer =
            lastGameStats?.player1?.symbol === currentTurn ? lastGameStats?.player1 : lastGameStats?.player2;
        let moves: IMove = makeMove(id, currentTurn, currentPlayer);
        // console.log('moves:', moves);

        const scoring = Scoring(squareDimension, moves);
        let xH = scoring.horizontalScoring('x');
        let oH = scoring.horizontalScoring('o');

        let xV = scoring.verticalScoring('x');
        let oV = scoring.verticalScoring('o');

        let rightDiagonalX = scoring.rightDiagonalScoring('x');
        let rightDiagonalO = scoring.rightDiagonalScoring('o');

        let leftDiagonalX = scoring.leftDiagonalScoring('x');
        let leftDiagonalO = scoring.leftDiagonalScoring('o');

        let totalX: number = xH + xV + rightDiagonalX + leftDiagonalX;
        let totalO: number = oH + oV + rightDiagonalO + leftDiagonalO;
        console.log('totalX: ', totalX);
        console.log('totalO: ', totalO);

        MovesInstance.updateTurn(currentTurn === 'x' ? 'o' : 'x');
        const playerMove: IPlayerMove = {
            selectedCells: [],
            player: currentPlayer
        };
        playerMove.selectedCells.push(id);
        MovesInstance.updateMoves(playerMove);
    };

    preInit();

    return {
        init
    };
};
