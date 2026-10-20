# CSV Table Preview — project rules

- Purpose: a small, dependency-free, read-only VS Code CSV table preview.
- `package.json`: extension manifest and commands. `extension.js`: VS Code host/controller. `media/`: CSP-safe webview resources. `sample/`: sample data. `README.md`: installation and UX instructions.
- Naming: JavaScript uses camelCase; VS Code commands use `csvTablePreview.*`; no generated files in source except the distributable `.vsix` at project root.
- Preview MUST never write or modify the source CSV. Editing remains in VS Code's Text Editor.
- Escape all rendered data using DOM textContent, not innerHTML. Restrict webview CSP. CSV parsing must account for quoted commas, escaped quotes, CRLF, and quoted newlines.
- No external network calls, telemetry, or runtime dependencies. Keep MVP changes localized, and update this file before changing structure or conventions.
- Verify syntax with `node --check`, smoke test CSV parsing, and package to `.vsix`. Remove temp packaging artifacts after build.
- CSV editor title toolbar action must open preview in the adjacent editor group (`ViewColumn.Beside`) without replacing the source text editor. The same side-by-side behavior applies to explorer and command-palette actions.
- Keep toolbar action only on `.csv` files using `resourceExtname`; display a built-in VS Code codicon. Increment extension version when shipping a new VSIX.

- Page-size dropdown is part of the preview footer: 50, 100, 200, 500, or 1000 rows. Changing it resets to the first page, without changing the underlying CSV.
