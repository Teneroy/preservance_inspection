import '../style.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {MathUtils, Raycaster} from "three";
import Navigation from "./navigation";
import {resize, loadModel, updateMouseCoordinates, associateButtons} from "./ui-functions";
import {geometry} from "./ui-constants";

//Scene vars
const clock = new THREE.Clock();
const canvas = document.querySelector('.webgl');
const canvasPreview = document.querySelector('.webgl-preview');
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const raycaster = new Raycaster();
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const previewMargin = {
    left: 0,
    top: 0
};
const mouse = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
    'background_panorama_blurred.jpg',
    () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    },
    (e) => {
        console.error(e);
    });
const rendererPreview = new THREE.WebGLRenderer({ canvas: canvasPreview });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendererPreview.setSize(canvasPreview.clientWidth, canvasPreview.clientHeight);
rendererPreview.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
camera.position.set(7.07, 1.56, 7.07);
camera.rotation.set(0, 0.73, 0);
scene.add(camera);

const navigation = new Navigation(sizes, camera);

const topViewpoint = navigation.addViewpoint({x: 3, y: 3.3, z: 0}, {x: 0, y: 0, z: 0}, geometry.SPHERE);
topViewpoint.camera.rotateY(MathUtils.degToRad(90));
topViewpoint.camera.rotateX(MathUtils.degToRad(320));

const pointLight = new THREE.PointLight();
pointLight.position.set(4, 12, 8);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight('white', 0.3);
scene.add(ambientLight);

const navStep = 1.1;
const firstNavZ = 1.1;
const lastNavZ = -1.1;
for (let z = firstNavZ; z >= lastNavZ; z -= navStep) {
    const viewpoint = navigation.addViewpoint({x: 3, y: 0.23, z: z}, {x: 0, y: 7.88, z: 0}, geometry.CONE);
    navigation.highlightViewpoint(viewpoint);
}
scene.add(navigation.navigationGroup);

//Event listeners
document.querySelector('.main').style.display = 'inline-block';
document.querySelector('.main').addEventListener('click', (e) => {
    navigation.currentCamera = camera;
});
window.addEventListener('mousemove', (e) => {
    updateMouseCoordinates(mouse, sizes, {x: e.clientX, y: e.clientY});
    previewMargin.top = e.clientY;
    previewMargin.left = e.clientX;
});
window.addEventListener('resize', () => resize(sizes, camera, renderer));
window.addEventListener( 'click', (e) => {
    const raycasterLocal = new Raycaster();

    const mouse2 = new THREE.Vector2();
    updateMouseCoordinates(mouse2, sizes, {x: e.clientX, y: e.clientY});

    raycasterLocal.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(navigation.labels.children);
    if(intersects.length > 0) {
        navigation.currentCamera = navigation.findViewpointByLabel(intersects[0].object).camera;
    }
});

//loading a model
loader.load( 'Perseverance.glb', (gltf) => loadModel(scene, gltf.scene), undefined, ( error ) => console.error( error ));


const tick = () => {
    renderer.render(scene, navigation.currentCamera);

    if(navigation.currentCamera !== camera) {
        const btns = associateButtons(navigation);
        document.querySelector('.navigation-buttons').style.display = 'block';
        document.querySelectorAll('.nav-btn').forEach(elem => {
            if(elem.classList.contains('main'))
                return;
            elem.style.display = 'none';
        });
        for (let btn of btns) {
            document.querySelector(btn.type).style.display = 'inline-block';
            document.querySelector(btn.type).addEventListener('click', (e) => {
                navigation.currentCamera = btn.elem.camera;
            });
        }
    } else {
        document.querySelector('.navigation-buttons').style.display = 'none';
    }

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    canvasPreview.style.display = 'none';

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(navigation.labels.children);

    let previewCamera = navigation.currentCamera;

    if(intersects.length > 0 && navigation.currentCamera === camera) {
        previewCamera = navigation.findViewpointByLabel(intersects[0].object).camera;
        canvasPreview.style.display = 'block';
        canvasPreview.style.top = previewMargin.top + 'px';
        canvasPreview.style.left = previewMargin.left + 'px';
    }

    rendererPreview.render(scene, previewCamera);

    const navElems = navigation.labels.children;

    for (let i = 0; i < navElems.length; i++) {
        if(intersects.length > 0 && navElems[i] === intersects[0].object) {
            navElems[i].material.color.set( 0x59ff );
            navElems[i].tick(delta, time, true);
            continue;
        }
        navElems[i].material.color.set( 0x009374 );
        navElems[i].tick(delta, time, false);
    }


    window.requestAnimationFrame(tick);
}

tick();