'use strict';

import * as vscode from 'vscode';
import Uglifier from './Uglifier';
import keywords from './keywords.json';
import dictionary from './dictionary.json';
import Variables from './Variables';

/**
 * Activate
 * @param Context
 */
export function activate(Context: vscode.ExtensionContext) {
    // vscode.workspace.onDidChangeTextDocument(parseKeys);

    registerProviders(Context);
    registerCommands(Context);
}

/**
 * Document Symbol Provider
 */
class PmlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken,
    ): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            const symbols: vscode.SymbolInformation[] = [];

            // This line is here purely to satisfy linter
            token = token;

            for (let i = 0; i < document.lineCount; i++) {
                let line = document.lineAt(i);
                let lineContent: string = line.text.trim();

                if (lineContent.toLowerCase().startsWith('define method .')) {
                    symbols.push({
                        name: line.text.substr(15),
                        containerName: '?',
                        kind: vscode.SymbolKind.Method,
                        location: new vscode.Location(document.uri, line.range),
                    });
                }

                if (lineContent.toLowerCase().startsWith('define function ')) {
                    symbols.push({
                        name: line.text.substr(16),
                        containerName: '?',
                        kind: vscode.SymbolKind.Function,
                        location: new vscode.Location(document.uri, line.range),
                    });
                }
            }

            resolve(symbols);
        });
    }
}

function registerProviders(Context: vscode.ExtensionContext) {
    const langs = vscode.languages;

    Context.subscriptions.push(langs.registerCompletionItemProvider('pml', new GeneralKeywords()));
    // Context.subscriptions.push(langs.registerCompletionItemProvider("pml", new GeneralMethods()));
    // Context.subscriptions.push(langs.registerCompletionItemProvider("pml", new VariableMethods(parseKeys())));
    Context.subscriptions.push(langs.registerDocumentSymbolProvider('pml', new PmlDocumentSymbolProvider()));
    Context.subscriptions.push(langs.registerCompletionItemProvider('pml', new DocumentMethods(), '!this.'));
}

function registerCommands(Context: vscode.ExtensionContext) {
    Context.subscriptions.push(Uglifier);
}

class DocumentMethods implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ) {
        const methods: Array<vscode.CompletionItem> = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            let lineContent: string = line.text.trim();

            if (lineContent.toLowerCase().startsWith('define method .')) {
                let methodName = line.text.substr(15);
                methods.push(new vscode.CompletionItem(methodName, vscode.CompletionItemKind.Method));
            }
        }

        return methods;
    }
}

class GeneralKeywords {
    provideCompletionItems(): vscode.CompletionItem[] {
        return keywords.map((keyword) => new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword));
    }
}
