# XCL for Visual Studio Code

Syntax highlighting for [XCL](https://github.com/jumppad-labs/xcl)
(`.xcl`) configuration files.

## Install

Until this is published to the Marketplace, install from source:

```sh
git clone https://github.com/jumppad-labs/xcl-vscode.git

# VS Code (local)
cp -r xcl-vscode ~/.vscode/extensions/jumppad-labs.xcl-vscode-0.1.0

# VS Code Remote / WSL
cp -r xcl-vscode ~/.vscode-server/extensions/jumppad-labs.xcl-vscode-0.1.0
```

Then run **Developer: Reload Window** from the command palette.

Alternatively, build and install a `.vsix`:

```sh
npm install
npm run package
code --install-extension xcl-vscode-0.1.0.vsix
```

## What it highlights

- Block declarations — `resource`, `module`, `variable`, `output`, `local` —
  with the type and name labels scoped separately.
- Nested blocks (`network {`, `volume {`) and attribute names.
- Reference chains such as `resource.network.test.name`, distinguished from
  block declarations of the same keyword.
- The built-in functions registered by xclconfig (`env`, `file`, `len`,
  `template_file`, `jsonencode`, …); unknown calls still highlight as functions.
- Strings with `${ ... }` interpolation and escapes.
- `<<EOF` / `<<-EOF` heredocs, including `#{{ .Vars.x }}` template
  interpolation inside them.
- `//`, `#` and `/* */` comments, numbers, booleans and `null`.

## Development

The grammar is a TextMate grammar in
[`syntaxes/xcl.tmLanguage.json`](syntaxes/xcl.tmLanguage.json).

Tests tokenize [`test/fixtures/sample.xcl`](test/fixtures/sample.xcl) using
`vscode-textmate` — the same engine VS Code uses — and assert that
representative tokens carry the expected scopes:

```sh
npm install
npm test
```

Add a case to the fixture and a matching `assertScope` call when extending
the grammar.

## Roadmap

- A linter / language server, to surface parse and validation errors as
  editor diagnostics.
- Publish to the Visual Studio Marketplace and Open VSX.

## License

MIT — see [LICENSE](LICENSE).
