'use strict';
const vscode = require("vscode");
var fs = require('file-system');
class ContentProv {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri) {
        return this.createProvSnippet();
    }
    createProvSnippet() {
        return this.extractSnippet();
    }
    extractSnippet() {
        let editor = vscode.window.activeTextEditor;
        var text = fs.readFileSync(vscode.workspace.rootPath + "/dirStructure.html", 'utf8');
        return this.snippet(text);
    }
    snippet(properties) {
        return properties;
    }
}
exports.ContentProv = ContentProv;
//# sourceMappingURL=ContentProv.js.map