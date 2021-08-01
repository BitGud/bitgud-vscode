// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const express = require('express');
const io = require("socket.io-client");

const axios = require('axios');


let linenumbersVisited = [];

const API = "https://bitgud-backend.herokuapp.com"
const SOCKETIO = "wss://bitgud-backend.herokuapp.com"
const WEBSITE = "https://noisy-firefly-1302.on.fleek.co/"

//const SOCKETIO = "ws://172.20.10.146:4000"
//const API = "http://172.20.10.146:4000"

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

class TreeDataProvider {
    constructor() {
        this.data = [
            new TreeItem('Commands', null, [new TreeItem('Insult', 'bitgud.insult'), new TreeItem('Help', 'bitgud.help')]),
        ];
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
class TreeItem extends vscode.TreeItem {
    constructor(label, command, children) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;

        this.command = command? {
            "title": label,
            "command": command,
        }: null
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('Congratulations, your extension "bitgud" is now active!');

	const disposable1 = vscode.commands.registerCommand('bitgud.authenticate', async () => {
		vscode.env.openExternal(vscode.Uri.parse("https://github.com/login/oauth/authorize?client_id=a963600a57e241817430"));

        var app = express();

        app.get('/', async function(req, res) {
            console.log(req.query.code);

            axios.post(`${API}/code`, {
                code: req.query.code,
            })
            .then(function (response) {
                console.log(response);
                res.send('<div><script>setTimeout (window.close, 1000);</script>SUCCESS</div>');

                const socket = io(SOCKETIO, {
                    reconnectionDelayMax: 10000,
                    auth: {
                        token: response.data.uid,
                    },
                });

                vscode.window.registerTreeDataProvider('bitgud-view', new TreeDataProvider());
        
                socket.on('shock', ()=> {
                    console.log('shocked')
                    shock()
                })
            })
            .catch(function (error) {
                console.log(error)
                res.send(`<div><script>setTimeout (() => {window.location.replace("${WEBSITE}")}, 1000)</script>NO USER (PLEASE CREATE USER)</div>`);
            });
        });



        app.listen(2000);
        console.log('Express working...');
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable2 = vscode.commands.registerCommand('bitgud.insult', shock );
    let disposable3 = vscode.commands.registerCommand('bitgud.help', ()=> {vscode.env.openExternal(vscode.Uri.parse(WEBSITE));} );

	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}

function shock() {
    // The code you place here will be executed every time your command is executed

    const editor = vscode.window.activeTextEditor;

    const insults = [
        'You Suck!',
        'Code? More like smode.',
        'You code your mother with that mouth?',
        'N00b',
        '/dev/null',
        'STFU()',
        'Cringe();',
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
}

// this method is called when your extension is deactivated
function deactivate() {
    console.error('NOOOOOOO');
}

module.exports = {
	activate,
	deactivate
}
