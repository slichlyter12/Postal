// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
let vscode = require('vscode');
let fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "postal" is now active!');


    var intCounter = 0


    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let FindFiles = vscode.commands.registerCommand('extension.findFiles', function() {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        //vscode.window.showInformationMessage('Running Postal...');
        vscode.window.setStatusBarMessage("Running Postal...");

        // Thenable<Uri[]> What is a thenable<uri[]>?
        //     -> https://code.visualstudio.com/Docs/extensionAPI/vscode-api#Thenable
        //        A thenable that resolves to an array of resource identifiers.
        var files = vscode.workspace.findFiles('*', 'hi');
        files.then(function(foundFiles) {
            console.log("foundFiles");
            console.log(foundFiles);
        });

        var cwd = vscode.workspace.rootPath;
        console.log("cwd:");
        console.log(cwd);

        var textDocuments = vscode.workspace.textDocuments;
        console.log("textDocuments:");
        console.log(textDocuments);
        
        vscode.window.setStatusBarMessage("");
    });

    context.subscriptions.push(FindFiles);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;