'use strict';
import { getCurrentTurn } from './utils/gamePlay.js';
import { Playground } from './utils/playground.js';

interface IMove {
    turn: string;
    cell: number;
}

(function () {
    const NUMBER_OF_GAME_PIECES = 5;
    console.log('Game is running!');

    const gameField: HTMLElement = document.querySelector('#gameField') as HTMLElement;
    let playground = Playground(NUMBER_OF_GAME_PIECES, gameField);
    playground.init();

    getCurrentTurn();
})();
