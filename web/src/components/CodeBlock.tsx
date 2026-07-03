const KEYWORDS = new Set([
  // solidity
  "contract", "function", "returns", "return", "external", "internal", "public",
  "private", "view", "pure", "payable", "memory", "storage", "calldata", "emit",
  "event", "error", "revert", "require", "mapping", "struct", "modifier",
  "constructor", "immutable", "constant", "indexed", "assembly", "pragma",
  "solidity", "import", "new", "delete", "if", "else", "for", "while", "receive",
  "fallback", "using", "is", "override", "virtual", "unchecked",
  // types
  "uint256", "uint64", "uint160", "uint8", "uint", "int256", "int", "address",
  "bool", "string", "bytes", "bytes32", "bytes1", "bytes4",
  // js/ts
  "const", "let", "var", "async", "await", "export", "default", "from",
  "interface", "type", "extends", "implements", "class", "true", "false", "null",
  "undefined", "typeof", "as", "in", "of", "try", "catch", "throw",
]);

const TOKEN_REGEX =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b0x[0-9a-fA-F]+\b|\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)|(\s+|[^\sA-Za-z_$]+)/g;

function highlight(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let key = 0;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    const [, comment, str, num, word, rest] = match;
    if (comment !== undefined) {
      nodes.push(<span key={key++} className="text-zinc-500 italic">{comment}</span>);
    } else if (str !== undefined) {
      nodes.push(<span key={key++} className="text-emerald-400">{str}</span>);
    } else if (num !== undefined) {
      nodes.push(<span key={key++} className="text-amber-400">{num}</span>);
    } else if (word !== undefined) {
      nodes.push(
        KEYWORDS.has(word) ? (
          <span key={key++} className="text-indigo-400">{word}</span>
        ) : (
          <span key={key++}>{word}</span>
        ),
      );
    } else {
      nodes.push(<span key={key++}>{rest}</span>);
    }
  }
  return nodes;
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="card overflow-hidden">
      {title && (
        <div className="border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-400">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-[13px] leading-relaxed text-zinc-200">
          <code>{highlight(code.trim())}</code>
        </pre>
      </div>
    </div>
  );
}
