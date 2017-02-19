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
        controller.launchUI();
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}