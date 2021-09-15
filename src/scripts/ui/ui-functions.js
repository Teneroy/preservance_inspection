import Navigation from "../navigation";
import * as THREE from "three";
import {geometry, previewMargin, sizes} from "./ui-constants";
import {MathUtils} from "three";

/**
 * Creates renderer of the specific size for a specific canvas
 * @param size Renderers size object with with and height parameters
 * @param canvas Renderers canvas
 * @return Created and configured renderer
 * */
function createRenderer(canvas, size) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
}

function hdriBackgroundLoad(scene, renderer, url) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
        url,
        () => {
            const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
            rt.fromEquirectangularTexture(renderer, texture);
            rt.texture.rotation = 1;
            scene.background = rt.texture;
        },
        (e) => {
            console.error(e);
        });
    return texture;
}

function resize(sizes, camera, renderer) {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function loadModel(scene, model) {
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    scene.add( model );
}

function associateButtons(navigation) {
    const sortElemsByDistance = (elems) => {
        if(elems.length === 0)
            return elems;

        return elems.sort((a,b) => (Math.abs(a.camera.position.z) > Math.abs(b.camera.position.z)) ? 1 : 0);
    }

    const position = {
        TOP: 'top',
        LEFT: 'left',
        RIGHT: 'right',
        DOWN: 'down'
    }

    const getElemByPosition = (currentCamera, elem, pos) => {
        switch (pos) {
            case position.TOP:
                return elem.camera.position.y > currentCamera.position.y ? elem : null;
            case position.DOWN:
                return elem.camera.position.y < currentCamera.position.y ? elem : null;
            case position.LEFT:
                return elem.camera.position.z > currentCamera.position.z && elem.camera.position.y === currentCamera.position.y ? elem : null;
            case position.RIGHT:
                return elem.camera.position.z < currentCamera.position.z && elem.camera.position.y === currentCamera.position.y ? elem : null;
        }
    }

    const results = [];
    const topElems = [];
    const leftElems = [];
    const rightElems = [];

    const sides = [{ pos: position.TOP, data: topElems },{ pos: position.LEFT, data: leftElems }, { pos: position.RIGHT, data: rightElems }];

    for (let elem of navigation.viewpoints) {
        const downElem = getElemByPosition(navigation.currentCamera, elem, position.DOWN);
        if(downElem !== null) {
            return [{ type: '.down', elem: downElem }];
        }

        for (const side of sides) {
            const sideElem = getElemByPosition(navigation.currentCamera, elem, side.pos);
            if(sideElem !== null) {
                side.data.push(sideElem);
            }
        }
    }

    if(topElems.length > 0)
        results.push({ type: '.up', elem: sortElemsByDistance(topElems)[0] });

    if(leftElems.length > 0)
        results.push({ type: '.left', elem: sortElemsByDistance(leftElems)[0] });

    if(rightElems.length > 0)
        results.push({ type: '.right', elem: sortElemsByDistance(rightElems)[0] });

    return results;
}

function updateMouseCoordinates(mouse, sizes, coordinates) {
    mouse.x = coordinates.x / sizes.width * 2 - 1;
    mouse.y = - (coordinates.y / sizes.height) * 2 + 1;
}

function createPointLight(x, y, z) {
    const pointLight = new THREE.PointLight();
    pointLight.position.set(x, y, z);
    return pointLight;
}

function createViewpoints(navigation, ) {
    const topViewpoint = navigation.addViewpoint({x: 3, y: 3.3, z: 0}, {x: 0, y: 0, z: 0}, geometry.SPHERE);
    topViewpoint.camera.rotateY(MathUtils.degToRad(90));
    topViewpoint.camera.rotateX(MathUtils.degToRad(320));

    const navStep = 1.1;
    const firstNavZ = 1.1;
    const lastNavZ = -1.1;
    for (let z = firstNavZ; z >= lastNavZ; z -= navStep) {
        const viewpoint = navigation.addViewpoint({x: 3, y: 0.23, z: z}, {x: 0, y: 7.88, z: 0}, geometry.CONE);
        navigation.highlightViewpoint(viewpoint);
    }
    return navigation.navigationGroup;
}

function initEventListeners(navigation, camera, mouse, raycaster) {
    document.querySelector('.main').addEventListener('click', () => navigation.currentCamera = camera);
    window.addEventListener('mousemove', (e) => {
        updateMouseCoordinates(mouse, sizes, {x: e.clientX, y: e.clientY});
        previewMargin.top = e.clientY;
        previewMargin.left = e.clientX;
    });
    window.addEventListener('resize', () => resize(sizes, camera, renderer));
    window.addEventListener( 'click', (e) => {
        const intersects = raycaster.intersectObjects(navigation.labels.children);
        if(intersects.length > 0) {
            navigation.currentCamera = navigation.findViewpointByLabel(intersects[0].object).camera;
        }
    });
}

function displayButtons(buttons, navigation) {
    document.querySelector('.navigation-buttons').style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(elem => {
        if(elem.classList.contains('main'))
            return;
        elem.style.display = 'none';
    });
    for (const btn of buttons) {
        document.querySelector(btn.type).style.display = 'inline-block';
        document.querySelector(btn.type).addEventListener('click', () => {
            navigation.currentCamera = btn.elem.camera;
        });
    }
}

export {resize, loadModel, updateMouseCoordinates, associateButtons, hdriBackgroundLoad,
    createRenderer, createPointLight, createViewpoints, initEventListeners, displayButtons};