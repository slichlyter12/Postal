'use strict'

import * as vscode from 'vscode';
import * as path from 'path';

// Node Dependencies
var open = require('open');
var fs = require('file-system');
var nodefs = require('fs');
var cwd = require('cwd');

export class Parser {

    /**
     * parse
     * Parameters:
     *      filepath: filepath of the file to parse
     * 
     * Return:
     *      tokens: an array of tokens
     */

    public parse(filepath: string) {

        var tokens;

        // get filetype
        var filetype = this.getFiletype(filepath);

        // get grammars
        var rules = this.getRules(filetype);

        // read file
        var file = nodefs.readFileSync(filepath, 'utf-8').split('\n');
        var lineNumber = 0;
        for (var line in file) {
            lineNumber++;
            for (var i = 0; i < rules.length; i++) {
                var regex = rules[i].regex;
                var match = line.match(regex);
                if (match != null) {
                    switch(rules[i].type) {
                        case "link":
                            tokens.push(this.linkFound(match[1], lineNumber));
                            break;
                        case "tagged":
                            
                            break;

                        default: break;
                    }
                }
            }
        }
    }

    private getFiletype(filepath: string): string {
        return filepath.slice(filepath.lastIndexOf(".") + 1);
    }

    private linkFound(link: string, lineNumber: number): any {
        var token = {
            tokenType: "link",
            type: null,
            value: link,
            lineNumber: lineNumber,
            subTokens: []
        }

        return token;
    }

    private getRules(filetype: string): any {

        // get entire grammars file
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../src/grammars.json", "utf8");
        var grammars = JSON.parse(grammarsFile);

        // pull out grammar rules for our filetype
        var rules = [];
        for (var i = 0; i < grammars.grammars.length; i++) {
            for (var j = 0; j < grammars.grammars[i].filetypes.length; j++) {
                if (grammars.grammars[i].filetypes[j] == filetype) {
                    for (var k = 0; k < grammars.grammars[i].rules.length; k++) {
                        
                        var rule = grammars.grammars[i].rules[k];
                        switch (rule.type) {
                            case "link": 
                                rule.regex = rule.options.link; 
                                rules.push(rule);
                                break;
                            case "tagged":
                                rule.regex = rule.options.tagStart;
                                rules.push(rule);
                                break;

                            default: 
                                console.log("Grammar Type Error");
                                break;
                        }
                    }
                }
            }
        }

        return rules;
    }
}