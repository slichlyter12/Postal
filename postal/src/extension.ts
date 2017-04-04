'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';
import { Controller } from './controller';

var isWin = /^win/.test(process.platform);
// Making a 'process bridge' 
var ipc = require('node-ipc'); 


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let controller = new Controller();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let parse = vscode.commands.registerCommand('extension.parse', () => {

        //NEW PARSER STUFF
        controller.buildDataStructure();

        // Launch UI in electron
        controller.launchUI();
    });
    
    // We can get rid of this stuff later. I am testing shtuff -Cramer
    let testing = vscode.commands.registerCommand('extension.error', () => {
        // controller.jumpToFilesLine("/Users/TheCmar7/Developer/kingfish/footer.php", 20);
        const settings = vscode.workspace.getConfiguration('');
        console.log("mapType: " + settings.get<string>("Postal.mapType"));
        console.log("Physics: " + settings.get<boolean>("Postal.physics"));
        var ignore1 = settings.get<string[]>("Postal.ignore")[0];
        //console.log(ignore1.);
        //var re = new RegExp(ignore1);


    });


    // pushes the command to the interphase where the user will then be able to 
    // use them. 
    context.subscriptions.push(testing);
    context.subscriptions.push(parse);
}

// this method is called when your extension is deactivated
export function deactivate() {}