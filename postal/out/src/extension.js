'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const ContentProv_1 = require("./ContentProv");
const controller_1 = require("./controller");
const unitTesting_1 = require("../testing/unitTesting");
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
function activate(context) {
    let provider = new ContentProv_1.ContentProv();
    let controller = new controller_1.Controller();
    let registration = vscode.workspace.registerTextDocumentContentProvider('Files', provider);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let parse = vscode.commands.registerCommand('extension.parse', () => {
        //NEW PARSER STUFF
        controller.buildDataStructure();
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
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map