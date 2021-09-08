import '../style.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GuiDebug from './gui-debug';
import {Raycaster} from "three";
import Navigation from "./navigation";

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
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild( renderer.domElement );

var cam1 = false;

document.querySelector('.toggle-cam').addEventListener('click', (e) => cam1 = !cam1);

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1;
    mouse.y = - (e.clientY / sizes.height) * 2 + 1;
});

//Functions
const tick = () => {
    //controls.update();
    if(cam1 === false) {
        renderer.render(scene, camera);
    } else {
        renderer.render(scene, navigation.cameras.children[0]);
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(navigation.labels.children);
    if(intersects.length > 0) {
        intersects[0].object.material.color.set( 0x000000 );
    } else {
        const navElems = navigation.labels.children;
        for (let i = 0; i < navElems.length; i++) {
            navElems[i].material.color.set( 0x00ff00 );
        }
    }

    window.requestAnimationFrame(tick);
}

const modelLoaderCallback = (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    scene.add( model );

    //Debugging
    const rotationRange = {min: 0, max: 9};
    guiDebug.addRotationDebugger(model, 'Rower rotation', rotationRange, rotationRange, rotationRange, 0.01);
    guiDebug.addPositionDebugger( model, 'Rower position', {min: -6, max: 6}, {min: -3, max: 3},
        {min: -3, max: 3}, 0.01);
}

//Actions
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
//const camera = new THREE.OrthographicCamera();
camera.position.set(0, 3, 10);
scene.add(camera);

const navigation = new Navigation(sizes);

//Actions
const navStep = 1.1;
const firstNavZ = 1.1;
const lastNavZ = -1.1;
for (let z = firstNavZ; z >= lastNavZ; z -= navStep) {
    const viewpoint = navigation.addViewpoint({x: 3, y: 0.23, z: z}, {x: 0, y: 7.88, z: 0});
    const light = navigation.highlightViewpoint(viewpoint);

    if(light === null) {
        continue;
    }
    const lightFolderName = ('Light with step: ' + z.toFixed(2));
    guiDebug.addPositionDebugger(light, lightFolderName, {min: -6, max: 6}, {min: -3, max: 3},
        {min: -3, max: 3}, 0.01);
    guiDebug.getFolderByName(lightFolderName)
        .add(light, 'intensity').min(0).max(10).step(0.01);
}

scene.add(navigation.navigationGroup);

const pointLight = new THREE.PointLight();
pointLight.position.set(2, 6, 4);
scene.add(pointLight);


//Debugging
const rotationRange = {min: 0, max: 9};
guiDebug.addRotationDebugger(camera, 'Camera rotation', rotationRange, rotationRange, rotationRange, 0.01);
guiDebug.addPositionDebugger(camera, 'Camera position', {min: -10, max: 10}, {min: -10, max: 10},
    {min: -10, max: 10}, 0.01);

guiDebug.addPositionDebugger(pointLight, 'Light position', {min: -6, max: 6}, {min: -3, max: 3},
    {min: -3, max: 3}, 0.01);
guiDebug.getFolderByName('Light position')
    .add(pointLight, 'intensity').min(0).max(10).step(0.01);


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener( 'click', (e) => {
    console.log(e);
    const raycasterLocal = new Raycaster();

    const mouse2 = new THREE.Vector2();
    mouse2.x = e.clientX / sizes.width * 2 - 1;
    mouse2.y = - (e.clientY / sizes.height) * 2 + 1;

    raycasterLocal.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(navigation.labels.children);
    if(intersects.length > 0) {
        cam1 = !cam1;
    }
});

//loading a model
loader.load( 'Perseverance.glb', modelLoaderCallback, undefined, ( error ) => console.error( error ));

tick();


