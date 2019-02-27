// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


    let allItems = [
        "import ",
        "handle ",
        "handle any",
        "endhandle",
        "elsehandle ",
        "object ",
        "before()",
        "after()"
    ];

    const disposable = vscode.languages.registerCompletionItemProvider('pml', {
        provideCompletionItems(document, position, token, context) {
            let items = [];
            allItems.forEach(key => {
                let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Value);
                items.push(item);
            });

            return items;
        }
    });

    // register a new command
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.pmlUglify", () => {
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

            var variables = {};

            var newContent = "--<001>-- Published PML 1.0 SP1 >--\n";

            for (let l = 0; l < lines; l++) {
                var lineContent = document.lineAt(l).text

                //first we remove the commented lines
                lineContent = lineContent.replace(/[\s+]?--.*/g, '')

                //then we remove the comented blocks
                // Those start with "($""  and end with "$)"
                // I should mark the start and end of those and cut them off the result

                //then we perform some trimming
                lineContent = lineContent.replace(/^[ ]+|[	]+$/g, '')


                //replace consecutive spaces with only one space
                lineContent = lineContent.replace(/[ ]{2,}/g, '')

                var regex = /(?:^|[^!])!(\w+)/g;
                var match;
                var varString = "";

                while (match = regex.exec(lineContent)) {
                    if (match && match[1] != "this") {

                        var newVar = "";

                        varString = match[1];

                        if (!variables.hasOwnProperty(varString)) {

                            var randVar = "v" + Array.apply(0, Array(20)).map(function () {
                                return (function (charset) {
                                    return charset.charAt(Math.floor(Math.random() * charset.length))
                                }('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'));
                            }).join('');

                            newVar = randVar;


                            var NewObject = {
                                [varString]: randVar,
                            };

                            variables = Object.assign(variables, NewObject);

                        } else {
                            newVar = variables[varString];
                        }

                        lineContent = lineContent.replace(varString, newVar);


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

            //console.log(variables);


            var selection = new vscode.Selection(start, end);
            vscode.window.activeTextEditor.edit((builder) => {
                builder.replace(selection, newContent);
            });





            vscode.window.showInformationMessage('File Uglified!');
        })
    );






}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}




function randomizeCase(Str) {
    var Randomized = Str.split('').map(function (v) {
        var chance = Math.round(Math.random());
        return v = chance ? v.toUpperCase() : v.toLowerCase();
    }).join('');

    return Randomized;
}