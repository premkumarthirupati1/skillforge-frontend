/**
 * SkillForge CodeStudio Syntax Highlighter
 * Pure JavaScript lexer and token highlighter for Rust, TypeScript, JavaScript, Python, Go, and TOML.
 * Zero external dependencies, zero latency, renders tokens with tailored Tailwind / Hex styles.
 */

const KEYWORDS = new Set([
    "fn", "pub", "struct", "enum", "impl", "let", "mut", "match", "if", "else", 
    "loop", "while", "for", "in", "return", "use", "mod", "async", "await", 
    "break", "continue", "where", "move", "ref", "self", "Self", "crate", "super",
    "import", "export", "from", "default", "const", "var", "function", "class", 
    "interface", "type", "extends", "implements", "new", "this", "typeof", "instanceof",
    "def", "elif", "try", "except", "finally", "with", "as", "lambda", "yield",
    "package", "func", "go", "defer", "select", "chan", "map"
]);

const BUILTIN_TYPES = new Set([
    "u8", "u16", "u32", "u64", "u128", "usize",
    "i8", "i16", "i32", "i64", "i128", "isize",
    "f32", "f64", "bool", "char", "str", "String", "Vec", "Option", "Result", 
    "Some", "None", "Ok", "Err", "Box", "Rc", "Arc", "Mutex", "RwLock",
    "TcpListener", "TcpStream", "Instant", "Duration", "HashMap", "HashSet",
    "number", "string", "boolean", "any", "void", "never", "unknown", "Promise",
    "Array", "Object", "Set", "Map", "Buffer", "Error"
]);

const MACROS_AND_CONSTS = new Set([
    "true", "false", "null", "undefined", "None", "True", "False", "nil",
    "println!", "eprintln!", "format!", "panic!", "vec!", "todo!", "unimplemented!"
]);

/**
 * Tokenizes a single line of source code into styled HTML spans
 */
export function highlightLine(line) {
    if (!line) return "&nbsp;";

    // Check for comment line
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        return `<span class="text-slate-500 italic">${escapeHtml(line)}</span>`;
    }

    // Token regex matches strings, comments, numbers, words, and operators
    const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|b?"(?:\\.|[^"\\])*"|b?'(?:\\.|[^'\\])*'|#[^\n]*|\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:ms|s|us)?\b|[a-zA-Z_][a-zA-Z0-9_]*!?|[-><=!+*%&|^~:;,\.{}()\[\]]+|\s+)/g;

    let match;
    let result = "";

    while ((match = tokenRegex.exec(line)) !== null) {
        const token = match[0];

        // Whitespace
        if (/^\s+$/.test(token)) {
            result += token;
            continue;
        }

        // Comment
        if (token.startsWith("//") || token.startsWith("/*") || token.startsWith("#")) {
            result += `<span class="text-slate-500 italic">${escapeHtml(token)}</span>`;
            continue;
        }

        // String
        if (token.startsWith('"') || token.startsWith("'") || token.startsWith('b"') || token.startsWith("b'")) {
            result += `<span class="text-emerald-400 font-medium">${escapeHtml(token)}</span>`;
            continue;
        }

        // Number
        if (/^\d/.test(token) || token.startsWith("0x")) {
            result += `<span class="text-amber-400 font-semibold">${escapeHtml(token)}</span>`;
            continue;
        }

        // Macro / Constant
        if (MACROS_AND_CONSTS.has(token) || token.endsWith("!")) {
            result += `<span class="text-cyan-300 font-bold">${escapeHtml(token)}</span>`;
            continue;
        }

        // Keyword
        if (KEYWORDS.has(token)) {
            result += `<span class="text-purple-400 font-bold">${escapeHtml(token)}</span>`;
            continue;
        }

        // Built-in Type
        if (BUILTIN_TYPES.has(token)) {
            result += `<span class="text-sky-300 font-semibold">${escapeHtml(token)}</span>`;
            continue;
        }

        // Annotations e.g. #[derive(...)]
        if (token.startsWith("#[") || token.startsWith("@")) {
            result += `<span class="text-yellow-300 font-medium">${escapeHtml(token)}</span>`;
            continue;
        }

        // Function / Method invocation (if followed by '(' in line)
        const nextIndex = tokenRegex.lastIndex;
        const restOfLine = line.slice(nextIndex).trimStart();
        if (restOfLine.startsWith("(")) {
            result += `<span class="text-blue-300 font-medium">${escapeHtml(token)}</span>`;
            continue;
        }

        // Special Operators
        if (/[-><=!+*%&|^~:]/.test(token)) {
            result += `<span class="text-indigo-300/80">${escapeHtml(token)}</span>`;
            continue;
        }

        // Default identifier
        result += `<span class="text-slate-200">${escapeHtml(token)}</span>`;
    }

    return result || escapeHtml(line);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
