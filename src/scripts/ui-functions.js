import Navigation from "./navigation";

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

export {resize, loadModel, updateMouseCoordinates, associateButtons};