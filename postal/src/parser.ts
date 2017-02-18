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

        
    }

    private getFiletype(filepath: string): string {
        return filepath.slice(filepath.lastIndexOf(".") + 1);
    }
}