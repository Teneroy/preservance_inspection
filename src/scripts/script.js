import '../style.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GuiDebug from './gui-debug';
import {Raycaster} from "three";
import Navigation from "./navigation";
import {resize, loadModel, updateMouseCoordinates} from "./ui-functions";

//Scene vars
const guiDebug = new GuiDebug();
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
const loader = new GLTFLoader();
const raycaster = new Raycaster();
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const mouse = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild( renderer.domElement );

var cam1 = false;

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3, 10);
scene.add(camera);

const navigation = new Navigation(sizes, camera);

const pointLight = new THREE.PointLight();
pointLight.position.set(2, 6, 4);
scene.add(pointLight);

const navStep = 1.1;
const firstNavZ = 1.1;
const lastNavZ = -1.1;
for (let z = firstNavZ; z >= lastNavZ; z -= navStep) {
    const viewpoint = navigation.addViewpoint({x: 3, y: 0.23, z: z}, {x: 0, y: 7.88, z: 0});
    navigation.highlightViewpoint(viewpoint);
}
scene.add(navigation.navigationGroup);

//Event listeners
document.querySelector('.toggle-cam').addEventListener('click', (e) => cam1 = !cam1);
window.addEventListener('mousemove', (e) => updateMouseCoordinates(mouse, sizes, {x: e.clientX, y: e.clientY}));
window.addEventListener('resize', () => resize(sizes, camera, renderer));
window.addEventListener( 'click', (e) => {
    console.log(e);
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

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(navigation.labels.children);

    const navElems = navigation.labels.children;
    for (let i = 0; i < navElems.length; i++) {
        navElems[i].material.color.set( 0x00ff00 );
    }

    if(intersects.length > 0) {
        intersects[0].object.material.color.set( 0x000000 );
    }

    window.requestAnimationFrame(tick);
}

tick();




//Debugging
const rotationRange = {min: 0, max: 9};
guiDebug.addRotationDebugger(camera, 'Camera rotation', rotationRange, rotationRange, rotationRange, 0.01);
guiDebug.addPositionDebugger(camera, 'Camera position', {min: -10, max: 10}, {min: -10, max: 10},
    {min: -10, max: 10}, 0.01);

guiDebug.addPositionDebugger(pointLight, 'Light position', {min: -6, max: 6}, {min: -3, max: 3},
    {min: -3, max: 3}, 0.01);
guiDebug.getFolderByName('Light position')
    .add(pointLight, 'intensity').min(0).max(10).step(0.01);


let i = 0;
navigation.viewpoints.forEach(viewpoint => {
    if(viewpoint.light === null)
        return;

    const lightFolderName = ('Light number: ' + (i++));
    guiDebug.addPositionDebugger(viewpoint.light, lightFolderName, {min: -6, max: 6}, {min: -3, max: 3},
        {min: -3, max: 3}, 0.01);
    guiDebug.getFolderByName(lightFolderName)
        .add(viewpoint.light, 'intensity').min(0).max(10).step(0.01);
});