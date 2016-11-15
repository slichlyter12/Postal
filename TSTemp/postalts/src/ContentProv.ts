'use strict';

import * as vscode from 'vscode';

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
        let text = editor.document.getText();
        return this.snippet(text);
    }


    private snippet(properties): string {
        let showTransGrid = vscode.workspace.getConfiguration('svgviewer').get('transparencygrid');
        let transparencyGridCss = '';
        //properties = "Hello I AM A THING";
        console.log('In snippet');
        return `<!DOCTYPE html><html><head>${transparencyGridCss}</head><body><div>${properties}</div></body></html>`;
    }
}