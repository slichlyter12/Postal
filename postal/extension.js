// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
let vscode = require('vscode');

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
    let disposable = vscode.commands.registerCommand('extension.sayHello', function() {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Sam is a silly muffin!');
        //console.log('This is how the extension do '.concat(intCounter));
        intCounter = intCounter + 1;

        // Thenable<Uri[]> What is a thenable<uri[]>?
        //     -> https://code.visualstudio.com/Docs/extensionAPI/vscode-api#Thenable
        //        A thenable that resolves to an array of resource identifiers.
        var files;
        var filesThen;
        var filesArray = [];
        files = vscode.workspace.findFiles('*', 'hi');

        // Found a website that gave me this https://spring.io/understanding/javascript-promises
        // Thenables/Promises run asynchronously, therefore this finishes AFTER the following 
        // print statements of filesArray and theFilesArray
        var theFilesArray = files.then(function(gettingTheFiles) {
            gettingTheFiles.forEach(function(fileInfo) {
                //console.log(typeof(fileInfo.path));
                console.log(fileInfo.path);
                filesArray.push(fileInfo.path);
            });
            return (gettingTheFiles);
        });

        console.log("theFilesArray:");
        console.log(theFilesArray);
        console.log("filesArray:");
        console.log(filesArray);
        
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;