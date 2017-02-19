'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Parser } from './parser'

// This is Node.js Code ...
const readline = require('readline');
const fileSystem = require('fs');

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var electronp = require('electron');
var find = require('find');

var isWin = /^win/.test(process.platform);

export class Controller {

    //parser: Parser;
    idCounter: number = 0;
    parser: Parser;

    constructor() {
        var parser = new Parser();
    }

    public buildDataStructure(){
        var FileStructs = this.buildFileStructs();
        var ErrorStructs = this.buildErrorStructs();
        this.writeJSON(FileStructs, ErrorStructs);      
    }

    private levelCounter(path){
        var topSlashCounter;
        var currSlashCounter;
        if(isWin){
            currSlashCounter = (path.match(/\\/g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\\/g) || []).length;
        }
        else{
            currSlashCounter = (path.match(/\//g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\//g) || []).length;
        }
        var level = currSlashCounter - topSlashCounter - 1;
        return level;
    }

    private nameSlicer(path){
        var fileName;
        if(isWin){
            fileName = path.slice(path.lastIndexOf("\\")+1)
        }
        else{
            fileName = path.slice(path.lastIndexOf("/")+1)
        }

        return fileName;
    }

    private buildFileStructs(){
        var FileStructs = [];

        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);

        for(var i = 0; i < dirPaths.length; i++){
            FileStructs.push({
                id: this.idCounter,
                level: this.levelCounter(dirPaths[i]),
                isSubContainer: false, //bool, Not files or dirs
                name: this.nameSlicer(dirPaths[i]),
                type: "dir",
                path: dirPaths[i],
                links: [],
                subContainers: [],
                errors: []
            });
            this.idCounter++;
        }

        for(var j = 0; j < filePaths.length; j++){
            FileStructs.push({
                id: this.idCounter,
                level: this.levelCounter(filePaths[j]),
                isSubContainer: false, //bool, Not files or dirs
                name: this.nameSlicer(filePaths[j]),
                type: "dir",
                path: filePaths[j],
                links: [],
                subContainers: [],
                errors: []
            });
            this.idCounter++;
        }

        return FileStructs;
    }

    private buildErrorStructs(){
        var ErrorStructs = {};

        return ErrorStructs;
    }

    private writeJSON(FileStructs, ErrorStructs){
        var FileData = {FileStructs, ErrorStructs};
        var jsonHolder = JSON.stringify({FileData});

        nodefs.writeFileSync(__dirname + "/../../postal.json", jsonHolder, 'utf8');
    }

}