import './style.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';

const gui = new dat.GUI();
const light = gui.addFolder('Light');
const rowerRotation = gui.addFolder('Rower rotation');
const rowerPosition = gui.addFolder('Rower position');

const canvas = document.querySelector('.webgl');

const scene = new THREE.Scene();

const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);

const material = new THREE.MeshBasicMaterial();
material.color = new THREE.Color(0xffffff);

const sphere = new THREE.Mesh(geometry, material);

const loader = new GLTFLoader();

loader.load( 'Perseverance.glb', function ( gltf ) {

    const model = gltf.scene;
    model.scale.set(0.6, 0.6, 0.6);
    model.position.set(0, -0.79, 0);
    scene.add( model );

    rowerRotation.add(model.rotation, 'x').min(0).max(9);
    rowerRotation.add(model.rotation, 'y').min(0).max(9);
    rowerRotation.add(model.rotation, 'z').min(0).max(9);

    rowerPosition.add(model.position, 'x').min(-6).max(6).step(0.01);
    rowerPosition.add(model.position, 'y').min(-3).max(3).step(0.01);
    rowerPosition.add(model.position, 'z').min(-3).max(3).step(0.01);

}, undefined, function ( error ) {

    console.error( error );
    console.log(error)

} );

const pointLight = new THREE.HemisphereLight();

pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

light.add(pointLight.position, 'x').min(-6).max(6).step(0.01);
light.add(pointLight.position, 'y').min(-3).max(3).step(0.01);
light.add(pointLight.position, 'z').min(-3).max(3).step(0.01);
light.add(pointLight, 'intensity').min(0).max(10).step(0.01);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();


