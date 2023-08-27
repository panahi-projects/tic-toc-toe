'use strict';
import { getCurrentTurn } from './utils/gamePlay.js';
import { Playground } from './utils/playground.js';
(function () {
    const NUMBER_OF_GAME_PIECES = 5;
    console.log('Game is running!');
    const gameField = document.querySelector('#gameField');
    let playground = Playground(NUMBER_OF_GAME_PIECES, gameField);
    playground.init();
    getCurrentTurn();
})();
//# sourceMappingURL=index.js.map