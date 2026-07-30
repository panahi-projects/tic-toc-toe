# How to make an advanced TIC TAC TOE game with Javascript [part 4]

### Welcome back

This is the last part of our Tic Tac Toe series, and we are going to finish the game properly.

In the part 3 we built the scoring engine — the matrix, the four rotations, and the counting of the
neighbour `1`s. Our board now understands lines on any dimension, and both scores move after every
click.

But the game still does not know how to **end**. The players can fill the last cell and nothing
happens, and nobody wins. Additionally, the dimension of the board is still my hardcoded
`GRID_SIZE = 5`, which is a shame because the whole reason I started this refactoring was to support
any size.

And frankly, a game that ends with a `console.log` is not a game. When somebody wins I want a real
celebration — a firework, and a modal that announces the winner with the final scores. Hence, we are
going to build both of them from scratch, with a canvas and around 150 lines of Javascript, without
any library.

So in this part we do the following things:

- decide when the game is over, and who won
- build a firework animation on a `<canvas>`
- announce the winner in a modal, with a draw state as well
- let the players choose the board size from the UI
- and at the end I will show you the two bugs that are hiding in this code, plus a troubleshooting
  list of everything that went wrong while I was building it

Click [here](https://dev.to/saeedpanahi/how-to-make-an-advanced-tic-tac-toe-game-with-javascript) to
see the PART-1 of the series, and here are the
[PART-2](ADD-PART-2-URL-HERE) and the [PART-3](ADD-PART-3-URL-HERE).

<!-- TODO(Saeed): replace ADD-PART-2-URL-HERE and ADD-PART-3-URL-HERE with the real dev.to links -->


**Let's finish it...**

### When exactly is this game over?

In the classic 3x3 game the answer is easy: as soon as somebody has 3 in a row, the game stops.

But our game is not the classic one anymore. On a 5x5 or 8x8 board, stopping at the first line of 3
would be boring, because the players would never use of the rest of the board and all the work we did
in the part 3 for counting 4, 5 and 6 in a row would be useless.

Hence, I chose a different rule for the big boards:

> The game continues until the board is full. Then the player with the higher score wins.

This rule fits our scoring engine perfectly — long lines are worth more than short ones, so a player
who builds one line of 5 (500 points) beats a player who builds one line of 3 (300 points), and every
single cell keeps mattering until the very last click.

If you prefer the classic sudden-death rule instead, you can do it easily too, and at the end of this
article I will show you how to switch.

#### Step 1:Keep a game-over flag in the store

First of all we need to know how many cells are already taken, and we need somewhere to remember that
the game has finished. Both of them belong to the moves store, therefore open
`./src/store/moveStats.ts` and modify it as below.

Add a new variable next to `currentTurn`:

```ts
let currentTurn: TSymbol = 'x';
let isGameOver: boolean = false;
```

Then add these three methods inside the `Moves` class:

```ts
totalMoves() {
    return (moves?.x?.selectedCells?.length || 0) + (moves?.o?.selectedCells?.length || 0);
}
gameOver() {
    return isGameOver;
}
setGameOver(value: boolean) {
    isGameOver = value;
}
```

And don't forget to clear the flag inside `resetMoves()`, otherwise after one finished game the board
would stay frozen forever:

```ts
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
    isGameOver = false;
}
```

- `totalMoves()` gives us the number of all the selected cells of the both players together
- `gameOver()` and `setGameOver()` are our simple getter and setter for the flag

And now that the store can count the moves, one small method in `./src/utils/playground.ts` is enough
to know if the board is full:

```ts
const isBoardFull = () => {
    return MovesInstance.totalMoves() >= Math.pow(squareDimension, 2);
};
```

`Math.pow(squareDimension, 2)` is exactly the same expression we used in `init()` to create the cells,
hence a 5x5 board is full at 25 moves, and an 8x8 board at 64 moves.

So we know **when** the game ends. But before we decide **who** won, we need something to celebrate
with. 🎆

#### Step 2:The firework

This is the only part of the project that is not about Tic Tac Toe at all, and it was the most fun to
write. We are going to make a small particle engine on a `<canvas>`.

The idea of a firework in code is simpler than it looks. There are only two kinds of objects:

- a **rocket** — it starts at the bottom, flies up, and when it arrives to its target height it dies
  and it gives birth to the sparks
- a **spark** — it flies away from the explosion point in a random direction, gravity pulls it down,
  friction slows it down, and it fades out until it disappears

So, both of them are only an `x`, a `y`, a speed on each axis, and a color. Add these two interfaces
to `./src/interfaces/index.ts`:

```ts
export interface IFireworkParticle {
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}
export interface IFireworkRocket {
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    targetY: number;
    color: string;
}
```

The `px` and `py` are the **previous** position of the particle, and they are the trick that makes the
whole thing look like a firework instead of a swarm of dots. I will explain it in a moment.

Now create the file `./src/utils/firework.ts`:

```ts
import { CreateElement } from './global.js';
import { IFireworkParticle, IFireworkRocket } from '../interfaces/index.js';

const COLORS: string[] = ['#03bcf4', '#f403a8', '#74ffa9', '#f49003', '#e7da99', '#ffffff'];
const GRAVITY: number = 0.045;
const FRICTION: number = 0.985;

export const Firework = (parentTag: HTMLElement) => {
    const canvas = CreateElement({ tag: 'canvas', className: 'firework-canvas' }) as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    let rockets: IFireworkRocket[] = [];
    let sparks: IFireworkParticle[] = [];
    let animationId: number = 0;
    let launchTimer: number = 0;
    let running: boolean = false;
    let width: number = 0;
    let height: number = 0;

    const randomBetween = (min: number, max: number): number => Math.random() * (max - min) + min;
    const pickColor = (): string => COLORS[Math.floor(Math.random() * COLORS.length)];

    // changing canvas.width/height resets the whole 2d context state,
    // hence the transform and the line style must be applied again in here
    const resize = () => {
        const ratio: number = window.devicePixelRatio || 1;
        width = parentTag.clientWidth;
        height = parentTag.clientHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.lineCap = 'round';
    };
    //...the rest goes here
};
```

The colors are not random ones — they are exactly the neon colors we already use in the game: the
cyan of X, the pink of O, the green of the old winner prompt, the orange of the score board, the cream
of the player titles, and white.

Two words about `devicePixelRatio`. A canvas has two sizes: how many pixels it really holds
(`canvas.width`) and how big it is on the screen (its CSS size). On a retina or a scaled Windows
display those two are not the same, and if you ignore it your firework looks blurry. Hence we
multiply the real size by the ratio and then we scale the context by the same ratio, so we can keep
drawing in normal CSS pixels and forget about it.

**Be careful about one thing here.** ⚠️ Assigning `canvas.width` does not only resize the canvas, it
**resets the entire 2d context** — the transform, the line width, the line cap, everything. That is
why `setTransform()` and `lineCap` are inside `resize()` and not somewhere in the setup. I lost a
good half an hour on this one, my fireworks were sharp on the first frame and blurry after I resized
the window. 😅

Then, launching a rocket and exploding it:

```ts
const launchRocket = () => {
    const x: number = randomBetween(width * 0.15, width * 0.85);
    const y: number = height + 10;

    rockets.push({
        x,
        y,
        px: x,
        py: y,
        vx: randomBetween(-1.1, 1.1),
        vy: randomBetween(-11, -8),
        // the modal sits in the middle of the screen, hence the rockets explode above it
        targetY: randomBetween(height * 0.06, height * 0.32),
        color: pickColor()
    });
};

const explode = (rocket: IFireworkRocket) => {
    const count: number = Math.floor(randomBetween(54, 90));
    const baseSpeed: number = randomBetween(2.6, 5.2);
    // roughly half of the bursts get a second color mixed into them
    const secondColor: string = Math.random() > 0.55 ? pickColor() : rocket.color;

    for (let i = 0; i < count; i++) {
        const angle: number = (Math.PI * 2 * i) / count + randomBetween(-0.06, 0.06);
        const speed: number = baseSpeed * randomBetween(0.35, 1);
        const maxLife: number = Math.floor(randomBetween(38, 70));

        sparks.push({
            x: rocket.x,
            y: rocket.y,
            px: rocket.x,
            py: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: maxLife,
            maxLife,
            color: i % 2 === 0 ? rocket.color : secondColor,
            size: randomBetween(1.6, 3.4)
        });
    }
};
```

The important line in `explode()` is the angle:

`const angle = (Math.PI * 2 * i) / count + randomBetween(-0.06, 0.06);`

`Math.PI * 2` is a full circle in radians, so dividing it by the number of the sparks spreads them
equally around 360 degrees. And then `Math.cos(angle)` and `Math.sin(angle)` turn that angle into a
horizontal and a vertical speed. The small random value at the end is what saves it — with a
perfectly equal spacing the burst looks like a machine-made ring, and with a little noise it looks
like a real firework.

Additionally, notice that I don't give all the sparks the same speed. `baseSpeed * randomBetween(0.35, 1)`
means some sparks fly far and some stay near the center, hence the burst has a **volume** and not just
an outline.

Now the drawing. And here is the `px` / `py` trick I promised:

```ts
const drawTrail = (fromX: number, fromY: number, toX: number, toY: number, color: string, size: number) => {
    context.strokeStyle = color;
    context.shadowColor = color;
    context.lineWidth = size;
    context.shadowBlur = 10;
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
};
```

Instead of drawing a **dot** at the position of the spark, we draw a short **line** from where it was
on the previous frame to where it is now. The faster the spark moves, the longer that line is — so
you get the streaks for free, without storing any history. Together with `shadowBlur` it gives the
same glow that we made with `text-shadow` everywhere else in this game.

And the animation loop:

```ts
const frame = () => {
    if (!running) return;

    // the canvas is cleared instead of being filled, so the modal behind it stays visible.
    // the trails come from drawing a short line between the previous and the current position.
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';

    launchTimer--;
    if (launchTimer <= 0) {
        launchRocket();
        launchTimer = Math.floor(randomBetween(22, 46));
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.px = rocket.x;
        rocket.py = rocket.y;
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.vy += GRAVITY * 2;

        context.globalAlpha = 1;
        drawTrail(rocket.px, rocket.py, rocket.x, rocket.y, rocket.color, 2.4);

        // it explodes when it arrives to its target height, or when it runs out of speed
        if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
            explode(rocket);
            rockets.splice(i, 1);
        }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.px = spark.x;
        spark.py = spark.y;
        spark.vx *= FRICTION;
        spark.vy *= FRICTION;
        spark.vy += GRAVITY;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life--;

        context.globalAlpha = Math.max(spark.life / spark.maxLife, 0);
        drawTrail(spark.px, spark.py, spark.x, spark.y, spark.color, spark.size);

        if (spark.life <= 0) sparks.splice(i, 1);
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-over';

    animationId = window.requestAnimationFrame(frame);
};
```

A few things worth explaining in the above loop:

- `context.globalCompositeOperation = 'lighter'` makes the overlapping particles **add** their light
  together instead of painting over each other. That is what gives the bright core in the middle of a
  burst. Without it a firework looks flat.

- `context.clearRect()` and not a `fillRect()` with a dark color. Many firework tutorials fill the
  canvas with a semi-transparent black on every frame to get the fading trails almost for free, but we
  cannot do that here — our canvas sits **on top of the modal**, so filling it would hide the winner.
  We keep it fully transparent and we pay for the trails with the `px` / `py` lines instead.

- both loops go **backwards** (`for (let i = length - 1; i >= 0; i--)`). Be careful about this one: we
  `splice()` dead particles out of the same array we are walking, and going forward would make the
  loop skip an item every time something is removed.

- `spark.life / spark.maxLife` goes from 1 to 0, so using it as `globalAlpha` gives us the fade out
  with no extra code.

At the end, the two methods that the outside world will use:

```ts
const start = () => {
    if (running) return;

    parentTag.appendChild(canvas);
    resize();
    window.addEventListener('resize', resize);

    rockets = [];
    sparks = [];
    launchTimer = 0;
    running = true;

    // two rockets immediately, so the players don't wait for the first burst
    launchRocket();
    launchRocket();

    animationId = window.requestAnimationFrame(frame);
};

const stop = () => {
    running = false;
    if (animationId) window.cancelAnimationFrame(animationId);
    animationId = 0;
    window.removeEventListener('resize', resize);
    rockets = [];
    sparks = [];
    canvas.remove();
};

return {
    start,
    stop
};
```

**Don't forget the `stop()` method, and don't forget to call it.** A `requestAnimationFrame` loop
never stops by itself — if you only hide the modal with CSS and you leave the loop running, the
browser keeps burning your CPU and your laptop fan for the rest of the session. Hence `stop()` cancels
the frame, removes the resize listener, empties the arrays and takes the canvas out of the DOM.

#### Step 3:The winner modal

Now the modal that the firework is celebrating for. Create `./src/utils/winnerModal.ts`:

```ts
import { CreateElement } from './global.js';
import { Firework } from './firework.js';
import { TSymbol } from '../interfaces/index.js';

const CLOSING_DURATION: number = 350; //must stay in sync with the transition in style.css

export const WinnerModal = () => {
    let overlay: HTMLElement | null = null;
    let firework: { start: () => void; stop: () => void } | null = null;

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') hide();
    };

    const hide = () => {
        document.removeEventListener('keydown', handleKeydown);

        if (firework) {
            firework.stop();
            firework = null;
        }
        if (!overlay) return;

        // the reference is released right away, so a second hide() cannot remove it twice
        const closingOverlay: HTMLElement = overlay;
        overlay = null;
        closingOverlay.classList.remove('is-open');
        window.setTimeout(() => closingOverlay.remove(), CLOSING_DURATION);
    };

    const show = (winner: TSymbol | null, xScore: number, oScore: number, onPlayAgain: () => void) => {
        hide(); //never allow two modals at the same time

        const title: string = winner ? `PLAYER ${winner.toUpperCase()} WINS!` : 'IT IS A DRAW!';
        const badge: string = winner ? '🏆' : '🤝';

        const badgeTag = CreateElement({
            tag: 'div',
            className: 'modal-badge',
            innerHTML: badge
        });
        const titleTag = CreateElement({
            tag: 'h2',
            className: winner ? `modal-title cell-${winner}` : 'modal-title',
            innerHTML: title
        });
        const scoresTag = CreateElement({
            tag: 'div',
            className: 'modal-scores',
            innerHTML:
                `<span class="cell-x">X</span> ${xScore}` +
                `<span class="modal-dash">–</span>` +
                `<span class="cell-o">O</span> ${oScore}`
        });
        const playAgainTag = CreateElement({
            tag: 'button',
            id: 'playAgain',
            className: 'btn btn-glow',
            textContent: 'PLAY AGAIN',
            onclick: () => {
                hide();
                onPlayAgain();
            }
        });
        const modalTag = CreateElement({
            tag: 'div',
            className: 'modal',
            childNodes: [badgeTag, titleTag, scoresTag, playAgainTag]
        });

        overlay = CreateElement({
            tag: 'div',
            id: 'winnerModal',
            className: 'modal-overlay',
            childNodes: [modalTag],
            onclick: (event) => {
                // only a click on the backdrop itself closes it, not a click inside the modal
                if (event.target === overlay) hide();
            }
        });

        document.body.appendChild(overlay);

        // the firework needs the overlay to be in the DOM already, because it reads its size
        if (winner) {
            firework = Firework(overlay);
            firework.start();
        }

        // the class is added one frame later, otherwise the browser has nothing to animate from
        window.requestAnimationFrame(() => {
            overlay?.classList.add('is-open');
        });

        document.addEventListener('keydown', handleKeydown);
    };

    return {
        show,
        hide
    };
};
```

This is our `Module` pattern again, and the whole modal is built out of `CreateElement()` schemas —
no `innerHTML` template of the whole thing, no `document.createElement()`. Notice also that the title
gets the class `cell-x` or `cell-o`, so it reuses the exact glow of the symbol of the winner for free.
The X wins in cyan and the O wins in pink. 😎

There are four details in the above code that are easy to get wrong, and each of them costs you an
annoying bug:

- **The `is-open` class is added one frame later**, inside a `requestAnimationFrame()`. If you append
  an element and you add the animating class in the same tick, the browser never renders the starting
  state, so there is nothing to transition **from** and your modal just appears without any animation.
  One frame of patience is all it needs.

- **The firework is created after `appendChild()`.** Our `resize()` reads `parentTag.clientWidth`, and
  an element that is not in the DOM yet has a width of `0`. So the order matters — first put the
  overlay on the page, then start the firework.

- **`hide()` sets `overlay = null` before the timeout.** Because we wait 350ms for the closing
  transition, a fast player could press `Escape` and then click the backdrop inside that window, and
  `remove()` would run twice on the same node. Releasing the reference first makes the second call a
  no-op.

- **The backdrop click checks `event.target === overlay`.** The click event bubbles up from the modal
  as well, hence without that condition the modal would close when the player clicks the title or the
  score.

And why does the firework only start when there is a `winner`?! because a draw is not something to
celebrate. 🤝 In that case the players still get the modal, with a different badge and title, but no
rockets.

#### Step 4:Decide the winner and stop the clicks

Now we glue everything together in `./src/utils/playground.ts`.

First the imports and two constants at the top of the file, outside the module:

```ts
import { WinnerModal } from './winnerModal.js';

// set it to true if you prefer the classic rule: the game stops at the first line of 3.
// a line of exactly 3 is worth 300 points, hence any score >= 300 means such a line exists.
const SUDDEN_DEATH: boolean = false;
const WINNING_SCORE: number = 300;
```

Then, inside `Playground()`, right after the two `rootCSS` lines, create the modal once:

```ts
const winnerModal = WinnerModal();
```

Now the method that actually decides who won. This is the one we postponed in the Step 1:

```ts
const finishGame = () => {
    MovesInstance.setGameOver(true);

    const gameStats = GameStats.getLastStats();
    const xScore: number = gameStats.player1.score;
    const oScore: number = gameStats.player2.score;

    let winner: TSymbol | null = null;
    if (xScore > oScore) winner = 'x';
    else if (oScore > xScore) winner = 'o';

    winnerModal.show(winner, xScore, oScore, resetButtonHandler);
};
```

`winner` stays `null` when the two scores are equal, and that `null` is exactly what tells the modal
to show the draw state. Additionally, we pass our existing `resetButtonHandler` as the callback of the
`PLAY AGAIN` button — so that button does the same thing as the `RESET` button, and we don't write the
resetting logic twice.

Now we connect it to `handleClick()`. Two changes are needed: a guard at the very top, and the
game-over check at the very bottom.

```ts
const handleClick = (event) => {
    if (MovesInstance.gameOver()) return;
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

    // the move of this click is already counted by now, hence the check comes at the end
    const gameStats = GameStats.getLastStats();
    const hasWinningLine: boolean =
        gameStats.player1.score >= WINNING_SCORE || gameStats.player2.score >= WINNING_SCORE;

    if (isBoardFull() || (SUDDEN_DEATH && hasWinningLine)) {
        finishGame();
    }
};
```

Why do we check `isBoardFull()` at the **end** and not at the beginning?! because the move of this
click must be counted first. Remember that `makeMove()` pushes the cell number into the live array
inside the store, so by the time we reach the last lines, `totalMoves()` already includes the click
that just happened. If we checked it at the top, the modal would appear one click too late.

And the guard on the first line is what really stops the game. Yes, the overlay of the modal covers the
whole screen so physically it already blocks the mouse from reaching the cells — but never rely only on
a visual overlay for your game rules. A flag in the store is the honest way. 😉

Two more small changes are needed in the same file. In `reset()` the modal must be closed, otherwise
after pressing `PLAY AGAIN` the firework would keep running on top of the new board:

```ts
const reset = () => {
    winnerModal.hide();
    MovesInstance.resetMoves();
    preInit();
    updateScoreBoard();
    const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;
    currentTurnSpan.innerHTML = 'X';
};
```

And `resetButtonHandler()` becomes a little more defensive, because now it is called from two places —
the `RESET` button and the `PLAY AGAIN` button of the modal:

```ts
const resetButtonHandler = () => {
    const playground = document.querySelector('#playground') as HTMLElement;
    playground?.remove();
    const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
    if (actions?.lastChild) actions.removeChild(actions.lastChild);

    reset();
    init();
};
```

The old version called `actions.removeChild(actions.lastChild)` directly, and `removeChild(null)`
throws. It never happened before because the `RESET` button was always there when the handler ran, but
it is not a guarantee I want to depend on anymore.

#### Step 5:The styles of the modal & the canvas

Add the below code at the end of `./public/style.css`:

```css
/* ===== winner modal & firework ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 4, 24, 0.86);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.35s ease;
}
.modal-overlay.is-open {
    opacity: 1;
}
.firework-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.modal {
    position: relative;
    z-index: 2;
    min-width: 320px;
    max-width: 90%;
    padding: 28px 48px 36px;
    text-align: center;
    background: rgb(95, 15, 191);
    background: linear-gradient(150deg, rgba(95, 15, 191, 0.96) 0%, rgba(170, 20, 111, 0.96) 100%);
    border-radius: 16px;
    box-shadow:
        0 0 50px rgba(3, 188, 244, 0.35),
        0 24px 60px rgba(0, 0, 0, 0.55);
    transform: translateY(28px) scale(0.9);
    transition: transform 0.45s cubic-bezier(0.18, 1.35, 0.4, 1);
}
.modal-overlay.is-open .modal {
    transform: translateY(0) scale(1);
}
.modal-badge {
    font-size: 64px;
    line-height: 1;
    margin-bottom: 4px;
    animation: badgePop 0.6s cubic-bezier(0.2, 1.6, 0.4, 1) both;
}
@keyframes badgePop {
    0% {
        transform: scale(0.2) rotate(-18deg);
        opacity: 0;
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
}
.modal-title {
    text-transform: uppercase;
    font-size: 38px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 14px;
}
.modal-scores {
    font-size: 26px;
    color: #e7da99;
    margin-bottom: 22px;
}
.modal-scores .cell-x,
.modal-scores .cell-o {
    font-size: 30px;
    font-weight: 600;
}
.modal-scores .modal-dash {
    color: #fff;
    opacity: 0.4;
    margin: 0 12px;
}
.modal .btn {
    transform: none;
    font-family: 'Varela Round', sans-serif;
    font-size: 18px;
    letter-spacing: 1px;
    border: 1px solid #03bcf4;
    border-radius: 6px;
    padding: 8px 24px;
}
.modal .btn:hover {
    background: rgba(3, 188, 244, 0.16);
}
@media only screen and (max-width: 600px) {
    .modal {
        min-width: 0;
        padding: 22px 26px 28px;
    }
    .modal-title {
        font-size: 26px;
    }
    .modal-badge {
        font-size: 48px;
    }
}
```

The parts of the above CSS that are doing the real work are as follows:

- `.firework-canvas` has **`pointer-events: none`**. Without it the canvas would sit on top of the
  backdrop and swallow every click, so clicking outside the modal would never close it.
- `.modal` has `z-index: 2` and the canvas has none, hence the rockets fly **behind** the modal box
  while still being above the dark backdrop.
- the `.modal .btn` rule resets the `transform: translateY(-20px)` that our old `.btn` class carries.
  That translate was written for the `RESET` button under the board, and inside the modal it only
  pushes the button 20 pixels up for no reason.
- and `.btn` never had a `font-family`, because buttons do not inherit it from the `body` by default —
  so inside the modal we set `'Varela Round'` explicitly to match the rest of the game.

By the way, the `.winner-prompt` class that we wrote in the part 2 is not used anymore, the modal has
completely replaced it. You can delete it from your CSS, or keep it if you want to show a small message
inside the board for something else later.

### Let the players choose the board size

This is the feature I promised in the very first part, so let's do it.

#### Step 1:Add the selector to the HTML

In `./public/index.html`, add a small settings block right after the `current-turn` div:

```html
<div class="current-turn">CURRENT TURN: <span id="currentTurn"></span></div>
<div class="settings">
    BOARD SIZE:
    <select id="gridSize">
        <option value="3">3 x 3</option>
        <option value="4">4 x 4</option>
        <option value="5">5 x 5</option>
        <option value="6">6 x 6</option>
        <option value="7">7 x 7</option>
        <option value="8">8 x 8</option>
    </select>
</div>
```

And add its style at the end of `./public/style.css`:

```css
.settings {
    text-align: center;
    margin-top: 4px;
    color: #e7da99;
    font-size: 16px;
}
.settings select {
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border: 1px solid #03bcf4;
    border-radius: 4px;
    padding: 4px 8px;
    font-family: 'Varela Round', sans-serif;
    font-size: 16px;
    cursor: pointer;
    outline: none;
}
```

#### Step 2:Let `init()` refresh the score board

A tiny change with a nice effect. Every time we build a new board we also want the two big numbers to
go back to `0`, because a new board means new players. Hence, in `./src/utils/playground.ts` call
`updateScoreBoard()` at the end of `init()`:

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
    updateScoreBoard();
    return newTag;
};
```

#### Step 3:Rewrite `index.ts`

Now the main file. Until here it created one `Playground` and that was all. Now it must be able to
throw the old board away and build a new one with another dimension:

```ts
'use strict';
import { getCurrentTurn } from './utils/gamePlay.js';
import { Playground } from './utils/playground.js';
import MovesInstance from './store/moveStats.js';

