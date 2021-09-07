import '../style.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GuiDebug from './gui-debug';
import {Raycaster} from "three";

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
        renderer.render(scene, camera2  );
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(navigation.children);
    if(intersects.length > 0) {
        intersects[0].object.material.color.set( 0x000000 );
    } else {
        const navElems = navigation.children;
        for (let i = 0; i < navElems.length; i++) {
            navElems[0].material.color.set( 0x00ff00 );
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
};

//Actions
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
//const camera = new THREE.OrthographicCamera();
camera.position.set(0, 3, 10);
scene.add(camera);

const navigation = new THREE.Group();

//Actions
const cameraLabelGeometry = new THREE.ConeGeometry(0.3, 0.3, 8, 1, false, 0);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const secondCameraLabel = new THREE.Mesh(cameraLabelGeometry, material);
secondCameraLabel.position.set(3, 0.23, 1.12);
navigation.add(secondCameraLabel);

const camera2 = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera2.rotation.set(0, 7.88, 0);
camera2.position.set(3, 0.23, 1.12);
scene.add(camera2);

const camera3 = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera3.rotation.set(0, 7.88, 0);
camera3.position.set(3, 0.23, -0.08);
scene.add(camera3);

const camera4 = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera4.rotation.set(0, 7.88, 0);
camera4.position.set(3, 0.23, -1.1);
scene.add(camera4);


scene.add(navigation);

const pointLight2 = new THREE.PointLight();
pointLight2.position.set(3, 0.23, 1.12);
pointLight2.rotation.set(0, 7.88, 0);
scene.add(pointLight2);

guiDebug.addPositionDebugger(pointLight2, 'Light2 position', {min: -6, max: 6}, {min: -3, max: 3},
    {min: -3, max: 3}, 0.01);
guiDebug.getFolderByName('Light2 position')
    .add(pointLight2, 'intensity').min(0).max(10).step(0.01);

const rotationRange = {min: 0, max: 9};
guiDebug.addRotationDebugger(camera3, 'Camera rotation', rotationRange, rotationRange, rotationRange, 0.01);
guiDebug.addPositionDebugger(camera3, 'Camera position', {min: -10, max: 10}, {min: -10, max: 10},
    {min: -10, max: 10}, 0.01);

const pointLight = new THREE.PointLight();
pointLight.position.set(2, 6, 4);
scene.add(pointLight);

//Debugging
guiDebug.addPositionDebugger(pointLight, 'Light position', {min: -6, max: 6}, {min: -3, max: 3},
    {min: -3, max: 3}, 0.01);
guiDebug.getFolderByName('Light position')
    .add(pointLight, 'intensity').min(0).max(10).step(0.01);


// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update();


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

    const intersects = raycaster.intersectObjects(navigation.children);
    if(intersects.length > 0) {
        cam1 = !cam1;
    }
});

//loading a model
loader.load( 'Perseverance.glb', modelLoaderCallback, undefined, ( error ) => console.error( error ));

tick();


