'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ContentProv } from './ContentProv';

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // get filepath and create file
    var htmlFilePath = vscode.workspace.rootPath;
    htmlFilePath += "/dirStructure.html";
    fs.writeFile(htmlFilePath, "\n", function(error) {
        if (error) {
            console.error("Error creating dirStructure.html");
        }
    });

    let previewUri = vscode.Uri.parse("Files://" + htmlFilePath);

    let provider = new ContentProv();
    
    let registration = vscode.workspace.registerTextDocumentContentProvider('Files', provider);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.postal', () => {
        // The code you place here will be executed every time your command is executed

        // generate html list of files
        var files = vscode.workspace.findFiles('*', '');
        files.then(function(foundFiles) {

            // start/create file
            var htmlOpen = "<!DOCTYPE html><html><head><title>Files</title></head><body><ul>\n";
            fs.writeFile(htmlFilePath, htmlOpen, function(error) {
                if (error) {
                    console.error("Failed to write opening HTML\nerror: " + error);
                }
            });

            // add file names to list
            foundFiles.forEach(function(file) {
                if (file.path != htmlFilePath) {
                    let html = "<li>" + file + "</li>\n";
                    fs.appendFile(htmlFilePath, html, function(error) {
                        if (error) {
                            console.error("Failed to write " + file + ", html: " + html + "\nerror: " + error);
                        }
                    });
                }
            });

            // end file
            var htmlClose = "</ul></body></html>\n";
            fs.appendFile(htmlFilePath, htmlClose, function(error) {
                if (error) {
                    console.error("Failed to write closing HTML\nerror: " + error);
                }
            });

            return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two);
        });
    });

    context.subscriptions.push(disposable);

    let parse = vscode.commands.registerCommand('extension.parse', () => {

        // GET GRAMMARS
        console.log(__dirname + "\\..\\..\\src\\grammars.json");
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
        var grammars = JSON.parse(grammarsFile);

        //GET FILES TO PARSE AND PARSE
        var files = [];
        for (var i = 0; i < grammars.grammars.length; i++) {
            for (var j = 0; j < grammars.grammars[i].filetypes.length; j++) {
                files.push(vscode.workspace.findFiles("*" + grammars.grammars[i].filetypes[j], ''));
            }
        }

        // FIXME: PARSE LOGIC
        for (var a = 0; a < files.length; a++) {
            files[a].then(function(foundFiles) {
                for (var i = 0; i < grammars.grammars.length; i++) {
                    for (var k = 0; k < grammars.grammars[i].regex.length; k++) {
                        for (var key in grammars.grammars[i].regex[k]) {
                            if (grammars.grammars[i].regex[k].hasOwnProperty(key)) {
                                //console.log(grammars.grammars[i].regex[k][key] + " -> " + key);
                                
                                for (var b = 0; b < foundFiles.length; b++) {
                                    var regexString = grammars.grammars[i].regex[k][key];
                                    var regex = new RegExp(regexString, 'g');
                                    var content = nodefs.readFileSync(foundFiles[b].path, 'utf8');
                                    var found = content.match(regex);
                                    console.log(found);
                                }
                            }
                        }
                    }
                }
                return 0;
            });
        }
    });


    context.subscriptions.push(parse);
}

// this method is called when your extension is deactivated
export function deactivate() {}