(function () {
    const DEFAULT_GRID_SIZE = 5;
    console.log('Game is running!');

    const gameField: HTMLElement = document.querySelector('#gameField') as HTMLElement;
    const gridSizeSelect: HTMLSelectElement = document.querySelector('#gridSize') as HTMLSelectElement;

    const startGame = (squareDimension: number) => {
        // throw away the previous board and the reset button, if they exist
        const oldPlayground = document.querySelector('#playground');
        if (oldPlayground) oldPlayground.remove();

        const actions: HTMLElement = document.querySelector('.actions') as HTMLElement;
        actions.innerHTML = '';

        // clean the state of the previous game
        MovesInstance.resetMoves();
        const currentTurnSpan = document.querySelector('#currentTurn') as HTMLElement;
        currentTurnSpan.innerHTML = '';

        const playground = Playground(squareDimension, gameField);
        playground.init();

        getCurrentTurn();
    };

    gridSizeSelect.value = `${DEFAULT_GRID_SIZE}`;
    startGame(DEFAULT_GRID_SIZE);

    gridSizeSelect.onchange = () => {
        startGame(+gridSizeSelect.value);
    };
})();
```

There are three things in `startGame()` that are easy to forget, and each of them gives you a
different weird bug:

- **removing the old `#playground`** — if you don't, `init()` appends a second board under the first
  one and you end up with two grids on the page
