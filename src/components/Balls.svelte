<script lang="ts">
    import { onMount } from "svelte";

    type TBall = {
        radius: number;
        left: number;
        top: number;
        color: string;
        opacity: number;
    };

    const numberOfBalls = 20;

    const ballRadius = 30;
    const deltaRadius = 10;

    /* const shades = [
        "#FF9998",
        "#FF99B4",
        "#FF9DCF",
        "#FFA5E6",
        "#EBAEF7",
        "#D1B8FF",
        "#B7C0FF",
        "#9FC7FF",
        "#8ECCFE",
    ]; */

    // const getShade = () => shades[Math.floor(Math.random() * shades.length)];

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let mouseX: number | undefined = undefined;
    let mouseY: number | undefined = undefined;
    let pX: number | undefined = undefined;
    let pY: number | undefined = undefined;
    let ballsEl: HTMLElement | undefined = undefined;

    const color = window?.matchMedia("(prefers-color-scheme: dark)").matches
        ? "linear-gradient(to top, #16222a, #3a6073)"
        : "linear-gradient(to top, #ff416c, #ff4b2b)";

    const getBalls = () => {
        // const color = getShade();

        return Array.from({
            length: numberOfBalls,
        }).map(() => {
            const radius = Math.floor(
                ballRadius + (Math.random() * 2 - 1) * deltaRadius
            );

            const opacity =
                0.1 + (0.6 - 0.1) * (Math.floor(Math.random() * 100) / 100);

            // left
            let left = Math.floor(
                (windowWidth - radius * 2) * Math.random() + radius
            );
            if (mouseX) {
                left += (mouseX - left) * Math.random();
            }

            // top
            let top = Math.floor(
                (windowHeight - radius * 2) * Math.random() + radius
            );
            if (mouseY) {
                top += (mouseY - top) * Math.random();
            }

            return {
                color,
                radius,
                left,
                top,
                opacity,
            };
        });
    };

    let balls: TBall[] = getBalls();

    onMount(() => {
        setTimeout(() => {
            balls = getBalls();
        }, 100);

        setInterval(() => {
            balls = getBalls();
        }, 3000);
    });

    const moveMult = 30;
    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        pX = (mouseX / window.innerWidth - 0.5) * moveMult;
        pY = (mouseY / window.innerWidth - 0.5) * moveMult;

        // move the canvas
        if (ballsEl) {
            ballsEl.style.transform = `rotateY(${pX}deg) rotateX(${pY}deg)`;
        }
    }
</script>

<section
    class="balls"
    aria-label="move"
    bind:this={ballsEl}
    on:mousemove={handleMouseMove}
>
    {#each balls as ball}
        <div
            class="ball"
            style:width="{ball.radius}px"
            style:height="{ball.radius}px"
            style:top="{ball.top}px"
            style:left="{ball.left}px"
            style:background={ball.color}
            style:opacity={ball.opacity}
        />
    {/each}
</section>

<style>
    .balls {
        position: absolute;
        inset: 0;

        overflow: hidden;

        transition-duration: 250ms;
    }

    .ball {
        position: absolute;

        border-radius: 100%;

        transition-duration: 3s;
        transition-timing-function: cubic-bezier(0.85, 0, 0.15, 1);
    }
</style>
