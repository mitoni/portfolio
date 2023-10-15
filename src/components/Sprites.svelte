<script lang="ts">
    import { onMount } from "svelte";
    import {
        BufferAttribute,
        BufferGeometry,
        PerspectiveCamera,
        Points,
        PointsMaterial,
        Scene,
        WebGLRenderer,
        type TypedArray,
        TextureLoader,
        Mesh,
        FogExp2,
        Color,
    } from "three";

    import TWEEN from "@tweenjs/tween.js";
    import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

    const loader = new OBJLoader();

    let container: HTMLElement | undefined = undefined;
    let camera: PerspectiveCamera;
    let scene: Scene;
    let particles: Points;
    let renderer: WebGLRenderer;

    let mouseX: number = 0;
    let mouseY: number = 0;

    const morphingTime = 1000;

    const numOfParticles = 15000;
    const color1 = new Color(0x060047);
    const color2 = new Color(0xb3005e);

    let currentGeometryIdx = 0;
    const shapes = ["boat.obj", "denture.obj", "pac.obj"];
    let geometries: BufferGeometry[] = [];

    onMount(init);

    function init() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        camera = new PerspectiveCamera(50, windowWidth / windowHeight, 1, 2000);

        camera.position.setZ(1000);

        const circle = new TextureLoader().load("/textures/circle.png");
        const material = new PointsMaterial({
            size: 15,
            vertexColors: true,
            sizeAttenuation: true,
            alphaMap: circle,
            depthWrite: false,
            transparent: true,
            opacity: 0,
        });
        const geometry = new BufferGeometry();

        const posArray = new Float32Array(Array(numOfParticles * 3).fill(0));
        for (let i = 0; i < numOfParticles; i++) {
            posArray[i * 3] = 0;
            posArray[i * 3 + 1] = 0;
            posArray[i * 3 + 2] = 0;
        }

        const colorArray = new Float32Array(Array(numOfParticles * 3).fill(0));
        for (let i = 0; i < numOfParticles; i++) {
            const color = new Color().lerpColors(
                color1,
                color2,
                i / numOfParticles
            );
            const { r, g, b } = color;

            colorArray[i * 3] = r;
            colorArray[i * 3 + 1] = g;
            colorArray[i * 3 + 2] = b;
        }

        const posAttribute = new BufferAttribute(posArray, 3);
        const colorAttribute = new BufferAttribute(colorArray, 3);

        geometry.setAttribute("position", posAttribute);
        geometry.setAttribute("color", colorAttribute);

        particles = new Points(geometry, material);

        scene = new Scene();
        scene.fog = new FogExp2(0xf7f2f9, 0.00075);
        scene.add(particles);

        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(windowWidth, windowHeight);

        container?.appendChild(renderer.domElement);

        // load 3d models
        loadModels();

        setTimeout(() => {
            // tween opacity
            new TWEEN.Tween(material)
                .to({ opacity: 0.75 }, morphingTime)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            iterate();
        }, 800);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        // update TWEEN
        TWEEN.update();

        render();
    }

    async function loadModels() {
        geometries = await Promise.all(
            shapes.map(async (path) => {
                const obj = await loader.loadAsync("/meshes/" + path);
                const geometry = (obj.children[0] as Mesh).geometry;
                return geometry;
            })
        );
    }

    function iterate() {
        draw(geometries[currentGeometryIdx]);

        currentGeometryIdx =
            currentGeometryIdx === shapes.length - 1 ? 0 : ++currentGeometryIdx;

        setTimeout(iterate, 3000);
    }

    function render() {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    async function draw(geometry: BufferGeometry) {
        const posArr = geometry.attributes.position.array;

        let array = [];
        for (let i = 0; i < posArr.length; i += 9) {
            array.push(posArr[i], posArr[i + 1], posArr[i + 2]);
        }

        morph(posArr);
    }

    function update() {
        particles.geometry.attributes.position.needsUpdate = true;
    }

    function morph(array: TypedArray) {
        new TWEEN.Tween(particles.geometry.attributes.position.array)
            .to(array, morphingTime)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate(update)
            .start();
    }

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX - window.innerWidth / 2;
        mouseY = event.clientY - window.innerHeight / 2;
    }
</script>

<section
    class="sprites"
    bind:this={container}
    on:pointermove={handleMouseMove}
/>

<style>
    .sprites {
        position: absolute;
        inset: 0;
        z-index: 0;
    }
</style>
