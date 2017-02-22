'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { Parser } from './parser'
import { spawn } from 'child_process'

//var open = require('open');
//var fs = require('file-system');
var nodefs = require('fs');
//var cwd = require('cwd');
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

    private findDirectoryLinks(filePath, FileStructs) {
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
                        id: this.linkidCounter,
                        toFileStructid: FileStructs[j].id,
                        lineNumber: null
                    }
                    foundLinks.push(link);
                    this.linkidCounter++;
                }
            }
        }

        return foundLinks;
    }


    private getNodeIdFromPath(filename: string, FileStructs: any): number {
        var filepath = vscode.workspace.rootPath + this.slash + filename;
        var id;
        
        // check for file in project
        for (var i = 0; i < FileStructs.length; i++) {
            if (FileStructs[i].path == filepath) {
                return FileStructs[i].id;
            }
        }

        // no file found in project, create new node
        var FileStruct = {
            id: this.nodeidCounter,
            level: 0,
            isSubContainer: false, //bool, Not files or dirs
            name: filename,
            type: "external",
            path: filepath,
            links: [],
            subContainers: [],
            errors: []
        }

        FileStructs.push(FileStruct);
        id = this.nodeidCounter;
        this.nodeidCounter++;

        return id;
    }


    private buildFileStructs(){
        var FileStructs = [];

        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);

        var dirCount = dirPaths.length;

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
                foundLinks = this.findDirectoryLinks(FileStructs[k].path, FileStructs);
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
                        path: FileStructs[i + dirCount].path,
                        links: [],
                        subContainers: [],
                        errors: []
                    };
                   
                    FileStructs.push(FileStruct);

                   
                    // push links between files and subcontainers
                    if (tokens[i][j].parentToken == undefined) {
                        var subContainer = {
                            id : this.linkidCounter,
                            toFileStructid : this.nodeidCounter,
                            lineNumber : tokens[i][j].lineNumber
                        };
                        FileStructs[i + dirCount].subContainers.push(subContainer);
                    }

                    //create a composite key to tie node id to filenumber + token id
                    tokens[i][j].nodeid = this.nodeidCounter;

                    this.nodeidCounter++;
                    this.linkidCounter++;

                }
            }
        }
        //linking subcontainers together, add between file links
        for(i = dirCount; i < filePaths.length + dirCount; i++){
            try {
                for(j = 0; j < tokens[i - dirCount].length; j++){
                    if(tokens[i - dirCount][j].tokenType == "node" && tokens[i - dirCount][j].parentToken != undefined){
                        try {
                            var parentNodeid = tokens[i - dirCount][tokens[i - dirCount][j].parentToken].nodeid;
                        } catch (err) {
                            console.log(err);
                        }
                        
                        
                        subContainer = {
                            id : this.linkidCounter,
                            toFileStructid : tokens[i - dirCount][j].nodeid,
                            lineNumber : tokens[i - dirCount][j].lineNumber
                        };
                        
                        FileStructs[parentNodeid].subContainers.push(subContainer);
                    }
                    else if(tokens[i - dirCount][j].tokenType == "link"){
                        
                        var linkDestination = this.getNodeIdFromPath(tokens[i - dirCount][j].value, FileStructs);
                        var linkcontainer = {
                            id : this.linkidCounter,
                            toFileStructid : linkDestination,
                            lineNumber : tokens[i - dirCount][j].lineNumber
                        }

                        if (tokens[i - dirCount][j].parentToken != undefined) {
                            var parentNodeid = tokens[i - dirCount][tokens[i - dirCount][j].parentToken].nodeid;
                            FileStructs[parentNodeid].links.push(linkcontainer);
                        } else {
                            FileStructs[i].links.push(linkcontainer);
                        }
                    }

                    // increment linkidCounter
                    this.linkidCounter++;
                }
            } catch (err) {
                console.log(err);
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