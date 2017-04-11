'use strict'

import * as vscode from 'vscode';
import * as path from 'path';

// Node Dependencies
var nodefs = require('fs');

export class Parser {
    
    private stack: any = [];

    private fileName: string;

    public parse(filepath: string): any {

        // get filetype
        var filetype = this.getFiletype(filepath);

        //get file name
        this.fileName = this.nameSlicer(filepath);

        // get grammars
        var rules = this.getRules(filetype);

        // strip comments
        var content = this.stripComments(filepath);

        // get tokens
        var tokens = this.getTokens(content, rules);

        this.stack = [];

        return tokens;
    }

    private getFiletype(filepath: string): string {
        return filepath.slice(filepath.lastIndexOf(".") + 1);
    }


    private nameSlicer(path){
        var fileName;
        var isWin = /^win/.test(process.platform);
        if(isWin){
            fileName = path.slice(path.lastIndexOf("\\")+1)
        }
        else{
            fileName = path.slice(path.lastIndexOf("/")+1)
        }

        return fileName;
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

    private clikeFound(match: any, lineNumber: number, rule: any, currentTokenID: number): any {
        //get title
        var type = match[1];
        var name = match[2];
        name = type + " " + name;

        // switch(type) {
        //     case "if":
        //     case "else":
        //     case "while":
        //     case "for":
        //     case "foreach":
        //         return null;
            
        //     default: break;
        // }

        // switch(name) {
        //     case "if":
        //     case "else":
        //     case "while":
        //     case "for":
        //     case "foreach":
        //         return null;
            
        //     default: break;
        // }

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
   
    private notificationFound(match: any, lineNumber: number, rule: any, currentTokenID: number): any {
        //get title
        var notification = match[1];

        // figure out parentToken
        var parentToken = null;
        if (this.stack != null && this.stack.length > 0) {
            parentToken = this.stack[this.stack.length - 1];
        }

        var token = {
            tokenType: "notification",
            type: rule.title,
            value: rule.title + ": " + notification,
            lineNumber: lineNumber,
            parentToken: parentToken
        }

        return token;
    }

    
    private getLineNumber(file: string, charIndex: number): number {
        var lineNumber = 0;
        for (var i = 0; i < charIndex; i++) {
            if (file[i] == '\n') {
                lineNumber++;
            }
        }

        return lineNumber + 1;
    }

    private stripComments(filepath: string): string {
        // get file contents
        var content = nodefs.readFileSync(filepath, 'utf-8');

        // get filetype
        let filetype = this.getFiletype(filepath);

        // get comment grammars
        const settings = vscode.workspace.getConfiguration('Postal');
        let grammars = settings.grammars;
        var commentGrammars = [];
        for (var i = 0; i < grammars.length; i++) {
            if (grammars[i].type == "comment") {
                for (var j = 0; j < grammars[i].filetypes.length; j++) {
                    if (grammars[i].filetypes[j] == filetype) {
                        commentGrammars.push(grammars[i]);
                    }
                }
            }
        }

        for (var i = 0; i < commentGrammars.length; i++) {
            let start = commentGrammars[i].options.start
            let end = commentGrammars[i].options.end;
            if (end != undefined) {
                // block comment

                let regexString = "(" + start + "([\\s\\S])*?" + end + ")";
                let regex = new RegExp("(" + start + "([\\s\\S])*?" + end + ")");
                var match = regex.exec(content);
                
                // build replacement block with same number of newlines to preserve linecounter
                while (match != null) {
                    let matchBlock = match[0];
                    let newlineMatches = matchBlock.match(/\n/g);
                    
                    var replaceString = "";
                    if (newlineMatches != null) {
                        let numNewlines = newlineMatches.length;
                        for (var k = 0; k < numNewlines; k++) {
                            replaceString += "\n";
                        }
                    }
                    
                    content = content.replace(regex, replaceString);
                    match = regex.exec(content);
                }
            } else {
                // single line comment
                let startRegex = new RegExp("(" + start + ".*)");
                content = content.replace(startRegex, "");
            }
        }

        return content;
    }

    private getTokens(fileString: string, rules: any): any[] {
        var tokens = [];
        var file = fileString;
        var matchObjects = [];
        for (var i = 0; i < rules.length; i++) {
            var regex = rules[i].regex;

            var match;
            while ((match = regex.exec(file)) != null) {
                var matchObject = {
                    match: match,
                    rule: rules[i]
                }

                matchObjects.push(matchObject);
            }
        }

        matchObjects.sort(this.matchCompare);

        for (var i = 0; i < matchObjects.length; i++) {
            var lineNumber = this.getLineNumber(file, matchObjects[i].match.index);
            switch(matchObjects[i].rule.type) {
                case "link":
                    tokens.push(this.linkFound(matchObjects[i].match[1], lineNumber));
                    break;
                case "tagged":
                    tokens.push(this.taggedFound(matchObjects[i].match, lineNumber, matchObjects[i].rule, tokens.length));
                    break;
                case "close":
                    this.stack.pop();
                    break;
                case "c-like":
                    tokens.push(this.clikeFound(matchObjects[i].match, lineNumber, matchObjects[i].rule, tokens.length));
                    break;
                case "notification":
                    tokens.push(this.notificationFound(matchObjects[i].match, lineNumber, matchObjects[i].rule, tokens.length));
                    break;

                default: break;
            }
        }

        return tokens;
    }

    private getRules(filetype: string): any {

        // get entire grammars file
        const settings = vscode.workspace.getConfiguration('Postal');
        let grammars = settings.grammars;

        // pull out grammar rules for our filetype
        var rules = [];
        for (var i = 0; i < grammars.length; i++) {
            for (var j = 0; j < grammars[i].filetypes.length; j++) {
                if (grammars[i].filetypes[j] == filetype) {
                    var rule = grammars[i];
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
                                title: rule.title + " closing tag",
                                type: "close",
                                regex: regex
                            }
                            rules.push(newRule);

                            break;

                        case "c-like":
                            var openParameterChar = rule.options.openParameterChar;
                            var closeParameterChar = rule.options.closeParameterChar;
                            var openLogicChar = rule.options.openLogicChar;
                            var returnType;
                            var regex:RegExp;

                            // regex101: https://regex101.com/r/Prlgcn/1
                            if (rule.options.returnType != undefined && rule.options.returnType != null && rule.options.returnType != "") {
                                returnType = rule.options.returnType;
                                regex = new RegExp("(" + returnType + ")" + "\s*(\w*)\s*" + openParameterChar + ".+?" + closeParameterChar + "\s*" + openLogicChar, "g");
                            } else {
                                regex = new RegExp("(\\w+)\\s+(\\w+)\\s*\\" + openParameterChar + ".+?\\" + closeParameterChar + "\\s*\\" + openLogicChar, "g");
                            }

                            rule.regex = regex;
                            rules.push(rule);

                            // generate new rule for closing end
                            regex = new RegExp(rule.options.closeLogicChar, "g");
                            var newRule = {
                                title: rule.title + " closing bracket",
                                type: "close",
                                regex: regex
                            }
                            rules.push(newRule);

                            break;
                        
                        case "notification":
                            rule.regex = new RegExp(rule.options.notify, "g"); 
                            rules.push(rule);
                            break;
                        case "comment":
                            break;

                        default: 
                            console.log("Grammar Type Error");
                            break;
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