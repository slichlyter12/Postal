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

        // get filetype
        var filetype = this.getFiletype(filepath);

        // get grammars
        var grammars = this.getGrammars(filetype);
    }

    private getFiletype(filepath: string): string {
        return filepath.slice(filepath.lastIndexOf(".") + 1);
    }

    private buildRegex(rules: any): any {

        var regex = [];
        for (var i = 0; i < rules.length; i++) {
            switch (rules[i].type) {
                case "link":
                    regex.push(rules[i].options.link)
                    break;
                case "tagged":

            }
        }

        return regex;
    }

    private getGrammars(filetype: string): any {

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
                                break;
                            case "tagged":
                                
                                //rule.regex = 
                                break;
                        }
                        rules.push(rule);
                    }
                }
            }
        }

        // build regex from user
        for (var i = 0; i < rules.length; i++) {

        }

        return rules;
    }
}