'use strict';

(function () {
    let currentTurn = 'x',
        isGameOver = false;
    let moves = [];
    const NUMBER_OF_GAME_PIECES = 9;

    const Playground_Init = (gamePiecesNum = 0) => {
        const playground = document.querySelector('#playground');

        for (let i = 1; i <= gamePiecesNum; i++) {
            const section = document.createElement('section');
            section.className = 'cell';
            section.innerHTML = '';
            section.dataset.number = i;
            section.onclick = () => {
                if (isGameOver) return;
                const selected_piece = +section.getAttribute('data-number');

                let moveStatus = makeMove(selected_piece);
                if (moveStatus?.cell) {
                    moves.push(moveStatus);
                }
                if (moves.length) {
                    makeResetButton();
                }
                isGameOver = gameOver();
                if (isGameOver) {
                    makeWinnigPrompt();
                }
            };
            playground.appendChild(section);
        }
    };
    const makeWinnigPrompt = () => {
        const playground = document.querySelector('#playground');

        const winningPrompt = document.createElement('div');
        winningPrompt.className = 'winner-prompt';
        winningPrompt.innerHTML = 'You Win! 🎉';
        playground.appendChild(winningPrompt);
    };
    const resetButtonHandler = () => {
        if (moves.length === 0) return;
        const playground = document.querySelector('#playground');
        while (playground.firstChild) {
            playground.removeChild(playground.lastChild);
        }
        const actions = document.querySelector('.actions');
        actions.removeChild(actions.lastChild);
        moves = [];
        isGameOver = false;
        currentTurn = 'x';

        Playground_Init(NUMBER_OF_GAME_PIECES);
    };
    const makeMove = (cellNumber) => {
        if (moves.findIndex((x) => x.cell === cellNumber) >= 0) {
            return {};
        }
        const cellContent = document.createElement('span');
        if (currentTurn === 'x') {
            cellContent.className = 'cell-x';
            cellContent.innerHTML = 'X';
            let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
            xCell.appendChild(cellContent);

            currentTurn = 'o';
            return { turn: 'x', cell: cellNumber };
        } else {
            cellContent.className = 'cell-o';
            cellContent.innerHTML = 'O';
            let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
            xCell.appendChild(cellContent);

            currentTurn = 'x';
            return { turn: 'o', cell: cellNumber };
        }
    };
    const extractMoves = (collection = [], turn = '') => {
        return collection
            .map((x) => {
                if (x.turn === turn) {
                    return x.cell;
                }
            })
            .filter((x) => x);
    };
    const makeResetButton = () => {
        const actionsDiv = document.querySelector('.actions');
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
    console.log('Web server is running!');

    Playground_Init(NUMBER_OF_GAME_PIECES);
    // resetButton();
})();
