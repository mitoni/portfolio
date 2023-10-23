<script lang="ts">
    import { onMount } from "svelte";
    import {
        BufferAttribute,
        BufferGeometry,
        PerspectiveCamera,
        Scene,
        WebGLRenderer,
        type TypedArray,
        Mesh,
        Color,
        DoubleSide,
        MeshStandardMaterial,
    } from "three";

    import TWEEN from "@tweenjs/tween.js";
    import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
    import { style } from "./stores/style";
    import { getCollection } from "astro:content";

    const loader = new OBJLoader();

    let container: HTMLAnchorElement | undefined = undefined;
    let camera: PerspectiveCamera;
    let scene: Scene;
    let particles: Mesh;
    let renderer: WebGLRenderer;

    let mouseX: number = 0;
    let mouseY: number = 0;

    const morphingTime = 1250;

    const numOfParticles = 15000;

    const color1 = new Color(`rgb(${style.get().getPropertyValue("--red")})`);
    const color2 = new Color(
        `rgb(${style.get().getPropertyValue("--orange")})`
    );

    let projectIds: string[] = [];
    let shapes: string[] = [];
    let currentGeometryIdx = 0;
    let geometries: BufferGeometry[] = [];

    onMount(init);

    async function init() {
        const { width, height } = container!.getBoundingClientRect();

        camera = new PerspectiveCamera(60, width / height, 1, 2000);
        camera.position.setZ(1000);

        const geometry = new BufferGeometry();

        const posArray = new Float32Array(Array(numOfParticles * 3).fill(0));
        const normalArray = new Float32Array(Array(numOfParticles * 3).fill(0));

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
        const normalAttribute = new BufferAttribute(normalArray, 3);
        const colorAttribute = new BufferAttribute(colorArray, 3);

        geometry.setAttribute("position", posAttribute);
        geometry.setAttribute("normal", normalAttribute);
        geometry.setAttribute("color", colorAttribute);

        const material = new MeshStandardMaterial({
            side: DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0,
        });

        particles = new Mesh(geometry, material);

        scene = new Scene();
        scene.add(particles);

        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        container?.appendChild(renderer.domElement);

        // load 3d models
        loadModels();

        setTimeout(() => {
            // tween opacity
            new TWEEN.Tween(material)
                .to({ opacity: 0.1 }, morphingTime)
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
        const projects = await getCollection("projects");

        projectIds = projects.map((project) => project.id);
        shapes = projects
            .map((project) => project.data.heroMesh)
            .filter((project): project is string => !!project);

        geometries = await Promise.all(
            shapes.map(async (path) => {
                const obj = await loader.loadAsync(path);
                const geometry = (obj.children[0] as Mesh).geometry;
                return geometry;
            })
        );
    }

    function iterate() {
        draw(geometries[currentGeometryIdx]);

        // change href
        const id = projectIds[currentGeometryIdx];
        container!.href = `/projects/${id}`;

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
        morph(
            particles.geometry.attributes.position.array,
            geometry.attributes.position.array
        );

        morph(
            particles.geometry.attributes.normal.array,
            geometry.attributes.normal.array
        );
    }

    function update() {
        particles.geometry.attributes.position.needsUpdate = true;
    }

    function morph(from: TypedArray, to: TypedArray) {
        new TWEEN.Tween(from)
            .to(to, morphingTime)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(update)
            .start();
    }

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX - window.innerWidth / 2;
        mouseY = event.clientY - window.innerHeight / 2;
    }

    function handleMouseClick(event: MouseEvent) {}
</script>

<a
    class="sprites"
    bind:this={container}
    on:pointermove={handleMouseMove}
    href="/"
/>

<style>
    .sprites {
        position: absolute;
        inset: 0;
        z-index: 0;
    }
</style>
