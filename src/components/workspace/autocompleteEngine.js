/**
 * SkillForge CodeStudio Autocomplete & IntelliSense Engine
 * Provides language-aware keyword, type, snippet, and document symbol suggestions.
 */

export const LANGUAGE_SYMBOLS = {
    rust: [
        // Snippets
        { label: "fn", insertText: "fn name() {\n    \n}", type: "snippet", detail: "Function definition" },
        { label: "fn:return", insertText: "fn name() -> Result<(), String> {\n    Ok(())\n}", type: "snippet", detail: "Function with return type" },
        { label: "struct", insertText: "struct Name {\n    field: String,\n}", type: "snippet", detail: "Struct declaration" },
        { label: "enum", insertText: "enum Name {\n    VariantA,\n    VariantB,\n}", type: "snippet", detail: "Enum declaration" },
        { label: "match", insertText: "match value {\n    pattern => {},\n    _ => {}\n}", type: "snippet", detail: "Pattern match expression" },
        { label: "impl", insertText: "impl Name {\n    pub fn new() -> Self {\n        Self {}\n    }\n}", type: "snippet", detail: "Implementation block" },
        { label: "loop", insertText: "loop {\n    \n}", type: "snippet", detail: "Infinite loop" },
        { label: "for", insertText: "for item in iter {\n    \n}", type: "snippet", detail: "For loop iterator" },
        { label: "if-let", insertText: "if let Some(val) = option {\n    \n}", type: "snippet", detail: "If let pattern" },
        
        // Macros
        { label: "println!", insertText: "println!(\"{}\", );", type: "macro", detail: "Print to stdout with newline" },
        { label: "eprintln!", insertText: "eprintln!(\"{}\", );", type: "macro", detail: "Print to stderr with newline" },
        { label: "format!", insertText: "format!(\"{}\", );", type: "macro", detail: "Format string" },
        { label: "panic!", insertText: "panic!(\"Error\");", type: "macro", detail: "Panics current thread" },
        { label: "vec!", insertText: "vec![];", type: "macro", detail: "Create Vector" },
        { label: "todo!", insertText: "todo!()", type: "macro", detail: "Unfinished code marker" },

        // Keywords
        { label: "pub", insertText: "pub ", type: "keyword", detail: "Public visibility" },
        { label: "let", insertText: "let ", type: "keyword", detail: "Variable binding" },
        { label: "mut", insertText: "mut ", type: "keyword", detail: "Mutable specifier" },
        { label: "use", insertText: "use std::;", type: "keyword", detail: "Import module path" },
        { label: "mod", insertText: "mod ", type: "keyword", detail: "Module declaration" },
        { label: "return", insertText: "return ", type: "keyword", detail: "Return from function" },
        { label: "async", insertText: "async ", type: "keyword", detail: "Async block or function" },
        { label: "await", insertText: ".await", type: "keyword", detail: "Await future" },
        { label: "crate", insertText: "crate::", type: "keyword", detail: "Root crate reference" },

        // Standard Types & Enums
        { label: "TcpListener", insertText: "TcpListener::bind(\"127.0.0.1:6379\")?", type: "type", detail: "TCP socket listener" },
        { label: "TcpStream", insertText: "TcpStream", type: "type", detail: "Connected TCP stream" },
        { label: "String", insertText: "String::from(\"\")", type: "type", detail: "Growable UTF-8 string" },
        { label: "Option", insertText: "Option<T>", type: "type", detail: "Optional value (Some / None)" },
        { label: "Result", insertText: "Result<T, E>", type: "type", detail: "Result type (Ok / Err)" },
        { label: "Some", insertText: "Some()", type: "type", detail: "Some option variant" },
        { label: "None", insertText: "None", type: "type", detail: "None option variant" },
        { label: "Ok", insertText: "Ok()", type: "type", detail: "Ok result variant" },
        { label: "Err", insertText: "Err()", type: "type", detail: "Err result variant" },
        { label: "Vec", insertText: "Vec::new()", type: "type", detail: "Growable array" },
        { label: "HashMap", insertText: "HashMap::new()", type: "type", detail: "Hash map key-value store" },
        { label: "Arc", insertText: "Arc::new()", type: "type", detail: "Atomic reference counting pointer" },
        { label: "RwLock", insertText: "RwLock::new()", type: "type", detail: "Reader-writer lock" },
        { label: "Instant", insertText: "Instant::now()", type: "type", detail: "Measurement of monotonic clock" },
        { label: "Duration", insertText: "Duration::from_millis(100)", type: "type", detail: "Span of time" },
        { label: "u8", insertText: "u8", type: "type", detail: "8-bit unsigned integer" },
        { label: "usize", insertText: "usize", type: "type", detail: "Pointer-sized unsigned integer" },

        // Methods
        { label: "unwrap", insertText: "unwrap()", type: "method", detail: "Unwraps Option or Result" },
        { label: "expect", insertText: "expect(\"failed\")", type: "method", detail: "Unwraps with custom error message" },
        { label: "clone", insertText: "clone()", type: "method", detail: "Deep clone" },
        { label: "as_bytes", insertText: "as_bytes()", type: "method", detail: "Converts string slice to byte slice" },
        { label: "write_all", insertText: "write_all(b\"+PONG\\r\\n\")", type: "method", detail: "Writes all buffer bytes to stream" },
        { label: "read", insertText: "read(&mut buffer)", type: "method", detail: "Reads bytes from stream" }
    ],

    typescript: [
        { label: "function", insertText: "function name() {\n    \n}", type: "snippet", detail: "Function definition" },
        { label: "arrow", insertText: "const name = () => {\n    \n};", type: "snippet", detail: "Arrow function" },
        { label: "interface", insertText: "interface Name {\n    id: string;\n}", type: "snippet", detail: "Interface definition" },
        { label: "type", insertText: "type Name = string;", type: "snippet", detail: "Type alias" },
        { label: "try-catch", insertText: "try {\n    \n} catch (err) {\n    console.error(err);\n}", type: "snippet", detail: "Try catch block" },
        { label: "console.log", insertText: "console.log();", type: "function", detail: "Logs to web console" },
        { label: "const", insertText: "const ", type: "keyword", detail: "Constant declaration" },
        { label: "let", insertText: "let ", type: "keyword", detail: "Let declaration" },
        { label: "return", insertText: "return ", type: "keyword", detail: "Return statement" },
        { label: "async", insertText: "async ", type: "keyword", detail: "Async function" },
        { label: "await", insertText: "await ", type: "keyword", detail: "Await promise" },
        { label: "export", insertText: "export ", type: "keyword", detail: "Export member" },
        { label: "import", insertText: "import { } from \"\";", type: "keyword", detail: "Import statement" },
        { label: "Promise", insertText: "new Promise((resolve, reject) => {\n    \n})", type: "type", detail: "JavaScript Promise" },
        { label: "setTimeout", insertText: "setTimeout(() => {\n    \n}, 1000);", type: "function", detail: "Timer callback" }
    ],

    javascript: [
        { label: "function", insertText: "function name() {\n    \n}", type: "snippet", detail: "Function definition" },
        { label: "const", insertText: "const ", type: "keyword", detail: "Constant declaration" },
        { label: "let", insertText: "let ", type: "keyword", detail: "Let declaration" },
        { label: "console.log", insertText: "console.log();", type: "function", detail: "Logs to web console" },
        { label: "async", insertText: "async ", type: "keyword", detail: "Async function" },
        { label: "await", insertText: "await ", type: "keyword", detail: "Await promise" },
        { label: "require", insertText: "const pkg = require('');", type: "function", detail: "CommonJS require" },
        { label: "module.exports", insertText: "module.exports = { };", type: "keyword", detail: "Export module" }
    ]
};

/**
 * Extracts unique word identifiers from source text (for user-defined functions/variables)
 */
export function extractDocSymbols(code) {
    if (!code) return [];
    const words = code.match(/[a-zA-Z_][a-zA-Z0-9_]{2,}/g) || [];
    const unique = Array.from(new Set(words));
    return unique.slice(0, 50).map(word => ({
        label: word,
        insertText: word,
        type: "variable",
        detail: "Document symbol"
    }));
}

/**
 * Queries autocomplete suggestions based on current word prefix and language
 */
export function getSuggestions(prefix, language, code) {
    if (!prefix || prefix.length < 1) return [];

    const langKey = language?.toLowerCase() || "rust";
    const baseSymbols = LANGUAGE_SYMBOLS[langKey] || LANGUAGE_SYMBOLS.rust;
    const docSymbols = extractDocSymbols(code);

    const all = [...baseSymbols, ...docSymbols];
    const lowerPrefix = prefix.toLowerCase();

    // Deduplicate and filter
    const matches = all.filter(item => 
        item.label.toLowerCase().startsWith(lowerPrefix) && item.label.toLowerCase() !== lowerPrefix
    );

    // Limit to top 7 most relevant items
    return matches.slice(0, 7);
}
