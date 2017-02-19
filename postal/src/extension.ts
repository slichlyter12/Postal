'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process'
import { ContentProv } from './ContentProv';
import { Controller } from './controller';

// This is Node.js Code ...
const readline = require('readline');
const fileSystem = require('fs');

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron');
var find = require('find');

var isWin = /^win/.test(process.platform);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let provider = new ContentProv();
    let controller = new Controller();

    let registration = vscode.workspace.registerTextDocumentContentProvider('Files', provider);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let parse = vscode.commands.registerCommand('extension.parse', () => {

        //NEW PARSER STUFF
        controller.buildDataStructure();

    });
}

        // Start the Electron app
    //     var filePath;
    //     if (isWin) {
    //         filePath = `${__dirname}/../../`.slice(1);
    //     } else {
    //         filePath = `${__dirname}/../../`;
    //     }

    //     try {
    //         var command;
    //         if (isWin) {
    //             command = './node_modules/.bin/electron.cmd';
    //         } else {
    //             command = './node_modules/.bin/electron';
    //         }
    //         var cwd = path.join(__dirname, '../../lib/app');

    //         command = command.replace(/\//g, path.sep);
    //         cwd = cwd.replace(/\//g, path.sep);

    //         var spawn_env = JSON.parse(JSON.stringify(process.env));

    //         // remove those env vars
    //         delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    //         delete spawn_env.ELECTRON_RUN_AS_NODE;

    //         var sp = spawn(command, ['.'], {cwd: cwd, env: spawn_env});
    //     } catch (error) {
    //         console.log("Electron Error: " + error);
    //     }

    // });

//     // This is how I am testing my code. -Cramer
//     let errorHighLight = vscode.commands.registerCommand('extension.error', () => {
//         LineParser('/Users/TheCmar7/Developer/random/maze-generator/mazegenerator.js', 'if')
//     });

//     context.subscriptions.push(errorHighLight);
//     context.subscriptions.push(parse);
 //}


// var LineParser = function(filepath :string, regex :string) {

//     const rl = readline.createInterface({
//         input: fileSystem.createReadStream(filepath)
//     });
    
//     var linesFound = []
//     var lineCount = 0; 

//     rl.on('line', function (line) {
//         lineCount++; 
//         var found = line.match(regex)
//         if (found != null) {
//             found.push(lineCount);
//             linesFound.push(found);    
//             console.log(linesFound);
//         } 
//     });


//     // // split on new line (will need different for UNIX or Windows)
//     // var split = '';
//     // if (isWin) {
//     //     split = "\Crlf";
//     // } else {
//     //     split = "\n";
//     // } 

//     // // loop through array of lines

//     //     // if line has regex add to ret dictionary

//     // // return ret dictionary

// } 
//}

// this method is called when your extension is deactivated
export function deactivate() {}