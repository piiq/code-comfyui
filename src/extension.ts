// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class ComfyUIPanel {
	public static currentPanel: ComfyUIPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._panel.webview.html = this._getWebviewContent();
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (ComfyUIPanel.currentPanel) {
			ComfyUIPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'comfyuiEditor',
			'ComfyUI Editor',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			}
		);

		ComfyUIPanel.currentPanel = new ComfyUIPanel(panel, extensionUri);
	}

	private _getWebviewContent() {
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>ComfyUI Editor</title>
				<style>
					body, html {
						margin: 0;
						padding: 0;
						width: 100%;
						height: 100vh;
						overflow: hidden;
					}
					iframe {
						border: none;
						width: 100%;
						height: 100%;
					}
				</style>
			</head>
			<body>
				<iframe
					src="http://localhost:8188"
					sandbox="allow-scripts allow-same-origin allow-forms"
					allow="clipboard-read; clipboard-write">
				</iframe>
			</body>
			</html>
		`;
	}

	public dispose() {
		ComfyUIPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('ComfyUI extension is now active!');

	const disposable = vscode.commands.registerCommand('comfyui.openEditor', () => {
		ComfyUIPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
