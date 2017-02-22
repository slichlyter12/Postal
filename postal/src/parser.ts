'use strict'

import * as vscode from 'vscode';
import * as path from 'path';

// Node Dependencies
var nodefs = require('fs');

export class Parser {

    /**
     * parse
     * Parameters:
     *      filepath: filepath of the file to parse
     * 
     * Return:
     *      tokens: an array of tokens
     */

    private stack: any = [];

    public parse(filepath: string): any {

        // get filetype
        var filetype = this.getFiletype(filepath);

        // get grammars
        var rules = this.getRules(filetype);

        // get tokens
        var tokens = this.getTokens(filepath, rules);

        this.stack = [];

        return tokens;
    }

    private getFiletype(filepath: string): string {
        return filepath.slice(filepath.lastIndexOf(".") + 1);
    }

    private linkFound(link: string, lineNumber: number): any {

        // figure out parentToken
        var parentToken = null;
        if (this.stack != null && this.stack.length > 0) {
            parentToken = this.stack[this.stack.length - 1];
        }

        // clean string for uri parameters
        var cleanedArray = [];
        for (var i = 0; i < link.length; i++) {
            if (link[i] != '?') {
                cleanedArray.push(link[i]);
            } else {
                break;
            }
        }
        var cleanedValue = cleanedArray.join("");

        var token = {
            tokenType: "link",
            type: null,
            value: cleanedValue,
            lineNumber: lineNumber,
            parentToken: parentToken
        }

        return token;
    }

    private taggedFound(line: string, lineNumber: number, rule: any, currentTokenID: number): any {

        // get title, if there is one
        var name = null;
        if (rule.options.namedOption != null) {
            name = line.match(rule.options.namedOption);
        } 
        if (name == null) {
            name = rule.title;
        } else {
            name = name[1];
        }

        // figure out parentToken
        var parentToken = null;
        if (this.stack != null && this.stack.length > 0) {
            parentToken = this.stack[this.stack.length - 1];
        }

        var token = {
            tokenType: "node",
            type: rule.title,
            value: name,
            lineNumber: lineNumber,
            parentToken: parentToken
        }

        this.stack.push(currentTokenID);

        return token;
    }

    private getTokens(filepath: string, rules: any): any[] {
        var tokens = [];
        var file = nodefs.readFileSync(filepath, 'utf-8').split('\n');
        var lineNumber = 0;
        for (var j = 0; j < file.length; j++) {
            var line = file[j];
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
                            tokens.push(this.taggedFound(line, lineNumber, rules[i], tokens.length));
                            break;
                        case "closingTag":
                            this.stack.pop();
                            break;

                        default: break;
                    }
                }
            }
        }

        return tokens;
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

                                // generate new rule for closing end
                                var newRule = {
                                    title: rule.title + "closing tag",
                                    type: "closingTag",
                                    regex: rule.options.closingTag
                                }
                                rules.push(newRule);

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