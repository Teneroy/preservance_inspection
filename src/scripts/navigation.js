import * as THREE from "three";


export default class Navigation {
    cameras = new THREE.Group();
    labels = new THREE.Group();
    lights = new THREE.Group();
    navigationGroup = new THREE.Group();
    viewpoints = new Set();
    cameraLabelGeometry;
    sizes;
    currentCamera;


    constructor(sizes, camera) {
        const cameraLabelHeight = 0.3;
        const cameraLabelRadius = 0.3;
        const cameraLabelRadialSegments = 8;
        const cameraLabelHeightSegments = 1;
        const cameraLabelThetaStart = 0;
        const isCameraLabelOpenEnded = false;

        this.cameraLabelGeometry = new THREE.ConeGeometry(cameraLabelRadius, cameraLabelHeight, cameraLabelRadialSegments,
            cameraLabelHeightSegments, isCameraLabelOpenEnded, cameraLabelThetaStart);
        this.sizes = sizes;
        this.currentCamera = camera;

        this.navigationGroup.add(this.labels);
        this.navigationGroup.add(this.cameras);
        this.navigationGroup.add(this.lights);
    }

    addViewpoint(position, rotation) {
        const cameraLabelColor = 0x00ff00;
        const cameraLabelMaterial = new THREE.MeshBasicMaterial( { color: cameraLabelColor } );
        const cameraLabel = new THREE.Mesh(this.cameraLabelGeometry, cameraLabelMaterial);
        cameraLabel.position.set(position.x, position.y, position.z);

        const camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        camera.rotation.set(rotation.x, rotation.y, rotation.z);
        camera.position.set(position.x, position.y, position.z);


        const viewpoint = {camera: camera, label: cameraLabel, light: null};
        this.viewpoints.add(viewpoint);
        this.labels.add(cameraLabel);
        this.cameras.add(camera);

        return viewpoint;
    }

    highlightViewpoint(viewpoint) {
        if(!this.viewpoints.has(viewpoint)) {
            return null;
        }
        const position = viewpoint.camera.position;
        const rotation = viewpoint.camera.rotation;
        const pointLight = new THREE.PointLight();
        pointLight.position.set(position.x, position.y, position.z);
        pointLight.rotation.set(rotation.x, rotation.y, rotation.z);
        viewpoint.light = pointLight;
        this.lights.add(pointLight);

        return pointLight;
    }

    findViewpointByLabel(label) {
        for (let viewpoint of this.viewpoints) {
            if(viewpoint.label === label) {
                return viewpoint;
            }
        }
        return null;
    }
}