- **emptying `.actions`** — otherwise the old `RESET` button stays there and it is still bound to the
  handler of the **previous** playground module, which points at a board that does not exist anymore
- **calling `MovesInstance.resetMoves()`** — the stores are `Singleton`s, remember? They survive
  everything. If you build a new 3x3 board while the store still holds the cell number 24 from the
  old 5x5 game, then `Scoring()` will try to write into `matrix[4][4]` of a 3x3 matrix and you get an
  error. Building a new `Playground` does **not** clean the stores, you must do it yourself.

Also notice that we clear `#currentTurn` before calling `getCurrentTurn()`. As we explained in the
part 2, that method shows the opposite symbol when the span is not empty — so if we left the old `O`
in there, a fresh game would start by telling the players it is X's turn while the store says
something else.

And the `--dimension` CSS variable takes care of itself, because `Playground()` sets it in its first
two lines every time it is created.

#### Step 4:Run the whole thing

`npm run dev`

Open `http://localhost:3000` and now you can:

- change the board size from the dropdown and watch a brand new grid appear
- play a full game until the last cell, and get the firework with the winner modal
- press `PLAY AGAIN` in the modal, or `RESET` under the board — both start a fresh game
- close the modal with the `Escape` key or by clicking on the dark backdrop, if you want to look at the
  final board again
