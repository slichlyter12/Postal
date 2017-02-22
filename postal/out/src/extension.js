'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const controller_1 = require("./controller");
const unitTesting_1 = require("../test/unitTesting");
//var open = require('open');
// var fs = require('file-system');
//var nodefs = require('fs');
//var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron');
var find = require('find');
var isWin = /^win/.test(process.platform);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let controller = new controller_1.Controller();
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let parse = vscode.commands.registerCommand('extension.parse', () => {
        //NEW PARSER STUFF
        controller.buildDataStructure();
        controller.launchUI();
    });
    // We can get rid of this stuff later. I am testing shtuff -Cramer
    let testing = vscode.commands.registerCommand('extension.error', () => {
        unitTesting_1.tests_main();
    });
    // pushes the command to the interphase where the user will then be able to 
    // use them. 
    context.subscriptions.push(testing);
    context.subscriptions.push(parse);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map