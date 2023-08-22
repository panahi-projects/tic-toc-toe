import { CreateElement } from './createElement.js';

interface IPlayground {
    id: string;
    tag: string;
    className: string;
    childNodes: HTMLElement[];
}

export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);

    const init = () => {
        const playgroundSchema: IPlayground = {
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
        parentTag.appendChild(playground);
    };
    /**
     *
     * @param cellNumber type: number
     * @returns The row number of the given cell by index + 1
     */
    const rowNumber = (cellNumber: number): number => {
        let rowNum = -1;
        if (typeof cellNumber !== 'number' || cellNumber <= 0) return rowNum;
        if (cellNumber % squareDimension > 0) rowNum = cellNumber / squareDimension + 1;
        else rowNum = cellNumber / squareDimension;

        return Math.floor(rowNum);
    };

    const colNumber = (cellNumber: number = -1): number => {
        return cellNumber % squareDimension === 0 ? squareDimension : Math.floor(cellNumber % squareDimension);
    };

    const handleClick = (event) => {
        const id = +event.target.id;
        let row = rowNumber(id);
        let col = colNumber(id);
        console.log('You clicked on item:', id);
        console.log(`(${row}, ${col})`);
    };
    return {
        init
    };
};