- make a draw on purpose (for example play a 3x3 where nobody makes any line of 3 — both scores stay
  `0`, so you get `IT IS A DRAW!` with the 🤝 badge and no firework)

<!-- TODO(Saeed): screenshot of a finished game with the firework + winner modal -->
<!-- TODO(Saeed): screenshot of the draw modal -->
<!-- TODO(Saeed): screenshot of the board size dropdown open -->

A little tip if you are impatient like me: filling a 5x5 board needs 25 clicks every time you want to
check the firework. Hence, while you are working on the modal, set `SUDDEN_DEATH` to `true` for a while
— then three symbols in a row are enough to trigger it.

One honest note about the big boards: our `.playground` width is `calc(var(--dimension) * 100px)`,
which means an 8x8 board is 800px wide and it does not shrink on small screens. That is why I stopped
the dropdown at 8. Making the cells responsive is a nice exercise if you want to continue — you would
need to replace the fixed `100px` with something based on `vmin`.

### If you prefer the classic rule instead

Some people will definitely want the sudden-death rule — the game stops at the first line of 3, same
like the classic game. And we already prepared it, so there is nothing to write: open
`./src/utils/playground.ts` and flip the constant at the top of the file.

```ts
const SUDDEN_DEATH: boolean = true;
```

That is all, and it works on any board size. Look at the condition in `handleClick()` again to see why:

