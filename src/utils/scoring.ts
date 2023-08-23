import { IMatrix, IMove, TSymbol } from '../interfaces/index.js';

export const Scoring = (squareDimension: number, moves: IMove) => {
    let xMoves: number[]; //desc sorted x moves
    let oMoves: number[]; //desc sorted o moves
    let xMatrix: number[][] = [];
    let oMatrix: number[][] = [];

    const preInit = () => {
        xMoves = decreasalSort(moves.x.selectedCells);
        oMoves = decreasalSort(moves.o.selectedCells);

        for (let i = 0; i < squareDimension; i++) {
            xMatrix[i] = [];
            oMatrix[i] = [];
            for (let j = 0; j < squareDimension; j++) {
                xMatrix[i][j] = 0;
                oMatrix[i][j] = 0;
            }
        }
    };
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
    const getSelectedAreas = (playerMoves: number[]): IMatrix => {
        let matrix: IMatrix = {};
        let rowNum, colNum;
        for (const move of playerMoves) {
            rowNum = rowNumber(move);
            colNum = colNumber(move);
            matrix[move] = [rowNum, colNum];
        }
        return matrix;
    };
    const getMatrix = (baseMatrix: number[][], selectedAreas: { [key: number]: number[] }) => {
        let tempMatrix = [...baseMatrix];
        Object.values(selectedAreas).forEach(([row, col]: number[]) => {
            tempMatrix[row - 1][col - 1] = 1;
        });
        return tempMatrix;
    };
    const getRelatedMatrix = (symbol: TSymbol) => {
        let selectedAreas: IMatrix = {} as IMatrix;
        let newMoves: number[][] = [];

        if (symbol === 'x') {
            selectedAreas = getSelectedAreas(xMoves);
            newMoves = getMatrix(xMatrix, selectedAreas);
        } else if (symbol === 'o') {
            selectedAreas = getSelectedAreas(oMoves);
            newMoves = getMatrix(oMatrix, selectedAreas);
        }
        return newMoves;
    };
    const calculateScores = (newMoves: number[][]): number => {
        let scores: number = 0;
        for (let i = 0; i < newMoves.length; i++) {
            const matrixRow = newMoves[i];
            let strMatRow = matrixRow.join('');
            let splittedCombination = strMatRow.split('0').filter((x) => x.length);

            for (const sc of splittedCombination) {
                if (sc.length >= 3) scores += sc.length * 10;
            }
        }
        return scores;
    };
    const horizontalScoring = (symbol: TSymbol) => {
        let scores = 0,
            newMoves: number[][] = [];

        newMoves = getRelatedMatrix(symbol);
        scores = calculateScores(newMoves);
        return scores;
    };
    const verticalScoring = (symbol: TSymbol) => {
        let scores = 0,
            newMoves: number[][] = [];

        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrix(newMoves); //rotate 90deg the matrix to change verticals with horizontal items

        scores = calculateScores(rotatedMatrix);

        return scores;
    };
    const rightDiagonalScoring = () => {};
    const leftDiagonalScoring = () => {};
    const decreasalSort = (collection: number[]) => {
        return collection.sort((a, b) => b - a);
    };
    const rotateMatrix = (matrix: number[][]) => {
        return matrix.map((row, i) => row.map((val, j) => matrix[matrix.length - 1 - j][i]));
    };
    preInit();

    return {
        horizontalScoring,
        verticalScoring,
        rightDiagonalScoring,
        leftDiagonalScoring
    };
};
