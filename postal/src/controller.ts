'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as path from 'path';
import { Parser } from './parser'
import { spawn } from 'child_process'

var nodefs = require('fs');
var finder = require('find');  
var ipc = require('node-ipc');	


var isWin = /^win/.test(process.platform);

export class Controller {

    //parser: Parser;
    nodeidCounter: number = 0;
    linkidCounter: number = 0;
    notificationidCounter: number = 0;
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
        this.nodeidCounter = 0;
        this.linkidCounter = 0;
        var FileStructs = this.buildFileStructs();
        this.writeJSON(FileStructs);      
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
        var level = currSlashCounter - topSlashCounter - 1 + 1; //plus one because there will be a main directory at 0
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
            notifications: []
        }

        FileStructs.push(FileStruct);
        id = this.nodeidCounter;
        this.nodeidCounter++;

        return id;
    }

    private buildFileStructs(){
        var FileStructs = [];

        var dirPaths = finder.dirSync(vscode.workspace.rootPath);
        var filePaths = finder.fileSync(vscode.workspace.rootPath);

        var modifiedDirPaths = Array.from(dirPaths);
        var modifiedFilePaths = Array.from(filePaths);

        const settings = vscode.workspace.getConfiguration('Postal');
        let ignoreFiles = settings.ignore;

        // remove ignored file paths from postal ignore
        var numRemoved = 0;
        for (var t = 0; t < filePaths.length; t++) {
            let path = filePaths[t];
            for (var u = 0; u < ignoreFiles.length; u++) {
                try {
                    let regexString = "\/*\/" + ignoreFiles[u] + "\/*";
                    let regex = new RegExp(regexString);
                    let match = regex.exec(path);
                    if (match != null) {
                        modifiedFilePaths.splice(t - numRemoved, 1);
                        numRemoved++;
                    }
                } catch (error) {
                    console.log("Getting files to parse error: " + error);
                }
            }
        }

        // remove ignored directory paths from postal ignore
        numRemoved = 0;
        for (var t = 0; t < dirPaths.length; t++) {
            let path = dirPaths[t];
            for (var u = 0; u < ignoreFiles.length; u++) {
                try {
                    let regexString = "\/*\/" + ignoreFiles[u] + "\/*";
                    let regex = new RegExp(regexString);
                    let match = regex.exec(path);
                    if (match != null) {
                        modifiedDirPaths.splice(t - numRemoved, 1);
                        numRemoved++;
                    }
                } catch (error) {
                    console.log("Getting files to parse error: " + error);
                }
            }
        }

        dirPaths = Array.from(modifiedDirPaths);
        filePaths = Array.from(modifiedFilePaths);

        var dirCount = dirPaths.length + 1;

        //Build Main Directory Node
        FileStructs.push({
                id: this.nodeidCounter,
                level: 0,
                isSubContainer: false, //bool, Not files or dirs
                name: this.nameSlicer(vscode.workspace.rootPath),
                type: "dir",
                path: vscode.workspace.rootPath,
                links: [],
                subContainers: [],
                notifications: []
            });
        this.nodeidCounter++;
       
       //build all other Directory Nodes
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
                notifications: []
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
                notifications: []
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
                        notifications: []
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
                else if(tokens[i][j].tokenType == "notification"){
                    var notificationContainer = {
                        id : this.notificationidCounter,
                        message : tokens[i][j].value,
                        lineNumber : tokens[i][j].lineNumber
                    };
                    if(tokens[i][j].parentToken == undefined){
                        FileStructs[i + dirCount].notifications.push(notificationContainer);
                    }
                    else{
                         try {
                            var parentNodeid = tokens[i][tokens[i][j].parentToken].nodeid;
                        } catch (err) {
                            console.log(err);
                        }
                        FileStructs[parentNodeid].notifications.push(notificationContainer);
                    }
                }
            }
        }
        //linking subcontainers together, add between file links
        for(i = dirCount; i < filePaths.length + dirCount; i++){
            for(j = 0; j < tokens[i - dirCount].length; j++){
                if(tokens[i - dirCount][j].tokenType == "node" && tokens[i - dirCount][j].parentToken != undefined){
                    try {
                        parentNodeid = tokens[i - dirCount][tokens[i - dirCount][j].parentToken].nodeid;
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
        }

        //Update level information
        for(i = dirCount; i < FileStructs.length; i++){
            if(FileStructs[i].isSubContainer){
                break;
            }
            if(FileStructs[i].subContainers.length != undefined){
                for(var j = 0; j < FileStructs[i].subContainers.length; j++){
                    FileStructs = this.updateFileStructLevelsRecursive(FileStructs[i].subContainers[j].toFileStructid, FileStructs[i].level, FileStructs);
                }       
            }
        }
       
        return FileStructs;
    }

    private getGrammarFiletypes() {
        const settings = vscode.workspace.getConfiguration('Postal');
        let grammars = settings.grammars;

        var filetypes = [];
        for (var i = 0; i < grammars.length; i++) {
            for (var j = 0; j < grammars[i].filetypes.length; j++) {
                let filetype = grammars[i].filetypes[j];
                filetypes.push(filetype);
            }
        }

        return Array.from(new Set(filetypes));
    }


    private updateFileStructLevelsRecursive(CurrentID, ParentLevel, FileStructs){
        if(FileStructs[CurrentID].isSubContainer && FileStructs[CurrentID].level ==  null){
            FileStructs[CurrentID].level = ParentLevel + 1;
            if(FileStructs[CurrentID].subContainers.length != undefined){
                for(var i = 0; i < FileStructs[CurrentID].subContainers.length; i++){
                    this.updateFileStructLevelsRecursive(FileStructs[CurrentID].subContainers[i].toFileStructid, FileStructs[CurrentID].level, FileStructs);
                }
            }
        }

        return FileStructs
    }


    private writeJSON(FileStructs){
        var FileData = {FileStructs};
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

            // starting the everntlistening server
            this.startServer();

        } catch (error) {
            console.log("Electron Error: " + error);
        }

    }

    // this opens a file and jumps to the given line
    public jumpToFilesLine(filename: string, lineNum: number) {
         let uri = Uri.parse("file:" + filename);
        vscode.workspace.openTextDocument(uri).then( doc => {
            //console.log(doc);
            vscode.window.showTextDocument(doc).then( poo => {
                this.jumpToLine(lineNum);
            }); 
        }, reason => {
            console.log(reason);
        });
    }

    // this opens a given file name
    public fileToEditor(fileName: string) {
        let uri = Uri.parse("file:" + fileName);
        vscode.workspace.openTextDocument(uri).then( doc => {
            //console.log(doc);
            vscode.window.showTextDocument(doc);
        }, reason => {
            console.log(reason);
        });
    }
 
    // this move to a line on the currently open file. 
    public jumpToLine(lineNum: number) {
        let sel = new vscode.Selection(lineNum - 1, 0, lineNum - 1, 0);
        vscode.window.activeTextEditor.selection = sel;
        vscode.window.activeTextEditor.revealRange(sel, vscode.TextEditorRevealType.Default);
    }

    // Theoretically starting the server to connect with Electron Client
    private startServer() {
        // this is a thing you can do. 
        var controller = this;
        
        ipc.config.id   = 'world';
        ipc.config.retry= 1500;
    
        ipc.serve(
            function(){
                 ipc.server.on(
                    'double_click',
                    function(data){
                        console.log("double click recieved");
                        //console.log("This is what I got back:" + data.path + " and " + data.lineNumber );
                        var filename = data.path;
                        var lineNum = data.lineNumber;

						controller.jumpToFilesLine(filename, parseInt(lineNum));
                    }
                );
				// this will kill the server 
				ipc.server.on(
					'kill_server',
					function(data){
                        console.log("killed");
						ipc.server.stop();
					}
				);
                ipc.server.on(
                    'disconnect',
                    function() {
                        
                        ipc.log("disconnected nat");
                        ipc.server.stop();
                    }
                );
                ipc.server.on(
                    'destroy',
                    function() {
                        ipc.log("destroy nat");
                        ipc.server.stop();
                    }
                );
				// this should only happen if the user closes the electron window
                ipc.server.on(
                    'socket.disconnected',
                    function(socket, destroyedSocketID) {
                        ipc.log('client ' + destroyedSocketID + ' has disconnected!');
                        ipc.log("killin it");
						ipc.server.stop();
                    }
                );
            }
        );
    
        ipc.server.start();
    }

}

