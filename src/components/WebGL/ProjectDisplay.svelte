<script lang="ts">
    import { onMount } from "svelte";
    import { getCollection } from "astro:content";
    import {
        DoubleSide,
        FogExp2,
        Mesh,
        MeshMatcapMaterial,
        PerspectiveCamera,
        Scene,
        TextureLoader,
        Vector3,
        WebGLRenderer,
    } from "three";

    import TWEEN from "@tweenjs/tween.js";

    import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
    import { selectedProject } from "../stores/selectedProject";

    const loader = new OBJLoader();
    const textureLoader = new TextureLoader();

    const morphingTime = 250;

    let container: HTMLElement | undefined = undefined;
    let camera: PerspectiveCamera;
    let scene: Scene;
    let renderer: WebGLRenderer;

    let meshes: Record<string, Mesh> = {};

    onMount(init);

    function init() {
        const { width, height } = container!.getBoundingClientRect();

        camera = new PerspectiveCamera(50, width / height, 1, 10000);

        camera.position.setZ(1500);
        camera.position.setY(1000);

        camera.lookAt(new Vector3(0, 0, 0));

        scene = new Scene();
        scene.fog = new FogExp2(0xf7f2f9, 0.00075);

        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        container?.appendChild(renderer.domElement);

        // load 3d models
        loadModels();

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        scene.rotateY(Math.PI / 1e3);

        // update TWEEN
        TWEEN.update();

        renderer.render(scene, camera);
    }

    async function loadModels() {
        const projects = await getCollection("projects");
        const shapes = projects.map((project) => project.data.mesh);
        const titles = projects.map((project) => project.data.title);

        const geometries = await Promise.all(
            shapes.map(async (path) => {
                const obj = await loader.loadAsync("/meshes/" + path);
                const geometry = (obj.children[0] as Mesh).geometry;
                return geometry;
            })
        );

        const texture = await textureLoader.loadAsync(
            "/textures/white_material.png"
        );

        const material = new MeshMatcapMaterial({
            matcap: texture,
            side: DoubleSide,
            alphaTest: 0.5,
            transparent: true,
            opacity: 0,
        });

        geometries.forEach((geometry, i) => {
            const mesh = new Mesh(geometry, material.clone());
            mesh.visible = false;

            meshes[titles[i]] = mesh;
            scene.add(mesh);
        });
    }

    selectedProject.subscribe((title) => {
        const mesh = meshes[title];

        if (mesh) {
            // turn off active mesh
            Object.values(meshes).forEach((mesh) => {
                const material = Array.isArray(mesh.material)
                    ? mesh.material[0]
                    : mesh.material;

                if (material.opacity > 0) {
                    new TWEEN.Tween(mesh.material)
                        .to({ opacity: 0 }, morphingTime)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .onComplete(() => (mesh.visible = false))
                        .start();
                }
            });

            new TWEEN.Tween(mesh.material)
                .to({ opacity: 1 }, morphingTime)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onStart(() => (mesh.visible = true))
                .start();
        }
    });
</script>

<section class="project-display-container" bind:this={container} />

<style>
    .project-display-container {
        width: 100%;
        height: 100%;
    }
</style>
