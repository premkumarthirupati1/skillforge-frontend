/**
 * SkillForge Project Forge - Workspace Specifications & Starter Code
 * Contains file structures, milestone guides, test suites, and starter code for projects.
 */

export const PROJECT_WORKSPACES = {
    "redis-clone": {
        language: "rust",
        repoName: "skillforge/redis-starter-rust",
        files: [
            {
                name: "main.rs",
                path: "src/main.rs",
                language: "rust",
                content: `use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;

mod resp;
mod store;

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    loop {
        match stream.read(&mut buffer) {
            Ok(0) => break, // Connection closed by client
            Ok(bytes_read) => {
                let input = String::from_utf8_lossy(&buffer[..bytes_read]);
                
                // Milestone 1: Respond to PING command
                if input.trim().to_uppercase().contains("PING") {
                    let response = "+PONG\\r\\n";
                    if let Err(e) = stream.write_all(response.as_bytes()) {
                        eprintln!("Failed to write to stream: {}", e);
                        break;
                    }
                } else {
                    // Default fallback
                    let _ = stream.write_all(b"-ERR unknown command\\r\\n");
                }
            }
            Err(e) => {
                eprintln!("Error reading socket: {}", e);
                break;
            }
        }
    }
}

fn main() {
    println!("⚡ SkillForge Anvil: Binding Redis server to 127.0.0.1:6379...");
    let listener = TcpListener::bind("127.0.0.1:6379").expect("Failed to bind port 6379");
    println!("✓ Redis Server listening on port 6379. Ready for clients.");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(move || {
                    handle_client(stream);
                });
            }
            Err(e) => eprintln!("Connection failed: {}", e),
        }
    }
}`
            },
            {
                name: "resp.rs",
                path: "src/resp.rs",
                language: "rust",
                content: `// Redis Serialization Protocol (RESP2) Parser
// Spec: https://redis.io/docs/reference/protocol-spec/

#[derive(Debug, PartialEq)]
pub enum RespType {
    SimpleString(String), // +OK\\r\\n
    Error(String),        // -ERR ...\\r\\n
    Integer(i64),         // :1000\\r\\n
    BulkString(Option<String>), // $5\\r\\nhello\\r\\n or $-1\\r\\n (null)
    Array(Vec<RespType>), // *2\\r\\n...
}

pub fn parse_resp(buffer: &[u8]) -> Result<(RespType, usize), String> {
    if buffer.is_empty() {
        return Err("Empty buffer".to_string());
    }

    match buffer[0] {
        b'+' => parse_simple_string(&buffer[1..]),
        b'$' => parse_bulk_string(&buffer[1..]),
        b'*' => parse_array(&buffer[1..]),
        _ => Err("Invalid RESP byte prefix".to_string()),
    }
}

fn parse_simple_string(slice: &[u8]) -> Result<(RespType, usize), String> {
    if let Some(pos) = slice.windows(2).position(|w| w == b"\\r\\n") {
        let s = String::from_utf8_lossy(&slice[..pos]).to_string();
        Ok((RespType::SimpleString(s), pos + 3))
    } else {
        Err("Incomplete simple string".to_string())
    }
}

fn parse_bulk_string(slice: &[u8]) -> Result<(RespType, usize), String> {
    // TODO (Milestone 2): Implement Bulk String extraction with length header
    Ok((RespType::BulkString(Some("placeholder".into())), slice.len()))
}

fn parse_array(slice: &[u8]) -> Result<(RespType, usize), String> {
    // TODO (Milestone 2): Implement Array of commands
    Ok((RespType::Array(vec![]), slice.len()))
}`
            },
            {
                name: "store.rs",
                path: "src/store.rs",
                language: "rust",
                content: `use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::Instant;

#[derive(Clone)]
pub struct StoreEntry {
    pub value: String,
    pub expires_at: Option<Instant>,
}

#[derive(Clone, Default)]
pub struct KeyValueStore {
    data: Arc<RwLock<HashMap<String, StoreEntry>>>,
}

impl KeyValueStore {
    pub fn new() -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn set(&self, key: String, value: String, ttl_ms: Option<u64>) {
        let mut store = self.data.write().unwrap();
        let expires_at = ttl_ms.map(|ms| Instant::now() + std::time::Duration::from_millis(ms));
        store.insert(key, StoreEntry { value, expires_at });
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let store = self.data.read().unwrap();
        if let Some(entry) = store.get(key) {
            if let Some(expiry) = entry.expires_at {
                if Instant::now() > expiry {
                    return None; // Expired key
                }
            }
            return Some(entry.value.clone());
        }
        None
    }
}`
            },
            {
                name: "Cargo.toml",
                path: "Cargo.toml",
                language: "toml",
                content: `[package]
name = "redis-server"
version = "0.1.0"
edition = "2021"

[dependencies]
bytes = "1.5"
tokio = { version = "1", features = ["full"] }`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Bind TCP Socket & Ping-Pong Handshake",
                objective: "Bind a raw TCP socket on 127.0.0.1:6379, accept connections, and respond to Redis PING commands with +PONG\\r\\n.",
                specRules: [
                    "Listen on TCP address 127.0.0.1 and port 6379.",
                    "Handle multiple concurrent client connections without blocking the main event loop.",
                    "When client sends PING or *1\\r\\n$4\\r\\nping\\r\\n, respond with +PONG\\r\\n.",
                    "When client sends PING with an echo argument (e.g., PING 'hello world'), return $11\\r\\nhello world\\r\\n."
                ],
                hints: [
                    "In Rust, TcpListener::bind returns an iterator over incoming connections using listener.incoming().",
                    "Spawning a thread per connection with thread::spawn or using tokio::spawn is a great starting point for concurrent connections.",
                    "Remember that Redis lines ALWAYS end with carriage return + line feed (\\r\\n)."
                ],
                testCases: [
                    { name: "TCP Bind & Port Availability", cmd: "nc -z 127.0.0.1 6379", expected: "Port 6379 open" },
                    { name: "PING command handshake", cmd: "redis-cli PING", expected: "PONG" },
                    { name: "Concurrent TCP connections", cmd: "spawn 5 clients concurrently", expected: "5/5 connected" },
                    { name: "Clean connection termination", cmd: "Client disconnects cleanly", expected: "Socket closed gracefully" }
                ]
            },
            {
                milestone: 2,
                title: "RESP Array & Bulk String Protocol Parser",
                objective: "Implement full deserialization of RESP (Redis Serialization Protocol) Arrays (*<len>\\r\\n) and Bulk Strings ($<len>\\r\\n<data>\\r\\n).",
                specRules: [
                    "Parse RESP Arrays: First byte is '*' followed by integer count.",
                    "Parse Bulk Strings: First byte is '$' followed by byte length, \\r\\n, raw bytes, and trailing \\r\\n.",
                    "Support nil bulk strings: $-1\\r\\n.",
                    "Handle command case insensitivity: 'ping', 'PING', and 'Ping' must resolve identically."
                ],
                hints: [
                    "Use byte windows or slice splitting at b'\\r\\n' to avoid string reallocation overhead.",
                    "Be careful not to parse UTF-8 characters by character index since Redis strings are binary-safe byte arrays."
                ],
                testCases: [
                    { name: "RESP Array Header Parsing", cmd: "parse '*2\\r\\n$4\\r\\nECHO\\r\\n$3\\r\\nhey\\r\\n'", expected: "Array(2 items)" },
                    { name: "ECHO Command Compliance", cmd: "redis-cli ECHO 'SkillForge Rocks'", expected: "'SkillForge Rocks'" },
                    { name: "Null Bulk String Handling", cmd: "GET non_existing_key", expected: "(nil)" },
                    { name: "Malformed Packet Recovery", cmd: "Send partial chunk '$10\\r\\nchunk'", expected: "Buffer awaits remainder" }
                ]
            },
            {
                milestone: 3,
                title: "Thread-Safe Key/Value Store with TTL Expiry",
                objective: "Implement SET and GET commands with optional expiration in milliseconds (PX) or seconds (EX).",
                specRules: [
                    "SET key value sets key to hold value. Returns +OK\\r\\n.",
                    "GET key returns the bulk string value or nil if missing or expired.",
                    "SET key value PX 100 expires key automatically after 100 milliseconds.",
                    "Access must be protected against race conditions using a read-write lock (RwLock) or concurrent map."
                ],
                hints: [
                    "Store each entry with an Instant timestamp representing Instant::now() + Duration::from_millis(px).",
                    "On GET, compare Instant::now() with the stored expiry time. If expired, remove the key and return nil."
                ],
                testCases: [
                    { name: "SET & GET basic value", cmd: "SET mykey 'hello' && GET mykey", expected: "'hello'" },
                    { name: "TTL Expiration verification", cmd: "SET key 'temp' PX 100 && sleep 120ms && GET key", expected: "(nil)" },
                    { name: "Overwriting existing keys", cmd: "SET k '1' && SET k '2' && GET k", expected: "'2'" },
                    { name: "Thread-safe concurrent writes", cmd: "100 parallel worker threads SET distinct keys", expected: "100/100 keys preserved" }
                ]
            },
            {
                milestone: 4,
                title: "LRU Memory Eviction & Concurrent Connections",
                objective: "Limit maximum server memory usage. When maxmemory is reached, evict keys using the Least Recently Used (LRU) algorithm.",
                specRules: [
                    "Configure `maxmemory` threshold.",
                    "Track last access timestamp for every key accessed via GET or SET.",
                    "When memory exceeds threshold on SET, evict the key with the oldest access timestamp.",
                    "Support `INFO memory` command to report allocated bytes."
                ],
                hints: [
                    "A Doubly Linked List + HashMap is the classic O(1) LRU eviction architecture.",
                    "Alternatively, Redis uses an approximation algorithm: sample 5 random keys and evict the oldest among them."
                ],
                testCases: [
                    { name: "LRU Eviction Trigger", cmd: "Fill memory to 100% capacity and SET new key", expected: "Oldest key evicted" },
                    { name: "Accessed Key Protection", cmd: "GET old_key then trigger eviction", expected: "Recently read key protected" },
                    { name: "INFO memory metrics", cmd: "redis-cli INFO memory", expected: "used_memory accurately returned" }
                ]
            },
            {
                milestone: 5,
                title: "RDB Disk Snapshot Encoding & Recovery",
                objective: "Persist the in-memory database to disk using the binary RDB file format, and reload state upon server restart.",
                specRules: [
                    "Implement the SAVE command to produce a valid `dump.rdb` file.",
                    "Encode Magic Header: 'REDIS0009'.",
                    "Encode database index opcodes, length-prefixed keys, and expiration epoch timestamps.",
                    "On startup, verify if `dump.rdb` exists in working directory and restore in-memory state."
                ],
                hints: [
                    "RDB encodes lengths using a compact variable-length integer format (top 2 bits denote length byte size).",
                    "Always write to a temporary file `temp-dump.rdb` first and use atomic rename to prevent corruption on crash."
                ],
                testCases: [
                    { name: "SAVE binary encoding", cmd: "SAVE to dump.rdb", expected: "Valid RDB header REDIS0009" },
                    { name: "Server restart recovery", cmd: "Kill server, restart process, GET key", expected: "Persisted key intact" },
                    { name: "CRC64 Checksum validation", cmd: "Inspect trailing 8-byte checksum", expected: "Checksum matches" }
                ]
            }
        ]
    },
    "collaborative-canvas": {
        language: "typescript",
        repoName: "skillforge/collaborative-canvas-ts",
        files: [
            {
                name: "Canvas.tsx",
                path: "src/Canvas.tsx",
                language: "typescript",
                content: `import React, { useRef, useState, useEffect } from "react";
import { useWebSocketRoom } from "./websocket";

export interface Shape {
    id: string;
    type: "rectangle" | "circle" | "arrow";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export default function CollaborativeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedTool, setSelectedTool] = useState<"select" | "rect" | "circle">("rect");
    const { cursors, broadcastCursor, broadcastShape } = useWebSocketRoom("canvas-room-1");

    // Milestone 1: Viewport panning & 2D rendering loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw shapes
        shapes.forEach(shape => {
            ctx.fillStyle = shape.color;
            if (shape.type === "rectangle") {
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            }
        });

        // Draw remote peer cursors
        cursors.forEach(cursor => {
            ctx.fillStyle = cursor.color;
            ctx.beginPath();
            ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(cursor.username, cursor.x + 10, cursor.y);
        });
    }, [shapes, cursors]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        broadcastCursor(e.clientX - rect.left, e.clientY - rect.top);
    };

    return (
        <div className="relative w-full h-full bg-[#0D1117] overflow-hidden">
            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                onMouseMove={handleMouseMove}
                className="w-full h-full cursor-crosshair"
            />
        </div>
    );
}`
            },
            {
                name: "websocket.ts",
                path: "src/websocket.ts",
                language: "typescript",
                content: `import { useState, useEffect, useCallback, useRef } from "react";

export interface RemoteCursor {
    id: string;
    username: string;
    color: string;
    x: number;
    y: number;
}

export function useWebSocketRoom(roomId: string) {
    const [cursors, setCursors] = useState<RemoteCursor[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Milestone 2: Establish resilient WebSocket connection
        const ws = new WebSocket(\`wss://forge-sync.skillforge.dev/rooms/\${roomId}\`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "cursor_update") {
                setCursors(prev => {
                    const existing = prev.filter(c => c.id !== data.cursor.id);
                    return [...existing, data.cursor];
                });
            }
        };

        return () => ws.close();
    }, [roomId]);

    const broadcastCursor = useCallback((x: number, y: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "cursor_move", x, y }));
        }
    }, []);

    return { cursors, broadcastCursor, broadcastShape: () => {} };
}`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Infinite HTML5 2D Vector Canvas Viewport",
                objective: "Construct high-DPI HTML5 Canvas with smooth 60fps pan/zoom matrix transformations.",
                specRules: [
                    "Handle devicePixelRatio scaling to prevent retina blur.",
                    "Support middle-click dragging to pan the infinite viewport.",
                    "Implement wheel zoom centering on mouse cursor coordinates."
                ],
                hints: ["Use ctx.setTransform or Matrix2D math rather than modifying individual shape positions."],
                testCases: [
                    { name: "Retina Canvas Scaling", cmd: "verify canvas.width === clientWidth * dpr", expected: "Crisp pixels on 2x DPR" },
                    { name: "Camera Matrix Panning", cmd: "Pan canvas by (100, 200)", expected: "Viewport origin shifts accurately" }
                ]
            },
            {
                milestone: 2,
                title: "Multiplayer WebSocket Connection & Presence Broadcast",
                objective: "Stream peer cursor positions and join/leave presence events with heartbeat reconnection.",
                specRules: [
                    "Send binary or JSON presence heartbeats every 5 seconds.",
                    "Remove inactive client cursors after 10 seconds of silence."
                ],
                hints: ["Throttle cursor mousemove events with requestAnimationFrame."],
                testCases: [
                    { name: "Broadcast Cursor Coordinates", cmd: "Move cursor across (450, 320)", expected: "Remote peers receive coordinates" },
                    { name: "Presence Timeout Eviction", cmd: "Peer disconnects", expected: "Cursor vanishes within 10s" }
                ]
            }
        ]
    },
    "url-shortener-distributed": {
        language: "javascript",
        repoName: "skillforge/url-shortener-node",
        files: [
            {
                name: "server.js",
                path: "src/server.js",
                language: "javascript",
                content: `const express = require('express');
const { encodeBase62, decodeBase62 } = require('./base62');
const { getCachedUrl, cacheUrl } = require('./cache');

const app = express();
app.use(express.json());

// In-memory counter for 64-bit sequence ID generation (Milestone 1)
let sequenceId = 1000000;

app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Generate unique short code
    const id = ++sequenceId;
    const shortCode = encodeBase62(id);

    // Save to cache & persistent database
    await cacheUrl(shortCode, url);

    res.json({
        shortCode,
        shortUrl: \`https://sho.rt/\${shortCode}\`,
        originalUrl: url
    });
});

app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    const originalUrl = await getCachedUrl(shortCode);

    if (!originalUrl) {
        return res.status(404).send("Short URL not found");
    }

    // 301 Permanent Redirect
    res.redirect(301, originalUrl);
});

app.listen(3000, () => {
    console.log("🚀 URL Shortener Service running on port 3000");
});`
            },
            {
                name: "base62.js",
                path: "src/base62.js",
                language: "javascript",
                content: `// Base62 Alphabet (0-9, a-z, A-Z)
const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = CHARSET.length; // 62

function encodeBase62(num) {
    if (num === 0) return CHARSET[0];
    let encoded = "";
    while (num > 0) {
        encoded = CHARSET[num % BASE] + encoded;
        num = Math.floor(num / BASE);
    }
    return encoded;
}

function decodeBase62(str) {
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const val = CHARSET.indexOf(char);
        if (val === -1) throw new Error(\`Invalid Base62 character: \${char}\`);
        num = num * BASE + val;
    }
    return num;
}

module.exports = { encodeBase62, decodeBase62 };`
            },
            {
                name: "cache.js",
                path: "src/cache.js",
                language: "javascript",
                content: `// Redis Write-Through Cache simulator
const cache = new Map();

async function cacheUrl(shortCode, originalUrl) {
    cache.set(shortCode, originalUrl);
}

async function getCachedUrl(shortCode) {
    return cache.get(shortCode) || null;
}

module.exports = { cacheUrl, getCachedUrl };`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Base62 Encoding Engine & Hash Generator",
                objective: "Implement mathematical Base62 encoding to convert numeric 64-bit IDs into compact 6-character strings.",
                specRules: [
                    "Map integers to alphanumeric charset [0-9a-zA-Z].",
                    "Handle zero and max 64-bit integer numbers without precision loss.",
                    "Reversible bijection: decode(encode(x)) === x."
                ],
                hints: ["Standard modulo division with remainder gives the least significant digit."],
                testCases: [
                    { name: "Zero integer encoding", cmd: "encodeBase62(0)", expected: "'0'" },
                    { name: "Bijective encoding check", cmd: "decode(encode(125309))", expected: "125309" }
                ]
            }
        ]
    },
    "local-rag-agent": {
        language: "python",
        repoName: "skillforge/local-rag-agent-py",
        files: [
            {
                name: "main.py",
                path: "src/main.py",
                language: "python",
                content: `"""
SkillForge Project Workspace: Autonomous Local RAG & Codebase Assistant
Track: AI & Machine Learning Systems
Milestone 1: AST Code Chunking & Semantic Boundary Extractor
"""
import ast
import json
from typing import List, Dict, Any

class CodeChunker:
    """
    Extracts semantic function and class boundaries from source code using AST.
    Avoids arbitrary token slicing to preserve complete logical context.
    """
    def __init__(self, language: str = "python"):
        self.language = language

    def chunk_python(self, source_code: str) -> List[Dict[str, Any]]:
        """
        Parses Python code into an Abstract Syntax Tree (AST) and
        returns a list of structured chunks with metadata.
        """
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return [{"error": f"Invalid Python syntax: {e}", "chunks": []}]

        chunks = []
        lines = source_code.splitlines()

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                start_line = node.lineno
                end_line = getattr(node, "end_lineno", start_line)
                chunk_lines = lines[start_line - 1:end_line]
                
                chunks.append({
                    "type": "function",
                    "name": node.name,
                    "start_line": start_line,
                    "end_line": end_line,
                    "docstring": ast.get_docstring(node) or "",
                    "content": "\\n".join(chunk_lines)
                })
            elif isinstance(node, ast.ClassDef):
                start_line = node.lineno
                end_line = getattr(node, "end_lineno", start_line)
                chunk_lines = lines[start_line - 1:end_line]

                chunks.append({
                    "type": "class",
                    "name": node.name,
                    "start_line": start_line,
                    "end_line": end_line,
                    "docstring": ast.get_docstring(node) or "",
                    "content": "\\n".join(chunk_lines)
                })

        return sorted(chunks, key=lambda c: c["start_line"])

def initialize() -> Dict[str, Any]:
    """Milestone 1 entrypoint initializing the chunking pipeline."""
    chunker = CodeChunker(language="python")
    sample_code = '''def calculate_metrics(data):
    """Calculates precision and recall."""
    return {"status": "ok", "items": len(data)}
'''
    result = chunker.chunk_python(sample_code)
    return {
        "status": "initialized",
        "ready": True,
        "sample_chunks": len(result)
    }

if __name__ == "__main__":
    print("⚡ Autonomous Local RAG & Codebase Assistant initializing...")
    init_state = initialize()
    print(f"✓ Chunker engine online: {init_state}")
`
            },
            {
                name: "retriever.py",
                path: "src/retriever.py",
                language: "python",
                content: `"""
Semantic Vector Retrieval & Hybrid Search Engine
"""
from typing import List, Dict, Any

class HybridRetriever:
    def __init__(self, collection_name: str = "codebase_index"):
        self.collection_name = collection_name
        self.index = {}

    def index_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        for idx, chunk in enumerate(chunks):
            self.index[f"chunk_{idx}"] = chunk
        return len(self.index)

    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        # Milestone 2 & 3: Dense vector cosine similarity + BM25 keyword fusion
        matches = []
        for key, chunk in self.index.items():
            if any(word.lower() in chunk.get("content", "").lower() for word in query_text.split()):
                matches.append(chunk)
            if len(matches) >= top_k:
                break
        return matches
`
            },
            {
                name: "requirements.txt",
                path: "requirements.txt",
                language: "text",
                content: `fastapi>=0.110.0
chromadb>=0.4.24
langchain>=0.1.14
uvicorn>=0.28.0
pydantic>=2.6.4
`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "AST Python/JS Code Chunking & Boundary Extractor",
                objective: "Parse source code into Abstract Syntax Trees (AST) and extract discrete, syntactically whole function and class chunks.",
                specRules: [
                    "Parse valid Python scripts using standard library `ast.parse`.",
                    "Preserve full function signatures, docstrings, and decorators.",
                    "Tag each extracted chunk with its starting and ending line coordinates.",
                    "Ensure syntax errors in target files are gracefully captured with informative diagnostics."
                ],
                hints: [
                    "Use `ast.walk()` or `ast.NodeVisitor` to traverse tree nodes without missing nested definitions.",
                    "The `ast.get_docstring(node)` helper extracts raw docstrings cleanly."
                ],
                testCases: [
                    { name: "AST Parse Single Function", cmd: "chunker.chunk_python('def foo(): pass')", expected: "1 function chunk extracted" },
                    { name: "Class Hierarchy Extraction", cmd: "chunker.chunk_python('class VectorStore: pass')", expected: "1 class chunk extracted" },
                    { name: "Line Number Boundary Accuracy", cmd: "chunk['start_line'] <= chunk['end_line']", expected: "Valid line intervals" },
                    { name: "Docstring Extraction Fidelity", cmd: "chunk['docstring'] matches function header", expected: "Docstring preserved" },
                    { name: "Syntax Error Boundary Catching", cmd: "chunker.chunk_python('def unclosed(')", expected: "Handled gracefully" }
                ]
            },
            {
                milestone: 2,
                title: "ChromaDB Vector Store Ingestion & Embeddings",
                objective: "Compute dense vector embeddings and persist code chunks into a local ChromaDB collection.",
                specRules: [
                    "Initialize ChromaDB persistent client pointing to `./chroma_db`.",
                    "Generate embeddings with consistent dimensionality (384 or 1536 dims).",
                    "Store source file path, chunk type, and start line in chunk metadata dictionary."
                ],
                hints: [
                    "Batch chunk insertions to optimize embedding throughput."
                ],
                testCases: [
                    { name: "ChromaDB Client Initialization", cmd: "chromadb.PersistentClient()", expected: "Collection handle acquired" },
                    { name: "Chunk Metadata Serialization", cmd: "collection.add(documents, metadatas)", expected: "Chunks persisted" }
                ]
            },
            {
                milestone: 3,
                title: "Hybrid Lexical + Dense Semantic Search Engine",
                objective: "Combine dense vector similarity search with BM25 lexical keyword matching using Reciprocal Rank Fusion (RRF).",
                specRules: [
                    "Perform cosine distance query across vector embeddings.",
                    "Execute BM25 lexical token match across codebase chunks.",
                    "Merge rank lists using RRF formula: RRF_score = sum(1 / (60 + rank))."
                ],
                hints: ["Tune k=60 in RRF to balance exact symbol matches against conceptual semantic similarity."],
                testCases: [
                    { name: "Cosine Vector Match", cmd: "vector_search('database connection pool')", expected: "Pool chunks ranked highest" },
                    { name: "Exact Symbol Lexical Search", cmd: "bm25_search('def parse_resp')", expected: "Exact definition retrieved" }
                ]
            },
            {
                milestone: 4,
                title: "Agent Reasoning Loop with Context Window Truncation",
                objective: "Construct prompt assembly pipeline with dynamic token budget truncation to fit local context limits.",
                specRules: [
                    "Enforce maximum 4096 context token ceiling.",
                    "Sort retrieved chunks by relevance score and greedily fill prompt budget.",
                    "Inject system prompt instructing concise architectural guidance."
                ],
                hints: ["Use tiktoken or token length heuristics (len(text) // 4) to estimate token usage."],
                testCases: [
                    { name: "Context Ceiling Protection", cmd: "assemble_prompt(chunks, max_tokens=2048)", expected: "Total tokens <= 2048" }
                ]
            },
            {
                milestone: 5,
                title: "Real-Time SSE Streaming Output & Syntax Highlighter",
                objective: "Stream AI response tokens to frontend subscribers using Server-Sent Events (SSE).",
                specRules: [
                    "Expose FastAPI endpoint `GET /api/agent/stream?query=...` with `text/event-stream` media type.",
                    "Yield tokens as `data: {\"token\": \"...\"}\\n\\n` chunks.",
                    "Signal stream termination with `data: [DONE]\\n\\n`."
                ],
                hints: ["In FastAPI, return a `StreamingResponse(event_generator(), media_type='text/event-stream')`."],
                testCases: [
                    { name: "SSE Content-Type Header", cmd: "curl -I /api/agent/stream", expected: "Content-Type: text/event-stream" },
                    { name: "Token Stream Termination", cmd: "Read full stream until EOF", expected: "Received [DONE] event" }
                ]
            }
        ]
    }
};

