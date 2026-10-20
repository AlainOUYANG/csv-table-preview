const vscode = require('vscode');
const path = require('path');
const crypto = require('crypto');

function guessDelimiter(text) {
  const first = text.split(/\r?\n/, 3).filter(Boolean).slice(0, 2);
  const options = [',', ';', '\t', '|'];
  const counts = options.map(d => first.map(line => countOutsideQuotes(line, d)));
  const scores = counts.map(a => a.reduce((x, y) => x + y, 0) - Math.abs((a[0] || 0) - (a[1] || 0)));
  const max = Math.max(...scores);
  return max > 0 ? options[scores.indexOf(max)] : ',';
}
function countOutsideQuotes(line, delimiter) {
  let count = 0, quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (quoted && line[i+1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) count++;
  }
  return count;
}
function parseCsv(text, delimiter, maxRows) {
  const rows = []; let row = [], field = '', quoted = false, limited = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i+1] === '"') { field += '"'; i++; }
      else if (field === '' || quoted) quoted = !quoted;
      else field += '"';
    } else if (!quoted && ch === delimiter) { row.push(field); field = ''; }
    else if (!quoted && (ch === '\r' || ch === '\n')) {
      if (ch === '\r' && text[i+1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
      if (rows.length >= maxRows + 1) { limited = i < text.length - 1; break; }
    } else { field += ch; }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (!limited && (row.length || field.length)) { row.push(field); rows.push(row); }
  const headers = rows.shift() || [];
  return { headers, rows: rows.slice(0, maxRows), limited: limited || rows.length > maxRows };
}
class PreviewProvider {
  constructor(context) { this.context = context; }
  async resolveCustomTextEditor(document, panel) {
    const webview = panel.webview;
    webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')] };
    const nonce = crypto.randomBytes(16).toString('base64');
    const js = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'preview.js'));
    const css = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'preview.css'));
    webview.html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"><link rel="stylesheet" href="${css}"></head><body><header><div class="title" id="file-title"></div><div class="controls"><input id="filter" type="search" placeholder="Filter rows…" aria-label="Filter rows"/><button id="refresh">Refresh</button><button id="text">Open as Text</button></div></header><div id="status">Loading CSV…</div><section id="viewport"><table><thead id="thead"></thead><tbody id="tbody"></tbody></table></section><footer><span id="range"></span><div class="pager"><label for="per-page">Rows per page</label><select id="per-page" aria-label="Rows per page"><option value="50">50</option><option value="100" selected>100</option><option value="200">200</option><option value="500">500</option><option value="1000">1000</option></select><button id="previous">Previous</button><span id="page"></span><button id="next">Next</button></div></footer><script nonce="${nonce}" src="${js}"></script></body></html>`;
    const sendData = () => {
      try {
        const config = vscode.workspace.getConfiguration('csvTablePreview');
        const maxRows = config.get('maxRows', 10000);
        const configured = config.get('delimiter', 'auto');
        const delimiter = configured === 'auto' ? guessDelimiter(document.getText().slice(0, 20000)) : configured;
        const data = parseCsv(document.getText(), delimiter, maxRows);
        webview.postMessage({ type: 'data', ...data, fileName: path.basename(document.uri.fsPath), delimiter: delimiter === '\t' ? 'TAB' : delimiter, maxRows });
      } catch (error) { webview.postMessage({ type: 'error', message: String(error.message || error) }); }
    };
    const messageListener = webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'ready' || message.type === 'refresh') sendData();
      else if (message.type === 'text') {
        await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
      }
    });
    const docListener = vscode.workspace.onDidChangeTextDocument(e => { if (e.document.uri.toString() === document.uri.toString()) sendData(); });
    const configListener = vscode.workspace.onDidChangeConfiguration(e => { if (e.affectsConfiguration('csvTablePreview')) sendData(); });
    panel.onDidDispose(() => { messageListener.dispose(); docListener.dispose(); configListener.dispose(); });
  }
}
function activate(context) {
  context.subscriptions.push(vscode.window.registerCustomEditorProvider('csvTablePreview.preview', new PreviewProvider(context), { webviewOptions: { retainContextWhenHidden: true } }));
  context.subscriptions.push(vscode.commands.registerCommand('csvTablePreview.openPreview', async (uri) => {
    const target = uri instanceof vscode.Uri ? uri : vscode.window.activeTextEditor?.document.uri;
    if (!target || path.extname(target.fsPath).toLowerCase() !== '.csv') {
      vscode.window.showWarningMessage('Open a CSV file first.');
      return;
    }
    await vscode.commands.executeCommand('vscode.openWith', target, 'csvTablePreview.preview', {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: false,
      preview: false
    });
  }));
}
function deactivate() {}
module.exports = { activate, deactivate, parseCsv, guessDelimiter };
