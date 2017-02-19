'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
//import { Parser } from './parser'

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

    idCounter: number = 0;

    public buildDataStructure(){
        this.buildFileStructs();
        
    }

    private buildFileStructs(){
        var FileStructs = [];

        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);

        for(var i = 0; i < dirPaths.length; i++){
        var topSlashCounter;
        var currSlashCounter;
        if(isWin){
            currSlashCounter = (dirPaths[i].match(/\\/g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\\/g) || []).length;
        }
        else{
            currSlashCounter = (dirPaths[i].match(/\//g) || []).length;
            topSlashCounter = (vscode.workspace.rootPath.match(/\//g) || []).length;
        }
        var level = currSlashCounter - topSlashCounter - 1;
            FileStructs.push({
                id: this.idCounter,
                level: level,
                isSubContainer: false, //bool, Not files or dirs
                name: dirPaths[i].slice(dirPaths[i].lastIndexOf("\\")+1),
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

}