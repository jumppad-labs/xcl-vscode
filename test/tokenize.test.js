// Tokenizes the fixture with the same TextMate engine VS Code uses and
// asserts that representative tokens carry the scopes the grammar promises.
//
// Run with: npm test

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const oniguruma = require('vscode-oniguruma');
const textmate = require('vscode-textmate');

const ROOT = path.join(__dirname, '..');

async function tokenize(file) {
  const onigDir = path.dirname(require.resolve('vscode-oniguruma'));
  await oniguruma.loadWASM(fs.readFileSync(path.join(onigDir, 'onig.wasm')).buffer);

  const registry = new textmate.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (s) => new oniguruma.OnigScanner(s),
      createOnigString: (s) => new oniguruma.OnigString(s),
    }),
    loadGrammar: async () =>
      textmate.parseRawGrammar(
        fs.readFileSync(path.join(ROOT, 'syntaxes', 'xcl.tmLanguage.json'), 'utf8'),
        'xcl.tmLanguage.json'
      ),
  });

  const grammar = await registry.loadGrammar('source.xcl');
  assert.ok(grammar, 'grammar source.xcl failed to load');

  const tokens = [];
  let stack = textmate.INITIAL;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const result = grammar.tokenizeLine(line, stack);
    for (const token of result.tokens) {
      const text = line.substring(token.startIndex, token.endIndex).trim();
      if (text) tokens.push({ text, scopes: token.scopes });
    }
    stack = result.ruleStack;
  }
  return tokens;
}

// Asserts some token whose text is exactly `text` carries a scope containing `scope`.
function assertScope(tokens, text, scope) {
  const matches = tokens.filter((t) => t.text === text);
  assert.ok(matches.length > 0, `no token found with text ${JSON.stringify(text)}`);
  assert.ok(
    matches.some((t) => t.scopes.some((s) => s.includes(scope))),
    `token ${JSON.stringify(text)} lacked scope ${scope}; got ${JSON.stringify(
      matches.map((m) => m.scopes)
    )}`
  );
}

(async () => {
  const tokens = await tokenize(path.join(__dirname, 'fixtures', 'sample.xcl'));

  // Block keywords and their labels.
  assertScope(tokens, 'resource', 'storage.type.xcl');
  assertScope(tokens, 'variable', 'storage.type.xcl');
  assertScope(tokens, 'module', 'storage.type.xcl');
  assertScope(tokens, 'output', 'storage.type.xcl');
  assertScope(tokens, '"network"', 'entity.name.type.xcl');
  assertScope(tokens, '"onprem"', 'entity.name.tag.xcl');

  // Attributes and literals.
  assertScope(tokens, 'subnet', 'variable.other.property.xcl');
  assertScope(tokens, '2048', 'constant.numeric.xcl');
  assertScope(tokens, '2.5', 'constant.numeric.xcl');
  assertScope(tokens, 'false', 'constant.language.xcl');
  assertScope(tokens, 'null', 'constant.language.xcl');

  // Built-in functions.
  assertScope(tokens, 'len', 'support.function.builtin.xcl');
  assertScope(tokens, 'env', 'support.function.builtin.xcl');

  // Comments.
  // begin/end rules emit the delimiter and body as separate tokens.
  assertScope(tokens, '//', 'comment.line.double-slash.xcl');
  assertScope(tokens, 'Comment forms', 'comment.line.double-slash.xcl');
  assertScope(tokens, '#', 'comment.line.number-sign.xcl');
  assertScope(tokens, '/*', 'comment.block.xcl');
  assertScope(tokens, '*/', 'comment.block.xcl');

  // Heredocs: both forms, and the terminator closes the string.
  assertScope(tokens, '<<-', 'keyword.operator.heredoc.xcl');
  assertScope(tokens, 'EOF', 'keyword.control.heredoc.xcl');
  assertScope(tokens, 'EOT', 'keyword.control.heredoc.xcl');
  assertScope(tokens, 'server = true', 'string.unquoted.heredoc.xcl');

  // Template interpolation nests inside a heredoc.
  assertScope(tokens, '#{{', 'punctuation.section.interpolation.begin.xcl');
  assertScope(tokens, 'Vars', 'variable.other.member.xcl');

  // Reference chains.
  assertScope(tokens, 'resource', 'support.class.reference.xcl');

  // A heredoc must not leak: content after its terminator is parsed as code.
  const after = tokens.filter((t) => t.text === 'append_file');
  assert.ok(
    after.some((t) => t.scopes.some((s) => s.includes('variable.other.property.xcl'))),
    'heredoc leaked past its terminator — append_file was not parsed as an attribute'
  );

  // Nothing should remain in an unterminated string state at EOF.
  const trailing = tokens[tokens.length - 1];
  assert.ok(
    !trailing.scopes.some((s) => s.includes('heredoc')),
    'grammar ended inside a heredoc'
  );

  console.log(`ok — ${tokens.length} tokens checked`);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
