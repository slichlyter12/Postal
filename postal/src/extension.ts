'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process'
import { ContentProv } from './ContentProv';


var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron-prebuilt');

var isWin = /^win/.test(process.platform);

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
    let parse = vscode.commands.registerCommand('extension.parse', () => {
        // GET GRAMMARS
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
        var grammars = JSON.parse(grammarsFile);

        // GET ALL FILES:
        var allFiles = vscode.workspace.findFiles('*', '');
        allFiles.then(function(foundFiles) {
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
        var foundLinks = [];

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        // FIXME: PARSE LOGIC
        for (var a = 0; a < files.length; a++) {
            files[a].then(function(foundFiles) {

                for (var i = 0; i < grammars.grammars.length; i++) { // loop through grammars
                    for (var k = 0; k < grammars.grammars[i].regex.length; k++) { // loop through regular expressions within each grammar
                        for (var key in grammars.grammars[i].regex[k]) { // trick to use a key-value pair in the JSON, utilizes a loop: always 1 run through
                            if (grammars.grammars[i].regex[k].hasOwnProperty(key)) { // continuation of trick; see line above ^^
                                //console.log(grammars.grammars[i].regex[k][key] + " -> " + key);

                                for (var b = 0; b < foundFiles.length; b++) { // loop through each file, should be of a set of specific filetypes defined in grammar

                                    // get regular expression and run it
                                    var regexString = grammars.grammars[i].regex[k][key];
                                    var regex = new RegExp(regexString, 'g');
                                    var content;
                                    if (isWin) {
                                        content = nodefs.readFileSync(foundFiles[b].path.slice(1), 'utf8');
                                    } else {
                                        content = nodefs.readFileSync(foundFiles[b].path, 'utf8');
                                    }
                                    var found = content.match(regex);

                                    // add files to name holder array
                                    // FIXME ??
                                    //
                                    nameHolder.push(foundFiles[b].path.slice(foundFiles[b].path.lastIndexOf("/")+1));
                                    for(var c = 0; c < foundFiles.length; c++){
                                        if(found != null){
                                            foundLinks.push(c)
                                        }
                                    }
                                    
                                    if(found != null){
                                        //linkHolder.push(foundFiles[b].path.slice(foundFiles[b].path.lastIndexOf("/")+1));
                                        
                                        console.log(JSON.stringify(foundLinks));
                                        linkHolder.push(foundLinks);
                                        
                                    }
                                    else{
                                        linkHolder.push([]);
                                    }
                                    foundLinks = [];
                                }
                            }
                        }
                    }
                }
                console.log(JSON.stringify(linkHolder));
                //Writing to DataStruct.json

                var nameHolderUnique = nameHolder.filter( onlyUnique );


                var jsonHolder = {};
                var FileData = {};
                var FileStructs = [];
                var ErrorStructs = [];
                var matchedLinks = [];

                

                for(var x = 0; x < nameHolderUnique.length; x++){
                    for(var y = 0; y < linkHolder.length; y++){
                        if(nameHolderUnique[x] == linkHolder[y]){
                            matchedLinks[x] = linkHolder[y+1];
                            /*if(matchedLinks[x].includes(nameHolderUnique[x])){
                                matchedLinks[x].push({FileStructsid: x})
                            }*/
                            y++;
                        }
                    }  
                    //console.log(JSON.stringify(matchedLinks));
                    FileStructs.push({
                            id: x,
                            level: 0,
                            name: nameHolderUnique[x],
                            type: nameHolderUnique[x].slice(nameHolderUnique[x].lastIndexOf(".")+1),
                            links: linkHolder[x],
                            errors: []
     
                    })
                    ErrorStructs.push({

                    })
                }

                FileData = {FileStructs, ErrorStructs};
                jsonHolder = JSON.stringify({FileData});

                nodefs.writeFileSync(__dirname + "/../../postal.json", jsonHolder, 'utf8');

                //console.log(JSON.stringify(nameHolder.filter( onlyUnique )));
                //console.log(JSON.stringify(linkHolder));


                return 0;
            });
        }

        // Start the Electron app
        var filePath;
        if (isWin) {
            filePath = `${__dirname}/../../`.slice(1);
        } else {
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

        try {
            var command;
            if (isWin) {
                command = './node_modules/.bin/electron.cmd';
            } else {
                command = './node_modules/.bin/electron';
            }
            var cwd = path.join(__dirname, '../../lib/app');

            command = command.replace(/\//g, path.sep);
            cwd = cwd.replace(/\//g, path.sep);

            var spawn_env = JSON.parse(JSON.stringify(process.env));

            // remove those env vars
            delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
            delete spawn_env.ELECTRON_RUN_AS_NODE;

            var sp = spawn(command, ['.'], {cwd: cwd, env: spawn_env});
        } catch (error) {
            console.log("Electron Error: " + error);
        }

    });


    context.subscriptions.push(parse);
}

// this method is called when your extension is deactivated
export function deactivate() {}