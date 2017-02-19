'use strict';
const vscode = require("vscode");
const path = require("path");
const parser_1 = require("./parser");
const child_process_1 = require("child_process");
var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var electronp = require('electron');
var find = require('find');
var isWin = /^win/.test(process.platform);
class Controller {
    constructor() {
        //parser: Parser;
        this.nodeidCounter = 0;
        this.linkidCounter = 0;
        this.parser = new parser_1.Parser();
        if (isWin) {
            this.slash = "\\";
        }
        else {
            this.slash = "/";
        }
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
    findLinks(filePath, FileStructs) {
        var allNames = nodefs.readdirSync(filePath);
        var fullPath;
        var link = {};
        var foundLinks = [];
        for (var i = 0; i < allNames.length; i++) {
            fullPath = filePath + this.slash + allNames[i];
            for (var j = 0; j < FileStructs.length; j++) {
                if (FileStructs[j].path == fullPath) {
                    link =
                        {
                            linkid: this.linkidCounter,
                            to: FileStructs[j].id,
                            lineNumber: null
                        };
                    foundLinks.push(link);
                    this.linkidCounter++;
                }
            }
        }
        return foundLinks;
    }
    linkBuilder() {
    }
    buildFileStructs() {
        var FileStructs = [];
        var dirPaths = find.dirSync(vscode.workspace.rootPath);
        var filePaths = find.fileSync(vscode.workspace.rootPath);
        //Build Directory Nodes
        for (var i = 0; i < dirPaths.length; i++) {
            FileStructs.push({
                id: this.nodeidCounter,
                level: this.levelCounter(dirPaths[i]),
                isSubContainer: false,
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
        for (var j = 0; j < filePaths.length; j++) {
            FileStructs.push({
                id: this.nodeidCounter,
                level: this.levelCounter(filePaths[j]),
                isSubContainer: false,
                name: this.nameSlicer(filePaths[j]),
                type: filePaths[j].slice(filePaths[j].lastIndexOf(".") + 1),
                path: filePaths[j],
                links: [],
                subContainers: [],
                errors: []
            });
            this.nodeidCounter++;
        }
        //Add Directory-to-File links
        var foundLinks;
        for (var k = 0; k < FileStructs.length; k++) {
            if (FileStructs[k].type == "dir") {
                foundLinks = this.findLinks(FileStructs[k].path, FileStructs);
                FileStructs[k].links = foundLinks;
            }
        }
        //Get All tokens from Parser
        var tokens = [];
        for (i = 0; i < filePaths.length; i++) {
            tokens.push(this.parser.parse(filePaths[i]));
        }
        //Add all subContainer nodes to FileStructs
        var FileStruct = {};
        for (i = 0; i < tokens.length; i++) {
            for (j = 0; j < tokens[i].length; j++) {
                if (tokens[i][j].tokenType == "node") {
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
                        };
                    this.nodeidCounter++;
                    FileStructs.push(FileStruct);
                }
            }
        }
        var dirNum = dirPaths.length;
        for (i = dirNum; i < FileStructs[i]; i++) {
            for (j = 0; j < tokens[i - dirNum].length; j++) {
                if (tokens[i - dirNum][j].tokenType == "node") {
                    if (tokens[i - dirNum][j].parentToken == null) {
                    }
                }
            }
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
    launchUI() {
        //Start the Electron app
        var filePath;
        if (isWin) {
            filePath = `${__dirname}/../../`.slice(1);
        }
        else {
            filePath = `${__dirname}/../../`;
        }
        try {
            var command;
            if (isWin) {
                command = './node_modules/.bin/electron.cmd';
            }
            else {
                command = './node_modules/.bin/electron';
            }
            var cwd = path.join(__dirname, '../../lib/app');
            command = command.replace(/\//g, path.sep);
            cwd = cwd.replace(/\//g, path.sep);
            var spawn_env = JSON.parse(JSON.stringify(process.env));
            // remove those env vars
            delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
            delete spawn_env.ELECTRON_RUN_AS_NODE;
            var sp = child_process_1.spawn(command, ['.'], { cwd: cwd, env: spawn_env });
        }
        catch (error) {
            console.log("Electron Error: " + error);
        }
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map