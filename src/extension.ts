'use strict';

import * as vscode from 'vscode';
import Uglifier from './Uglifier'
import keywords from './keywords.json'
import dictionary from './dictionary.json'

// const data = dictionary.map(m => {
// 	return (m.category);
//     });
    
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

