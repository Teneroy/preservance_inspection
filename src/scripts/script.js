import '../style.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GuiDebug from './gui-debug';

//Scene vars
const guiDebug = new GuiDebug();
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
const loader = new GLTFLoader();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild( renderer.domElement );


//Functions
const tick = () => {
    controls.update();
    renderer.render(scene, camera);
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

const pointLight = new THREE.PointLight();
pointLight.position.set(2, 6, 4);
scene.add(pointLight);

//Debugging
guiDebug.addPositionDebugger(pointLight, 'Light position', {min: -6, max: 6}, {min: -3, max: 3},
    {min: -3, max: 3}, 0.01);
guiDebug.getFolderByName('Light position')
    .add(pointLight, 'intensity').min(0).max(10).step(0.01);


const controls = new OrbitControls( camera, renderer.domElement );
controls.update();



window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//loading a model
loader.load( 'Perseverance.glb', modelLoaderCallback, undefined, ( error ) => console.error( error ));

tick();


