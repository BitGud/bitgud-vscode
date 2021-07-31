// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
let linenumbersVisited = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

// generates a unique linenumber
function generateLineNumber(lc) {
    if (linenumbersVisited.length === lc) {
        return -1;
    }

    let ln = Math.floor(Math.random()*lc);
    if (!linenumbersVisited.includes(ln)) {
        linenumbersVisited.push(ln);
        return ln;
    } else {
        return generateLineNumber(lc);
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "bitgud" is now active!');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('bitgud.insult', function () {
		// The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;

        const insults = [
            'You Suck!',
            'Code? More like smode.',
            'You code your mother with that mouth?',
            'N00b',
            '/dev/null',
            'STFU()',
            'Cringe ();',
            'u.canSuckIt = true;'
        ]

        if (!editor) {
            console.error("no document open");
            return;
        }

        const document = editor.document;
        const linenumber = generateLineNumber(document.lineCount);
        console.log(linenumber)

        if (linenumber === -1) {
            console.error('No free lines!')
            return;
        }

        const line = document.lineAt(linenumber);
        const edit = new vscode.WorkspaceEdit();
		edit.insert(
            document.uri,
            new vscode.Position(linenumber, line.text.length),
            ' // ' + insults[Math.floor(Math.random()*insults.length)] 
        );

		return vscode.workspace.applyEdit(edit);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {
    console.error('NOOOOOOO');
}

module.exports = {
	activate,
	deactivate
}
