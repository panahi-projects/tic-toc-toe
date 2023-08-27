import { CreateElement } from './createElement.js';
import MovesInstance from '../store/moveStats.js';
export const makeMove = (cellNumber, currentTurn, player) => {
    // next 4 lines are for preventing to add more than one item in each section
    let moves = MovesInstance.getMoves();
    if (moves.o.selectedCells.includes(cellNumber) || moves.x.selectedCells.includes(cellNumber)) {
        return {};
    }
    const symbol = player.symbol.toLowerCase();
    const cellContentSchema = {
        tag: 'span',
        className: `cell-${currentTurn?.toLowerCase()}`,
        innerHTML: currentTurn
    };
    let selectedSection = document.querySelector(`section.cell:nth-child(${cellNumber})`);
    const cellContent = CreateElement(cellContentSchema);
    selectedSection.appendChild(cellContent);
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
    getCurrentTurn();
    return updatedMove;
};
export const getCurrentTurn = () => {
    let turn = MovesInstance.getCurrentTurn();
    const currentTurnSpan = document.querySelector('#currentTurn');
    if (!currentTurnSpan.innerHTML.length) {
        currentTurnSpan.innerHTML = turn.toUpperCase();
    }
    else {
        currentTurnSpan.innerHTML = turn == 'x' ? 'O' : 'X';
    }
    return turn;
};
//# sourceMappingURL=gamePlay.js.map