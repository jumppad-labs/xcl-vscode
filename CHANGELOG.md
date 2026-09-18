# Changelog

## [0.1.0] - 2026-09-18

Initial release.

- Syntax highlighting for `.xcl` files.
- Block declarations (`resource`, `module`, `variable`, `output`, `local`)
  with separately scoped type and name labels.
- Nested blocks, attribute names and reference chains
  (`resource.network.test.name`).
- The built-in functions registered by xclconfig.
- Strings with `${ ... }` interpolation, and `<<EOF` / `<<-EOF` heredocs
  including `#{{ .Vars.x }}` template interpolation.
- Comments, numbers, booleans and `null`.
- Comment toggling, bracket matching and auto-indent.