```ts
if (isBoardFull() || (SUDDEN_DEATH && hasWinningLine)) {
    finishGame();
}
```

`hasWinningLine` is only a comparison of the score with `WINNING_SCORE`, which is `300` — and a line of
exactly 3 is worth 300 points, hence any score bigger than or equal to 300 means such a line exists
somewhere on the board, in any of the four directions.

This is the real payoff of having built a scoring engine in the part 3 instead of a list of winning
combinations. The classic win condition of Tic Tac Toe became **one comparison**, and it does not care
if the board is 3x3 or 20x20.

And if you want to be stricter, for example "you win only with a line of 5 on a big board", you only
change `WINNING_SCORE` to `500`. That is it.

### Two bugs that are hiding in this code

I want to be honest with you about my own code, because finding this kind of thing is much more useful
for a junior developer than reading a perfect tutorial where everything works by magic. 🙂

Both of these bugs are in the project **right now** and the game still works. That is exactly what
makes them dangerous.

**1. `updateMoves()` does nothing to the cells**

Look at this method in `./src/store/moveStats.ts`:

```ts
moves.x.selectedCells.concat(playerMove.selectedCells);
```

`concat()` does **not** change the array it is called on, it returns a **new** array. And we don't
assign that returned value to anything, so this line is doing absolutely nothing. The correct version
would be `moves.x.selectedCells = moves.x.selectedCells.concat(...)` or simply a `push()`.

