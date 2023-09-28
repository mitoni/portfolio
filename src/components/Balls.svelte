<script lang="ts">
    type TBall = {
        radius: number;
        left: number;
        top: number;
        color: string;
    };

    const numberOfBalls = 20;
    const deltaNumberOfBalls = 10;

    const ballRadius = 30;
    const deltaRadius = 10;

    const shades = [
        "#FDB147",
        "#FFA65F",
        "#FF9E7B",
        "#FF9998",
        "#FF99B4",
        "#FF9DCF",
        "#FFA5E6",
        "#EBAEF7",
        "#D1B8FF",
        "#B7C0FF",
        "#9FC7FF",
        "#8ECCFE",
    ];
    const getShade = () => shades[Math.floor(Math.random() * shades.length)];

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let mouseX: number | undefined = undefined;
    let mouseY: number | undefined = undefined;

    const getBalls = () => {
        return Array.from({
            length: Math.floor(
                numberOfBalls + (Math.random() - 1 * deltaNumberOfBalls)
            ),
        }).map(() => {
            const radius = Math.floor(
                ballRadius + Math.random() * 2 - 1 * deltaRadius
            );

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
            };
        });
    };

    let balls: TBall[] = getBalls();

    // trigger first iteration
    setTimeout(() => {
        balls = getBalls();
    }, 10);

    // trigger interval moves
    setInterval(() => {
        balls = getBalls();
    }, 2000);

    // listen for mouse movement
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
        />
    {/each}
</section>

<style>
    .section {
        position: absolute;
        inset: 0;
    }

    .ball {
        position: absolute;
        border-radius: 100%;
        opacity: 0.5;

        transition-property: top left background-color;
        transition-duration: 2s;
        transition-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
    }
</style>
