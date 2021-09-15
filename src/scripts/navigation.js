import * as THREE from "three";
import {MathUtils} from "three";
import {geometry} from "./ui/ui-constants";


export default class Navigation {
    cameras = new THREE.Group();
    labels = new THREE.Group();
    lights = new THREE.Group();
    navigationGroup = new THREE.Group();
    viewpoints = new Set();
    sizes;
    currentCamera;


    constructor(sizes, camera) {
        this.sizes = sizes;
        this.currentCamera = camera;

        this.navigationGroup.add(this.labels);
        this.navigationGroup.add(this.cameras);
        this.navigationGroup.add(this.lights);
    }

    addViewpoint(position, rotation, type) {
        const cameraLabelColor = 0x009374;
        let cameraLabelGeometry;
        switch (type) {
            case geometry.CONE:
                cameraLabelGeometry = this.createConeGeometry();
                break;
            case geometry.SPHERE:
                cameraLabelGeometry = this.createSphereGeometry();
                break;
            default:
                cameraLabelGeometry = this.createConeGeometry();
        }
        const cameraLabelMaterial = new THREE.MeshStandardMaterial( { color: cameraLabelColor } );
        cameraLabelMaterial.transparent = true;
        cameraLabelMaterial.opacity = 0.7;
        const cameraLabel = new THREE.Mesh(cameraLabelGeometry, cameraLabelMaterial);
        cameraLabel.position.set(position.x, position.y, position.z);
        cameraLabel.rotation.z = MathUtils.degToRad(180);

        const radiansPerSecond = MathUtils.degToRad(30);
        console.log(radiansPerSecond);

        let currentPos = cameraLabel.position.y;
        cameraLabel.tick = (delta, time, hover) => {
            cameraLabel.rotation.y += radiansPerSecond * delta;

            if(hover === true) {
                cameraLabel.position.y += (Math.sin(time*10) / 100);
                return;
            }

            cameraLabel.position.y = currentPos + (Math.sin(time) / 1000);

            currentPos = cameraLabel.position.y;
        };

        const camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        camera.rotation.set(rotation.x, rotation.y, rotation.z);
        camera.position.set(position.x, position.y, position.z);


        const viewpoint = {camera: camera, label: cameraLabel, light: null};
        this.viewpoints.add(viewpoint);
        this.labels.add(cameraLabel);
        this.cameras.add(camera);

        return viewpoint;
    }

    createConeGeometry() {
        const cameraLabelHeight = 0.5;
        const cameraLabelRadius = 0.3;
        const cameraLabelRadialSegments = 20;
        const cameraLabelHeightSegments = 1
        const cameraLabelThetaStart = 0;
        const isCameraLabelOpenEnded = false;

        return new THREE.ConeGeometry(cameraLabelRadius, cameraLabelHeight, cameraLabelRadialSegments,
            cameraLabelHeightSegments, isCameraLabelOpenEnded, cameraLabelThetaStart);
    }

    createSphereGeometry() {
        const cameraLabelRadius = 0.25;
        const cameraLabelWidthSegments = 32;
        const cameraLabelHeightSegments = 16;

        return new THREE.SphereGeometry(cameraLabelRadius, cameraLabelWidthSegments, cameraLabelHeightSegments);
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

    animate(intersects, clock) {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        const navElems = this.labels.children;
        for (const elem of navElems) {
            if(intersects.length > 0 && elem === intersects[0].object) {
                elem.material.color.set( 0x59ff );
                elem.tick(delta, time, true);
                continue;
            }
            elem.material.color.set( 0x009374 );
            elem.tick(delta, time, false);
        }
    }
}