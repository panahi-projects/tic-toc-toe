'use strict';
import { getCurrentTurn } from './utils/gamePlay.js';
import { Playground } from './utils/playground.js';

(function () {
    const GRID_SIZE = 5;
    console.log('Game is running!');

    const gameField: HTMLElement = document.querySelector('#gameField') as HTMLElement;
    let playground = Playground(GRID_SIZE, gameField);
    playground.init();

    getCurrentTurn();
})();
