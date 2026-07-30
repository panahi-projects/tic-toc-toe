import { CreateElement } from './global.js';
const COLORS = ['#03bcf4', '#f403a8', '#74ffa9', '#f49003', '#e7da99', '#ffffff'];
const GRAVITY = 0.045;
const FRICTION = 0.985;
export const Firework = (parentTag) => {
    const canvas = CreateElement({ tag: 'canvas', className: 'firework-canvas' });
    const context = canvas.getContext('2d');
    let rockets = [];
    let sparks = [];
    let animationId = 0;
    let launchTimer = 0;
    let running = false;
    let width = 0;
    let height = 0;
    const randomBetween = (min, max) => Math.random() * (max - min) + min;
    const pickColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
    // changing canvas.width/height resets the whole 2d context state,
    // hence the transform and the line style must be applied again in here
    const resize = () => {
        const ratio = window.devicePixelRatio || 1;
        width = parentTag.clientWidth;
        height = parentTag.clientHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.lineCap = 'round';
    };
    const launchRocket = () => {
        const x = randomBetween(width * 0.15, width * 0.85);
        const y = height + 10;
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
    const explode = (rocket) => {
        const count = Math.floor(randomBetween(54, 90));
        const baseSpeed = randomBetween(2.6, 5.2);
        // roughly half of the bursts get a second color mixed into them
        const secondColor = Math.random() > 0.55 ? pickColor() : rocket.color;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + randomBetween(-0.06, 0.06);
            const speed = baseSpeed * randomBetween(0.35, 1);
            const maxLife = Math.floor(randomBetween(38, 70));
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
    const drawTrail = (fromX, fromY, toX, toY, color, size) => {
        context.strokeStyle = color;
        context.shadowColor = color;
        context.lineWidth = size;
        context.shadowBlur = 10;
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.stroke();
    };
    const frame = () => {
        if (!running)
            return;
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
            if (spark.life <= 0)
                sparks.splice(i, 1);
        }
        context.globalAlpha = 1;
        context.shadowBlur = 0;
        context.globalCompositeOperation = 'source-over';
        animationId = window.requestAnimationFrame(frame);
    };
    const start = () => {
        if (running)
            return;
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
        if (animationId)
            window.cancelAnimationFrame(animationId);
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
};
//# sourceMappingURL=firework.js.map