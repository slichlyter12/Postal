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
        //FIXME: not good for php parameters
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

    private taggedFound(match: any, lineNumber: number, rule: any, currentTokenID: number): any {

        // get title, if there is one
        var name = null;
        if (match[1] != undefined) {
            name = match[1];
        } else {
            name = rule.title;
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
            var matchObjects = [];
            for (var i = 0; i < rules.length; i++) {
                var regex = rules[i].regex;

                var match;
                while ((match = regex.exec(line)) != null) {
                    var matchObject = {
                        match: match,
                        rule: rules[i]
                    }

                    matchObjects.push(matchObject);
                }
            }

            matchObjects.sort(this.matchCompare);

            for (var i = 0; i < matchObjects.length; i++) {
                switch(matchObjects[i].rule.type) {
                    case "link":
                        tokens.push(this.linkFound(matchObjects[i].match[1], lineNumber));
                        break;
                    case "tagged":
                        tokens.push(this.taggedFound(matchObjects[i].match, lineNumber, matchObjects[i].rule, tokens.length));
                        break;
                    case "closingTag":
                        this.stack.pop();
                        break;

                    default: break;
                }
            }

            matchObjects = [];
        }



        return tokens;
    }

    private getRules(filetype: string): any {

        // get entire grammars file
        var grammarsFile = nodefs.readFileSync(__dirname + "/../../lib/grammars.json", "utf8");
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
                                rule.regex = new RegExp(rule.options.link, "g"); 
                                rules.push(rule);
                                break;
                            case "tagged":
                                var tagStart = rule.options.tagStart;
                                var tagEnd = rule.options.tagEnd;
                                var namedOption = "";
                                if (rule.options.namedOption) {
                                    namedOption = rule.options.namedOption;
                                }

                                // regex101: https://regex101.com/r/OKd7Hv/1
                                var regex = new RegExp(tagStart + ".*?(?:" + namedOption + ")?" + tagEnd, "g");
                                rule.regex = regex;
                                rules.push(rule);

                                // generate new rule for closing end
                                regex = new RegExp(rule.options.closingTag, "g");
                                var newRule = {
                                    title: rule.title + "closing tag",
                                    type: "closingTag",
                                    regex: regex
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

    private matchCompare(a, b) {
        if (a.match.index > b.match.index) {
            return 1;
        } else if (a.match.index < b.match.index) {
            return -1;
        } else {
            return 0;
        }
    }
}