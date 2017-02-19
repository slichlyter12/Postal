'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Parser } from './parser'
import { spawn } from 'child_process'

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var electronp = require('electron');
var find = require('find');

var isWin = /^win/.test(process.platform);

export class Controller {

    //parser: Parser;
    nodeidCounter: number = 0;
    linkidCounter: number = 0;
    parser: Parser;
    slash: string;
    constructor() {
        this.parser = new Parser();
        
        if(isWin){
            this.slash = "\\";
        }
        else{
            this.slash = "/";
        }
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

    private findLinks(filePath, FileStructs){
        var allNames = nodefs.readdirSync(filePath);
        var fullPath;
        var link = {};
        var foundLinks = [];
        for(var i = 0; i < allNames.length; i++){
            fullPath = filePath + this.slash + allNames[i];
            for(var j = 0; j < FileStructs.length; j++){
                if(FileStructs[j].path == fullPath){
                    link = 
                    {
                        linkid: this.linkidCounter,
                        to: FileStructs[j].id,
                        lineNumber: null
                    }
                    foundLinks.push(link);
                    this.linkidCounter++;
                }
            }
        }
        


        return foundLinks;
    }

    private getNodeIDFromToken(){
        
    }

    private buildFileStructs(){
        var FileStructs = [];

        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);

        //Build Directory Nodes
        for(var i = 0; i < dirPaths.length; i++){
            FileStructs.push({
                id: this.nodeidCounter,
                level: this.levelCounter(dirPaths[i]),
                isSubContainer: false, //bool, Not files or dirs
                name: this.nameSlicer(dirPaths[i]),
                type: "dir",
                path: dirPaths[i],
                links: [],
                subContainers: [],
                errors: []
            });
            this.nodeidCounter++;
        }

        //Build File Nodes
        for(var j = 0; j < filePaths.length; j++){
            FileStructs.push({
                id: this.nodeidCounter,
                level: this.levelCounter(filePaths[j]),
                isSubContainer: false, //bool, Not files or dirs
                name: this.nameSlicer(filePaths[j]),
                type: filePaths[j].slice(filePaths[j].lastIndexOf(".")+1),
                path: filePaths[j],
                links: [],
                subContainers: [],
                errors: []
            });
            this.nodeidCounter++;
        }

        //Add Directory-to-File links
        var foundLinks;
        for(var k = 0; k < FileStructs.length; k++){
            if(FileStructs[k].type == "dir"){
                foundLinks = this.findLinks(FileStructs[k].path, FileStructs);
                FileStructs[k].links = foundLinks;
            }
        }

        //Get All tokens from Parser
        var tokens = [];
        for(i= 0; i < filePaths.length; i++){
            tokens.push(this.parser.parse(filePaths[i]));
        }

        //Add all subContainer nodes to FileStructs
        var FileStruct = {};
        for(i = 0; i < tokens.length; i++){
            for(j = 0; j < tokens[i].length; j++){
                if(tokens[i][j].tokenType == "node"){
                    FileStruct = 
                    {
                        id: this.nodeidCounter,
                        level: null,
                        isSubContainer: true,
                        name: tokens[i][j].value,
                        type: tokens[i][j].type,
                        path: null,
                        links: [],
                        subContainers: [],
                        errors: []
                    }
                    this.nodeidCounter++;
                    FileStructs.push(FileStruct);
                }
            }
        }

        var dirCount = dirPaths.length;
        for(i = dirCount; i < filePaths.length + dirCount; i++){
            for(j = 0; j < tokens[i - dirCount].length; j++){
                if(tokens[i - dirCount][j].tokenType == "node"){
                    if(tokens[i - dirCount][j].parentToken == undefined){
                        console.log("FileStructs[i].links.push");
                    }
                }
            }
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

    public launchUI(){
    //Start the Electron app
        var filePath;
        if (isWin) {
            filePath = `${__dirname}/../../`.slice(1);
        } else {
            filePath = `${__dirname}/../../`;
        }

        try {
            var command;
            if (isWin) {
                command = './node_modules/.bin/electron.cmd';
            } else {
                command = './node_modules/.bin/electron';
            }
            var cwd = path.join(__dirname, '../../lib/app');

            command = command.replace(/\//g, path.sep);
            cwd = cwd.replace(/\//g, path.sep);

            var spawn_env = JSON.parse(JSON.stringify(process.env));

            // remove those env vars
            delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
            delete spawn_env.ELECTRON_RUN_AS_NODE;

            var sp = spawn(command, ['.'], {cwd: cwd, env: spawn_env});
        } catch (error) {
            console.log("Electron Error: " + error);
        }

    }


}