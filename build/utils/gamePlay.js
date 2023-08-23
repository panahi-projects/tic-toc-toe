import { CreateElement } from './createElement.js';
import MovesInstance from '../store/moveStats.js';
export const makeMove = (cellNumber, currentTurn, player) => {
    const symbol = player.symbol.toLowerCase();
    const cellContentSchema = {
        tag: 'span',
        className: `cell-${currentTurn?.toLowerCase()}`,
        innerHTML: currentTurn
    };
    let selectedSection = document.querySelector(`section.cell:nth-child(${cellNumber})`);
    const cellContent = CreateElement(cellContentSchema);
    selectedSection.appendChild(cellContent);
    debugger;
    let moves = MovesInstance.getMoves();
    let currentPlayerStats = moves[symbol];
    if (currentPlayerStats?.selectedCells) {
        currentPlayerStats.selectedCells.push(cellNumber);
    }
    else {
        let newPlayerMove = {
            selectedCells: [],
            player: player
        };
        currentPlayerStats = {
            ...newPlayerMove
        };
        currentPlayerStats.selectedCells.push(cellNumber);
    }
    const playerMove = {
        ...currentPlayerStats
    };
    const updatedMove = {
        ...moves,
        [symbol]: playerMove
    };
    return updatedMove;
};
//# sourceMappingURL=gamePlay.js.map