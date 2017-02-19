'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process'
import { ContentProv } from './ContentProv';

// This is Node.js Code ...
const readline = require('readline');
const fileSystem = require('fs');

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron');

var isWin = /^win/.test(process.platform);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let provider = new ContentProv();

    let registration = vscode.workspace.registerTextDocumentContentProvider('Files', provider);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let parse = vscode.commands.registerCommand('extension.parse', () => {
        // GET GRAMMARS
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
        var grammars = JSON.parse(grammarsFile);

        //GET FILES TO PARSE
        var files = [];
        for (var i = 0; i < grammars.grammars.length; i++) {
            for (var j = 0; j < grammars.grammars[i].filetypes.length; j++) {
                files.push(vscode.workspace.findFiles("*" + grammars.grammars[i].filetypes[j], ''));
            }
        }
        var pathHolder = [];
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
                                    
                                    //Store array of all paths of files in current directory
                                    pathHolder.push(foundFiles[b].path);
                                    
                                   /* for(var c = 0; c < foundFiles.length; c++){
                                        if(found != null){
                                            foundLinks.push(c)
                                        }
                                    }
                                    */
                                    if(found != null){
                                        //linkHolder.push(foundFiles[b].path.slice(foundFiles[b].path.lastIndexOf("/")+1));
                                        
                                        //console.log(JSON.stringify(foundLinks));
                                        linkHolder.push(found);
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

                //Setting up DataStruct data
                var pathHolderU = pathHolder.filter( onlyUnique ); //remove duplicate path names from when parser ran multiple times

                //Get NAMES from end of path string
                var dirHolder = []; //This will receive all folders in cwd
                var nameHolder = []; //All names from end of pathHolderU
                var hrefNameHolder = []; //Contains all found href link names that aren't in cwd

                pathHolderU.forEach(function(path, index){
                    nameHolder.push(pathHolderU[index].slice(pathHolderU[index].lastIndexOf("/")+1));
                });

                var allNamesHolder = dirHolder.concat(nameHolder, hrefNameHolder); //Combine directory, file, and discovered href names
                console.log(JSON.stringify(allNamesHolder));

                //Get LINKS
                linkHolder = linkHolder.slice(0, nameHolder.length);
                var catLinkHolder = []; //Same as link Holder but each internal string is reduced to filename and extension
                var idLinkHolder = []; //Contains ids of catLinkHolder
                var fakeDirLinkHolder = [];
                var fakeHrefLinkHolder = [];

                for(i = 0; i <linkHolder.length; i++ ){
                    for(j = 0; j < linkHolder[i].length; j++){
                        catLinkHolder.push([]);
                        idLinkHolder.push([]);

                    }
                }
                //1 Too many empty arrays
                catLinkHolder.shift();
                idLinkHolder.shift();


                for(i = 0; i <linkHolder.length; i++ ){
                    for(j = 0; j < linkHolder[i].length; j++){
                        if(linkHolder[i] != null){
                            linkHolder[i][j] = linkHolder[i][j].slice(linkHolder[i][j].indexOf("\"")+1, linkHolder[i][j].lastIndexOf(".")+4);
                            catLinkHolder[i] = linkHolder[i].filter( onlyUnique );

                            if(nameHolder.includes(catLinkHolder[i][j])){
                                
                                idLinkHolder[i][j] = nameHolder.indexOf(catLinkHolder[i][j]);
                            }
                            else{
                                //Create Node Here
                                idLinkHolder[i].shift(); //WROOOONG
                            }
                        }
                        else{
                            catLinkHolder[i].push([]);
                        }
                    }
                } 
                

                dirHolder.forEach(function(name, index){
                    fakeDirLinkHolder.push([]);
                });

                hrefNameHolder.forEach(function(name, index){
                    fakeHrefLinkHolder.push([]);
                });
                //idLinkHolder.slice(0, nameHolder.length);
                var allLinksHolder = fakeDirLinkHolder.concat(idLinkHolder, fakeHrefLinkHolder);
                console.log(JSON.stringify(catLinkHolder));
                console.log(JSON.stringify(allLinksHolder));

                //Get IDS from the list of allNamesHolder
                var idHolder = [];
                allNamesHolder.forEach(function(name, index) {
                    idHolder.push(index);
                });
                //console.log(JSON.stringify(idHolder));

                //Get LEVELS from pathHolderU and allNamesHolder
                var dirLevelsHolder = [];
                var nameLevelsHolder = [];
                var hrefLevelsHolder = [];
                var topSlashCounter = (pathHolderU[0].match(/\//g) || []).length; //Finds the number of backslashes in the path of the first files, ie number of slashes in top directory
                /*****************************/
                ////////CHANGE WHEN DIRECTORIES ARE WORKING. Can't assume names are top level, have to compare names and directories for which has fewest slashes
                /*****************************/

                pathHolderU.forEach(function(path, index){
                    var currSlashCounter = (pathHolderU[index].match(/\//g) || []).length; //If same as topSlashCounter, at level 0
                    nameLevelsHolder.push(currSlashCounter - topSlashCounter);
                });

                var allLevelsHolder = dirLevelsHolder.concat( nameLevelsHolder, hrefLevelsHolder); //Combine directory, file, and discovered href levels
                //console.log(JSON.stringify(allLevelsHolder));
                                                 
                //Get TYPES from allNamesHolder
                var typeHolder = [];
                allNamesHolder.forEach(function(name, index) {
                    typeHolder.push(name.slice(name.lastIndexOf(".")+1));
                });
                //console.log(JSON.stringify(typeHolder));


                var jsonHolder = {};
                var FileData = {};
                var FileStructs = [];
                var ErrorStructs = [];
                var matchedLinks = [];

                

                idHolder.forEach(function(id, index) {
                    FileStructs.push({
                            id: idHolder[index],
                            level: allLevelsHolder[index],
                            name: allNamesHolder[index],
                            type: typeHolder[index],
                            links: allLinksHolder[index],
                            errors: []
     
                    })
                    ErrorStructs.push({

                    })
                });

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

    // This is how I am testing my code. -Cramer
    let errorHighLight = vscode.commands.registerCommand('extension.error', () => {
        LineParser('/Users/TheCmar7/Developer/random/maze-generator/mazegenerator.js', 'if')
    });

    context.subscriptions.push(errorHighLight);
    context.subscriptions.push(parse);
}


var LineParser = function(filepath :string, regex :string) {

    const rl = readline.createInterface({
        input: fileSystem.createReadStream(filepath)
    });
    
    var linesFound = []
    var lineCount = 0; 

    rl.on('line', function (line) {
        lineCount++; 
        var found = line.match(regex)
        if (found != null) {
            found.push(lineCount);
            linesFound.push(found);    
            console.log(linesFound);
        } 
    });


    // // split on new line (will need different for UNIX or Windows)
    // var split = '';
    // if (isWin) {
    //     split = "\Crlf";
    // } else {
    //     split = "\n";
    // } 

    // // loop through array of lines

    //     // if line has regex add to ret dictionary

    // // return ret dictionary

} 


// this method is called when your extension is deactivated
export function deactivate() {}