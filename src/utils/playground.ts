import { CreateElement } from './global.js';
import { IMove, IPlayer, IPlayerMove, IPlayground, IStat, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';
import { makeMove } from './gamePlay.js';
import MovesInstance from '../store/moveStats.js';
import { Scoring } from '../utils/scoring.js';
import { WinnerModal } from './winnerModal.js';

// set it to true if you prefer the classic rule: the game stops at the first line of 3.
// a line of exactly 3 is worth 300 points, hence any score >= 300 means such a line exists.
const SUDDEN_DEATH: boolean = false;
const WINNING_SCORE: number = 300;

export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);

    const winnerModal = WinnerModal();

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
        winnerModal.hide();
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
    const isBoardFull = () => {
        return MovesInstance.totalMoves() >= Math.pow(squareDimension, 2);
    };
    const finishGame = () => {
        MovesInstance.setGameOver(true);

        const gameStats = GameStats.getLastStats();
        const xScore: number = gameStats.player1.score;
        const oScore: number = gameStats.player2.score;

        let winner: TSymbol | null = null;
        if (xScore > oScore) winner = 'x';
        else if (oScore > xScore) winner = 'o';

        winnerModal.show(winner, xScore, oScore, resetButtonHandler);
    };
    const handleClick = (event) => {
        if (MovesInstance.gameOver()) return;
        if (!event?.target?.id) throw new Error('Element Id is not recognized!');
        makeResetButton();
        const id = +event.target.id;

        let currentTurn: TSymbol = MovesInstance.currentTurn();
        let lastGameStats = GameStats.getLastStats();
        let currentPlayer =
            lastGameStats?.player1?.symbol === currentTurn ? lastGameStats?.player1 : lastGameStats?.player2;
        let moves: IMove = makeMove(id, currentTurn, currentPlayer);

        // `makeMove()` returns an empty object when the cell was already taken.
        // it must be caught here, otherwise `Scoring()` reads `selectedCells` of undefined
        // and the turn would be switched without putting any symbol on the board.
        if (!moves?.x) return;

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

        // the move of this click is already counted by now, hence the check comes at the end
        const gameStats = GameStats.getLastStats();
        const hasWinningLine: boolean =
            gameStats.player1.score >= WINNING_SCORE || gameStats.player2.score >= WINNING_SCORE;

        if (isBoardFull() || (SUDDEN_DEATH && hasWinningLine)) {
            finishGame();
        }
    };
    const resetButtonHandler = () => {
        const playground = document.querySelector('#playground') as HTMLElement;
        playground?.remove();
        const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
        if (actions?.lastChild) actions.removeChild(actions.lastChild);

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
