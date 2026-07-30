# How to make an advanced TIC TAC TOE game with Javascript [part 3]

### Welcome back

In the previous part we migrated the whole project to `Typescript`, we rebuilt the board with the
`Module` pattern, we stored the players and their moves with two `Singleton` stores, and at the end
we had a real playable 5x5 board — the symbols appear, the turn switches, the reset button works.

Only one thing was missing, and it was the most important one: both scores were stuck on `0`.

Click [here](https://dev.to/saeedpanahi/how-to-make-an-advanced-tic-tac-toe-game-with-javascript) to
see the article PART-1, and the PART-2 is [here](ADD-PART-2-URL-HERE).

<!-- TODO(Saeed): replace ADD-PART-2-URL-HERE with the real dev.to link of part 2 -->


In this part we are going to build the brain of the game. Frankly, this was the part that took me the
most time in the whole project, and also it was the most enjoyable one. 🤓

**Let's get started...**

### Why the trick of part 1 does not work anymore

Do you remember this piece of code from the part 1?

```js
const winningCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
];
```

Eight combinations, written by hand. For a 3x3 board it is totally fine, you write them once in two
minutes and you never think about them again.

But now our board is 5x5, and it could be 8x8 or even bigger. So, how many combinations of "3 in a
row" exist on those boards?!

- on a **3x3** board: **8** lines (the ones we wrote above)
- on a **5x5** board: **48** lines
- on a **6x6** board: **80** lines
- on an **8x8** board: **168** lines

And that is only for exactly 3 in a row. In our game I want 4 in a row to be worth more than 3 in a
row, and 5 in a row to be worth more than 4, therefore I would also need all the combinations of
length 4, and 5, and 6... At all, writing them by hand is not an option anymore.

Hence, we must stop **listing** the winning lines and start **calculating** them.

### The idea in one sentence

Here is the whole plan, and everything in the rest of this article is just the implementation of it:

> Convert the cells of each player into a matrix of `0` and `1`, then count the neighbour `1`s in
> every row. After that, rotate the same matrix so that the columns and the diagonals also become
> rows, and count them again with exactly the same function.

That is it. One counting function, four different orientations of the same matrix. Instead of 168
hardcoded arrays we will have around 20 lines of real logic.

So, create a new file `./src/utils/scoring.ts`, and we start filling it step by step:

```ts
import { IMatrix, IMove, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';

export const Scoring = (squareDimension: number, moves: IMove = { x: {}, o: {} } as IMove) => {
    let xMoves: number[]; //desc sorted x moves
    let oMoves: number[]; //desc sorted o moves
    let xMatrix: number[][] = [];
    let oMatrix: number[][] = [];

    //the rest of the code goes here...
};
```

Same like `Playground()`, this is also a `Module` — it takes the dimension of the board and the moves
of the both players, it keeps everything private inside itself, and at the end it will return only
one method to the outside world.

Additionally, add this small interface to `./src/interfaces/index.ts`:

```ts
export interface IMatrix {
    [key: number]: number[];
}
```

It only says "an object whose keys are numbers and whose values are arrays of numbers". We will use
of it in a moment.

#### Step 1:From a cell number to a row & a column

In the part 2, our `init()` numbered the cells from `1` to `dimension²`, from the top-left to the
bottom-right. So for a 5x5 board the numbering is as below:

```
      col 1   col 2   col 3   col 4   col 5
row 1 |  1  |   2  |   3  |   4  |   5  |
row 2 |  6  |   7  |   8  |   9  |  10  |
row 3 | 11  |  12  |  13  |  14  |  15  |
row 4 | 16  |  17  |  18  |  19  |  20  |
row 5 | 21  |  22  |  23  |  24  |  25  |
```

A flat number like `13` is perfect for the DOM (because of `nth-child()`), but it is useless for a
matrix. Therefore, the first two methods we need are the ones that translate a cell number into its
row and its column:

```ts
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
```

Let's check them with the above table, on a 5x5 board:

- cell `6` → `6 % 5` is `1` and it is bigger than 0, hence the row is `Math.floor(6 / 5 + 1)` = **2**,
  and the column is `6 % 5` = **1**. Look at the table, cell 6 is really in the row 2, column 1 ✅
- cell `13` → `13 % 5` is `3`, hence the row is `Math.floor(13 / 5 + 1)` = **3**, and the column is
  **3** ✅
- cell `25` → `25 % 5` is `0`, so we are in the **last** column of a row. The row is `25 / 5` = **5**
  and the column becomes the dimension itself, **5** ✅

Be careful that both of these methods return **1-based** numbers, not 0-based. It means, when we
index a real Javascript array with them we always have to write `[row - 1]` and `[col - 1]`. That
`- 1` is the source of a lot of off-by-one bugs, hence keep it in your mind.

#### Step 2:Paint the moves into a matrix

Now we know where each cell sits. So we build the matrix in two small steps.

The first method takes the list of the cells of one player and returns an object where each cell
number points to its `[row, column]`:

```ts
const getSelectedAreas = (playerMoves: number[]): IMatrix => {
    let matrix: IMatrix = {};
    let rowNum, colNum;
    if (!playerMoves?.length) return {} as IMatrix;

    for (const move of playerMoves) {
        rowNum = rowNumber(move);
        colNum = colNumber(move);
        matrix[move] = [rowNum, colNum];
    }
    return matrix;
};
```

For example, if X has selected the cells 1, 2 and 3 on a 5x5 board, the result is:

```js
{
   1: [1, 1],
   2: [1, 2],
   3: [1, 3]
}
```

And the second method takes an empty matrix full of zeros and puts a `1` on every coordinate that was
selected:

```ts
const getMatrix = (baseMatrix: number[][], selectedAreas: { [key: number]: number[] }) => {
    let tempMatrix = [...baseMatrix];
    Object.values(selectedAreas).forEach(([row, col]: number[]) => {
        tempMatrix[row - 1][col - 1] = 1;
    });
    return tempMatrix;
};
```

There is the `- 1` that I warned you about. 😉

The empty matrix of zeros itself is prepared in a `preInit()` method, exactly same like we did in the
`Playground()` module:

```ts
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
const decreasalSort = (collection: number[]) => {
    return collection?.sort((a, b) => b - a);
};
```

Two nested loops, and we get a `dimension x dimension` matrix where everything is `0`. And we keep
one matrix per player, because X and O must be counted separately.

About `decreasalSort()`: it sorts the cell numbers from the biggest to the smallest. For building the
matrix the order does not change the result at all — cell 3 painted before cell 1 gives the same
matrix. Just keep in mind that `.sort()` in Javascript sorts the array **in place**, so it also
reorders the array that lives inside our moves store. Here it is harmless, but it is a good habit to
know when a method mutates your data and when it does not.

And this small method decides which of the two matrices we are working on:

```ts
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
```

Now, this is the moment where I think an animation explains it much better than my words. In the
below GIF you see a 7x7 board where the player X has selected some cells, and next to it you see the
matrix that our code generates out of those cells:

![How we calculate the moves of a player](assets/3-how-we-calculate-it.gif)

The matrix in the animation is exactly this one:

```js
[
   [1, 1, 1, 0, 1, 1, 1],
   [0, 0, 0, 0, 0, 0, 0],
   [0, 0, 1, 0, 1, 0, 0],
   [0, 0, 0, 0, 0, 1, 0],
   [1, 1, 0, 0, 0, 0, 0],
   [0, 1, 1, 1, 0, 0, 0],
   [0, 0, 0, 1, 1, 1, 1]
]
```

`1` means "X is sitting here" and `0` means "this cell is empty or it belongs to O". We are going to
use of this exact matrix as our example until the end of the article.

#### Step 3:Count the points of the rows

Look at the first row of the above matrix: `1, 1, 1, 0, 1, 1, 1`. There are three `1`s, then a hole,
then three more `1`s. So how do we find those groups without writing a nested loop with a counter and
five `if`s inside it?!

Here is my favorite trick of this whole project, and it is only three lines:

```ts
const calculateScores = (newMoves: number[][]): number => {
    let scores: number = 0;
    for (let i = 0; i < newMoves.length; i++) {
        const matrixRow = newMoves[i];
        let strMatRow = matrixRow.join('');
        let splittedCombination = strMatRow.split('0').filter((x) => x.length);

        for (const sc of splittedCombination) {
            if (sc.length >= 3) scores += sc.length * 100;
        }
    }
    return scores;
};
```

What happens for that first row is as follows:

1. `[1,1,1,0,1,1,1].join('')` gives us the string `"1110111"`
2. `"1110111".split('0')` gives us `["111", "111"]` — the zeros act like the scissors!
3. `.filter((x) => x.length)` throws away the empty strings (you get them when two zeros sit next to
   each other, or when a row starts or ends with a zero)
4. every remaining string is a group of neighbour `1`s, and its `length` is how many symbols are in
   that line
5. if the group is 3 or longer, we add `length * 100` to the score

That is why a longer line is worth more: 3 in a row gives 300, 4 in a row gives 400, and 7 in a row
gives 700.

Let's run the whole example matrix through it, row by row:

```
row 0: "1110111"  ->  ["111", "111"]  ->  300 + 300  =  600
row 1: "0000000"  ->  []              ->  nothing    =    0
row 2: "0010100"  ->  ["1", "1"]      ->  too short  =    0
row 3: "0000010"  ->  ["1"]           ->  too short  =    0
row 4: "1100000"  ->  ["11"]          ->  too short  =    0
row 5: "0111000"  ->  ["111"]         ->  300        =  300
row 6: "0001111"  ->  ["1111"]        ->  400        =  400
                                        -------------------
                                          horizontally  1300
```

So the player X earned **1300** points only from the horizontal lines. And notice how the rows 2, 3
and 4 cost us nothing — single `1`s and a group of two are simply ignored by the `if (sc.length >= 3)`.

Now the beautiful part. This `calculateScores()` method only knows how to count **rows**. It has no
idea about columns or diagonals, and it never will. Instead of teaching it, we are going to **rotate
the matrix** and give it the same rows again from a different angle.

```ts
const horizontalScoring = (symbol: TSymbol) => {
    let scores = 0,
        newMoves: number[][] = [];

    newMoves = getRelatedMatrix(symbol);
    scores = calculateScores(newMoves);
    return scores;
};
```

The horizontal one needs no rotation of course, it just passes the matrix as it is.

#### Step 4:The vertical lines — rotate 90 degrees

To count the columns, we rotate the matrix 90 degrees, then the columns become rows and our existing
method can count them:

```ts
const rotateMatrix90Deg = (matrix: number[][]) => {
    return matrix.map((row, i) => row.map((val, j) => matrix[matrix.length - 1 - j][i]));
};
const verticalScoring = (symbol: TSymbol) => {
    let scores = 0,
        newMoves: number[][] = [];

    newMoves = getRelatedMatrix(symbol);
    let rotatedMatrix = rotateMatrix90Deg(newMoves); //rotate 90deg the matrix to change verticals with horizontal items

    scores = calculateScores(rotatedMatrix);

    return scores;
};
```

If you give our numbering grid to `rotateMatrix90Deg()`:

```js
[
   [1, 2, 3],
   [4, 5, 6],
   [7, 8, 9]
]
```

you get back:

```js
[
   [7, 4, 1],
   [8, 5, 2],
   [9, 6, 3]
]
```

Look at it carefully. The first **column** of the original one was 1, 4, 7 — and now it is the first
**row**, only written backwards as 7, 4, 1. And it does not matter at all for us, because a group of
three neighbour `1`s is still a group of three neighbour `1`s no matter from which side you read it.

#### Step 5:The diagonals — rotate 45 and -45 degrees

The diagonals are the tricky ones, so instead of explaining them with words I made two animations.

In the below GIF, watch what happens to the 3x3 numbering grid: it gets tilted, and the cells that
were sitting on the `/` diagonals become straight rows:

![How the matrix is generated - rotate 45 degrees](assets/1-how-matrix-is-generated-1.gif)

The result of that tilt is as follows:

```js
[
   [1],
   [4, 2],
   [7, 5, 3],
   [8, 6],
   [9]
]
```

Two things to notice here.

First, the number of the rows is **not** 3 anymore, it is `3 * 2 - 1` = **5**. In general a
`dimension x dimension` board has `dimension * 2 - 1` diagonals in each direction, and this is why
every loop in the two next methods runs `squareDimension * 2 - 1` times.

Second, the middle row `[7, 5, 3]` is the full `/` diagonal of the board, and the rows around it get
shorter and shorter until they are single cells. Those short rows can never contain 3 neighbours,
hence `calculateScores()` will ignore them by itself and we don't need any special condition for
them. 👌

Here is the implementation:

```ts
const rotateMatrix45Deg = (matrix: number[][]): number[][] => {
    let a = 0;
    let b = 0;
    let peakPoint: boolean = false;
    let newRow: number[] = [];
    let newMatrix: number[][] = [];
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
        } else if (a > 0 && peakPoint) {
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
```

The variable that carries the whole idea here is `peakPoint`. Before we reach the longest diagonal
the rows are **growing**, so we increase `a` on every round. The moment `a` reaches the dimension we
have passed the middle of the board — that is the "peak" — and from there the rows must start
**shrinking**, hence we flip `peakPoint` to `true` and from then on we increase `b` instead of `a`.

And the same story for the other direction, the `\` diagonals:

![How the matrix is generated - rotate -45 degrees](assets/2-how-matrix-is-generated-2.gif)

which gives us:

```js
[
   [3],
   [2, 6],
   [1, 5, 9],
   [4, 8],
   [7]
]
```

This time the middle row is `[1, 5, 9]`, and if you look at our numbering table, 1-5-9 is really the
main `\` diagonal of a 3x3 board.

```ts
const rotateMatrixMinus45Deg = (matrix: number[][]): number[][] => {
    let a = 0;
    let b = squareDimension - 1;
    let c = 0;
    let d = squareDimension - 1;
    let peakPoint: boolean = false;
    let newRow: number[] = [];
    let newMatrix: number[][] = [];
    for (let x = 0; x < squareDimension * 2 - 1; x++) {
        newRow = [];
        if (a >= squareDimension - 1) {
            peakPoint = true;
            b = 0;
        }
        for (let i = c; i <= a; i++) {
            for (let j = !peakPoint ? b : 0; j <= (!peakPoint ? squareDimension - 1 : d); j++) {
                newRow.push(matrix[i++][j]);
            }
        }
        newMatrix.push(newRow);

        if (a < squareDimension - 1 && !peakPoint) {
            a++;
            b--;
        } else if (peakPoint) {
            c++;
            d--;
        }
    }
    return newMatrix;
};
```

It needs four cursors instead of two (`a`, `b`, `c`, `d`) because this diagonal walks the matrix from
the other corner, but the logic is the same: grow until the peak, then shrink.

Frankly, these two methods are the least beautiful code in the whole project, and I rewrote them
several times. If you want to understand them properly, my advice is to put a
`console.log(newRow)` right after the inner loops, run the game on a 3x3 board, and compare the
output with the two animations above. That is exactly how I debugged them. 😅

And then the two scoring methods are boring again, because all the work is already done:

```ts
const rightDiagonalScoring = (symbol: TSymbol) => {
    let scores = 0,
        newMoves: number[][] = [];

    newMoves = getRelatedMatrix(symbol);
    let rotatedMatrix = rotateMatrix45Deg(newMoves);
    scores = calculateScores(rotatedMatrix);
    return scores;
};
const leftDiagonalScoring = (symbol: TSymbol) => {
    let scores = 0,
        newMoves: number[][] = [];

    newMoves = getRelatedMatrix(symbol);
    let rotatedMatrix = rotateMatrixMinus45Deg(newMoves);
    scores = calculateScores(rotatedMatrix);

    return scores;
};
```

#### Step 6:Sum up all the four directions

Now we have four scoring methods for each of the two players, and the last method of the module just
calls all of them and saves the totals:

```ts
const finalScores = () => {
    let xH = horizontalScoring('x');
    let oH = horizontalScoring('o');

    let xV = verticalScoring('x');
    let oV = verticalScoring('o');

    let rightDiagonalX = rightDiagonalScoring('x');
    let rightDiagonalO = rightDiagonalScoring('o');

    let leftDiagonalX = leftDiagonalScoring('x');
    let leftDiagonalO = leftDiagonalScoring('o');

    let totalX: number = xH + xV + rightDiagonalX + leftDiagonalX;
    let totalO: number = oH + oV + rightDiagonalO + leftDiagonalO;

    GameStats.addScore('x', totalX);
    GameStats.addScore('o', totalO);
};

preInit();

return {
    finalScores
};
```

Remember the `addScore()` method that we wrote in the `GameStats` store in the part 2? Its name says
"add", but if you look at it again you see that it **replaces** the score instead of adding to it:

```ts
if (lastStat.player1.symbol === playerSymbol) {
    lastStat.player1.score = newValue;
}
```

And that is correct here, it is not a bug. Because a whole new `Scoring()` module is created after
every single click and it recalculates the complete matrix from zero, `totalX` is always the full
score of X from the beginning of the game until now. So if we added it to the old value, the score
would grow like crazy after a few moves.

Let me also say something about the performance, because somebody will ask. Yes, we rebuild four
rotated matrices for both players on every click, and yes it looks wasteful. But for a 5x5 or even a
20x20 board this is a few hundred array operations, it means far less than a millisecond, and in
exchange we get a scoring engine with no state to keep in sync and no cache to invalidate. For a game
like this, I chose the simple one.

Now let's return to our example matrix with the 1300 horizontal points. If you run the complete
engine on it, the final score of X is **1600**: the 1300 from the rows, plus 300 more that comes from
one `\` diagonal. The columns and the `/` diagonals give nothing.

Where is that extra diagonal?! Count with the yellow labels of the animation (they start from 0):
the cells at **row 4 / column 1**, **row 5 / column 2** and **row 6 / column 3** are all `1`, and they
sit on the same `\` line. I looked at that picture many times and I never noticed it with my eyes —
the matrix found it immediately.

That is the real value of this approach — it finds the lines that a human eye misses.

#### Step 7:Connect the engine to the clicks

Everything is ready, we only need to call it. Go back to `handleClick()` in
`./src/utils/playground.ts` and replace that comment we left in the part 2 with these two lines:

```ts
const scoring = Scoring(squareDimension, moves);
scoring.finalScores();
```

So the whole method becomes as below:

```ts
const handleClick = (event) => {
    if (!event?.target?.id) throw new Error('Element Id is not recognized!');
    makeResetButton();
    const id = +event.target.id;

    let currentTurn: TSymbol = MovesInstance.currentTurn();
    let lastGameStats = GameStats.getLastStats();
    let currentPlayer =
        lastGameStats?.player1?.symbol === currentTurn ? lastGameStats?.player1 : lastGameStats?.player2;
    let moves: IMove = makeMove(id, currentTurn, currentPlayer);

    if (!moves?.x) return;

    const scoring = Scoring(squareDimension, moves);
    scoring.finalScores();

    updateScoreBoard();

    MovesInstance.updateTurn(currentTurn === 'x' ? 'o' : 'x');
    const playerMove: IPlayerMove = {
        selectedCells: [],
        player: currentPlayer
    };
    playerMove.selectedCells.push(id);
    MovesInstance.updateMoves(playerMove);
};
```

Don't forget to import the module at the top of the file:

```ts
import { Scoring } from '../utils/scoring.js';
```

**Be careful about the order of these lines!** ⚠️

The `if (!moves?.x) return;` must stay **above** the `Scoring()` call. As we said in the part 2,
`makeMove()` returns an empty object `{}` when the clicked cell is already taken. And if that empty
object reaches `Scoring()`, then inside `preInit()` the line
`decreasalSort(moves.x.selectedCells)` tries to read `selectedCells` of `undefined`, and you get this
error in your console:

`Uncaught TypeError: Cannot read properties of undefined (reading 'selectedCells')`

It does not break the game visually, because the exception happens inside a click handler, but it
fills your console with red errors every time a player clicks on a wrong cell. Hence, the guard.

#### Step 8:Run it

Whole `./src/utils/scoring.ts` file should looks like this:

```ts
import { IMatrix, IMove, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';

export const Scoring = (squareDimension: number, moves: IMove = { x: {}, o: {} } as IMove) => {
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
        if (!playerMoves?.length) return {} as IMatrix;

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
                if (sc.length >= 3) scores += sc.length * 100;
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
        let rotatedMatrix = rotateMatrix90Deg(newMoves); //rotate 90deg the matrix to change verticals with horizontal items

        scores = calculateScores(rotatedMatrix);

        return scores;
    };
    const rightDiagonalScoring = (symbol: TSymbol) => {
        let scores = 0,
            newMoves: number[][] = [];

        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrix45Deg(newMoves);
        scores = calculateScores(rotatedMatrix);
        return scores;
    };
    const leftDiagonalScoring = (symbol: TSymbol) => {
        let scores = 0,
            newMoves: number[][] = [];

        newMoves = getRelatedMatrix(symbol);
        let rotatedMatrix = rotateMatrixMinus45Deg(newMoves);
        scores = calculateScores(rotatedMatrix);

        return scores;
    };
    const decreasalSort = (collection: number[]) => {
        return collection?.sort((a, b) => b - a);
    };
    const rotateMatrix90Deg = (matrix: number[][]) => {
        return matrix.map((row, i) => row.map((val, j) => matrix[matrix.length - 1 - j][i]));
    };
    const rotateMatrix45Deg = (matrix: number[][]): number[][] => {
        let a = 0;
        let b = 0;
        let peakPoint: boolean = false;
        let newRow: number[] = [];
        let newMatrix: number[][] = [];
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
            } else if (a > 0 && peakPoint) {
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
    const rotateMatrixMinus45Deg = (matrix: number[][]): number[][] => {
        let a = 0;
        let b = squareDimension - 1;
        let c = 0;
        let d = squareDimension - 1;
        let peakPoint: boolean = false;
        let newRow: number[] = [];
        let newMatrix: number[][] = [];
        for (let x = 0; x < squareDimension * 2 - 1; x++) {
            newRow = [];
            if (a >= squareDimension - 1) {
                peakPoint = true;
                b = 0;
            }
            for (let i = c; i <= a; i++) {
                for (let j = !peakPoint ? b : 0; j <= (!peakPoint ? squareDimension - 1 : d); j++) {
                    newRow.push(matrix[i++][j]);
                }
            }
            newMatrix.push(newRow);

            if (a < squareDimension - 1 && !peakPoint) {
                a++;
                b--;
            } else if (peakPoint) {
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

        let totalX: number = xH + xV + rightDiagonalX + leftDiagonalX;
        let totalO: number = oH + oV + rightDiagonalO + leftDiagonalO;

        GameStats.addScore('x', totalX);
        GameStats.addScore('o', totalO);
    };

    preInit();

    return {
        finalScores
    };
};
```

Then run the app:

`npm run dev`

Open `http://localhost:3000` and try these cases on the 5x5 board, so you can be sure that all the
four directions really work:

- put 3 X in a row horizontally → the score of X becomes **300**
- add a 4th X to the same line → it becomes **400** (not 700, because it is still one single line,
  only longer)
- put only 2 X next to each other → it stays **0**
- put 3 X vertically in the same column → **300**
- put 3 X on a diagonal (for example the cells 1, 7 and 13) → **300**
- make two separate rows of 3 → **600**

<!-- TODO(Saeed): screenshot of a 5x5 board where X has a line of 4 and the score shows 400 -->

If all of these numbers match on your machine, congratulations — your game now understands lines on
**any** board size, and you never have to write a `winningCombinations` array again. 🎉

### The Next Step...

Our game counts, but honestly it still does not know how to **finish**. You can keep clicking until
the last cell and nobody ever wins.

So in the next part we are going to close the circle:

- detect when the board is full and decide the winner out of the scores
- build a **firework** on a `<canvas>`, with rockets and gravity and glowing trails, without any library
- announce the winner in a **modal** with the final scores, and a draw state as well
- let the players **choose the size of the board** before starting, instead of my hardcoded
  `GRID_SIZE = 5`
- and at the end, a small troubleshooting list of every mistake I hit while building this, so you
  don't lose your evening on the same ones

See you in the part 4! 😉