# How to make an advanced TIC TAC TOE game with Javascript [part 2]

### Welcome back

Welcome back to our Tic Tac Toe series, where we're building a fully functional Tic Tac Toe game from scratch using JavaScript, HTML, and CSS. In our previous article, we laid the foundation for our project by creating the necessary files and folders, and adding some initial JavaScript code to handle the basic game logic. We also configured the game board and added some styling to make it look visually appealing.

Now, it's time to start building upon that foundation and add more advanced features to our game. In this article, we'll focus on implementing the core gameplay mechanics, such as handling user input, updating the game state, and determining the winner. We'll also explore how to use JavaScript design patterns to make our code more organized and scalable. So, let's dive right in and see what we can create!

Click [here](https://dev.to/saeedpanahi/how-to-make-an-advanced-tic-tac-toe-game-with-javascript) to see the article PART-1

**Let's get started...**

### Modify project configurations

#### Step 1:Modify `package.json`

To handle better the project I decided to add `Typescript` to it.
Hence, the project needs to be modified in some places as below:

First of all, install below packages by the following command:

`npm install --save-dev typescript concurrently @types/node`

Then, you need to change the `script` section in the package.json to the next lines:

```json
"scripts": {
	"start": "node server.js",
	"dev": "concurrently npm:watch:*",
	"watch:1": "tsc -w",
	"watch:2": "tsc server.ts",
	"watch:3": "nodemon server.js",
	"build-dist": "./node_modules/typescript/bin/tsc",
	"test": "exit 0"
},
```

[concurrently](https://github.com/open-cli-tools/concurrently#readme) package helps us to run several commands in the same line, if we want to use it we can do as above.

#### Step 2: Migrate from Javascript to Typescript

Now, you need to change all the _.js files to _.ts to be able to use of the power of Typescript. For this purpose you should apply some changes in the files and the structure of the project.

Create `tsconfig.json` file in the root of the project and add the following code:

```json
{
    "compilerOptions": {
        "target": "esnext",
        "allowJs": true,
        "checkJs": true,
        "outDir": "build",
        "rootDir": "src",
        "strict": false,
        "esModuleInterop": true /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */,
        "forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */,
        "declaration": true /* Generates corresponding '.d.ts' file. */,
        "strictNullChecks": true,
        "sourceMap": true,
        "baseUrl": ".",
        "paths": {
            "./*": ["src/*"]
        }
    },
    "exclude": ["node_modules", "dist"],
    "include": ["./src", "./test", "./config"]
}
```

In the above \*.json file we determined that our output directory to be called `build` and whenever we run command `npm run dev` it will be created automatically and all the converted files goes in there.

#### Step 3: Modify HTML & CSS files

Make a folder called `src` and move the `index.ts` file (previously it was `index.js`) to the `src` folder.

Now, you need to update the script import in `/public/index.html` file as below:

```html
<body>
    ...
    <script type="module" src="../build/index.js"></script>
</body>
```

But, why is the src URI is: `../build/index.js`?! because as we explained previously, the output directory that automatically will be created is `build` folder.

Furthermore, we should modify the _.html & _.css files that are used in the app as below:

`./public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tic Tac Toe</title>
        <style>
            :root {
                --dimension: 3;
            }
        </style>
        <link rel="stylesheet" href="./style.css" />
    </head>
    <body>
        <div id="app">
            <div id="gameField" class="container">
                <h1 class="title">Tic Tac Toe</h1>
                <div class="current-turn">CURRENT TURN: <span id="currentTurn"></span></div>
                <!-- Plaground goes here... -->

                <div class="score-board board-left">
                    <div class="player-score">
                        <div class="player-title">PLAYER <span class="cell-x">X</span></div>
                        <div id="xScore" class="score">0</div>
                    </div>
                </div>
                <div class="score-board board-right">
                    <div class="player-score">
                        <div class="player-title">PLAYER <span class="cell-o">O</span></div>
                        <div id="oScore" class="score">0</div>
                    </div>
                </div>
            </div>
            <div class="actions"></div>
        </div>
        <script type="module" src="../build/index.js"></script>
    </body>
</html>
```

In the above code, you see that tag `<div id="playground" class="playground flexbox">...</div>` is deleted, because we will generate it by Javascript code in the next steps.

Along with this, we made out score board inside tag:
`<div class="score-board board-left">...</div>`

Additionally, you see a piece of code is added between `<head>...</head>` as below:

```html
<style>
    :root {
        --dimension: 3;
    }
</style>
```

We are going to use of `--dimension` variable to make our game board grid as many as we wish to have.

After all, you should modify your CSS file as below:

`./public/style.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
* {
    margin: 0;
    padding: 0;
}
body {
    background-color: #22113f;
    font-family: 'Varela Round', sans-serif;
}
.container {
    margin: auto;
    width: 75%;
}
.title {
    text-align: center;
    text-transform: uppercase;
    font-size: 48px;
    font-weight: 800;
    color: #fff;
    text-shadow:
        0 0 10px #03bcf4,
        0 0 20px #03bcf4,
        0 0 40px #03bcf4,
        0 0 80px #03bcf4,
        0 0 160px #03bcf4;
    margin: 16px;
}
.playground {
    position: relative;
    width: calc(var(--dimension) * 100px);
    height: calc(var(--dimension) * 100px);
    margin: 10px auto 32px;
    background: rgb(95, 15, 191);
    background: linear-gradient(120deg, rgba(95, 15, 191, 1) 0%, rgba(170, 20, 111, 1) 100%);
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    overflow: hidden;
}
.flexbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.playground .cell {
    position: relative;
    width: calc((100% / var(--dimension)) - 46px); /* Calculate width based on available space */
    padding: 40px 20px;
    margin: 2px;
    color: #f1f1f1;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    transition: 0.3s;
}
.playground .cell span {
    position: absolute;
    text-transform: uppercase;
    font-size: 92px;
    font-weight: 600;
    top: calc(50% + 2px);
    left: 50%;
    transform: translate(-50%, -50%);
}
.cell-x {
    color: #fff;
    text-shadow:
        0 0 10px #03bcf4,
        0 0 20px #03bcf4;
}
.cell-o {
    color: #fff;
    text-shadow:
        0 0 10px #f403a8,
        0 0 20px #f403a8,
        0 0 30px #da0095;
}
.playground .cell:hover {
    background: rgba(0, 0, 0, 0.65);
}
.clearfix {
    overflow: auto;
}
.clearfix::after {
    content: '';
    display: table;
    clear: both;
}
.actions {
    position: relative;
    padding: 2px 32px;
    width: calc(var(--dimension) * 100px);
    margin: auto;
    text-align: right;
}
.btn {
    border: none;
    background: none;
    box-shadow: none;
    outline: none;
    cursor: pointer;
    transition: 0.3s;
    transform: translateY(-20px);
}
.btn-glow {
    color: #fff;
    text-shadow:
        0 0 4px #03bcf4,
        0 0 30px #03bcf4;
    padding: 4px 8px;
}
.btn-glow:hover {
    text-shadow:
        0 0 50px #03bcf4,
        0 0 10px #03bcf4,
        0 0 30px #03bcf4;
}
.winner-prompt {
    position: absolute;
    background: rgba(0, 0, 0, 0.85);
    color: #74ffa9;
    font-size: 48px;
    z-index: 999;
    top: 10px;
    bottom: 10px;
    left: 10px;
    right: 10px;
    height: calc(100% - 20px);
    text-align: center;
    line-height: 6;
    border-radius: 8px;
}
.score-board {
    position: absolute;
    width: 25%;
}
.board-left {
    left: 2.5%;
}
.board-right {
    right: 2.5%;
}
.player-score {
    width: 100%;
    display: inline-block;
    text-align: center;
}
.player-title {
    font-size: 2em;
    color: #e7da99;
    font-weight: 400;
}
.player-title span {
    font-size: 42px;
    font-weight: 600;
}
.score {
    font-size: 7.2em;
    color: #f49003;
    font-weight: 600;
}
.current-turn {
    color: #4ff403;
    font-size: 18px;
    text-align: center;
}
@media only screen and (max-width: 1200px) {
    .score-board {
        top: 10px;
        font-size: 40%;
    }
    .player-title span {
        font-size: 22px;
    }
}
```

### Let's dive into JS 🏊

#### Step 1:Remake the board game

In the `src` directory add a folder called `utils` and in utils add a \*.ts file named `playground.ts`.

I decided to use of `Module` design pattern for this step, if you don't know what does module pattern do exactly you can read this article that explained all JS design patterns:
[Design patterns in JS](https://dev.to/twinfred/design-patterns-in-javascript-1l2l)

So, start coding in `playground.ts` by this block of code

```ts
export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    //functions goes here...
};
```

In the function parameters you see 2 items:

- `squareDimension: number`: it accepts the square counts
- `parentTag: HTMLElement`: it accepts the main HTML tag that we want to initialize our board game.

Then, we need a function called `init()` to initialize our board game, add it in `Playground()` function

```ts
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
    const newTag = parentTag.appendChild(playground);
    return newTag;
};
```

As you see, we used an interface in the above code `IPlayground`, so you need to create this interface as is explaining:
First, create a folder inside `src` and add `index.ts` to it:
`/src/interfaces/index.ts`

Add the following code:

```ts
export interface IPlayground {
    id: string;
    tag: string;
    className: string;
    childNodes: HTMLElement[];
}
```

Additionaly, there is a function `CreateElement()` that we made it globally to use it any where we need:

Create a file inside `utils` named `global.ts`:
`./src/utils/global.ts`

Write the below code:

```ts
export const CreateElement = (elementObj: any): HTMLElement => {
    if (!elementObj || !elementObj.tag) return {} as HTMLElement;
    var element: HTMLElement = document.createElement(elementObj.tag);
    for (var prop in elementObj) {
        if (prop === 'childNodes') {
            elementObj.childNodes.forEach(function (node) {
                element.appendChild(node);
            });
        } else if (prop === 'attributes') {
            elementObj.attributes.forEach(function (attr) {
                element.setAttribute(attr.key, attr.value);
            });
        } else if (prop === 'datasets') {
            elementObj.datasets.forEach(function (dataset) {
                element.dataset[dataset] = elementObj[dataset];
            });
        } else element[prop] = elementObj[prop];
    }
    return element;
};
```

What this method does is simple but it saves us a lot of repeated lines: you give it a plain object
that describes a tag, and it walks every property of that object and copies it onto a real DOM
element. Three property names are treated specially — `childNodes`, `attributes` and `datasets` —
and everything else (`id`, `className`, `innerHTML`, `onclick`, and etc.) is assigned directly to
the element. Hence, from now on we never call `document.createElement()` by hand again, we only
write schemas.

Now, import the files we just created in `./src/utils/playground.ts`:

```ts
//...
import { IPlayground } from '../interfaces/index.js';
import { CreateElement } from './global.js';
//...
```

**Be careful about the `.js` at the end of the import paths!** ⚠️

This is the part that confuses almost everybody the first time, so let me explain it. The files we
are writing are `*.ts`, but we import them as `*.js`. It looks wrong, but it is correct, and it is
mandatory here.

The reason is that we have no bundler in this project (no Webpack, no Vite). `tsc` converts our
`*.ts` files to `*.js` files inside `build`, and then the **browser itself** resolves the import
paths, because in `index.html` we load the app as a native ES module:
`<script type="module" src="../build/index.js"></script>`

And the browser cannot guess extensions. Whatever string you wrote in the import is exactly what it
will request from the server. So:

- if you write `from './global'` → the browser asks for `/build/utils/global` → **404**
- if you write `from './global.ts'` → the browser asks for a file that does not exist in `build` → **404**
- if you write `from './global.js'` → the browser asks for `/build/utils/global.js` → ✅

The important thing to know is that `tsc` does **not** rewrite these paths, it leaves them exactly
as you typed them. Therefore, always point at the compiled name (`.js`), not at the source name
(`.ts`). If your game shows an empty page and the console says something like
"Failed to load module script", this is almost always the reason.

Then, you need to return the `init()` function, and import and call `./src/utils/playground.ts` inside our main `index.ts`

`./src/utils/playground.ts`:

```ts
export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);

    return {
        init
    };
};
```

`./src/index.ts`:

```ts
'use strict';
import { Playground } from './utils/playground.js';

(function () {
    const GRID_SIZE = 5;
    console.log('Game is running!');

    const gameField: HTMLElement = document.querySelector('#gameField') as HTMLElement;
    let playground = Playground(GRID_SIZE, gameField);
    playground.init();
})();
```

Now if you run the app you must see an empty board game with 5x5 grid:

![5x5 board game](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bv5dl0y9lciaapvqnnj7.png)

#### Step 2:Initialize game stats & player

To be able to access the players stats including their ID, symbol (which is referred to their current turn: X or O), username, name, type ("Mankind" or "AI") and score; we need to do as follows:

Inside the `./src/interfaces/index.ts` add the following interfaces and types:

```ts
export type TType = 'Mankind' | 'AI';
export type TSymbol = 'x' | 'o';
export interface IPlayer {
    id: string;
    username: string;
    name?: string;
    type: TType;
    symbol: TSymbol;
    score: number;
}
export interface IStat {
    contestId: string;
    timestamp: number;
    player1: IPlayer;
    player2: IPlayer;
}
```

If in your JS apps you need to store the data that you are using and don't miss it, probably you need to use of `Singleton` design pattern in your implementation to save the states.

Therefore, for storing the game states, we should create a folder called `./src/store/` and inside of it, we need to make a file called `gameStats.ts` and implement it as below:

```ts
import { IStat, TSymbol } from '../interfaces/index.js';

let instance: any;
const stats: IStat[] = [];

class GameStats {
    constructor() {
        if (instance) {
            throw new Error('New instance cannot be created!');
        }
        instance = this;
    }

    setStats(newStat: IStat): void {
        stats.push(newStat);
    }
    updateStats(stat: IStat): IStat[] {
        let foundStatIndex = stats.findIndex((s) => s.contestId === stat.contestId);
        if (foundStatIndex) {
            stats.splice(foundStatIndex, 1, stat);
        }
        return stats;
    }
    getAllStats(): IStat[] {
        return stats;
    }
    getLastStats(): IStat {
        return stats[stats.length - 1];
    }
    addScore(playerSymbol: TSymbol, newValue: number) {
        let lastStat: IStat = { ...this.getLastStats() };

        if (lastStat.player1.symbol === playerSymbol) {
            lastStat.player1.score = newValue;
        } else {
            lastStat.player2.score = newValue;
        }
        this.updateStats(lastStat);
    }
}

const gameStatsInstance = Object.freeze(new GameStats());
export default gameStatsInstance;
```

In the above code you see:
`const stats: IStat[] = [];`

Our game stats saves in the array.

- `setStats()` function helps us to set new stat

- `updateStats()` we use it to update the stats during the play

- `getLastStats()` returns the last stat that is saved in the array, it means, it gives us the information of the current game which is playing now

- `addScore()` we will be using this method for adding the score of each player after each move

Afterward, in `./src/utils/playground.ts` you have to define function `preInit()` that must be called before `init()` function, actually this method should be called once the playground declared.

```ts
//...
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';

//other parts of the code...

const preInit = () => {
    const player1: IPlayer = definePlayer('x');
    const player2: IPlayer = definePlayer('o');

    let newGameStat: IStat = {
        contestId: generateID(24),
        timestamp: new Date().valueOf(),
        player1,
        player2
    };
    GameStats.setStats(newGameStat);
};
```

You can observe that we used interface `IPlayer`, hence, you should import it.
In addition, there is a function named `definePlayer()` that must look like below:

```ts
const definePlayer = (playerSymbol: TSymbol): IPlayer => {
    const id = generateID(24);
    const player: IPlayer = {
        id,
        name: '',
        username: id.substring(0, 8),
        type: 'Mankind',
        symbol: playerSymbol,
        score: 0
    };
    return player;
};
```

The task of this method is to generate a new player with the provided info.

Function `generateID()` is a global method that is defined in the `./src/utils/global.ts` file:

```ts
export const generateID = (length: number): string => {
    const chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result: string = '';
    const charsLength: number = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
};
```

Then, `preInit()` must be called once, right when the playground is declared — not inside `init()`,
because `init()` will be called again every time the players reset the game and we don't want to
create new players on every reset. Hence, call it just before the `return` statement of `Playground()`:

```ts
export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);

    // ...all the other functions...

    preInit();

    return {
        init
    };
};
```

#### Step 3:Store the moves of the players

We have got the players and the game stats, but still we don't store **who clicked which cell**.
Therefore, we need a second store, and again we are going to use of the `Singleton` pattern for it.

First of all, add these two interfaces to `./src/interfaces/index.ts`:

```ts
export interface IPlayerMove {
    selectedCells: number[];
    player: IPlayer;
}
export interface IMove {
    x: IPlayerMove;
    o: IPlayerMove;
}
```

So, an `IMove` object holds two records, one for each symbol, and each record keeps the list of the
cell numbers that this player has selected until now. It means, if X clicked the cells 1, 5 and 9,
then `moves.x.selectedCells` will be `[1, 5, 9]`.

Then, create the file `./src/store/moveStats.ts` as follows:

```ts
import { IMove, IPlayer, IPlayerMove, TSymbol } from '../interfaces/index.js';

let instance: any;
let moves: IMove = {
    x: {
        player: {} as IPlayer,
        selectedCells: []
    },
    o: {
        player: {} as IPlayer,
        selectedCells: []
    }
} as IMove;
let currentTurn: TSymbol = 'x';

class Moves {
    constructor() {
        if (instance) throw new Error('New instance cannot be created!');
        instance = this;
    }
    resetMoves() {
        moves = {
            x: {
                player: {} as IPlayer,
                selectedCells: []
            },
            o: {
                player: {} as IPlayer,
                selectedCells: []
            }
        };
        currentTurn = 'x';
    }
    doesExistAnyMove() {
        if (moves?.o?.selectedCells?.length > 0 || moves?.x?.selectedCells?.length > 0) return true;
        return false;
    }
    getMoves() {
        return moves;
    }
    updateMoves(playerMove: IPlayerMove) {
        if (playerMove.player.symbol === 'x') {
            moves.x.player = playerMove.player;
            moves.x.selectedCells.concat(playerMove.selectedCells);
        } else if (playerMove.player.symbol === 'o') {
            moves.o.player = playerMove.player;
            moves.o.selectedCells.concat(playerMove.selectedCells);
        }
        return moves;
    }
    currentTurn() {
        return currentTurn;
    }
    updateTurn(turn: TSymbol) {
        currentTurn = turn;
    }
}

const movesInstance = Object.freeze(new Moves());
export default movesInstance;
```

The methods of this store are as follows:

- `getMoves()` gives us the live `IMove` object, it means the current state of the whole board
- `updateMoves()` we call it after each move to attach the player object to their own record
- `doesExistAnyMove()` returns `true` if at least one cell is selected, we will use of it to decide
  when the `reset` button should appear
- `currentTurn()` returns whose turn it is now, `'x'` or `'o'`
- `updateTurn()` switches the turn to the other player
- `resetMoves()` empties everything and gives the turn back to X

Notice that both stores are exported as `Object.freeze(new ClassName())`, and both of them throw an
error inside the constructor if a second instance is created. That is the whole idea of the
`Singleton` pattern — no matter from how many different files you import them, you always get the
same one object, hence the game state never gets duplicated.

#### Step 4:Put the X and O on the board

Now it is the turn of the most satisfying part, drawing the symbols. 😄

Create a file `./src/utils/gamePlay.ts` and add the below code:

```ts
import { CreateElement } from './global.js';
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
    getCurrentTurn();
    return updatedMove;
};
export const getCurrentTurn = () => {
    let turn = MovesInstance.currentTurn();
    const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;

    if (!currentTurnSpan.innerHTML.length) {
        currentTurnSpan.innerHTML = turn.toUpperCase();
    } else {
        currentTurnSpan.innerHTML = turn == 'x' ? 'O' : 'X';
    }

    return turn;
};
```

There are a couple of things in the above code that need to be explained:

- The first `if` block is our guard against cheating (or just double-clicking). If the cell number
  already exists in the selected cells of X **or** of O, we return an empty object and we draw
  nothing. So the same cell can never be taken twice.

- `document.querySelector('section.cell:nth-child(' + cellNumber + ')')` — this is the reason we
  numbered our cells starting from **1** and not from 0 in `init()`. CSS `nth-child()` is also
  1-based, hence the cell number and the DOM position match each other exactly and we don't need to
  keep any extra map between them.

- Instead of building the `<span>` by hand we pass a schema to our `CreateElement()`, same like we
  did for the board itself. The class name becomes `cell-x` or `cell-o`, which are the two glowing
  styles we already wrote in the CSS.

- `getCurrentTurn()` is called at the **end** of `makeMove()`, and this is a little tricky so pay
  attention. At that moment the turn has not been switched yet, so `MovesInstance.currentTurn()`
  still returns the player who just played. Therefore, to show the reader whose turn is **next**, we
  display the opposite symbol. And the first time it runs (from `index.ts`, before anybody played)
  the span is still empty, hence it simply prints `X`.

#### Step 5:Handle the clicks

In `init()` we already gave every cell an `onclick: handleClick`, but we never wrote `handleClick`
itself. Therefore, add it to `./src/utils/playground.ts`:

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

    // `makeMove()` gives us back an empty object when the cell was already taken,
    // in that case we must stop right here and NOT switch the turn
    if (!moves?.x) return;

    // the scores will be calculated in here, in the next part of the series

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

The flow of this method is as follows:

1. read the current turn from the moves store
2. take the last game stat and find out **which player object** owns that symbol
3. ask `makeMove()` to draw the symbol on the clicked cell
4. if the cell was already taken, return and do nothing
5. refresh the score board
6. switch the turn to the other player, and save the move in the store

Be careful about that early `return` in the middle. ⚠️ Without it, clicking on an already-filled
cell would draw nothing (which is correct) but would still switch the turn (which is wrong), and
your players would lose their turn for free.

#### Step 6:The score board & the reset button

We are almost there. Three small methods are still missing in `./src/utils/playground.ts`.

The first one only reads the last game stat and writes the two numbers into the score board that we
prepared in the HTML:

```ts
const updateScoreBoard = () => {
    const gameStats = GameStats.getLastStats();

    let xScore = document.querySelector('#xScore') as HTMLElement;
    let oScore = document.querySelector('#oScore') as HTMLElement;

    xScore.innerHTML = gameStats.player1.score.toString();
    oScore.innerHTML = gameStats.player2.score.toString();
};
```

Then the `reset` button. Same like in part 1 we don't want to show it before the first move, hence
we check `doesExistAnyMove()` first:

```ts
const makeResetButton = () => {
    const hasAnyMove = MovesInstance.doesExistAnyMove();
    if (!hasAnyMove) return;

    const actionsDiv: HTMLElement = document.querySelector('.actions') as HTMLElement;
    if (actionsDiv.querySelector('button')) return;

    const resetButtonSchema = {
        id: 'reset',
        tag: 'button',
        className: 'btn btn-glow',
        textContent: 'RESET',
        onclick: resetButtonHandler
    };
    const resetButton = CreateElement(resetButtonSchema);
    actionsDiv.appendChild(resetButton);
};
```

And these two handle the actual resetting:

```ts
const reset = () => {
    MovesInstance.resetMoves();
    preInit();
    updateScoreBoard();
    const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;
    currentTurnSpan.innerHTML = 'X';
};
const resetButtonHandler = () => {
    const playground = document.querySelector('#playground') as HTMLElement;
    playground.remove();
    const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
    actions?.removeChild(actions.lastChild as HTMLElement);

    reset();
    init();
};
```

`resetButtonHandler()` throws away the whole `#playground` element and the button itself, then
`reset()` empties the moves store and calls `preInit()` again — which means a **brand new contest
with brand new players** is pushed into `GameStats`, so the old game is still kept in the stats
array as a history. At the end `init()` builds a fresh empty board.

Now, update `./src/index.ts` to also call `getCurrentTurn()` once at the startup, so the players see
`CURRENT TURN: X` before anybody clicked:

```ts
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
```

#### Step 7:Run it and see the result

Whole `./src/utils/playground.ts` file should looks like this:

```ts
import { CreateElement } from './global.js';
import { IMove, IPlayer, IPlayerMove, IPlayground, IStat, TSymbol } from '../interfaces/index.js';
import GameStats from '../store/gameStats.js';
import { generateID } from './global.js';
import { makeMove } from './gamePlay.js';
import MovesInstance from '../store/moveStats.js';

export const Playground = (squareDimension: number, parentTag: HTMLElement) => {
    let rootCSS = document.querySelector(':root') as HTMLElement;
    rootCSS.style.setProperty('--dimension', `${squareDimension}`);

    const definePlayer = (playerSymbol: TSymbol): IPlayer => {
        const id = generateID(24);
        const player: IPlayer = {
            id,
            name: '',
            username: id.substring(0, 8),
            type: 'Mankind',
            symbol: playerSymbol,
            score: 0
        };
        return player;
    };
    const reset = () => {
        MovesInstance.resetMoves();
        preInit();
        updateScoreBoard();
        const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;
        currentTurnSpan.innerHTML = 'X';
    };
    const preInit = () => {
        const player1: IPlayer = definePlayer('x');
        const player2: IPlayer = definePlayer('o');

        let newGameStat: IStat = {
            contestId: generateID(24),
            timestamp: new Date().valueOf(),
            player1,
            player2
        };
        GameStats.setStats(newGameStat);
    };
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
        const newTag = parentTag.appendChild(playground);
        return newTag;
    };
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

        // the scores will be calculated in here, in the next part of the series

        updateScoreBoard();

        MovesInstance.updateTurn(currentTurn === 'x' ? 'o' : 'x');
        const playerMove: IPlayerMove = {
            selectedCells: [],
            player: currentPlayer
        };
        playerMove.selectedCells.push(id);
        MovesInstance.updateMoves(playerMove);
    };
    const resetButtonHandler = () => {
        const playground = document.querySelector('#playground') as HTMLElement;
        playground.remove();
        const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
        actions?.removeChild(actions.lastChild as HTMLElement);

        reset();
        init();
    };
    const makeResetButton = () => {
        const hasAnyMove = MovesInstance.doesExistAnyMove();
        if (!hasAnyMove) return;

        const actionsDiv: HTMLElement = document.querySelector('.actions') as HTMLElement;
        if (actionsDiv.querySelector('button')) return;

        const resetButtonSchema = {
            id: 'reset',
            tag: 'button',
            className: 'btn btn-glow',
            textContent: 'RESET',
            onclick: resetButtonHandler
        };
        const resetButton = CreateElement(resetButtonSchema);
        actionsDiv.appendChild(resetButton);
    };
    const updateScoreBoard = () => {
        const gameStats = GameStats.getLastStats();

        let xScore = document.querySelector('#xScore') as HTMLElement;
        let oScore = document.querySelector('#oScore') as HTMLElement;

        xScore.innerHTML = gameStats.player1.score.toString();
        oScore.innerHTML = gameStats.player2.score.toString();
    };

    preInit();

    return {
        init
    };
};
```

And the structure of your `src` folder must be same like this:

```
src
├── index.ts
├── interfaces
│   └── index.ts
├── store
│   ├── gameStats.ts
│   └── moveStats.ts
└── utils
    ├── gamePlay.ts
    ├── global.ts
    └── playground.ts
```

Now run the app:

`npm run dev`

Then open `http://localhost:3000` and you must see a 5x5 board. Click on the cells one by one and
check the following things:

- the X and O appear with their glowing colors
- the `CURRENT TURN` at the top switches after every move
- the `RESET` button shows up after the very first move, and it really clears the board
- clicking on a cell that is already taken does absolutely nothing

<!-- TODO(Saeed): screenshot of a played 5x5 board (marks + RESET button visible) -->

But, both scores are still `0` and they will stay `0` forever, no matter how many symbols you put in
a row. 😅

And that is exactly the interesting part, because on a 5x5 board (or 8x8, or 20x20) the trick we used
in part 1 — a hardcoded array of the 8 winning combinations — is simply not an option anymore.

### The Next Step...

In the next part we are going to build the brain of this game: the scoring engine.

We will convert the moves of each player into a **matrix of 0 and 1**, then we will rotate that
matrix by 90, 45 and -45 degrees, so that the vertical lines and both diagonals can be counted with
exactly the same code that counts the horizontal ones. I made a few animations to show you how this
generation and rotation works, because seeing it is much easier than reading it.

Then, finally, those two big zeros on the score board will start moving. Stay tuned! 😉
