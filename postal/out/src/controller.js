'use strict';
const vscode = require("vscode");
//import { Parser } from './parser'
var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var electronp = require('electron');
var find = require('find');
var isWin = /^win/.test(process.platform);
class Controller {
    constructor() {
        this.idCounter = 0;
    }
    buildDataStructure() {
        var FileStructs = this.buildFileStructs();
        var ErrorStructs = this.buildErrorStructs();
        this.writeJSON(FileStructs, ErrorStructs);
    }
    levelCounter(path) {
        var topSlashCounter;
        var currSlashCounter;
        if (isWin) {
            currSlashCounter = (path.match(/\\/g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\\/g) || []).length;
        }
        else {
            currSlashCounter = (path.match(/\//g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\//g) || []).length;
        }
        var level = currSlashCounter - topSlashCounter - 1;
        return level;
    }
    nameSlicer(path) {
        var fileName;
        if (isWin) {
            fileName = path.slice(path.lastIndexOf("\\") + 1);
        }
        else {
            fileName = path.slice(path.lastIndexOf("/") + 1);
        }
        return fileName;
    }
    buildFileStructs() {
        var FileStructs = [];
        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);
        for (var i = 0; i < dirPaths.length; i++) {
            FileStructs.push({
                id: this.idCounter,
                level: this.levelCounter(dirPaths[i]),
                isSubContainer: false,
                name: this.nameSlicer(dirPaths[i]),
                type: "dir",
                path: dirPaths[i],
                links: [],
                subContainers: [],
                errors: []
            });
            this.idCounter++;
        }
        return FileStructs;
    }
    buildErrorStructs() {
        var ErrorStructs = {};
        return ErrorStructs;
    }
    writeJSON(FileStructs, ErrorStructs) {
        var FileData = { FileStructs, ErrorStructs };
        var jsonHolder = JSON.stringify({ FileData });
        nodefs.writeFileSync(__dirname + "/../../postal.json", jsonHolder, 'utf8');
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map