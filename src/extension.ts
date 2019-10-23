'use strict';

import * as vscode from 'vscode';

let _import = new vscode.CompletionItem('import', vscode.CompletionItemKind.Method);
_import.documentation = new vscode.MarkdownString("_Import Aveva .NET Library._");

let _handle = new vscode.CompletionItem('handle ()', vscode.CompletionItemKind.Method);
_handle.insertText = new vscode.SnippetString('handle (${1:0}, ${2:1000})');
_handle.documentation = new vscode.MarkdownString("_**Handle** Syntax can differentiate between specific error codes._");

let _handleany = new vscode.CompletionItem('handle any', vscode.CompletionItemKind.Method);
_handleany.documentation = new vscode.MarkdownString("_**Handle Any** Syntax can be used to capture All Errors_");

let _endhandle = new vscode.CompletionItem('endhandle', vscode.CompletionItemKind.Method);
_endhandle.documentation = new vscode.MarkdownString("_Closure for handle method_");

let _elsehandle = new vscode.CompletionItem('elsehandle', vscode.CompletionItemKind.Method);
_elsehandle.documentation = new vscode.MarkdownString("_**Elsehandle** is used to define the logic to be parsed if the Error is not in withing the handle scope._");

export function activate(context: vscode.ExtensionContext) {

    let provider1 = vscode.languages.registerCompletionItemProvider('pml', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            
            return [ 
                _import,
                _handle,
                _handleany,
                _endhandle,
                _elsehandle,
                ];
        }
    });


    let provider2 = vscode.commands.registerCommand("extension.pmlUglify", () => {
        if (!vscode.window.activeTextEditor) {
            return; // no editor
        }
        let {
            document
        } = vscode.window.activeTextEditor;

        var lines = document.lineCount;
        var lastLine = document.lineAt(lines - 1);
        var start = new vscode.Position(0, 0);
        var end = new vscode.Position(lastLine.lineNumber, lastLine.text.length);

        var variables: string[] = [];

        var newContent = "--<001>-- Published PML 1.0 SP1 >--\n";

        for (let l = 0; l < lines; l++) {
            var lineContent = document.lineAt(l).text

            //first we remove the commented lines
            lineContent = lineContent.replace(/[\s+]?--.*/g, '')

            // and the inline comments
            lineContent = lineContent.replace(/\$\*.*/g, '')

            //then we remove the comented blocks
            // Those start with "($""  and end with "$)"
            // I should mark the start and end of those and cut them off the result

            //then we perform some trimming
            lineContent = lineContent.replace(/^[ ]+|[	]+$/g, '')


            //replace consecutive spaces with only one space
            lineContent = lineContent.replace(/[ ]{2,}/g, '')

            var regex = /(?:^|[^!])!(\w+)/g;
            var match;
            var varString: string = "";

            while (match = regex.exec(lineContent)) {
                if (match && match[1] != "this") {

                    var newVar: string = "";

                    varString = match[1];

                    if (!variables.hasOwnProperty(varString)) {

                        var randVar = "v" + Array.apply(0, Array(20)).map(function () {
                            return (function (charset) {
                                return charset.charAt(Math.floor(Math.random() * charset.length))
                            }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'));
                        }).join('');

                        newVar = randVar;
              
                        setProperty(variables, varString, randVar);

                    } else {
                        newVar = getProperty(variables, varString);
                    }

                    lineContent = lineContent.replace("!" + varString, "!" + newVar);


                }
            }


            // Mess up the cases
            // TO DO: mess up with the cases outside quoted text (now the whole line is excluded based on some basic logic)
            if (lineContent.indexOf("'") == -1 && lineContent.indexOf("|") == -1 && lineContent.indexOf('"') == -1 && lineContent.indexOf("$P") == -1 && lineContent.indexOf("$p") == -1 && lineContent.indexOf("CE") == -1) {
                lineContent = randomizeCase(lineContent)
            }



            if (lineContent.length > 0) {
                newContent = newContent + lineContent.split("").reverse().join("") + "\n";
            }

        }

        var selection = new vscode.Selection(start, end);
        vscode.window.activeTextEditor.edit((builder) => {
            builder.replace(selection, newContent);
        });
        

        vscode.window.showInformationMessage('File Uglified!');

    });

    
    context.subscriptions.push( provider1, provider2);
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


export function randomizeCase(Str: string) {
    var Randomized = Str.split('').map(function (v) {
        var chance = Math.round(Math.random());
        return v = chance ? v.toUpperCase() : v.toLowerCase();
    }).join('');

    return Randomized;
}


// Set value on an item in a Array of Strings by providing the key name and the value
export function setProperty (ObjectName: string[], KeyName: any, value: string) {
    ObjectName[KeyName] = value;
}

// Retreive Item from Array of Strings by the key name
export function getProperty (ObjectName: string[], KeyName: any) {
    return ObjectName[KeyName];
}
