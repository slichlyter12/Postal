'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ContentProv } from './ContentProv';

var open = require('open');
var fs = require('file-system');
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
        var grammarsObject;
        var grammars = [];
        var grammarsFile = fs.readFile(cwd() + "/src/grammars.json", "utf8", function(err, data) {
            if (err) {
                console.log("Error: " + err);
                return;
            } else {
                grammarsObject = JSON.parse(data);
            }
        });

        //GET FILES TO PARSE
        var files = vscode.workspace.findFiles("*.php", '');

        //PARSE FILES
        files.then(function(foundFiles) {
            for (var i = 0; i < foundFiles.length; i++) {
                var linksRegex = new RegExp(grammarsObject.html.links, 'g');
                var content = fs.readFileSync(foundFiles[i].path, 'utf8');
                var links = content.match(linksRegex);
                console.log(links);
            }
        });
    });

    context.subscriptions.push(parse);
}

// this method is called when your extension is deactivated
export function deactivate() {}