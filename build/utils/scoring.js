import GameStats from '../store/gameStats.js';
export const Scoring = (squareDimension, moves = { x: {}, o: {} }) => {
    let xMoves; //desc sorted x moves
    let oMoves; //desc sorted o moves
    let xMatrix = [];
    let oMatrix = [];
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
    const getSelectedAreas = (playerMoves) => {
        let matrix = {};
        let rowNum, colNum;
        if (!playerMoves?.length)
            return {};
        for (const move of playerMoves) {
            rowNum = rowNumber(move);
            colNum = colNumber(move);
            matrix[move] = [rowNum, colNum];
        }
        return matrix;
    };
    const getMatrix = (baseMatrix, selectedAreas) => {
        let tempMatrix = [...baseMatrix];
        Object.values(selectedAreas).forEach(([row, col]) => {
            tempMatrix[row - 1][col - 1] = 1;
        });
        return tempMatrix;
    };
    const getRelatedMatrix = (symbol) => {
        let selectedAreas = {};
        let newMoves = [];
        if (symbol === 'x') {
            selectedAreas = getSelectedAreas(xMoves);
            newMoves = getMatrix(xMatrix, selectedAreas);
        }
        else if (symbol === 'o') {
            selectedAreas = getSelectedAreas(oMoves);
            newMoves = getMatrix(oMatrix, selectedAreas);
        }
        return newMoves;
    };
    const calculateScores = (newMoves) => {
        let scores = 0;
        for (let i = 0; i < newMoves.length; i++) {
            const matrixRow = newMoves[i];
            let strMatRow = matrixRow.join('');
            let splittedCombination = strMatRow.split('0').filter((x) => x.length);
            for (const sc of splittedCombination) {
                if (sc.length >= 3)
                    scores += sc.length * 100;
            }
        }
        return scores;
    };
    const horizontalScoring = (symbol) => {
        let scores = 0, newMoves = [];
        newMoves = getRelatedMatrix(symbol);
        scores = calculateScores(newMoves);
        return scores;
    };
    const verticalScoring = (symbol) => {
        let scores = 0, newMoves = [];
        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrix90Deg(newMoves); //rotate 90deg the matrix to change verticals with horizontal items
        scores = calculateScores(rotatedMatrix);
        return scores;
    };
    const rightDiagonalScoring = (symbol) => {
        let scores = 0, newMoves = [];
        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrix45Deg(newMoves);
        scores = calculateScores(rotatedMatrix);
        return scores;
    };
    const leftDiagonalScoring = (symbol) => {
        let scores = 0, newMoves = [];
        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrixMinus45Deg(newMoves);
        scores = calculateScores(rotatedMatrix);
        return scores;
    };
    const decreasalSort = (collection) => {
        return collection?.sort((a, b) => b - a);
    };
    const rotateMatrix90Deg = (matrix) => {
        return matrix.map((row, i) => row.map((val, j) => matrix[matrix.length - 1 - j][i]));
    };
    const rotateMatrix45Deg = (matrix) => {
        let a = 0;
        let b = 0;
        let peakPoint = false;
        let newRow = [];
        let newMatrix = [];
        for (let x = 0; x < squareDimension * 2 - 1; x++) {
            newRow = [];
            for (let i = a; i >= b; i--) {
                for (let j = peakPoint ? b : 0; j <= a; j++) {
                    newRow.push(matrix[i--][j]);
                }
            }
            newMatrix.push(newRow);
            if (a < squareDimension && !peakPoint) {
                a++;
            }
            else if (a > 0 && peakPoint) {
                b++;
            }
            if (a === squareDimension) {
                peakPoint = true;
                a = squareDimension - 1;
                b = 1;
            }
        }
        return newMatrix;
    };
    const rotateMatrixMinus45Deg = (matrix) => {
        let a = 0;
        let b = squareDimension - 1;
        let c = 0;
        let d = squareDimension - 1;
        let peakPoint = false;
        let newRow = [];
        let newMatrix = [];
        let str = '';
        for (let x = 0; x < squareDimension * 2 - 1; x++) {
            newRow = [];
            str = '';
            if (a >= squareDimension - 1) {
                peakPoint = true;
                b = 0;
            }
            for (let i = c; i <= a; i++) {
                for (let j = !peakPoint ? b : 0; j <= (!peakPoint ? squareDimension - 1 : d); j++) {
                    newRow.push(matrix[i++][j]);
                    // str += `(${i++},${j}), `;
                }
            }
            newMatrix.push(newRow);
            if (a < squareDimension - 1 && !peakPoint) {
                a++;
                b--;
            }
            else if (peakPoint) {
                c++;
                d--;
            }
        }
        return newMatrix;
    };
    const finalScores = () => {
        let xH = horizontalScoring('x');
        let oH = horizontalScoring('o');
        let xV = verticalScoring('x');
        let oV = verticalScoring('o');
        let rightDiagonalX = rightDiagonalScoring('x');
        let rightDiagonalO = rightDiagonalScoring('o');
        let leftDiagonalX = leftDiagonalScoring('x');
        let leftDiagonalO = leftDiagonalScoring('o');
        let totalX = xH + xV + rightDiagonalX + leftDiagonalX;
        let totalO = oH + oV + rightDiagonalO + leftDiagonalO;
        GameStats.addScore('x', totalX);
        GameStats.addScore('o', totalO);
    };
    preInit();
    return {
        finalScores
    };
};
//# sourceMappingURL=scoring.js.map