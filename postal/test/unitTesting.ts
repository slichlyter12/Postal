'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process'
import { Controller } from '../src/controller';
import { Parser } from '../src/parser';

// testing 
var RandExp = require('randexp');

var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');
var childProcess = require('child_process');
var electronp = require('electron');
var find = require('find');

var isWin = /^win/.test(process.platform);

/*
     This is the unit tests for the two classes that do a huge amount of the work. 
*/

/* 
     Tests for the parser 
        Parser.parse(filepath: string) -> tokens

        token object:
            - tokenType: string
            - type: string
            - value: string
            - lineNumber: number 
            - parentToken: token

    I am going to export this function to a test command within the extension 
    it can be removed once I am finished.
*/

export function tests_main() {
    //test_parse_empty();
    var output = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 300; i++) {
        //output[random(1, output.length) - 1]++;
        output[random(1, output.length / 2) + random(1, output.length / 2) - 2]++;
    }
    for (var i = 0; i < output.length; i++) {
        var outputs : string = (i + 1)  + " |";
        for (var j = 0; j < output[i]; j++) {
            outputs = outputs + "+";  
        }
        console.log(outputs);
    } 
    output[i]
}

function test_parse_empty() {
    let TestParser = new Parser;

    // let it be noted you need the whole file path for the parser to parse
    var filename = "/Users/TheCmar7/Desktop/college/Senior Project/Postal/postal/test/testFiles/emptyFile";
    var result = TestParser.parse(filename);

    if (result.length == 0) {
        console.log("parse empty file: Passed");
    } else {
        console.log("parse empty file: failed");
        console.log(result);
    }
} 

function test_parse_short_file() {

}

function generate_files_with_grammars() {
    var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
    var g = JSON.parse(grammarsFile);

    /* for each object grammar */
    for (var gram = 0; gram < g.grammars.length; gram++) {
        // for each rule
        for (var r = 0; r < g.grammars[gram].rules.length; r++) {
            // generate a random string that matches rule
            var gen; 
            if (g.grammars[gram].rules[r].type == "link") {
                var rand = new RandExp(g.grammars[gram].rules[r].options.link).gen();
                gen = rand; 
            } else if (g.grammars[gram].rules[r].type == "tagged") {
                if (g.grammars[gram].rules[r].options.namedOption != null) {
                    gen = generate_recursive_tagged(g.grammars[gram].rules[r].options, 8);
                } else {
                    gen = g.grammars[gram].rules[r].options.tagStart;
                    gen = gen + g.grammars[gram].rules[r].options.tagEnd;
                    gen = gen + g.grammers[gram].rules[r].options.closingTag;
                }
            }
            console.log(gen);
        }
    } 
}

function generate_recursive_tagged(obj, num: number) :string {
    var ret :string  = ""
    if (num == 0) {
        return ret;
    } else {
        ret = obj.tagStart + " " + new RandExp(obj.namedOption).gen() + " " + obj.tagEnd;
        ret = ret + "\n" + generate_recursive_tagged(obj, num - 1) + " " + obj.closingTag;
    }
    return ret;
}

function random(min: number, max: number) {
    return Math.floor((Math.random() * max) + min);    
}




