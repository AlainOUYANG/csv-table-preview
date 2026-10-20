# CSV Table Preview

English | [简体中文](README.zh-CN.md)

A lightweight, dependency-free VS Code extension to preview `.csv` files in a table without changing the source file.

## Features
- Read-only table with sticky column headers and row index.
- Click a column header to sort ascending/descending (numeric aware).
- Search across the loaded rows; choose 50, 100 (default), 200, 500, or 1000 rows per page.
- Handles quoted delimiters, escaped quotes, quoted newlines, UTF-8 BOM, CRLF; auto-detects comma, semicolon, tab, and pipe.
- Honors VS Code theme colors and refreshes on external text document changes.
- Default is **opt-in**, so normal CSV text editing is unaffected.

## Install
In VS Code choose **Extensions → … → Install from VSIX**, select `csv-table-preview-0.3.0.vsix`, then reload if prompted.

## Use
Open a CSV text file and click the **table icon in the top-right editor toolbar**. Its read-only table preview appears in the right editor group while the CSV stays open on the left. Alternatively, right-click a CSV file in Explorer → **CSV: Open Table Preview**, or run the command from the Command Palette. Use the **Rows per page** selector in the preview footer to change the number of rows displayed. Use **Open as Text** inside the preview if you want to switch that pane back to text.

## Limits
By default only the first 10,000 data rows are loaded (configurable up to 100,000) and filtering/sorting only act on loaded rows. Because VS Code's text document is loaded before parsing, this MVP is not optimized for enormous gigabyte-scale CSV files. Read-only: editing and saving happens in the standard text editor. Files are interpreted using VS Code's text encoding.

## Development
Run `node --check extension.js` and `node --check media/preview.js`; open this folder in VS Code and press F5 to start Extension Development Host.
