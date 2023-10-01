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

    /** const shades = [
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
    const getShade = () => "#424753";

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let mouseX: number | undefined = undefined;
    let mouseY: number | undefined = undefined;

    const getBalls = () => {
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

            const color = getShade();

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
        setInterval(() => {
            balls = getBalls();
        }, 4000);
    });

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
</script>

<section class="section" aria-label="move" on:mousemove={handleMouseMove}>
    {#each balls as ball}
        <div
            class="ball"
            style:width="{ball.radius}px"
            style:height="{ball.radius}px"
            style:top="{ball.top}px"
            style:left="{ball.left}px"
            style:background-color={ball.color}
            style:opacity={ball.opacity}
        />
    {/each}
</section>

<style>
    .section {
        position: absolute;
        inset: 0;

        overflow: hidden;
    }

    .ball {
        position: absolute;

        border-radius: 20%;

        transition-duration: 3s;
        transition-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
    }
</style>
