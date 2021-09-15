import '../css/style.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import * as THREE from 'three'
import { Raycaster } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Navigation from "./navigation";
import * as UI from './ui/ui-functions';
import { previewMargin, sizes } from "./ui/ui-constants";

//Scene vars
const clock = new THREE.Clock();
const canvas = document.querySelector('.webgl');
const canvasPreview = document.querySelector('.webgl-preview');
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const raycaster = new Raycaster();
const mouse = new THREE.Vector2();

const renderer = UI.createRenderer(canvas, sizes);
document.body.appendChild( renderer.domElement );

const rendererPreview = UI.createRenderer(canvasPreview, { width: canvasPreview.clientWidth, height: canvasPreview.clientHeight });
const texture = UI.hdriBackgroundLoad(scene, renderer, 'background_panorama_blurred.jpg');

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
camera.position.set(7.07, 1.56, 7.07);
camera.rotation.set(0, 0.73, 0);
scene.add(camera);

const navigation = new Navigation(sizes, camera);
scene.add(UI.createViewpoints(navigation));

scene.add(UI.createPointLight(4, 12, 8));
scene.add(new THREE.AmbientLight('white', 0.3));

document.querySelector('.main').style.display = 'inline-block';
UI.initEventListeners(navigation, camera, mouse, raycaster);

loader.load( 'Perseverance.glb', (gltf) => UI.loadModel(scene, gltf.scene), undefined, ( error ) => console.error( error ));

const tick = () => {
    canvasPreview.style.display = 'none';
    renderer.render(scene, navigation.currentCamera);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(navigation.labels.children);
    let previewCamera = navigation.currentCamera;

    if(navigation.currentCamera !== camera) {
        const buttons = UI.associateButtons(navigation);
        UI.displayButtons(buttons, navigation);
    } else {
        document.querySelector('.navigation-buttons').style.display = 'none';
    }

    if(intersects.length > 0 && navigation.currentCamera === camera) {
        previewCamera = navigation.findViewpointByLabel(intersects[0].object).camera;
        canvasPreview.style.display = 'block';
        canvasPreview.style.top = previewMargin.top + 'px';
        canvasPreview.style.left = previewMargin.left + 'px';
    }

    rendererPreview.render(scene, previewCamera);

    navigation.animate(intersects, clock);

    window.requestAnimationFrame(tick);
}

tick();