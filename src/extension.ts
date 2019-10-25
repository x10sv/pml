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

                let item =  new vscode.CompletionItem(method.label, vscode.CompletionItemKind.Method);

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
   
    context.subscriptions.push( RegisterKeywords, RegisterGeneralMethods, Uglifier);
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        {language: "pml"}, new PmlDocumentSymbolProvider()
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
    
    var varString: {name: string, type: string, from: Number, to: Number | null, global: Boolean};
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

            // if (lineContent.toLowerCase().startsWith('define ')) {
            //     // set all empty to to: l-1
            //     let OpenVars = variables.filter(variable => (variable.name !== varString.name && variable.to !== null));
                
            //     (OpenVars[0]).name.map((variable: { to: number; }) => {
            //         variable.to = l-1;

            //         return variable;
            //     }
                
            // }
            
            while (match = regex.exec(lineContent)) {
                if (match && match[1] != "this") {
    
                    var to = null;

                    if (lineContent.toLowerCase().startsWith('setup form')) {
                        type = "Form";
                        from = l;
                    }
    
                    if (lineContent.toLowerCase().includes(' = object marui()')) {
                        type = "MarUi";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object marutil()')) {
                        type = "MarUtil";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object mardrafting()')) {
                        type = "MarDrafting";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object marelementhandle()')) {
                        type = "MarElementHandle";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object marmodel()')) {
                        type = "MarModel";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object marpanelschema()')) {
                        type = "MarPanelSchema";
                        from = l;
                    }
                    
                    if (lineContent.toLowerCase().includes(' = object marhullpan()')) {
                        type = "MarHullPan";
                        from = l;
                    }
    
                    if (match[1].startsWith('!!')) {
                        global = true;
                    }else {
                        global = false;
                        to = lines;
                    }
                    
    
                    varString = {
                        name: match[1],
                        type: type,
                        from: from,
                        to: to,
                        global: global
                    };    
                    
                    if (variables.filter(variable => (variable.name !== varString.name && variable.to !== null))) {
                        variables.push(varString);
                    }
                    
                }
            
            }

        }

    }

    console.log(variables);

    return variables;
}