So why does the game work?! because the cells are actually recorded somewhere else — in `makeMove()`,
where `currentPlayerStats.selectedCells.push(cellNumber)` writes directly into the live array that
lives inside the store. It means the whole game depends on a side effect in a different file, and
`updateMoves()` is only useful for attaching the player object.

Be careful about this one: if you ever "clean up" `makeMove()` to stop mutating the store, your game
will silently stop counting anything.

**2. `updateStats()` skips the first game**

And this one in `./src/store/gameStats.ts`:

```ts
let foundStatIndex = stats.findIndex((s) => s.contestId === stat.contestId);
if (foundStatIndex) {
    stats.splice(foundStatIndex, 1, stat);
}
```

`findIndex()` returns `-1` when nothing is found, and `0` when the item is the **first** one in the
array. But `0` is falsy in Javascript! Therefore, for the very first game of the session the `if`
never runs and the `splice()` never happens. The correct condition is `if (foundStatIndex > -1)`.

And again — why does the score still appear on the screen?! because of another accident.
`addScore()` starts with:

```ts
let lastStat: IStat = { ...this.getLastStats() };
```

The spread operator makes a **shallow** copy, so `lastStat.player1` is not a copy, it is the very same
object that is sitting inside the `stats` array. When we then write `lastStat.player1.score = newValue`,
we are already changing the stored stat directly, and the `splice()` is not needed at all.

