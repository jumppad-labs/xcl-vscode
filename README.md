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

- Top-level blocks of any type — `resource`, `module`, `variable`, `output`
  and every registered type — with the subtype and name labels scoped
  separately: `agent "claude" {`, `resource "network" "onprem" {`, and a
  singleton written without labels, `runner {`.
- Nested blocks (`health {`, `volume "data" {`), scoped apart from top-level
  blocks, and attribute names.
- Reference chains headed by any type, such as `resource.network.test.name`,
  `agent.claude.model` or a singleton's `runner.server`, distinguished from
  block declarations of the same type.
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
