'use strict';

import * as vscode from 'vscode';
import Uglifier from './Uglifier'
import keywords from './keywords.json'
import dictionary from './dictionary.json'

// const data = dictionary.map(m => {
// 	return (m.category);
//     });

var variables: string[] = [];

export function activate(context: vscode.ExtensionContext) {

    // Register Keywords
    let RegisterKeywords = vscode.languages.registerCompletionItemProvider('pml', {

        provideCompletionItems() {
            return keywords.map(keyword => {
                return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            });
        }
    });


    // Register General Methods
    let RegisterGeneralMethods = vscode.languages.registerCompletionItemProvider('pml', {

        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

            const filteredGeneralMethods = dictionary.filter(methods => methods.library === "General");
            let Methods = (filteredGeneralMethods[0].methods).map(method => {

                let item = new vscode.CompletionItem(method.label, vscode.CompletionItemKind.Method);

                if (method.snippet) {
                    item.insertText = new vscode.SnippetString(method.snippet);
                }

                if (method.md) {
                    item.documentation = new vscode.MarkdownString(method.md);
                }

                return item;

            });

            return Methods;
        }

    });

    context.subscriptions.push(RegisterKeywords, RegisterGeneralMethods, Uglifier);
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        { language: "pml" }, new PmlDocumentSymbolProvider()
    ));

    vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument);

}

export class PmlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            var symbols: any[] = [];

            // This line is here purely to satisfy linter
            token = token;

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);

                let lineTrimmed: string = line.text.trim();

                if (lineTrimmed.toLowerCase().startsWith("define method .")) {
                    symbols.push({
                        name: line.text.substr(15),
                        kind: vscode.SymbolKind.Method,
                        location: new vscode.Location(document.uri, line.range)
                    })
                }

                if (lineTrimmed.toLowerCase().startsWith("define function ")) {
                    symbols.push({
                        name: line.text.substr(16),
                        kind: vscode.SymbolKind.Function,
                        location: new vscode.Location(document.uri, line.range)
                    })
                }
            }

            resolve(symbols);
        });
    }
}

function onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    if (!vscode.window.activeTextEditor) {
        return; // no editor
    }

    let {
        document
    } = vscode.window.activeTextEditor;

    var lines = document.lineCount;

    var varString: { name: string, type: string, from: Number, to: Number | null, global: Boolean };
    var variables: any[] = [];

    for (let l = 0; l < lines; l++) {
        var lineContent = document.lineAt(l).text

        //replace consecutive spaces with one space
        lineContent = lineContent.replace(/[ ]{2,}/g, '')

        if (!lineContent.startsWith('--')) {
            var regex = /(?:^|[^!])!+(\w+)/g;
            var match;
            var type = "";
            var from = 0;
            var global;

            if (lineContent.toLowerCase().startsWith('define ') || lineContent.toLowerCase().startsWith('endmethod')) {

                variables.forEach(function (variable) {

                    //set "unclosed" variables valid until here
                    if (variable.to === null) {
                        variable.to = l;
                    }

                });

            }

            while (match = regex.exec(lineContent)) {
                if (match && match[1] != "this") {

                    var to = null;
                    from = l;

                    //set the global variable valid up to the end of the file
                    if (lineContent.includes('!!' + match[1])) {
                        global = true;
                        to = lines;
                    } else {
                        global = false;
                    }


                    if (lineContent.toLowerCase().startsWith('setup form')) {
                        type = "Form";
                    }

                    if (lineContent.toLowerCase().includes(' = object marui(')) {
                        type = "MarUi";
                    }

                    if (lineContent.toLowerCase().includes(' = object marutil(')) {
                        type = "MarUtil";
                    }

                    if (lineContent.toLowerCase().includes(' = object mardrafting(')) {
                        type = "MarDrafting";
                    }

                    if (lineContent.toLowerCase().includes(' = object marelementhandle(')) {
                        type = "MarElementHandle";
                    }

                    if (lineContent.toLowerCase().includes(' = object marmodel(')) {
                        type = "MarModel";
                    }

                    if (lineContent.toLowerCase().includes(' = object mardex(')) {
                        type = "MarDex";
                    }

                    if (lineContent.toLowerCase().includes(' = object marpanelschema(')) {
                        type = "MarPanelSchema";
                        from = l;
                    }

                    if (lineContent.toLowerCase().includes(' = object marhullpan(')) {
                        type = "MarHullPan";
                    }

                    if (lineContent.toLowerCase().includes(' = object netgridcontrol(')) {
                        type = "NetGridControl";
                    }

                    if (lineContent.toLowerCase().includes(' = object netdatasource(')) {
                        type = "NetDataSource";
                    }

                    if (lineContent.toLowerCase().includes(' = object marpythonengine(')) {
                        type = "MarPythonEngine";
                    }

                    if (lineContent.toLowerCase().includes(' = object pmlfilebrowser(')) {
                        type = "PMLFileBrowser";
                    }

                    if (lineContent.toLowerCase().includes(' = object file(')) {
                        type = "file";
                    }

                    if (lineContent.toLowerCase().includes(' = object datetime(')) {
                        type = "DateTime";
                    }

                    // add here something like var !x COLL
                    if (lineContent.toLowerCase().includes(' = object collection(')) {
                        type = "Collection";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is array') || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = array(') || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object array(')) {
                        type = "array";
                        from = l;
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is boolean') || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object boolean(') || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = true') || lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = false')) {
                        type = "boolean";
                        from = l;
                    }

                    //add here something like var !x USER|HOST|CLOCK ...
                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is string') || lineContent.includes(match[1] + " = '") || lineContent.includes(match[1] + " = |")) {
                        type = "string";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is gadget')) {
                        type = "gadget";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is real')) {
                        type = "real";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' is any')) {
                        type = "any";
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = current project')) {
                        type = "project";
                        from = l;
                    }

                    if (lineContent.toLowerCase().includes('!' + match[1].toLowerCase() + ' = object dbref(')) {
                        type = "DBRef";
                        from = l;
                    }


                    varString = {
                        name: match[1].toLowerCase(),
                        type: type,
                        from: from,
                        to: to,
                        global: global
                    };

                    var filtered = variables.filter(variable => (variable.name === varString.name && variable.to === varString.to));

                    if (filtered.length === 0) {
                        variables.push(varString);
                    }

                }

            }

        }

    }

    console.log(variables);

    return variables;
}