Two accidental behaviours that cancel two bugs. This is the kind of thing that makes a project work
for months and then explode the day somebody refactors one innocent line. 😅

### Troubleshooting

These are the real problems I hit while making this game. If something does not work on your machine,
most probably it is one of these:

**The page is completely empty and the console says "Failed to load module script" or 404**

Check the extensions in your imports. As we explained in the part 2, they must end with `.js` even
though your files are `.ts`, because the browser resolves them, not `tsc`.

**404 on `/build/index.js`**

The `build` folder does not exist yet. It is generated by `tsc`, hence you must run `npm run dev` (or
`npm run build-dist`) at least once before opening the page. Also make sure you are opening
`http://localhost:3000` and not the `index.html` file directly from your file system — with `file://`
the module imports and the live reload will not work.

**`Cannot find module 'body-parser'`**

Our `server.js` requires it. It usually comes along with `express` as a sub-dependency so it works by
luck, but you should not rely on that:

`npm install body-parser`

**I changed `server.ts` and nothing happened**

Look at the scripts again:

```json
"watch:2": "tsc server.ts",
```

There is no `-w` in there, so it compiles **once** when you start `npm run dev` and never again. On
top of that, when you pass a file name to `tsc` on the command line, `tsc` **ignores your
`tsconfig.json` completely** and falls back to its own defaults. That is why the generated `server.js`
looks so different from the rest of our `build` output — it comes out as old-style ES5 with `var` and
`function`. So if you edit `server.ts`, restart `npm run dev`.

