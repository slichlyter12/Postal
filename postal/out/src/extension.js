'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const ContentProv_1 = require("./ContentProv");
var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron-prebuilt');
var isWin = /^win/.test(process.platform);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // get filepath and create file
    var htmlFilePath = vscode.workspace.rootPath;
    htmlFilePath += "/dirStructure.html";
    fs.writeFile(htmlFilePath, "\n", function (error) {
        if (error) {
            console.error("Error creating dirStructure.html");
        }
    });
    let previewUri = vscode.Uri.parse("Files://" + htmlFilePath);
    let provider = new ContentProv_1.ContentProv();
    let registration = vscode.workspace.registerTextDocumentContentProvider('Files', provider);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.postal', () => {
        // The code you place here will be executed every time your command is executed
        // generate html list of files
        var files = vscode.workspace.findFiles('*', '');
        files.then(function (foundFiles) {
            // start/create file
            var htmlOpen = "<!DOCTYPE html><html><head><title>Files</title></head><body><ul>\n";
            fs.writeFile(htmlFilePath, htmlOpen, function (error) {
                if (error) {
                    console.error("Failed to write opening HTML\nerror: " + error);
                }
            });
            // add file names to list
            foundFiles.forEach(function (file) {
                if (file.path != htmlFilePath) {
                    let html = "<li>" + file + "</li>\n";
                    fs.appendFile(htmlFilePath, html, function (error) {
                        if (error) {
                            console.error("Failed to write " + file + ", html: " + html + "\nerror: " + error);
                        }
                    });
                }
            });
            // end file
            var htmlClose = "</ul></body></html>\n";
            fs.appendFile(htmlFilePath, htmlClose, function (error) {
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
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
        var grammars = JSON.parse(grammarsFile);
        // GET ALL FILES:
        var allFiles = vscode.workspace.findFiles('*', '');
        allFiles.then(function (foundFiles) {
            //DO STUFF WITH ALL FILES
            //console.log(JSON.stringify(allFiles));
        });
        //GET FILES TO PARSE
        var files = [];
        for (var i = 0; i < grammars.grammars.length; i++) {
            for (var j = 0; j < grammars.grammars[i].filetypes.length; j++) {
                files.push(vscode.workspace.findFiles("*" + grammars.grammars[i].filetypes[j], ''));
            }
        }
        var nameHolder = [];
        var linkHolder = [];
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        // FIXME: PARSE LOGIC
        for (var a = 0; a < files.length; a++) {
            files[a].then(function (foundFiles) {
                for (var i = 0; i < grammars.grammars.length; i++) {
                    for (var k = 0; k < grammars.grammars[i].regex.length; k++) {
                        for (var key in grammars.grammars[i].regex[k]) {
                            if (grammars.grammars[i].regex[k].hasOwnProperty(key)) {
                                //console.log(grammars.grammars[i].regex[k][key] + " -> " + key);
                                for (var b = 0; b < foundFiles.length; b++) {
                                    var regexString = grammars.grammars[i].regex[k][key];
                                    var regex = new RegExp(regexString, 'g');
                                    var content;
                                    if (isWin) {
                                        content = nodefs.readFileSync(foundFiles[b].path.slice(1), 'utf8');
                                    }
                                    else {
                                        content = nodefs.readFileSync(foundFiles[b].path, 'utf8');
                                    }
                                    var found = content.match(regex);
                                    nameHolder.push(foundFiles[b].path.slice(foundFiles[b].path.lastIndexOf("/") + 1));
                                    if (found != null) {
                                        linkHolder.push(foundFiles[b].path.slice(foundFiles[b].path.lastIndexOf("/") + 1));
                                        linkHolder.push(found);
                                    }
                                }
                            }
                        }
                    }
                }
                //Writing to DataStruct.json
                var nameHolderUnique = nameHolder.filter(onlyUnique);
                var jsonHolder = {};
                var FileData = {};
                var FileStructs = [];
                var ErrorStructs = [];
                for (var x = 0; x < nameHolderUnique.length; x++) {
                    FileStructs.push({
                        id: x,
                        level: 0,
                        name: nameHolderUnique[x],
                        type: nameHolderUnique[x].slice(nameHolderUnique[x].lastIndexOf(".") + 1),
                        links: []
                    });
                }
                FileData = { FileStructs, ErrorStructs };
                jsonHolder = JSON.stringify({ FileData });
                nodefs.writeFileSync(__dirname + "/../../postal.json", jsonHolder, 'utf8');
                console.log(JSON.stringify(nameHolder.filter(onlyUnique)));
                //console.log(JSON.stringify(linkHolder));
                return 0;
            });
        }
        // Start the Electron app
        var filePath;
        if (isWin) {
            filePath = `${__dirname}/../../`.slice(1);
        }
        else {
            filePath = `${__dirname}/../../`;
        }
        //console.log(filePath);
        //var p = childProcess.spawn(electronp, [filePath + 'main.js']);
        //console.log(p);
        //console.log("children");
        // exec('electron main.js', (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`exec error: ${error}`);
        //         return;
        //     }
        //     console.log(`stdout: ${stdout}`);
        //     console.log(`stderr: ${stderr}`);
        // });
    });
    context.subscriptions.push(parse);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map