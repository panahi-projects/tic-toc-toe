import { CreateElement } from './global.js';
import { Firework } from './firework.js';
const CLOSING_DURATION = 350; //must stay in sync with the transition in style.css
export const WinnerModal = () => {
    let overlay = null;
    let firework = null;
    const handleKeydown = (event) => {
        if (event.key === 'Escape')
            hide();
    };
    const hide = () => {
        document.removeEventListener('keydown', handleKeydown);
        if (firework) {
            firework.stop();
            firework = null;
        }
        if (!overlay)
            return;
        // the reference is released right away, so a second hide() cannot remove it twice
        const closingOverlay = overlay;
        overlay = null;
        closingOverlay.classList.remove('is-open');
        window.setTimeout(() => closingOverlay.remove(), CLOSING_DURATION);
    };
    const show = (winner, xScore, oScore, onPlayAgain) => {
        hide(); //never allow two modals at the same time
        const title = winner ? `PLAYER ${winner.toUpperCase()} WINS!` : 'IT IS A DRAW!';
        const badge = winner ? '🏆' : '🤝';
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
            innerHTML: `<span class="cell-x">X</span> ${xScore}` +
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
                if (event.target === overlay)
                    hide();
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
//# sourceMappingURL=winnerModal.js.map