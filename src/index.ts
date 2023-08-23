'use strict';
import { Playground } from './utils/playground.js';

interface IMove {
    turn: string;
    cell: number;
}

(function () {
    let currentTurn: string = 'x',
        isGameOver: boolean = false;
    let moves: IMove[] = [];
    const NUMBER_OF_GAME_PIECES = 9;

    // const Playground_Init = (gamePiecesNum = 0) => {
    //     // CreateElement();
    //     const playground = document.querySelector('#playground') as HTMLElement;

    //     for (let i = 1; i <= gamePiecesNum; i++) {
    //         const section: HTMLElement = document.createElement('section');
    //         section.className = 'cell';
    //         section.innerHTML = '';
    //         section.dataset.number = `${i}`;
    //         section.onclick = () => {
    //             if (isGameOver) return;
    //             const selected_piece = parseInt(section.getAttribute('data-number') || '0');

    //             let moveStatus = makeMove(selected_piece);
    //             if (moveStatus?.cell) {
    //                 moves.push(moveStatus);
    //             }
    //             if (moves.length) {
    //                 makeResetButton();
    //             }
    //             isGameOver = gameOver();
    //             if (isGameOver) {
    //                 makeWinnigPrompt();
    //             }
    //         };
    //         playground?.appendChild(section);
    //     }
    // };
    const makeWinnigPrompt = () => {
        const playground = document.querySelector('#playground') as HTMLElement;

        const winningPrompt = document.createElement('div');
        winningPrompt.className = 'winner-prompt';
        winningPrompt.innerHTML = 'You Win! 🎉';
        playground?.appendChild(winningPrompt);
    };
    const resetButtonHandler = () => {
        if (moves.length === 0) return;
        const playground = document.querySelector('#playground') as HTMLElement;
        while (playground?.firstChild) {
            playground?.removeChild(playground.lastChild as HTMLElement);
        }
        const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
        actions?.removeChild(actions.lastChild as HTMLElement);
        moves = [];
        isGameOver = false;
        currentTurn = 'x';

        // Playground_Init(NUMBER_OF_GAME_PIECES);
    };
    const makeMove = (cellNumber: number): IMove => {
        if (moves.findIndex((x) => x.cell === cellNumber) >= 0) {
            return {} as IMove;
        }
        const cellContent = document.createElement('span');
        if (currentTurn === 'x') {
            cellContent.className = 'cell-x';
            cellContent.innerHTML = 'x';
            let xCell: HTMLElement = document.querySelector(`section.cell:nth-child(${cellNumber})`) as HTMLElement;
            xCell.appendChild(cellContent);

            currentTurn = 'o';
            return { turn: 'x', cell: cellNumber } as IMove;
        } else {
            cellContent.className = 'cell-o';
            cellContent.innerHTML = 'o';
            let xCell: HTMLElement = document.querySelector(`section.cell:nth-child(${cellNumber})`) as HTMLElement;
            xCell.appendChild(cellContent);

            currentTurn = 'x';
            return { turn: 'o', cell: cellNumber } as IMove;
        }
    };
    const extractMoves = (collection: IMove[] = [], turn = '') => {
        return collection
            .map((x) => {
                if (x.turn === turn) {
                    return x.cell;
                }
            })
            .filter((x) => x);
    };
    const makeResetButton = () => {
        const actionsDiv: HTMLElement = document.querySelector('.actions') as HTMLElement;
        if (actionsDiv.querySelector('button')) return;

        const resetButton = document.createElement('button');
        resetButton.className = 'btn btn-glow';
        resetButton.id = 'reset';
        resetButton.textContent = 'RESET';
        resetButton.onclick = resetButtonHandler;
        actionsDiv.appendChild(resetButton);
    };
    const gameOver = () => {
        const winningCombinations = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
            [1, 5, 9],
            [3, 5, 7]
        ];

        let xMoves = extractMoves(moves, 'x');
        let oMoves = extractMoves(moves, 'o');

        let hasWon = false;

        for (let combination of winningCombinations) {
            if (xMoves.includes(combination[0]) && xMoves.includes(combination[1]) && xMoves.includes(combination[2])) {
                hasWon = true;
                break;
            }
            if (oMoves.includes(combination[0]) && oMoves.includes(combination[1]) && oMoves.includes(combination[2])) {
                hasWon = true;
                break;
            }
        }
        if (hasWon) {
            console.log('You Win! 🎉');
        }
        return hasWon;
    };
    console.log('Game is running!');

    // Playground_Init(NUMBER_OF_GAME_PIECES);
    // resetButton();

    const gameField: HTMLElement = document.querySelector('#gameField') as HTMLElement;
    let playground = Playground(4, gameField);
    playground.init();
})();
