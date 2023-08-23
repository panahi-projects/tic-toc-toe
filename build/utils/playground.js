import { CreateElement } from './createElement.js';
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';
import { makeMove } from './gamePlay.js';
import MovesInstance from '../store/moveStats.js';
export const Playground = (squareDimension, parentTag) => {
    let rootCSS = document.querySelector(':root');
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);
    const definePlayer = (playerSymbol) => {
        const id = generateID(24);
        const player = {
            id,
            name: '',
            username: id.substring(0, 8),
            type: 'Mankind',
            symbol: playerSymbol,
            score: 0
        };
        // PlayerStatsInstance.updatePlayer(player);
        return player;
    };
    const preInit = () => {
        const player1 = definePlayer('x');
        const player2 = definePlayer('o');
        let newGameStat = {
            contestId: generateID(24),
            timestamp: new Date().valueOf(),
            player1,
            player2
        };
        GameStats.setStats(newGameStat);
    };
    const init = () => {
        const playgroundSchema = {
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
    /**
     *
     * @param cellNumber type: number
     * @returns The row number of the given cell by index + 1
     */
    const rowNumber = (cellNumber) => {
        let rowNum = -1;
        if (typeof cellNumber !== 'number' || cellNumber <= 0)
            return rowNum;
        if (cellNumber % squareDimension > 0)
            rowNum = cellNumber / squareDimension + 1;
        else
            rowNum = cellNumber / squareDimension;
        return Math.floor(rowNum);
    };
    const colNumber = (cellNumber = -1) => {
        return cellNumber % squareDimension === 0 ? squareDimension : Math.floor(cellNumber % squareDimension);
    };
    const handleClick = (event) => {
        if (!event?.target?.id)
            throw new Error('Element Id is not recognized!');
        debugger;
        const id = +event.target.id;
        // let row = rowNumber(id);
        // let col = colNumber(id);
        // console.log('You clicked on item:', id);
        // console.log(`(${row}, ${col})`);
        let currentTurn = MovesInstance.getCurrentTurn();
        let lastGameStats = GameStats.getLastStats();
        let currentPlayer = lastGameStats?.player1?.symbol === currentTurn ? lastGameStats?.player1 : lastGameStats?.player2;
        let moves = makeMove(id, currentTurn, currentPlayer);
        console.log('moves:', moves);
        MovesInstance.updateTurn(currentTurn === 'x' ? 'o' : 'x');
        const playerMove = {
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
//# sourceMappingURL=playground.js.map