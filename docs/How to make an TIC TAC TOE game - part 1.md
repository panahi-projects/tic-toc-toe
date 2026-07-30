# How to make an advanced TIC TAC TOE game with Javascript [part 1]

### Introduction

Hey there, fellow tech enthusiasts! My name is Saeed Panahi, and I'm thrilled to be sharing my latest creation with you - a Tic Tac Toe game built with vanilla JavaScript! 🎉 As a seasoned software engineer with a passion for front-end development.

Now, I know what you might be thinking - "TIC TAC TOE? That's not exactly rocket science, is it?" And you'd be right, but that's precisely the beauty of it! The simplicity of this classic game allows us to focus on the nitty-gritty details of coding, without getting bogged down in overly complex logic. Plus, who doesn't love a good game of Tic Tac Toe every now and then? 😄
So, if you're ready to dive into the world of JavaScript gaming, I invite you to join me on this adventure! In the following sections, we'll explore the steps involved in creating our very own Tic Tac Toe game, complete with stylish graphics and intuitive gameplay. By the end of this tutorial, you'll have a fully functional game to show off to your friends and family (or keep all to yourself - we won't judge!). 😉

**Let's get started!** 🚀

Not long ago, on a holiday evening, I decided to quickly implement a Tic Tac Toe game with pure JS for my own fun. After spending a couple of hours finally I made a 3x3 game with an appropriate UI and functionality.
[Click here](https://github.com/panahi-projects/tic-toc-toe/tree/149de7d9402d002b305b00adb2ae6e40ca9974e2) to see the source code on my [Github](https://github.com/panahi-projects).

But when I looked at the code I had written from a distance I realized why should it be limited only to 3x3 and why not 6x6 or more?! To reach that milestone, a series of fundamental changes had to be made in the program. And very casually, this project became a relatively serious project.

### Objectives of these series of article

After reading this article and implementing it, you will be familiar with the following:

- Using of modern Javascript/Typescript methods
- Implementing famous design patterns (Singleton & Module pattern, and etc.)
- Think deeply on the problems and resolve them better

### Prerequisites

Before you continue you need to know the following:

- Basics of Javascript
- A little bit of HTML & CSS
- Know how to work with an IDE ([VS Code](https://code.visualstudio.com/download) is recommended)
  Also, you need to install LTS version of [Node.js](https://nodejs.org/en) on your local machine.
  It’s better to install the following items before starting the project:

`npm install -g nodemon`

### Initialize the project

Make an empty folder for the project, open it on the IDE (vs code), and initialize it as a Node
project by the below command:

`npm init -y`

This gives us a `package.json` file, and we are going to need it in a few minutes for the packages and
for the `scripts` section.

After that, We’re going to prepare the UI:
In the root of the project create a directory named “public”.
Inside the `public` folder create an HTML file as follows: `index.html` and inside the `<body></body>` tag add the below codes:

```html
<div id="app">
    <div class="container">
        <h1 class="title">Tic Tac Toe</h1>
        <div id="playground" class="playground flexbox">
            <!-- game field will be created in here by JS -->
        </div>
        <div class="actions clearfix">
            <!-- the button handlers like ‘reset’ button goes here -->
        </div>
    </div>
</div>
```

Then firstly, we need to add the cells of the game inside the tag `<div id=”playground”></div>` and create the playground of the game for our UI test (because these cells will be removed in future and will be added automatically by the JS code), in order to do it write these codes:

```html
<div class="playground flexbox">
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-o">O</span>
    </section>
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-o">O</span>
    </section>
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-x">X</span>
    </section>
    <section class="cell">
        <span class="cell-o">O</span>
    </section>
</div>
```

The numbers of the `section` tags is 9 because a 3X3 Tic Tac Toe game has 3 rows and 3 columns which will be 9 cells at all.
It is look like this:

![index.html](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qcq3nsn2tid58190m4cd.png)

Okey, Okeyyyy !!! I know it looks ugly!
Let’s make it pretty 😉

Make a CSS file named `style.css` in the public folder and add the following codes for having a good-looking UI:

`@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');`

```css
* {
    margin: 0;
    padding: 0;
}
body {
    background-color: #22113f;
}
.container {
    margin: auto;
    width: 75%;
}
```

The above codes of CSS are only for preparation and also, we added a font from google fonts “Varela Round” for having a round edge X / O in the game but it is optional.
I decided to have a glowing title and items in the game, so added this piece of code for styling the title:

```css
.title {
    text-align: center;
    font-family: 'Varela Round', sans-serif;
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
```

The below code helps us to make a glowing text:
`text-shadow: 0 0 10px #03bcf4, 0 0 20px #03bcf4, 0 0 40px #03bcf4, 0 0 80px #03bcf4, 0 0 160px #03bcf4;`

Then write the below CSS for the board game:

```css
.playground {
    width: 300px;
    height: 300px;
    margin: 10px auto;
    background: rgb(95, 15, 191);
    background: linear-gradient(120deg, rgba(95, 15, 191, 1) 0%, rgba(170, 20, 111, 1) 100%);
    text-align: center;
    padding: 12px;
    border-radius: 8px;
}
.flexbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
```

After we created the styles of the container, now it is the turn of sections that are 9 of them inside the board game. But, how can we have only 3 sections in a row, by using the `calc()` function in CSS we can have calculated values
`width : calc((100% / 3) - 44px);`

So, since we want 3 items in a row divide 100% to 3. But what is the `44px` in the above code snippet?!

Because the max of padding is 40px and the margin between each item is 2px (2px on the left and the right side will be 4px) the summation of that will be 44px. And the whole CSS class is like the below code:

```css
.playground .cell {
    position: relative;
    width: calc((100% / 3) - 44px); /* Calculate width based on available space */
    padding: 40px 20px;
    margin: 2px;
    color: #f1f1f1;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.55);
    cursor: pointer;
    transition: 0.3s;
}
```

At the end, we need shining XOs. Hence, add the following codes to the CSS file:

```css
.playground .cell span {
    position: absolute;
    font-family: 'Varela Round', sans-serif;
    text-transform: uppercase;
    font-size: 92px;
    font-weight: 600;
    top: calc(50% + 2px);
    left: 50%;
    transform: translate(-50%, -50%);
}
.playground .cell span.cell-x {
    color: #fff !important;
    text-shadow:
        0 0 10px #03bcf4,
        0 0 20px #03bcf4 !important;
}
.playground .cell span.cell-o {
    color: #fff;
    text-shadow:
        0 0 10px #f403a8,
        0 0 20px #f403a8,
        0 0 30px #da0095;
}
.playground .cell:hover {
    background: rgba(0, 0, 0, 0.65);
}
```

Whole `style.css` file should looks like this:

```css
@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

* {
    margin: 0;
    padding: 0;
}
body {
    background-color: #22113f;
}
.container {
    margin: auto;
    width: 75%;
}
.title {
    text-align: center;
    font-family: 'Varela Round', sans-serif;
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
    width: 300px;
    height: 300px;
    margin: 10px auto;
    background: rgb(95, 15, 191);
    background: linear-gradient(120deg, rgba(95, 15, 191, 1) 0%, rgba(170, 20, 111, 1) 100%);
    text-align: center;
    padding: 12px;
    border-radius: 8px;
}
.flexbox {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.playground .cell {
    position: relative;
    width: calc((100% / 3) - 44px); /* Calculate width based on available space */
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
    font-family: 'Varela Round', sans-serif;
    text-transform: uppercase;
    font-size: 92px;
    font-weight: 600;
    top: calc(50% + 2px);
    left: 50%;
    transform: translate(-50%, -50%);
}
.playground .cell span.cell-x {
    color: #fff !important;
    text-shadow:
        0 0 10px #03bcf4,
        0 0 20px #03bcf4;
}
.playground .cell span.cell-o {
    color: #fff;
    text-shadow:
        0 0 10px #f403a8,
        0 0 20px #f403a8,
        0 0 30px #da0095;
}
.playground .cell:hover {
    background: rgba(0, 0, 0, 0.65);
}
```

Don’t forget to import `style.css` to the HTML file by code:
`<link rel="stylesheet" href="./style.css" />`
Finally our app’s UI must be same like the below image:

![index.html Final UI of the game](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qau804yoa6og0q1hiu2u.png)

## Time to code Javascript

**Roll up the sleeves...**

We need to establish a web server. However, it’s not a must-do but is better to run our application on a web server.

### Prepare web server

Install the following packages:

- `npm install express http-errors body-parser`
- `npm install --save-dev nodemon livereload connect-livereload`

A small note about `body-parser`: it comes along with `express` as a sub-dependency, hence
`require('body-parser')` would work even if you don't install it. But it is not written in your
`package.json` in that case, so the day `express` changes its dependencies your app breaks for no
visible reason. Therefore, always install what you `require` directly.

When we installed the above packages, make a JS file in the root called `server.js`
And add the following codes inside that to make a server (because this article is not about “How to create a JS web server”, we only add the following codes to our project and not going to instruct that):

```js
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const bodyParser = require('body-parser');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

const app = express();
const PORT = 3000;
const COLORS = {
    CYAN: '\u001b[36m',
    WHITE: '\u001b[37m'
};

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});

app.use(connectLiveReload());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`${COLORS.CYAN}Server is running on http://localhost:${PORT}${COLORS.WHITE}`));

// serve the css & js as static
app.use(express.static(__dirname));
// get our app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/');
});
```

Remember, that you need to add the following command to your `package.json` to run the app by using `npm run dev`

```json
"scripts":{
      …
        "start": "node server.js",
        "dev": "nodemon server.js",
      …
 }
```

Add a \*.js file in the root of the project called `index.js` and first of all insert the following JS code:

```js
'use strict';

(function () {
    // The code goes here...
})();
```

Now, You should import the `index.js` file to your `index.html` file.

```html
…
<body>
    …
    <script type="module" src="../index.js"></script>
</body>
…
```

So, your finall `index.html` file should be same like the below code:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tic Tac Toe</title>
        <link rel="stylesheet" href="./style.css" />
    </head>
    <body>
        <div id="app">
            <div class="container">
                <h1 class="title">Tic Tac Toe</h1>
                <div id="playground" class="playground flexbox">
                    <!-- game board will be created here automatically by the js code -->
                </div>
                <div class="actions clearfix">
                    <!-- reset button goes here -->
                </div>
            </div>
        </div>
        <script type="module" src="../index.js"></script>
    </body>
</html>
```

Don't forget that in the preceding steps we added a couple of `<section class="cell">...</section>` inside tag `<div id="playground" class="playground flexbox">...</div>`, but those were added only for testing the CSS styles and now those are should be removed, because they will be added to the `<div id="playground" class="playground flexbox">...</div>` automatically by the JS code.

Finally the structure of your project should be similar to the below image:

![Project structure](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6mmvimucct5wxsaik5sr.png)

### Core of the game

After adding all of the previous configurations and doing all of the steps, now we are going to code the core of the game.
Hence, in `index.js` file we need a couple of functions to handle different parts of the game.

#### Step 1:Define global variables

Inside `index.js` and in the block of the main IIFE function, we should define some variables to store the current turn (X or O), store the user moves, and also to check if the game is over or not!

```js
(function () {
    let currentTurn = 'x',
        isGameOver = false;
    let moves = [];
    const NUMBER_OF_GAME_PIECES = 9;

    //The rest of the code goes here...
})();
```

#### Step 2:Create the Game Board

Create a HTML element to represent the game board, and add nine squares to it.

```js
const Playground_Init = (gamePiecesNum = 0) => {
    const playground = document.querySelector('#playground');

    for (let i = 1; i <= gamePiecesNum; i++) {
        const section = document.createElement('section');
        section.className = 'cell';
        section.innerHTML = '';
        section.dataset.number = i;
        section.onclick = () => {
            if (isGameOver) return;
        };
        playground.appendChild(section);
    }
};
```

#### Step 3:Create the Move Function

Now, let's create a function that will handle player moves. This function will take in the row and column where the player wants to place their mark (X or O), and it will update the game state accordingly.

```js
const makeMove = (cellNumber) => {
    if (moves.findIndex((x) => x.cell === cellNumber) >= 0) {
        return {};
    }
    const cellContent = document.createElement('span');
    if (currentTurn === 'x') {
        cellContent.className = 'cell-x';
        cellContent.innerHTML = 'X';
        let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
        xCell.appendChild(cellContent);

        currentTurn = 'o';
        return {
            turn: 'x',
            cell: cellNumber
        };
    } else {
        cellContent.className = 'cell-o';
        cellContent.innerHTML = 'O';
        let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
        xCell.appendChild(cellContent);

        currentTurn = 'x';
        return {
            turn: 'o',
            cell: cellNumber
        };
    }
};
```

#### Step 4: Create the Check Game Over Function

The `gameOver()` function will check if the game is over by checking if any player has won or if all squares have been filled.

```js
const gameOver = () => {
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

    let xMoves = extractMoves(moves, 'x');
    let oMoves = extractMoves(moves, 'o');

    let hasWon = false;

    for (let combination of winningCombinations) {
        if (xMoves.includes(combination[0]) && xMoves.includes(combination[1]) && xMoves.includes(combination[2])) {
            hasWon = true;
            break;
        }
        if (oMoves.includes(combination[0]) && oMoves.includes(combination[1]) && oMoves.includes(combination[2])) {
            hasWon = true;
            break;
        }
    }
    if (hasWon) {
        console.log('You Win! 🎉');
    }
    return hasWon;
}; //end gameOver
```

Inside the `gameOver()` function, you can see that a function called `extractMoves()` is used, the task of this function in the app is to return the movements of each player to us. Because in the `moves` variable we store an array of objects equal to example below:

```js
[
   ...
   { turn: 'x', cell: 3},
   { turn: 'x', cell: 4},
   { turn: 'o', cell: 1},
   ...
]
```

```js
const extractMoves = (collection = [], turn = '') => {
    return collection
        .map((x) => {
            if (x.turn === turn) {
                return x.cell;
            }
        })
        .filter((x) => x);
};
```

#### Step 5: Create reset button

Also, after starting the game the players should see a `reset` button in order to reset the game as they intended.

```js
const makeResetButton = () => {
    const actionsDiv = document.querySelector('.actions');
    if (actionsDiv.querySelector('button')) return;

    const resetButton = document.createElement('button');
    resetButton.className = 'btn btn-glow';
    resetButton.id = 'reset';
    resetButton.textContent = 'RESET';
    resetButton.onclick = resetButtonHandler;
    actionsDiv.appendChild(resetButton);
};
```

Additionally, when the players click on the `reset` button should trigger the below function:

```js
const resetButtonHandler = () => {
    if (moves.length === 0) return;
    const playground = document.querySelector('#playground');
    while (playground.firstChild) {
        playground.removeChild(playground.lastChild);
    }
    const actions = document.querySelector('.actions');
    actions.removeChild(actions.lastChild);
    moves = [];
    isGameOver = false;
    currentTurn = 'x';

    Playground_Init(NUMBER_OF_GAME_PIECES);
};
```

Then, the function `Playground_Init()` should be modified as below:

```js
const Playground_Init = (gamePiecesNum = 0) => {
    const playground = document.querySelector('#playground');

    for (let i = 1; i <= gamePiecesNum; i++) {
        const section = document.createElement('section');
        section.className = 'cell';
        section.innerHTML = '';
        section.dataset.number = i;
        section.onclick = () => {
            if (isGameOver) return;
            const selected_piece = +section.getAttribute('data-number');

            let moveStatus = makeMove(selected_piece);
            if (moveStatus?.cell) {
                moves.push(moveStatus);
            }
            if (moves.length) {
                makeResetButton();
            }
            isGameOver = gameOver();
            if (isGameOver) {
                makeWinnigPrompt();
            }
        };
        playground.appendChild(section);
    }
};
```

Finally we call method `Playground_Init()` at the end of IIFE function

`Playground_Init(NUMBER_OF_GAME_PIECES);`

At the end, the final code in `index.js` should be look like this:

```js
'use strict';

(function () {
    let currentTurn = 'x',
        isGameOver = false;
    let moves = [];
    const NUMBER_OF_GAME_PIECES = 9;

    const Playground_Init = (gamePiecesNum = 0) => {
        const playground = document.querySelector('#playground');

        for (let i = 1; i <= gamePiecesNum; i++) {
            const section = document.createElement('section');
            section.className = 'cell';
            section.innerHTML = '';
            section.dataset.number = i;
            section.onclick = () => {
                if (isGameOver) return;
                const selected_piece = +section.getAttribute('data-number');

                let moveStatus = makeMove(selected_piece);
                if (moveStatus?.cell) {
                    moves.push(moveStatus);
                }
                if (moves.length) {
                    makeResetButton();
                }
                isGameOver = gameOver();
                if (isGameOver) {
                    makeWinnigPrompt();
                }
            };
            playground.appendChild(section);
        }
    };
    const makeWinnigPrompt = () => {
        const playground = document.querySelector('#playground');

        const winningPrompt = document.createElement('div');
        winningPrompt.className = 'winner-prompt';
        winningPrompt.innerHTML = 'You Win! 🎉';
        playground.appendChild(winningPrompt);
    };
    const resetButtonHandler = () => {
        if (moves.length === 0) return;
        const playground = document.querySelector('#playground');
        while (playground.firstChild) {
            playground.removeChild(playground.lastChild);
        }
        const actions = document.querySelector('.actions');
        actions.removeChild(actions.lastChild);
        moves = [];
        isGameOver = false;
        currentTurn = 'x';

        Playground_Init(NUMBER_OF_GAME_PIECES);
    };
    const makeMove = (cellNumber) => {
        if (moves.findIndex((x) => x.cell === cellNumber) >= 0) {
            return {};
        }
        const cellContent = document.createElement('span');
        if (currentTurn === 'x') {
            cellContent.className = 'cell-x';
            cellContent.innerHTML = 'X';
            let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
            xCell.appendChild(cellContent);

            currentTurn = 'o';
            return {
                turn: 'x',
                cell: cellNumber
            };
        } else {
            cellContent.className = 'cell-o';
            cellContent.innerHTML = 'O';
            let xCell = document.querySelector(`section.cell:nth-child(${cellNumber})`);
            xCell.appendChild(cellContent);

            currentTurn = 'x';
            return {
                turn: 'o',
                cell: cellNumber
            };
        }
    };
    const extractMoves = (collection = [], turn = '') => {
        return collection
            .map((x) => {
                if (x.turn === turn) {
                    return x.cell;
                }
            })
            .filter((x) => x);
    };
    const makeResetButton = () => {
        const actionsDiv = document.querySelector('.actions');
        if (actionsDiv.querySelector('button')) return;

        const resetButton = document.createElement('button');
        resetButton.className = 'btn btn-glow';
        resetButton.id = 'reset';
        resetButton.textContent = 'RESET';
        resetButton.onclick = resetButtonHandler;
        actionsDiv.appendChild(resetButton);
    };
    const gameOver = () => {
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

        let xMoves = extractMoves(moves, 'x');
        let oMoves = extractMoves(moves, 'o');

        let hasWon = false;

        for (let combination of winningCombinations) {
            if (xMoves.includes(combination[0]) && xMoves.includes(combination[1]) && xMoves.includes(combination[2])) {
                hasWon = true;
                break;
            }
            if (oMoves.includes(combination[0]) && oMoves.includes(combination[1]) && oMoves.includes(combination[2])) {
                hasWon = true;
                break;
            }
        }
        if (hasWon) {
            console.log('You Win! 🎉');
        }
        return hasWon;
    }; //end gameOver
    console.log('Web server is running!');

    Playground_Init(NUMBER_OF_GAME_PIECES);
})();
```

And that's it! Now you should have a fully functional Tic Tac Toe game using JavaScript.

**Algorithm Explanation:**

The game starts with X going first. When a player makes a move, the makeMove() function gets called, which updates the game state by.

### The Next Step...

Stay tuned for the next part of our Tic Tac Toe series, where we'll take the game to the next level by optimizing and enhancing its functionality. We'll be incorporating popular JavaScript design patterns such as `Singleton` and `Module` patterns to make the code more efficient and maintainable.

Plus, we'll expand the game to support larger boards, allowing players to experience the thrill of competition on 6x6, 8x8, or even larger grids.

And, we'll automate the process of checking for winning combinations, so you can focus on strategizing and outsmarting your opponent without worrying about keeping track of every possible combination. Lastly, we'll display the players' scores on a dynamic scoreboard, adding an extra layer of excitement to the game. Don't miss out on the next installment of our Tic Tac Toe adventure! ;)
