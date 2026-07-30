'use strict';
import { getCurrentTurn } from './utils/gamePlay.js';
import { Playground } from './utils/playground.js';
import MovesInstance from './store/moveStats.js';
(function () {
    const DEFAULT_GRID_SIZE = 5;
    console.log('Game is running!');
    const gameField = document.querySelector('#gameField');
    const gridSizeSelect = document.querySelector('#gridSize');
    const startGame = (squareDimension) => {
        // throw away the previous board and the reset button, if they exist
        const oldPlayground = document.querySelector('#playground');
        if (oldPlayground)
            oldPlayground.remove();
        const actions = document.querySelector('.actions');
        actions.innerHTML = '';
        // clean the state of the previous game
        MovesInstance.resetMoves();
        const currentTurnSpan = document.querySelector('#currentTurn');
        currentTurnSpan.innerHTML = '';
        const playground = Playground(squareDimension, gameField);
        playground.init();
        getCurrentTurn();
    };
    gridSizeSelect.value = `${DEFAULT_GRID_SIZE}`;
    startGame(DEFAULT_GRID_SIZE);
    gridSizeSelect.onchange = () => {
        startGame(+gridSizeSelect.value);
    };
})();
//# sourceMappingURL=index.js.map