/**
 * Returns complete workspace starter data, generating fallback structure if not pre-defined.
 */
export function getProjectWorkspaceData(projectId, projectMeta) {
    if (PROJECT_WORKSPACES[projectId]) {
        return PROJECT_WORKSPACES[projectId];
    }

    // Dynamic fallback starter skeleton for any other project in the catalog
    const primaryTech = (projectMeta?.techStack?.[0] || "javascript").toLowerCase();
    const ext = primaryTech === "rust" ? "rs" :
                primaryTech === "python" ? "py" :
                primaryTech === "go" || primaryTech === "golang" ? "go" : "js";

    let starterMain = "";
    let starterTests = "";

    if (ext === "py") {
        starterMain = `"""
SkillForge Project Workspace: ${projectMeta?.title || "Engineering Spec"}
Track: ${projectMeta?.track || "Systems Core"}
Milestone 1 Implementation
"""

def initialize():
    """TODO: Implement Milestone 1 logic"""
    return {"status": "initialized", "ready": True}

if __name__ == "__main__":
    print("⚡ Welcome to ${projectMeta?.title || "Project Forge"}")
    print("Follow the Milestone specification guide on the left panel to begin.")
    status = initialize()
    print(f"✓ System status: {status}")
`;
        starterTests = `# Automated Test Suite for ${projectMeta?.title || "Project"}
# Run tests using the 'Run Tests' button in the toolbar

import unittest

class Milestone1Tests(unittest.TestCase):
    def test_initialization(self):
        """Verify runtime initialization"""
        self.assertTrue(True)

if __name__ == "__main__":
    unittest.main()
`;
    } else if (ext === "rs") {
        starterMain = `// SkillForge Project Workspace: ${projectMeta?.title || "Engineering Spec"}
// Track: ${projectMeta?.track || "Systems Core"}
// Milestone 1 Implementation

pub fn initialize() -> bool {
    // TODO: Implement Milestone 1 logic
    true
}

fn main() {
    println!("⚡ Welcome to ${projectMeta?.title || "Project Forge"}");
    println!("Follow the Milestone specification guide on the left panel to begin.");
    let ready = initialize();
    println!("✓ System status initialized: {}", ready);
}
`;
        starterTests = `// Automated Test Suite for ${projectMeta?.title || "Project"}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initialization() {
        assert!(true);
    }
}
`;
    } else if (ext === "go") {
        starterMain = `// SkillForge Project Workspace: ${projectMeta?.title || "Engineering Spec"}
// Track: ${projectMeta?.track || "Systems Core"}
// Milestone 1 Implementation

package main

import "fmt"

func Initialize() bool {
    // TODO: Implement Milestone 1 logic
    return true
}

func main() {
    fmt.Println("⚡ Welcome to ${projectMeta?.title || "Project Forge"}")
    fmt.Println("Follow the Milestone specification guide on the left panel to begin.")
    ready := Initialize()
    fmt.Printf("✓ System status initialized: %v\\n", ready)
}
`;
        starterTests = `// Automated Test Suite for ${projectMeta?.title || "Project"}
package main

import "testing"

func TestInitialization(t *testing.T) {
    if !Initialize() {
        t.Errorf("Initialize() returned false")
    }
}
`;
    } else {
        starterMain = `// SkillForge Project Workspace: ${projectMeta?.title || "Engineering Spec"}
// Track: ${projectMeta?.track || "Frontend & Web Systems"}
// Milestone 1 Implementation

console.log("⚡ Welcome to ${projectMeta?.title || "Project Forge"}");
console.log("Follow the Milestone specification guide on the left panel to begin.");

function initialize() {
    // TODO: Implement Milestone 1 logic
    return { status: "initialized", ready: true };
}

module.exports = { initialize };
`;
        starterTests = `// Automated Test Suite for ${projectMeta?.title || "Project"}
// Run tests using the 'Run Tests' button in the toolbar

describe("Milestone 1 Verification", () => {
    it("should initialize runtime successfully", () => {
        expect(true).toBe(true);
    });
});
`;
    }

    return {
        language: primaryTech,
        repoName: `skillforge/${projectId}-starter`,
        files: [
            {
                name: `main.${ext}`,
                path: `src/main.${ext}`,
                language: primaryTech,
                content: starterMain
            },
            {
                name: `tests.${ext}`,
                path: `tests/spec_test.${ext}`,
                language: primaryTech,
                content: starterTests
            },
            {
                name: "README.md",
                path: "README.md",
                language: "markdown",
                content: `# ${projectMeta?.title || "Project Specification"}

> ${projectMeta?.tagline || ""}

## Architectural Instructions
1. Review the milestone objectives in the left navigation tab.
2. Edit the starter files in the code editor.
3. Click **Run Tests** (or press Ctrl+Enter) to verify against the automated test runner.
4. Pass all test assertions to advance to the next milestone.`
            }
        ],
        milestoneGuides: projectMeta?.milestones?.map((m, idx) => ({
            milestone: idx + 1,
            title: m.title,
            objective: `Implement ${m.title} according to production engineering constraints.`,
            specRules: [
                "Follow clean architecture separation of concerns.",
                "Ensure error boundaries and graceful exception recovery.",
                `Pass all ${m.testCount || 4} automated verification test assertions.`
            ],
            hints: [
                "Inspect the starter code in the middle pane.",
                "Verify return values and formatting carefully."
            ],
            testCases: Array.from({ length: m.testCount || 4 }).map((_, i) => ({
                name: `Harness ${idx + 1}.${i + 1}: Spec assertion criteria`,
                cmd: `test_harness_m${idx + 1}_step${i + 1}`,
                expected: "Assertion passed with exit code 0"
            }))
        })) || []
    };
}
