import * as THREE from "three";
import {MathUtils} from "three";
import {geometry} from "./ui/ui-constants";


/**
 * Class contains viewpoints as well as helping objects and methods related to those viewpoints
 * */
export default class Navigation {
    /**
     * Group, contains cameras
     * */
    cameras = new THREE.Group();

    /**
     * Group, contains viewpoint geometry
     * */
    labels = new THREE.Group();

    /**
     * Group, contains lights in order to better highlight elements
     * */
    lights = new THREE.Group();

    /**
     * Group, contains cameras, labels, and lights
     * */
    navigationGroup = new THREE.Group();

    /**
     * Set contains objects with such parameters as camera, light, and label those fully describes viewpoint
     * */
    viewpoints = new Set();

    /**
     * Sizes object with width and height parameters
     * */
    sizes;

    /**
     * Current active camera
     * */
    currentCamera;

    constructor(sizes, camera) {
        this.sizes = sizes;
        this.currentCamera = camera;

        this.navigationGroup.add(this.labels);
        this.navigationGroup.add(this.cameras);
        this.navigationGroup.add(this.lights);
    }

    /**
     * Adding new viewpoint to the scene
     * @param position Position object with x,y,z coordinates
     * @param rotation Rotation object with x,y,z coordinates
     * @param type Label geometry type
     * @return new viewpoint
     * */
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

    /**
     * Creates new ConeGeometry
     * @return ConeGeometry
     * */
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

    /**
     * Creates SphereGeometry
     * @return SphereGeometry
     * */
    createSphereGeometry() {
        const cameraLabelRadius = 0.25;
        const cameraLabelWidthSegments = 32;
        const cameraLabelHeightSegments = 16;

        return new THREE.SphereGeometry(cameraLabelRadius, cameraLabelWidthSegments, cameraLabelHeightSegments);
    }

    /**
     * Creates new point light to highlight viewpoint
     * @param viewpoint Viewpoint object
     * @return pointLight new point light
     * */
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

    /**
     * Find viewpoint by label(geometry)
     * @param label Geometry object that describes viewpoint
     * @return viewpoints if object has been found or null if has not
     * */
    findViewpointByLabel(label) {
        for (let viewpoint of this.viewpoints) {
            if(viewpoint.label === label) {
                return viewpoint;
            }
        }
        return null;
    }

    /**
     * Animates and colors all viewpoints
     * @param intersects Array with intersected objects
     * @param clock Object with time logic
     * */
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