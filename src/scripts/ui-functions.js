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

        let temp = elems[0];
        for (let i = 0; i < elems.length; i++) {
            if(temp.camera.position.z < elems[i].camera.position.z) {
                elems[i] = temp;
            }
        }
        return elems;
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
                return elem.camera.position.z < currentCamera.position.z ? elem : null;
            case position.RIGHT:
                return elem.camera.position.z > currentCamera.position.z ? elem : null;
        }
    }

    const getElemsByPosition = (currentCamera, elements, pos) => {
        const elems = [];
        for (let elem of elements) {
            const posElem = getElemByPosition(currentCamera, elem, pos);
            if(posElem !== null) {
                elems.push(posElem);
            }
        }
        return sortElemsByDistance(elems);
    };

    const downElems = getElemsByPosition(navigation.currentCamera, navigation.viewpoints, position.DOWN);
    if(downElems.length > 0) {
        return [{ type: '.down', elem: downElems[(downElems.length / 2).toFixed(0)] }];
    }

    const results = [];
    const topElems = getElemsByPosition(navigation.currentCamera, navigation.viewpoints, position.TOP);
    const leftElems = getElemsByPosition(navigation.currentCamera, navigation.viewpoints, position.LEFT);
    const rightElems = getElemsByPosition(navigation.currentCamera, navigation.viewpoints, position.RIGHT);

    if(topElems.length > 0)
        results.push({ type: '.up', elem: topElems[0] });

    if(leftElems.length > 0)
        results.push({ type: '.left', elem: leftElems[0] });

    if(rightElems.length > 0)
        results.push({ type: '.right', elem: rightElems[0] });

    return results;
}

function updateMouseCoordinates(mouse, sizes, coordinates) {
    mouse.x = coordinates.x / sizes.width * 2 - 1;
    mouse.y = - (coordinates.y / sizes.height) * 2 + 1;
}

export {resize, loadModel, updateMouseCoordinates, associateButtons};