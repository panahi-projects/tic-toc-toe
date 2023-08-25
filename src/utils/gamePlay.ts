import { CreateElement } from './createElement.js';
import { IMove, IPlayer, IPlayerMove, TSymbol } from '../interfaces/index.js';
import MovesInstance from '../store/moveStats.js';

export const makeMove = (cellNumber: number, currentTurn: TSymbol, player: IPlayer): IMove => {
    // next 4 lines are for preventing to add more than one item in each section
    let moves: IMove = MovesInstance.getMoves();
    if (moves.o.selectedCells.includes(cellNumber) || moves.x.selectedCells.includes(cellNumber)) {
        return {} as IMove;
    }

    const symbol = player.symbol.toLowerCase();
    const cellContentSchema = {
        tag: 'span',
        className: `cell-${currentTurn?.toLowerCase()}`,
        innerHTML: currentTurn
    };
    let selectedSection: HTMLElement = document.querySelector(`section.cell:nth-child(${cellNumber})`) as HTMLElement;
    const cellContent = CreateElement(cellContentSchema);
    selectedSection.appendChild(cellContent);

    let currentPlayerStats: IPlayerMove = moves[symbol];

    if (currentPlayerStats?.selectedCells) {
        currentPlayerStats.selectedCells.push(cellNumber);
    } else {
        let newPlayerMove: IPlayerMove = {
            selectedCells: [],
            player: player
        };
        currentPlayerStats = {
            ...newPlayerMove
        };
        currentPlayerStats.selectedCells.push(cellNumber);
    }
    const playerMove: IPlayerMove = {
        ...currentPlayerStats
    };
    const updatedMove: IMove = {
        ...moves,
        [symbol]: playerMove
    };
    return updatedMove;
};
