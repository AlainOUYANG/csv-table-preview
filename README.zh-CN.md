# CSV Table Preview

[English](README.md) | 简体中文

一个轻量、零依赖的 VS Code 扩展，以表格形式预览 `.csv` 文件，且不会改动源文件。

## 功能
- 只读表格，列头固定，带行号。
- 点击列头排序（升序/降序，支持数值感知）。
- 全文搜索已加载的行；每页可选 50、100（默认）、200、500 或 1000 行。
- 正确处理引号内分隔符、转义引号（`""`）、引号内换行、UTF-8 BOM、CRLF；自动识别逗号、分号、Tab、竖线分隔符。
- 遵循 VS Code 主题配色；源文件在外部被修改时自动刷新。
- 默认**手动开启**，不影响 CSV 的正常文本编辑。

## 安装
在 VS Code 中选择「扩展 → … → 从 VSIX 安装」，选择 `csv-table-preview-0.3.1.vsix`，如提示请重新加载窗口。

也可以用命令行安装：

```bash
code --install-extension csv-table-preview-0.3.0.vsix
```

## 使用
打开 CSV 文本文件后，点击**编辑器右上角的表格图标**，预览表格会在右侧编辑器组打开，左侧 CSV 保持不动。也可以在资源管理器中右键 CSV 文件 → 「CSV: Open Table Preview」，或从命令面板执行该命令。在预览底部的「Rows per page」下拉框中可更改每页行数；点击预览内的「Open as Text」可把该面板切回文本编辑。

## 限制
默认只加载前 10,000 行数据（可通过设置调整到最多 100,000），筛选和排序只作用于已加载的行。由于解析前需要先经过 VS Code 文本文档加载，本 MVP 未针对 GB 级超大 CSV 做优化。预览只读，编辑和保存仍在标准文本编辑器中进行。文件编码按 VS Code 的文本编码解释。

## 开发
运行 `node --check extension.js` 和 `node --check media/preview.js` 做语法检查；用 VS Code 打开本目录后按 F5 启动 Extension Development Host 调试。
