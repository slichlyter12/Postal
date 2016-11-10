// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
let vscode = require('vscode');
let fs = require('fs');
let open = require('open');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let findFiles = vscode.commands.registerCommand('extension.findFiles', function() {

        //vscode.window.showInformationMessage('Running Postal...');
        vscode.window.setStatusBarMessage("Running Postal...");

        // Thenable<Uri[]> What is a thenable<uri[]>?
        //     -> https://code.visualstudio.com/Docs/extensionAPI/vscode-api#Thenable
        //        A thenable that resolves to an array of resource identifiers.
        var files = vscode.workspace.findFiles('*', '');
        files.then(function(foundFiles) {
            console.log("foundFiles:");
            console.log(foundFiles);

            // get filepath
            var htmlFilePath = vscode.workspace.rootPath;
            htmlFilePath += "/.dirStructure.html";

            // start/create file
            var htmlOpen = "<!DOCTYPE html><html><head><title>files in current dir</title></head><body><ul>\n";
            fs.writeFile(htmlFilePath, htmlOpen, function(error) {
                if (error) {
                    console.error("Failed to write opening HTML\nerror: " + error);
                }
            });
            // 
            foundFiles.forEach(function(file) {
                if (file !== htmlFilePath) {
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

            // open file in browser
            open(htmlFilePath);

            // show preview window
            let uri = vscode.Uri.parse(htmlFilePath);
            let success = vscode.commands.executeCommand('vscode.previewHtml', uri);
            success.then(function() {
                console.log("completed");
            });
        });

        var cwd = vscode.workspace.rootPath;
        console.log("cwd:");
        console.log(cwd);

        var textDocuments = vscode.workspace.textDocuments;
        console.log("textDocuments:");
        console.log(textDocuments);
        
        vscode.window.setStatusBarMessage("");
    });

    context.subscriptions.push(findFiles);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;