**I changed a `*.ts` file in `src` and the browser shows the old code**

`tsc -w` regenerates the `build` files and `nodemon` restarts the server, but sometimes the browser
holds the old ES module in its cache. Do a hard refresh (`Ctrl` + `Shift` + `R`), and if you are
debugging a lot, open the devtools and check "Disable cache" in the Network tab.

**`New instance cannot be created!`**

Our stores throw this on purpose when a second instance is built. In practice it means the same module
got loaded twice by the browser, and the usual reason is that two files imported it with two different
paths (for example `'../store/moveStats.js'` in one file and `'./store/moveStats.js'` from a wrong
folder level in another). To the browser those are two different URLs, hence two different modules.
Keep your import paths consistent.

**`Cannot read properties of undefined (reading 'selectedCells')`**

The guard from the part 3 is missing. Make sure `if (!moves?.x) return;` sits **above** the
`Scoring()` call in `handleClick()`.

**An error about reading `player1` or `symbol` of `undefined`**

`GameStats.getLastStats()` returned nothing, which means no stat was ever pushed into the store. Check
that you kept the `preInit();` call just before the `return` statement of the `Playground()` module —
it is easy to lose it while copying the methods around.

**The scores grow insanely after a few clicks**

You changed `addScore()` to add instead of to set. As we explained in the part 3, a new `Scoring()`
module recalculates the complete score from zero on every click, so it must **replace** the old value.

**The modal appears without any animation, it just pops in**

The `is-open` class is being added in the same tick as the `appendChild()`. It must go inside a
`requestAnimationFrame()`, otherwise the browser never paints the starting state of the transition.

**The firework is blurry, or it draws in the wrong place**

Two candidates. Either the `setTransform()` is missing after you assigned `canvas.width`, or you
started the firework before the overlay was appended to the DOM — an element that is not on the page
has a `clientWidth` of `0`, hence the canvas gets a size of zero.

**The modal is closed but the fan of my laptop keeps spinning**

The `requestAnimationFrame` loop is still running. Make sure `hide()` really calls `firework.stop()`,
and that `stop()` calls `window.cancelAnimationFrame()`. A loop that only stops drawing but keeps
scheduling itself costs you exactly the same CPU as a visible one.

**Clicking outside the modal does not close it**

The canvas is eating your clicks. Check that `.firework-canvas` has `pointer-events: none` in the CSS.

### That's a wrap 🎉

So, what did we build across these four parts?

We started with a 3x3 board and 8 hardcoded winning combinations in a single `index.js`, and we ended
with a `Typescript` project that has a `Module`-pattern playground, two `Singleton` stores, a scoring
engine based on matrix rotations that works on any dimension, a live score board, a winner detection
with a switchable rule, a board size selector, and a firework made of nothing but a `<canvas>` and some
trigonometry.

And more importantly, at least I hope so, you saw the reasoning behind each step and not only the
final code — why the hardcoded combinations had to go, why the matrix had to be rotated instead of
writing four different counting methods, why a particle gets drawn as a line and not as a dot, and why
two bugs can hide in a working game for months.

The whole source code is on my [Github](https://github.com/panahi-projects/tic-toc-toe), feel free to
clone it, break it and improve it.

What is still on my own list for this project: the `1-player` mode against the computer (the
`TType` type in our interfaces already says `'Mankind' | 'AI'`, so the door is open 😉), a responsive
board for the mobile screens, and saving the game history that we are already collecting in
`GameStats` but never showing to anybody.

If you build something on top of this, or if you find a third bug that I didn't notice, please tell me
in the comments — I would really enjoy reading it.

Thanks for reading all the four parts, and have fun! 🚀
