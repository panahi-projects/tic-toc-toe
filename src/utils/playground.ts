import { CreateElement } from './global.js';
import { IMove, IPlayer, IPlayerMove, IPlayground, IStat, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';
import { makeMove } from './gamePlay.js';
import MovesInstance from '../store/moveStats.js';
import { Scoring } from '../utils/scoring.js';

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
    const reset = () => {
        MovesInstance.resetMoves();
        preInit();
        updateScoreBoard();
        const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;
        currentTurnSpan.innerHTML = 'X';
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
        const newTag = parentTag.appendChild(playground);
        return newTag;
    };
    const handleClick = (event) => {
        if (!event?.target?.id) throw new Error('Element Id is not recognized!');
        makeResetButton();
        const id = +event.target.id;

        let currentTurn: TSymbol = MovesInstance.currentTurn();
        let lastGameStats = GameStats.getLastStats();
        let currentPlayer =
            lastGameStats?.player1?.symbol === currentTurn ? lastGameStats?.player1 : lastGameStats?.player2;
        let moves: IMove = makeMove(id, currentTurn, currentPlayer);

        const scoring = Scoring(squareDimension, moves);
        scoring.finalScores();

        updateScoreBoard();

        MovesInstance.updateTurn(currentTurn === 'x' ? 'o' : 'x');
        const playerMove: IPlayerMove = {
            selectedCells: [],
            player: currentPlayer
        };
        playerMove.selectedCells.push(id);
        MovesInstance.updateMoves(playerMove);
    };
    const resetButtonHandler = () => {
        const playground = document.querySelector('#playground') as HTMLElement;
        playground.remove();
        const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
        actions?.removeChild(actions.lastChild as HTMLElement);

        reset();
        init();
    };
    const makeResetButton = () => {
        const hasAnyMove = MovesInstance.doesExistAnyMove();
        if (!hasAnyMove) return;

        const actionsDiv: HTMLElement = document.querySelector('.actions') as HTMLElement;
        if (actionsDiv.querySelector('button')) return;

        const resetButtonSchema = {
            id: 'reset',
            tag: 'button',
            className: 'btn btn-glow',
            textContent: 'RESET',
            onclick: resetButtonHandler
        };
        const resetButton = CreateElement(resetButtonSchema);
        actionsDiv.appendChild(resetButton);
    };
    const updateScoreBoard = () => {
        const gameStats = GameStats.getLastStats();

        let xScore = document.querySelector('#xScore') as HTMLElement;
        let oScore = document.querySelector('#oScore') as HTMLElement;

        xScore.innerHTML = gameStats.player1.score.toString();
        oScore.innerHTML = gameStats.player2.score.toString();
    };

    preInit();

    return {
        init
    };
};
