'use strict';

import * as vscode from 'vscode';

var fs = require('file-system');

export class ContentProv implements vscode.TextDocumentContentProvider {

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    public provideTextDocumentContent(uri: vscode.Uri): string {
        console.log('In Doc Content');
        return this.createProvSnippet();
    }

    private createProvSnippet() {
        return this.extractSnippet();
    }

    private extractSnippet(): string {
        let editor = vscode.window.activeTextEditor;
        var text = fs.readFileSync(vscode.workspace.rootPath + "/dirStructure.html", 'utf8');
        return this.snippet(text);
    }

    private snippet(properties): string {
        console.log('In snippet');
        return properties;
    }
}