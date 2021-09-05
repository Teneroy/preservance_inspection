import * as dat from 'dat.gui';

export default class GuiDebug {
    gui = new dat.GUI();
    folders = new Map();

    addFolder(folderName) {
        const folder = this.gui.addFolder(folderName);
        this.folders.set(folderName, folder);
        return folder;
    }

    getFolderByName(folderName) {
        return this.folders.get(folderName);
    }

    static addMovementToGui(movementType, folder, x, y, z, step) {
        folder.add(movementType, 'x').min(x.min).max(x.max).step(step);
        folder.add(movementType, 'y').min(y.min).max(y.max).step(step);
        folder.add(movementType, 'z').min(z.min).max(z.max).step(step);
    }

    addRotationDebugger(model, folder = {}, x = {min: 0, max: 9}, y = {min: 0, max: 9}, z = {min: 0, max: 9}, step = 1) {
        if(typeof folder === "string") {
            folder = this.addFolder(folder);
        }
        if(model === undefined) {
            model = this.gui;
        }
        GuiDebug.addMovementToGui(model.rotation, folder, x, y, z, step);
        return folder;
    }

    addPositionDebugger(model, folder = '', x = {min: 0, max: 9}, y = {min: 0, max: 9}, z = {min: 0, max: 9}, step = 1) {
        if(typeof folder === "string") {
            folder = this.addFolder(folder);
        }
        if(typeof model === "undefined") {
            model = this.gui;
        }
        GuiDebug.addMovementToGui(model.position, folder, x, y, z, step);
        return folder;
    }
}
