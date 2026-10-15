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
                prerequisites: [
                    "Rust 1.75+ or Go 1.21+ or Node 18+",
                    "TCP socket networking and stream buffering",
                    "Redis CLI client (optional for verification)"
                ],
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
                prerequisites: [
                    "Byte slice manipulation without unnecessary allocations",
                    "ASCII carriage return and newline tokenization (CRLF)",
                    "Case-insensitive command normalization"
                ],
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
                    { name: "Malformed Packet Recovery", cmd: "Send partial chunk '$10\\r\\nchunk'", expected: "Buffer awaits remainder" },
                    { name: "Integer RESP Type Parsing", cmd: "parse ':1000\\r\\n'", expected: "Integer(1000)" },
                    { name: "Simple String RESP Parsing", cmd: "parse '+OK\\r\\n'", expected: "SimpleString('OK')" },
                    { name: "Bulk String Slicing Bounds", cmd: "parse '$5\\r\\nhello\\r\\n'", expected: "BulkString('hello')" },
                    { name: "Case Insensitive Dispatch", cmd: "redis-cli pInG", expected: "PONG" }
                ]
            },
            {
                milestone: 3,
                title: "Thread-Safe Key/Value Store with TTL Expiry",
                objective: "Implement SET and GET commands with optional expiration in milliseconds (PX) or seconds (EX).",
                prerequisites: [
                    "Thread synchronization via Arc<RwLock<T>> or sync.RWMutex",
                    "Monotonic clock timestamps (std::time::Instant)",
                    "Lazy expiration checking algorithms on key access"
                ],
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
                    { name: "Thread-safe concurrent writes", cmd: "100 parallel worker threads SET distinct keys", expected: "100/100 keys preserved" },
                    { name: "GET Expired Key Purge", cmd: "GET key after TTL", expected: "Key unlinked and (nil) returned" },
                    { name: "Millisecond TTL Precision", cmd: "SET k v PX 50", expected: "Active for exactly 50ms" }
                ]
            },
            {
                milestone: 4,
                title: "LRU Memory Eviction & Concurrent Connections",
                objective: "Limit maximum server memory usage. When maxmemory is reached, evict keys using the Least Recently Used (LRU) algorithm.",
                prerequisites: [
                    "Doubly Linked List + HashMap architecture or sampled LRU approximation",
                    "Memory allocation tracking or heap profiling",
                    "Concurrency protection during memory threshold eviction"
                ],
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
                    { name: "INFO memory metrics", cmd: "redis-cli INFO memory", expected: "used_memory accurately returned" },
                    { name: "Sampled Eviction Threshold", cmd: "Verify 5-sample oldest eviction", expected: "Oldest sample candidate removed" },
                    { name: "Zero Memory Leak Guarantee", cmd: "Run 10,000 SET/GET/Evict cycles", expected: "Memory remains bounded" },
                    { name: "Sub-millisecond Eviction", cmd: "Measure eviction latency", expected: "Latency < 0.5ms" },
                    { name: "Concurrent SET Under Pressure", cmd: "Concurrent writes at memory ceiling", expected: "Continuous eviction without crash" }
                ]
            },
            {
                milestone: 5,
                title: "RDB Disk Snapshot Encoding & Recovery",
                objective: "Persist the in-memory database to disk using the binary RDB file format, and reload state upon server restart.",
                prerequisites: [
                    "Binary file serialization and big-endian variable length integers",
                    "CRC64 checksum calculation",
                    "Atomic file rename pattern (temp file -> target file)"
                ],
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
                    { name: "CRC64 Checksum validation", cmd: "Inspect trailing 8-byte checksum", expected: "Checksum matches" },
                    { name: "Excluded Expired Keys in RDB", cmd: "SAVE with expired keys in store", expected: "Expired keys omitted from dump" },
                    { name: "Database Index Opcode Header", cmd: "Inspect FE 00 opcode in RDB stream", expected: "DB index 0 cleanly identified" }
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
import { Shape } from "./types";

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
            } else if (shape.type === "circle") {
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.width / 2, 0, Math.PI * 2);
                ctx.fill();
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
import { RemoteCursor, Shape } from "./types";

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

    const broadcastShape = useCallback((shape: Shape) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "shape_create", shape }));
        }
    }, []);

    return { cursors, broadcastCursor, broadcastShape };
}`
            },
            {
                name: "types.ts",
                path: "src/types.ts",
                language: "typescript",
                content: `export interface Shape {
    id: string;
    type: "rectangle" | "circle" | "arrow";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    updatedAt: number;
}

export interface RemoteCursor {
    id: string;
    username: string;
    color: string;
    x: number;
    y: number;
}`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Infinite HTML5 2D Vector Canvas Viewport",
                objective: "Construct high-DPI HTML5 Canvas with smooth 60fps pan/zoom matrix transformations.",
                prerequisites: [
                    "HTML5 Canvas 2D Rendering Context API",
                    "devicePixelRatio retina scaling logic",
                    "2D affine matrix transformation mathematics"
                ],
                specRules: [
                    "Handle devicePixelRatio scaling to prevent retina blur.",
                    "Support middle-click dragging to pan the infinite viewport.",
                    "Implement wheel zoom centering on mouse cursor coordinates."
                ],
                hints: ["Use ctx.setTransform or Matrix2D math rather than modifying individual shape positions."],
                testCases: [
                    { name: "Retina Canvas Scaling", cmd: "verify canvas.width === clientWidth * dpr", expected: "Crisp pixels on 2x DPR" },
                    { name: "Camera Matrix Panning", cmd: "Pan canvas by (100, 200)", expected: "Viewport origin shifts accurately" },
                    { name: "Cursor Centered Zoom", cmd: "Zoom 1.5x at point (400, 300)", expected: "Focal point preserved" },
                    { name: "Clear Rect Optimization", cmd: "Render tick executes clearRect", expected: "60fps zero flicker" },
                    { name: "Viewport Boundary Clamping", cmd: "Pan to extreme coordinates", expected: "Float overflow avoided" }
                ]
            },
            {
                milestone: 2,
                title: "Multiplayer WebSocket Connection & Presence Broadcast",
                objective: "Stream peer cursor positions and join/leave presence events with heartbeat reconnection.",
                prerequisites: [
                    "WebSocket client-server handshake protocol",
                    "Presence heartbeat timers and timeout eviction",
                    "JSON serialization for real-time cursor packets"
                ],
                specRules: [
                    "Send binary or JSON presence heartbeats every 5 seconds.",
                    "Remove inactive client cursors after 10 seconds of silence."
                ],
                hints: ["Throttle cursor mousemove events with requestAnimationFrame."],
                testCases: [
                    { name: "Broadcast Cursor Coordinates", cmd: "Move cursor across (450, 320)", expected: "Remote peers receive coordinates" },
                    { name: "Presence Timeout Eviction", cmd: "Peer disconnects", expected: "Cursor vanishes within 10s" },
                    { name: "Heartbeat Interval Verification", cmd: "Monitor ping frequency", expected: "5s heartbeat interval maintained" },
                    { name: "Room Multi-tenant Isolation", cmd: "Connect to room A vs room B", expected: "Traffic separated cleanly" },
                    { name: "Exponential Reconnect Backoff", cmd: "Simulate socket drop", expected: "Reconnects with 1s, 2s, 4s delay" },
                    { name: "Unique Peer Color Assignment", cmd: "Join 3 clients", expected: "3 distinct cursor colors assigned" }
                ]
            },
            {
                milestone: 3,
                title: "Smoothing Live Cursors with Linear Interpolation",
                objective: "Eliminate jitter in remote peer cursors by applying linear interpolation (lerp) over packet arrival windows.",
                prerequisites: [
                    "Mathematical linear interpolation formula: x + (target - x) * alpha",
                    "requestAnimationFrame render loop decoupling from network events",
                    "Clock drift estimation between peers"
                ],
                specRules: [
                    "Buffer incoming cursor packets and interpolate over 60fps render frames.",
                    "Ensure maximum cursor latency lag remains below 50ms.",
                    "Smooth position jumps when network packets arrive out of order."
                ],
                hints: ["Tune lerp coefficient alpha between 0.15 and 0.25 for responsive yet buttery movement."],
                testCases: [
                    { name: "Linear Interpolation Curve", cmd: "lerp(0, 100, 0.2)", expected: "Smooth trajectory calculated" },
                    { name: "Jitter Reduction Verification", cmd: "Send jerky 10Hz network updates", expected: "Render output remains 60fps smooth" },
                    { name: "Velocity Prediction Guard", cmd: "Simulate packet loss for 100ms", expected: "Cursor glides forward gracefully" },
                    { name: "Smooth Trailing Decay", cmd: "Peer halts movement", expected: "Cursor settles exactly on target" }
                ]
            },
            {
                milestone: 4,
                title: "Concurrent Shape Mutations & Conflict Resolution",
                objective: "Support drawing shapes with real-time multi-user synchronization using Last-Write-Wins (LWW) conflict resolution.",
                prerequisites: [
                    "Operational transformation / CRDT / LWW timestamp ordering",
                    "Bounding box hit testing for shape selection",
                    "Command pattern for undo/redo state management"
                ],
                specRules: [
                    "Assign monotonic timestamp and client UUID to every shape mutation.",
                    "When two clients mutate the same shape concurrently, highest timestamp wins.",
                    "Broadcast shape deletions and color updates instantly to all room members."
                ],
                hints: ["Use crypto.randomUUID() for deterministic unique shape identity across peers."],
                testCases: [
                    { name: "Rectangle Creation Broadcast", cmd: "Create rect {x: 10, y: 10, w: 100, h: 50}", expected: "Peers render shape" },
                    { name: "Circle Creation Broadcast", cmd: "Create circle {r: 40}", expected: "Peers render circle" },
                    { name: "Bounding Box Hit Test", cmd: "Click inside shape bounds", expected: "Shape selected" },
                    { name: "LWW Timestamp Conflict Resolution", cmd: "Simulate concurrent drag on shape 1", expected: "Newer timestamp preserved" },
                    { name: "Color Mutation Broadcast", cmd: "Change shape color to #2563EB", expected: "Peers update color" },
                    { name: "Z-Index Reordering", cmd: "Bring shape to front", expected: "Z-index incremented" },
                    { name: "Undo State Restoration", cmd: "Trigger Undo command", expected: "Previous canvas state restored" },
                    { name: "Redo State Restoration", cmd: "Trigger Redo command", expected: "Restored future mutation" }
                ]
            },
            {
                milestone: 5,
                title: "Local History Tree & High-Res Image Export",
                objective: "Implement branching undo/redo tree and export vector canvases to SVG and high-resolution PNG images.",
                prerequisites: [
                    "Vector SVG string serialization from Canvas shape graph",
                    "HTML5 Canvas.toDataURL() with resolution scaling",
                    "Browser Blob download trigger using anchor element"
                ],
                specRules: [
                    "Generate valid XML SVG 1.1 output containing all active vector shapes.",
                    "Export 300DPI PNG image maintaining crisp line edges.",
                    "Save and load room snapshot states via JSON serialization."
                ],
                hints: ["Scale the export canvas size by 2x or 3x before rendering shapes to achieve print quality 300DPI."],
                testCases: [
                    { name: "SVG XML Serialization", cmd: "exportToSvg()", expected: "Valid <svg> markup generated" },
                    { name: "High-Res PNG Export", cmd: "exportToPng(scale=2.0)", expected: "Crisp 3840x2160 image exported" },
                    { name: "JSON Room Snapshot Backup", cmd: "exportRoomJson()", expected: "Complete room state serialized" },
                    { name: "Snapshot Import Validation", cmd: "importRoomJson(data)", expected: "All shapes and layers restored" }
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

if (require.main === module) {
    app.listen(3000, () => {
        console.log("🚀 URL Shortener Service running on port 3000");
    });
}

module.exports = app;`
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

async function cacheUrl(shortCode, originalUrl, ttlSeconds = 86400) {
    cache.set(shortCode, {
        url: originalUrl,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });
}

async function getCachedUrl(shortCode) {
    const entry = cache.get(shortCode);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(shortCode);
        return null;
    }
    return entry.url;
}

module.exports = { cacheUrl, getCachedUrl };`
            },
            {
                name: "package.json",
                path: "package.json",
                language: "json",
                content: `{
  "name": "url-shortener-distributed",
  "version": "1.0.0",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "ioredis": "^5.3.2",
    "pg": "^8.11.3"
  }
}`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Base62 Encoding Engine & Hash Generator",
                objective: "Implement mathematical Base62 encoding to convert numeric 64-bit IDs into compact 6-character strings.",
                prerequisites: [
                    "Modulo arithmetic and integer division",
                    "Base62 alphanumeric charset bijective mapping",
                    "JavaScript BigInt handling for 64-bit precision"
                ],
                specRules: [
                    "Map integers to alphanumeric charset [0-9a-zA-Z].",
                    "Handle zero and max 64-bit integer numbers without precision loss.",
                    "Reversible bijection: decode(encode(x)) === x."
                ],
                hints: ["Standard modulo division with remainder gives the least significant digit."],
                testCases: [
                    { name: "Zero integer encoding", cmd: "encodeBase62(0)", expected: "'0'" },
                    { name: "Bijective encoding check", cmd: "decode(encode(125309))", expected: "125309" },
                    { name: "64-bit integer encoding", cmd: "encodeBase62(9007199254740991)", expected: "Valid 64-bit string" },
                    { name: "Charset validity check", cmd: "verify all chars in [0-9a-zA-Z]", expected: "All characters conform" },
                    { name: "Sequential ID collision resistance", cmd: "encode sequential IDs 1000..1100", expected: "0 collisions across 100 IDs" },
                    { name: "Negative number validation", cmd: "encodeBase62(-1)", expected: "Throws Error or returns empty" }
                ]
            },
            {
                milestone: 2,
                title: "PostgreSQL Schema & Unique Hash Indexing",
                objective: "Design optimized relational table schema with unique B-Tree index on short_code for sub-millisecond lookups.",
                prerequisites: [
                    "PostgreSQL table creation and constraints (PRIMARY KEY, UNIQUE)",
                    "B-Tree index structure fundamentals",
                    "Parameterized SQL queries to prevent injection"
                ],
                specRules: [
                    "Create `urls` table with fields `id` (BIGSERIAL), `short_code` (VARCHAR(10)), `original_url` (TEXT), `created_at` (TIMESTAMP).",
                    "Enforce UNIQUE index on `short_code` column.",
                    "Verify query execution plan uses Index Scan on lookup."
                ],
                hints: ["Use `CREATE UNIQUE INDEX idx_urls_short_code ON urls(short_code);` for maximum lookup speed."],
                testCases: [
                    { name: "Schema Migration Execution", cmd: "Verify table 'urls' exists in database", expected: "Table present with required columns" },
                    { name: "Unique Constraint Violation", cmd: "Insert duplicate short_code 'abc'", expected: "Rejects with unique violation error" },
                    { name: "Index Scan Verification", cmd: "EXPLAIN SELECT * WHERE short_code = 'abc'", expected: "Query plan uses Index Scan" },
                    { name: "Sub-millisecond Query Latency", cmd: "Benchmark 1000 SELECT lookups", expected: "Mean query latency < 1.5ms" }
                ]
            },
            {
                milestone: 3,
                title: "Redis Write-Through Cache with Cache-Stampede Shield",
                objective: "Front database reads with an in-memory Redis cache and implement probabilistic early expiration (XFetch) to prevent thundering herds.",
                prerequisites: [
                    "Redis GET/SET/EXPIRE operations",
                    "Cache-aside vs Write-through caching patterns",
                    "Cache stampede mitigation using mutex lock or XFetch algorithm"
                ],
                specRules: [
                    "Query Redis first on redirect; return cached URL immediately on hit.",
                    "On cache miss, fetch from PostgreSQL, populate Redis with 24h TTL, and return.",
                    "Implement distributed lock or probabilistic early expiration to shield database during stampedes."
                ],
                hints: ["Redis `SET key value NX PX 5000` is the standard distributed lock implementation."],
                testCases: [
                    { name: "Cache Hit Direct Return", cmd: "GET /abc with warm cache", expected: "Returns cached URL in < 1ms" },
                    { name: "Cache Miss Fallthrough", cmd: "GET /fresh with empty cache", expected: "Fetches DB and warms Redis" },
                    { name: "Write-Through on Shorten", cmd: "POST /api/shorten", expected: "Written to both DB and Redis" },
                    { name: "TTL Expiration Verification", cmd: "Inspect Redis TTL on created key", expected: "TTL set to 86400s (24h)" },
                    { name: "Cache Stampede Shield", cmd: "Fire 50 concurrent requests on uncached key", expected: "Exactly 1 DB read triggered" },
                    { name: "Probabilistic Early Expiration", cmd: "Simulate delta background refresh", expected: "Refreshed before hard TTL" },
                    { name: "Redis Downtime Fallback", cmd: "Simulate Redis failure", expected: "Gracefully falls back to PostgreSQL" }
                ]
            },
            {
                milestone: 4,
                title: "Sliding-Window Rate Limiting Middleware",
                objective: "Implement a Redis-backed sliding-window counter rate limiter allowing maximum 100 requests per minute per IP.",
                prerequisites: [
                    "Redis Sorted Sets (ZADD, ZREMRANGEBYSCORE, ZCARD)",
                    "HTTP 429 Too Many Requests status code",
                    "X-RateLimit-* standard response headers"
                ],
                specRules: [
                    "Maintain timestamps in Redis sorted set keyed by client IP.",
                    "Prune timestamps older than `now - 60 seconds` on every request.",
                    "If active count > 100, return HTTP 429 with `Retry-After` header.",
                    "Include `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers in all responses."
                ],
                hints: ["Use a Redis MULTI transaction to execute ZREMRANGEBYSCORE, ZADD, and ZCARD atomically."],
                testCases: [
                    { name: "Under-limit Pass-through", cmd: "Send 50 requests in 30 seconds", expected: "All return HTTP 200/301" },
                    { name: "Rate Limit Exceeded (HTTP 429)", cmd: "Send 101st request within 1 minute", expected: "Returns HTTP 429 Too Many Requests" },
                    { name: "Rate Limit Header Decrement", cmd: "Inspect X-RateLimit-Remaining", expected: "Decrements accurately from 100 to 0" },
                    { name: "Per-IP Bucket Isolation", cmd: "IP A hits limit; IP B sends request", expected: "IP B allowed through" },
                    { name: "Window Expiration Recovery", cmd: "Wait 61 seconds after rate limit", expected: "Bucket resets to 100 capacity" }
                ]
            },
            {
                milestone: 5,
                title: "Telemetry Analytics Worker & Click Geo-tracking",
                objective: "Asynchronously record click telemetry (country, referrer, device) to analytics queue without adding redirect latency.",
                prerequisites: [
                    "Asynchronous message queuing or background worker patterns",
                    "User-Agent parsing for browser/OS identification",
                    "HTTP Referer header parsing"
                ],
                specRules: [
                    "Dispatch click event to background queue before terminating 301 response.",
                    "Capture client IP, User-Agent, Referrer, and epoch timestamp.",
                    "Aggregate hourly click metrics in an `analytics_clicks` table.",
                    "Provide GET `/api/stats/:shortCode` returning total clicks, top referrers, and country breakdown."
                ],
                hints: ["Never block the HTTP 301 redirect on database writes; fire-and-forget or queue to Redis stream."],
                testCases: [
                    { name: "Zero Latency Impact on 301", cmd: "Benchmark redirect latency with telemetry active", expected: "Latency added < 0.2ms" },
                    { name: "Click Event Recording", cmd: "Trigger redirect and inspect queue", expected: "Click event captured with IP & UA" },
                    { name: "User-Agent Device Classification", cmd: "Simulate Mobile Safari User-Agent", expected: "Categorized as Mobile / iOS" },
                    { name: "Country Code Resolution", cmd: "Parse client IP", expected: "ISO-2 country code assigned" },
                    { name: "Stats API Aggregation", cmd: "GET /api/stats/abc after 5 clicks", expected: "Reports { totalClicks: 5 }" },
                    { name: "Hourly Time-Series Grouping", cmd: "Query stats grouped by hour", expected: "Returns hourly bucket distribution" }
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
                prerequisites: [
                    "Python 3.10+ standard library `ast` module",
                    "AST node visitors and recursive tree walking",
                    "Source code line mapping and docstring extraction"
                ],
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
                prerequisites: [
                    "Dense vector representations (high-dimensional floating point vectors)",
                    "ChromaDB persistent client API and collection schemas",
                    "Batch insertion and metadata indexing"
                ],
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
                    { name: "Chunk Metadata Serialization", cmd: "collection.add(documents, metadatas)", expected: "Chunks persisted" },
                    { name: "Embedding Dimension Consistency", cmd: "len(embedding) === 384 or 1536", expected: "Consistent dimensionality" },
                    { name: "Batch Insertion Ingestion", cmd: "Add 100 chunks in single batch", expected: "100/100 documents indexed" },
                    { name: "Chunk ID Deduplication", cmd: "Add duplicate chunk ID", expected: "Updates or skips cleanly" },
                    { name: "Local Disk Directory Creation", cmd: "Verify ./chroma_db directory", expected: "Database files created on disk" }
                ]
            },
            {
                milestone: 3,
                title: "Hybrid Lexical + Dense Semantic Search Engine",
                objective: "Combine dense vector similarity search with BM25 lexical keyword matching using Reciprocal Rank Fusion (RRF).",
                prerequisites: [
                    "Cosine distance / dot product similarity calculation",
                    "BM25 term frequency / inverse document frequency scoring",
                    "Reciprocal Rank Fusion (RRF) rank aggregation algorithm"
                ],
                specRules: [
                    "Perform cosine distance query across vector embeddings.",
                    "Execute BM25 lexical token match across codebase chunks.",
                    "Merge rank lists using RRF formula: RRF_score = sum(1 / (60 + rank))."
                ],
                hints: ["Tune k=60 in RRF to balance exact symbol matches against conceptual semantic similarity."],
                testCases: [
                    { name: "Cosine Vector Match", cmd: "vector_search('database connection pool')", expected: "Pool chunks ranked highest" },
                    { name: "Exact Symbol Lexical Search", cmd: "bm25_search('def parse_resp')", expected: "Exact definition retrieved" },
                    { name: "RRF Score Fusion Merging", cmd: "merge_rankings(dense_results, lexical_results)", expected: "Balanced fused top-k ranking" },
                    { name: "Top-K Relevance Cutoff", cmd: "query(text, top_k=5)", expected: "Returns exactly 5 relevant chunks" },
                    { name: "Whitespace Query Normalization", cmd: "query('   parse_resp   ')", expected: "Matches query accurately" },
                    { name: "Zero Lexical Match Fallback", cmd: "query('conceptual architecture')", expected: "Vector results populate fallback" },
                    { name: "Exact Symbol Retrieval Speed", cmd: "Benchmark query latency", expected: "Sub-50ms query turnaround" }
                ]
            },
            {
                milestone: 4,
                title: "Agent Reasoning Loop with Context Window Truncation",
                objective: "Construct prompt assembly pipeline with dynamic token budget truncation to fit local context limits.",
                prerequisites: [
                    "Tokenization budgeting and context window management",
                    "System prompt engineering for code architecture assistance",
                    "Greedy context packing algorithms"
                ],
                specRules: [
                    "Enforce maximum 4096 context token ceiling.",
                    "Sort retrieved chunks by relevance score and greedily fill prompt budget.",
                    "Inject system prompt instructing concise architectural guidance."
                ],
                hints: ["Use tiktoken or token length heuristics (len(text) // 4) to estimate token usage."],
                testCases: [
                    { name: "Context Ceiling Protection", cmd: "assemble_prompt(chunks, max_tokens=2048)", expected: "Total tokens <= 2048" },
                    { name: "Greedy Relevance Packing", cmd: "Verify order of chunks in prompt", expected: "Highest scoring chunks prioritized" },
                    { name: "System Prompt Injection", cmd: "Verify system instructions header", expected: "Persona & formatting instructions present" },
                    { name: "Few-shot Example Boundaries", cmd: "Inspect example code delimiters", expected: "Delimiters prevent prompt injection" },
                    { name: "Conversation History Truncation", cmd: "Send 10 multi-turn messages", expected: "Oldest messages trimmed cleanly" },
                    { name: "Empty Query Boundary Guard", cmd: "assemble_prompt([])", expected: "Handled gracefully without exception" }
                ]
            },
            {
                milestone: 5,
                title: "Real-Time SSE Streaming Output & Syntax Highlighter",
                objective: "Stream AI response tokens to frontend subscribers using Server-Sent Events (SSE).",
                prerequisites: [
                    "FastAPI StreamingResponse & async generators",
                    "Server-Sent Events (SSE) format: data: ...\\n\\n",
                    "Stream EOF sentinel events"
                ],
                specRules: [
                    "Expose FastAPI endpoint `GET /api/agent/stream?query=...` with `text/event-stream` media type.",
                    "Yield tokens as `data: {\"token\": \"...\"}\\n\\n` chunks.",
                    "Signal stream termination with `data: [DONE]\\n\\n`."
                ],
                hints: ["In FastAPI, return a `StreamingResponse(event_generator(), media_type='text/event-stream')`."],
                testCases: [
                    { name: "SSE Content-Type Header", cmd: "curl -I /api/agent/stream", expected: "Content-Type: text/event-stream" },
                    { name: "Token Stream Chunk Yielding", cmd: "Inspect streamed chunks", expected: "Valid SSE format data: {...}\\n\\n" },
                    { name: "Token Stream Termination", cmd: "Read full stream until EOF", expected: "Received [DONE] event" },
                    { name: "Client Disconnect Cleanup", cmd: "Abort client request mid-stream", expected: "Generator halts without resource leak" },
                    { name: "Real-time Markdown Chunking", cmd: "Stream code block markdown", expected: "Syntax highlights progressively" }
                ]
            }
        ]
    },

    "git-clone": {
        language: "rust",
        repoName: "skillforge/git-starter-rust",
        files: [
            {
                name: "main.rs",
                path: "src/main.rs",
                language: "rust",
                content: `use std::env;
use std::fs;
use std::path::Path;

mod objects;
mod index;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: git-clone <command> [<args>]");
        return;
    }

    match args[1].as_str() {
        "init" => {
            init_repository();
        }
        "hash-object" => {
            let file_path = args.get(2).expect("File path required");
            let sha = objects::hash_object(file_path, true);
            println!("{}", sha);
        }
        "cat-file" => {
            let sha = args.get(3).expect("Object SHA required");
            objects::cat_file(sha);
        }
        _ => eprintln!("Unknown command: {}", args[1]),
    }
}

fn init_repository() {
    fs::create_dir_all(".git/objects").expect("Failed to create .git/objects");
    fs::create_dir_all(".git/refs/heads").expect("Failed to create .git/refs/heads");
    fs::write(".git/HEAD", "ref: refs/heads/main\\n").expect("Failed to write .git/HEAD");
    println!("✓ Initialized empty Git repository in .git/");
}`
            },
            {
                name: "objects.rs",
                path: "src/objects.rs",
                language: "rust",
                content: `// Git Object Database Engine (Blobs, Trees, Commits)
use std::fs;
use std::io::Read;

pub fn hash_object(file_path: &str, write: bool) -> String {
    let content = fs::read(file_path).unwrap_or_default();
    // Milestone 2: Format header "blob <size>\\0<content>", SHA-1 hash, zlib compress
    let header = format!("blob {}\\0", content.len());
    let mut store_data = header.into_bytes();
    store_data.extend_from_slice(&content);

    // Compute synthetic or real SHA-1 digest
    let sha = format!("{:x}", "4b825dc642cb6eb9a060e54bf8d69288fbee4904");
    if write {
        // Shard object into .git/objects/4b/825dc...
    }
    sha
}

pub fn cat_file(sha: &str) {
    println!("Decompressed content of {}", sha);
}`
            },
            {
                name: "index.rs",
                path: "src/index.rs",
                language: "rust",
                content: `// Git Working Directory Index & Tree Serializer
pub struct IndexEntry {
    pub mode: u32,
    pub sha: [u8; 20],
    pub path: String,
}

pub fn write_tree() -> String {
    // Milestone 3: Serialize directory tree in Git canonical order
    "4b825dc642cb6eb9a060e54bf8d69288fbee4904".to_string()
}`
            },
            {
                name: "Cargo.toml",
                path: "Cargo.toml",
                language: "toml",
                content: `[package]
name = "git-starter-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
flate2 = "1.0"
sha1 = "0.10"`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Git Directory Schema & `init` Command",
                objective: "Implement `git init` to construct the internal `.git` filesystem schema, subdirectories, and root HEAD pointer.",
                prerequisites: [
                    "Filesystem directory creation and file writing",
                    "CLI argument parsing (std::env::args)",
                    "Idempotent directory initialization"
                ],
                specRules: [
                    "Create `.git`, `.git/objects`, and `.git/refs/heads` directories.",
                    "Write `.git/HEAD` containing `ref: refs/heads/main\\n`.",
                    "Executing `init` in an already initialized directory must succeed idempotently without corrupting existing files."
                ],
                hints: ["Use `std::fs::create_dir_all` to create nested directory hierarchies in one call."],
                testCases: [
                    { name: "Git Directory Schema Creation", cmd: "git-clone init", expected: ".git/ directory created" },
                    { name: "Objects & Refs Subdirectories", cmd: "Verify .git/objects and .git/refs/heads", expected: "Both directories exist" },
                    { name: "HEAD Symbolic Ref Pointer", cmd: "cat .git/HEAD", expected: "ref: refs/heads/main" },
                    { name: "Idempotent Re-initialization", cmd: "Run git-clone init twice", expected: "Exits cleanly with code 0" }
                ]
            },
            {
                milestone: 2,
                title: "SHA-1 Hash-Object & Zlib Blob Storage",
                objective: "Construct the Git object store: format blobs with length headers, compute SHA-1 digests, and write deflated zlib files.",
                prerequisites: [
                    "SHA-1 160-bit cryptographic hashing",
                    "Zlib deflate and inflate compression algorithms",
                    "Hexadecimal byte string formatting"
                ],
                specRules: [
                    "Header format: `blob <size>\\0<content>`.",
                    "Hash full header + content with SHA-1 to produce 40-character hexadecimal string.",
                    "Compress formatted bytes with zlib deflate.",
                    "Shard object file path: `.git/objects/<first-2-chars>/<remaining-38-chars>`.",
                    "Implement `cat-file -p <sha>` to decompress and display raw blob content."
                ],
                hints: ["The null byte `\\0` is a single zero byte `0x00`, not the characters '\\' and '0'."],
                testCases: [
                    { name: "SHA-1 Hash Calculation", cmd: "git-clone hash-object test.txt", expected: "Accurate 40-char SHA-1 hex" },
                    { name: "Blob Header Formatting", cmd: "Inspect pre-hash buffer", expected: "Includes 'blob <len>\\0'" },
                    { name: "Zlib Deflate Compression", cmd: "Verify stored file format", expected: "Valid zlib compressed stream" },
                    { name: "Object Sharding on Disk", cmd: "Check .git/objects/ab/cd...", expected: "Two-character directory prefix used" },
                    { name: "Cat-File Decompression", cmd: "git-clone cat-file -p <sha>", expected: "Exact original file output" },
                    { name: "Empty File Hashing", cmd: "hash-object empty.txt", expected: "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391" }
                ]
            },
            {
                milestone: 3,
                title: "Recursive Tree Objects & Directory Serialization",
                objective: "Recursively traverse directories to build Git Tree objects containing file modes, names, and 20-byte binary SHA-1 hashes.",
                prerequisites: [
                    "Recursive filesystem tree walk",
                    "Unix file mode masks (100644 for regular file, 100755 for executable, 40000 for directory)",
                    "Git canonical entry sorting (directories sorted as if trailing slash present)"
                ],
                specRules: [
                    "Format tree entry: `<mode> <name>\\0<20_raw_sha_bytes>`.",
                    "Sort entries in canonical Git order.",
                    "Recurse into subdirectories, creating child tree objects first and storing their tree SHA in the parent.",
                    "Implement `write-tree` returning root tree SHA-1."
                ],
                hints: ["In Git, directory mode is `40000` (printed without leading zero in tree entries)."],
                testCases: [
                    { name: "Recursive Directory Walk", cmd: "Traverse nested repo directories", expected: "All files and subdirs captured" },
                    { name: "Tree Entry Binary Format", cmd: "Inspect serialized tree bytes", expected: "<mode> <name>\\0<20-bytes>" },
                    { name: "Git Canonical Sorting", cmd: "Verify order of tree entries", expected: "Canonical alphabetical sorting" },
                    { name: "Sub-tree Object Generation", cmd: "Verify child dir SHA in parent tree", expected: "Child tree linked accurately" },
                    { name: "Official Git Compatibility", cmd: "Compare output with 'git write-tree'", expected: "Identical SHA-1 hashes" },
                    { name: "Executable Mode Preservation", cmd: "Hash script with +x mode", expected: "Mode 100755 preserved" },
                    { name: "Write-Tree Atomic Execution", cmd: "git-clone write-tree", expected: "Writes tree object to .git/objects" }
                ]
            },
            {
                milestone: 4,
                title: "Commit Objects with Author Timestamps & Parents",
                objective: "Construct immutable commit objects linking root tree hashes, parent commit pointers, author identity, and commit messages.",
                prerequisites: [
                    "Epoch timestamps with timezone offsets (+0000, -0800)",
                    "Directed Acyclic Graph (DAG) parent chaining",
                    "Git commit object schema formatting"
                ],
                specRules: [
                    "Format commit header: `commit <size>\\0`.",
                    "Include headers: `tree <sha>`, `parent <sha>` (if not root commit), `author <name> <email> <timestamp> <tz>`, `committer ...`.",
                    "Follow headers with an empty line and commit message.",
                    "Implement `git log` traversal walking parent pointers backwards to root."
                ],
                hints: ["A commit without a parent header is valid and recognized as the root commit of the repository."],
                testCases: [
                    { name: "Commit Object Schema Format", cmd: "Inspect commit body", expected: "Contains tree, author, committer, message" },
                    { name: "Tree Pointer Header Linking", cmd: "Verify 'tree <sha>' line", expected: "Points to valid tree object" },
                    { name: "Parent Pointer Chaining", cmd: "Create second commit", expected: "Contains 'parent <first_commit_sha>'" },
                    { name: "Author Timestamp Encoding", cmd: "Inspect timestamp format", expected: "Valid epoch seconds + timezone" },
                    { name: "Commit Message Trailing Newline", cmd: "Inspect message body", expected: "Formatted with trailing newline" },
                    { name: "Root Commit Generation", cmd: "Create initial commit", expected: "Valid commit without parent header" },
                    { name: "Git Log Chronological Walk", cmd: "git-clone log", expected: "Displays commits in DAG order" },
                    { name: "Deterministic Commit Hashing", cmd: "Hash commit with fixed timestamp", expected: "Consistent SHA-1 computed" }
                ]
            },
            {
                milestone: 5,
                title: "Branch Ref Pointers & Working Directory `checkout`",
                objective: "Manage branch pointers in `.git/refs/heads/`, atomic HEAD symbolic ref switching, and working tree restoration.",
                prerequisites: [
                    "Branch references as files containing 40-character commit hashes",
                    "Atomic ref updates using temporary file swap",
                    "Working tree diffing to prevent overwriting uncommitted modifications"
                ],
                specRules: [
                    "Create branch: write 40-char commit SHA to `.git/refs/heads/<branch_name>`.",
                    "Switch branch (`checkout`): update `.git/HEAD` to point to new ref.",
                    "Restore working directory files to match tree object of target commit.",
                    "Safely abort checkout if uncommitted modified files would be overwritten."
                ],
                hints: ["Always check file status before checkout to guard against accidental data loss."],
                testCases: [
                    { name: "Branch Ref File Creation", cmd: "git-clone branch feature", expected: "Creates .git/refs/heads/feature" },
                    { name: "HEAD Symbolic Ref Switching", cmd: "git-clone checkout feature", expected: "HEAD updated to ref: refs/heads/feature" },
                    { name: "Working Directory Tree Restoration", cmd: "Checkout historical commit", expected: "Files match historical tree" },
                    { name: "Untracked Conflict Protection", cmd: "Checkout with conflicting dirty file", expected: "Aborts with safe error message" },
                    { name: "Detached HEAD State Handling", cmd: "git-clone checkout <raw_sha>", expected: "HEAD contains direct SHA without ref" },
                    { name: "Fast-Forward Branch Advancement", cmd: "Commit on branch", expected: "Ref file updated to new commit SHA" }
                ]
            }
        ]
    },

    "api-gateway-proxy": {
        language: "go",
        repoName: "skillforge/api-gateway-go",
        files: [
            {
                name: "main.go",
                path: "main.go",
                language: "go",
                content: `package main

import (
    "fmt"
    "net/http"
    "time"
)

func main() {
    fmt.Println("⚡ SkillForge Anvil: Starting API Gateway on :8080...")

    balancer := NewLoadBalancer([]string{
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
    })

    server := &http.Server{
        Addr:         ":8080",
        Handler:      balancer,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
    }

    fmt.Println("✓ API Gateway listening on port 8080 with Round-Robin routing.")
    if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        fmt.Printf("Server error: %v\\n", err)
    }
}`
            },
            {
                name: "proxy.go",
                path: "proxy.go",
                language: "go",
                content: `package main

import (
    "net/http"
    "net/http/httputil"
    "net/url"
)

// ReverseProxyWrapper handles forwarding requests to backend microservices
type ReverseProxyWrapper struct {
    targetURL *url.URL
    proxy     *httputil.ReverseProxy
}

func NewReverseProxy(target string) (*ReverseProxyWrapper, error) {
    u, err := url.Parse(target)
    if err != nil {
        return nil, err
    }
    return &ReverseProxyWrapper{
        targetURL: u,
        proxy:     httputil.NewSingleHostReverseProxy(u),
    }, nil
}

func (rp *ReverseProxyWrapper) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Milestone 1: Forward client request headers and stream response
    r.Header.Set("X-Forwarded-Host", r.Host)
    rp.proxy.ServeHTTP(w, r)
}`
            },
            {
                name: "balancer.go",
                path: "balancer.go",
                language: "go",
                content: `package main

import (
    "net/http"
    "sync/atomic"
)

type LoadBalancer struct {
    targets []string
    counter uint64
}

func NewLoadBalancer(targets []string) *LoadBalancer {
    return &LoadBalancer{
        targets: targets,
        counter: 0,
    }
}

func (lb *LoadBalancer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if len(lb.targets) == 0 {
        http.Error(w, "Service Unavailable: No upstream targets", http.StatusServiceUnavailable)
        return
    }

    // Milestone 2: Round-robin selection using atomic counter
    idx := atomic.AddUint64(&lb.counter, 1) % uint64(len(lb.targets))
    target := lb.targets[idx]

    proxy, err := NewReverseProxy(target)
    if err != nil {
        http.Error(w, "Gateway error", http.StatusInternalServerError)
        return
    }
    proxy.ServeHTTP(w, r)
}`
            },
            {
                name: "go.mod",
                path: "go.mod",
                language: "text",
                content: `module skillforge/api-gateway

go 1.21`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Basic TCP/HTTP Reverse Proxy Forwarder",
                objective: "Construct high-throughput HTTP/1.1 reverse proxy forwarding client requests to an upstream backend.",
                prerequisites: [
                    "Go standard library `net/http` and `net/http/httputil`",
                    "HTTP header mutation (X-Forwarded-For, Host)",
                    "Connection pooling and socket keep-alive"
                ],
                specRules: [
                    "Listen on port :8080 and forward requests to configured upstream backend.",
                    "Preserve original request headers while appending `X-Forwarded-For` with client remote address.",
                    "Stream upstream response status code, headers, and body back to client without buffering entire payload."
                ],
                hints: ["Use `httputil.NewSingleHostReverseProxy` as the core forwarding director."],
                testCases: [
                    { name: "HTTP Reverse Proxy Listener", cmd: "curl http://localhost:8080/", expected: "Forwards request to upstream" },
                    { name: "X-Forwarded-For Header Injection", cmd: "Inspect forwarded headers", expected: "Client IP present in X-Forwarded-For" },
                    { name: "Upstream Response Streaming", cmd: "Stream 10MB payload through proxy", expected: "Streams with chunked transfer" },
                    { name: "Clean Upstream 404/500 Pass-through", cmd: "Upstream returns 404", expected: "Proxy returns 404 to client" }
                ]
            },
            {
                milestone: 2,
                title: "Round-Robin Load Balancer with Background Health Checks",
                objective: "Distribute incoming traffic across multiple backends with automatic failover and background health probes.",
                prerequisites: [
                    "Atomic counter operations (`sync/atomic`) for lock-free round-robin",
                    "Background goroutines and periodic `time.Ticker` health checks",
                    "Thread-safe backend target list synchronization"
                ],
                specRules: [
                    "Distribute requests across pool using modulo index on atomic request counter.",
                    "Probe backend `/healthz` endpoint every 5 seconds.",
                    "If node fails 3 consecutive probes, mark node unhealthy and remove from routing pool.",
                    "When unhealthy node recovers, re-admit node to pool automatically."
                ],
                hints: ["Use atomic uint64 modulo to achieve lock-free Round-Robin load distribution."],
                testCases: [
                    { name: "Round-Robin Traffic Distribution", cmd: "Send 10 requests across 2 nodes", expected: "Exactly 5 requests per node" },
                    { name: "Background Health Check Probing", cmd: "Monitor /healthz probes", expected: "Probes fired every 5 seconds" },
                    { name: "Unhealthy Node Automatic Removal", cmd: "Kill backend 2", expected: "100% traffic rerouted to backend 1" },
                    { name: "Zero Dropped Connections on Failover", cmd: "Kill node during traffic burst", expected: "0 failed requests returned" },
                    { name: "Recovered Node Re-admission", cmd: "Restart backend 2", expected: "Traffic distribution restored 50/50" },
                    { name: "No Upstream Targets 503 Guard", cmd: "Kill all backends", expected: "Returns HTTP 503 Service Unavailable" }
                ]
            },
            {
                milestone: 3,
                title: "Cryptographic Edge JWT Authentication Layer",
                objective: "Verify cryptographic JSON Web Tokens (JWT) at the proxy boundary before requests reach internal services.",
                prerequisites: [
                    "JWT RFC 7519 specification (Header.Payload.Signature)",
                    "HMAC-SHA256 signature verification",
                    "Header extraction and claim propagation"
                ],
                specRules: [
                    "Extract token from `Authorization: Bearer <token>` header.",
                    "Validate HMAC-SHA256 signature against secret key and verify expiration timestamp (`exp`).",
                    "If token is valid, extract claims and inject `X-User-Id` header into upstream request.",
                    "If invalid or expired, reject immediately with HTTP 401 Unauthorized."
                ],
                hints: ["Allow bypass whitelist for public endpoints like `/healthz` and `/public/*`."],
                testCases: [
                    { name: "Valid JWT Signature Authorization", cmd: "Send request with valid JWT", expected: "Forwarded to upstream" },
                    { name: "Expired JWT Rejection (HTTP 401)", cmd: "Send request with expired token", expected: "Returns HTTP 401 Unauthorized" },
                    { name: "Forged Token Signature Rejection", cmd: "Tamper with JWT payload", expected: "Rejected with signature mismatch" },
                    { name: "Claim Propagation to Upstream", cmd: "Inspect upstream request", expected: "Contains X-User-Id: <user_id>" },
                    { name: "Public Route Whitelist Bypass", cmd: "GET /public/info without token", expected: "Allowed without authentication" }
                ]
            },
            {
                milestone: 4,
                title: "Dynamic Routing Rules with Path Rewriting",
                objective: "Route requests dynamically based on URL path prefixes and rewrite paths before dispatching upstream.",
                prerequisites: [
                    "URL path matching using prefix trees (Radix Tree) or regex",
                    "URL path stripping (`strings.TrimPrefix`)",
                    "Dynamic route table loading from JSON configuration"
                ],
                specRules: [
                    "Route `/api/v1/users/*` to Users Service; route `/api/v1/billing/*` to Billing Service.",
                    "Strip `/api/v1` prefix before forwarding to upstream services.",
                    "Support path wildcards and HTTP method constraints (e.g. POST only on `/checkout`).",
                    "Return HTTP 404 Not Found if no route matches."
                ],
                hints: ["Use a Radix tree or `http.ServeMux` pattern matching for fast O(k) path lookups."],
                testCases: [
                    { name: "Prefix Route Matching", cmd: "GET /api/v1/users", expected: "Routed to Users Service" },
                    { name: "Path Prefix Stripping", cmd: "Inspect upstream path", expected: "Path rewritten to /users" },
                    { name: "Method Constraint Filtering", cmd: "GET on POST-only route", expected: "Returns HTTP 405 Method Not Allowed" },
                    { name: "Query Parameters Preserved", cmd: "GET /api/v1/search?q=skillforge", expected: "Query string intact upstream" },
                    { name: "Wildcard Path Routing", cmd: "GET /static/assets/logo.png", expected: "Routed to Static Assets Service" },
                    { name: "Custom Header Injection Rule", cmd: "Inspect forwarded headers", expected: "Custom route headers attached" },
                    { name: "Unmatched Route 404 Fallback", cmd: "GET /unknown/path", expected: "Returns HTTP 404 Not Found" }
                ]
            },
            {
                milestone: 5,
                title: "Prometheus Latency Metrics & Docker Cluster Spec",
                objective: "Expose Prometheus `/metrics` endpoint measuring request counts, latencies, and active connections.",
                prerequisites: [
                    "Prometheus metrics exposition format",
                    "Histogram bucket calculation for request latency",
                    "Docker Compose multi-container service orchestration"
                ],
                specRules: [
                    "Expose `GET /metrics` in standard Prometheus text format.",
                    "Track `http_requests_total` counter labeled by method, path, and status code.",
                    "Track `http_request_duration_seconds` histogram with standard latency buckets.",
                    "Provide `docker-compose.yml` spinning up the Gateway, 2 backends, and Prometheus."
                ],
                hints: ["Record the start time `time.Now()` at the beginning of each request and defer histogram observation."],
                testCases: [
                    { name: "Prometheus Metrics Endpoint", cmd: "curl http://localhost:8080/metrics", expected: "Returns valid Prometheus text metrics" },
                    { name: "Requests Total Counter Accurate", cmd: "Send 5 requests then check metrics", expected: "http_requests_total incremented by 5" },
                    { name: "Duration Histogram Recording", cmd: "Inspect latency histogram", expected: "Buckets populated with duration observations" },
                    { name: "Active Connection Gauge", cmd: "Hold 3 concurrent connections", expected: "http_active_connections gauge reports 3" },
                    { name: "Docker Compose Topology Spec", cmd: "docker-compose config", expected: "Cluster configuration valid" }
                ]
            }
        ]
    },

    "audio-synthesizer": {
        language: "javascript",
        repoName: "skillforge/web-audio-synth-js",
        files: [
            {
                name: "Synthesizer.jsx",
                path: "src/Synthesizer.jsx",
                language: "javascript",
                content: `import React, { useState, useEffect, useRef } from "react";
import { AudioEngine } from "./audioEngine";
import { StepSequencer } from "./sequencer";

export default function Synthesizer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(128);
    const [waveform, setWaveform] = useState("sawtooth");
    const [currentStep, setCurrentStep] = useState(0);

    const engineRef = useRef(null);
    const sequencerRef = useRef(null);

    useEffect(() => {
        engineRef.current = new AudioEngine();
        sequencerRef.current = new StepSequencer(engineRef.current, (step) => {
            setCurrentStep(step);
        });

        return () => {
            sequencerRef.current?.stop();
            engineRef.current?.close();
        };
    }, []);

    const togglePlayback = () => {
        if (!isPlaying) {
            engineRef.current?.resume();
            sequencerRef.current?.start(bpm);
            setIsPlaying(true);
        } else {
            sequencerRef.current?.stop();
            setIsPlaying(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#0B0F19] text-white p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-cyan-400">⚡ Web Audio Synthesizer & Drum Machine</h2>
                <button
                    onClick={togglePlayback}
                    className={\`px-6 py-2.5 rounded-xl font-bold \${isPlaying ? "bg-rose-600" : "bg-cyan-500 hover:bg-cyan-400"} text-white transition-all\`}
                >
                    {isPlaying ? "Stop" : "Play Beat"}
                </button>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-slate-400">BPM: {bpm}</span>
                <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setBpm(val);
                        sequencerRef.current?.setBpm(val);
                    }}
                    className="cursor-pointer"
                />
            </div>
        </div>
    );
}`
            },
            {
                name: "audioEngine.js",
                path: "src/audioEngine.js",
                language: "javascript",
                content: `// Web Audio API Synthesis Engine
export class AudioEngine {
    constructor() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = AudioCtx ? new AudioCtx() : null;
    }

    resume() {
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    playTone(frequency, duration = 0.2, type = "sawtooth") {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        // Milestone 2: ADSR Envelope
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    close() {
        this.ctx?.close();
    }
}`
            },
            {
                name: "sequencer.js",
                path: "src/sequencer.js",
                language: "javascript",
                content: `// 16-Step High-Precision BPM Sequencer Clock
export class StepSequencer {
    constructor(engine, onStep) {
        this.engine = engine;
        this.onStep = onStep;
        this.currentStep = 0;
        this.bpm = 120;
        this.intervalId = null;
    }

    start(bpm = 120) {
        this.bpm = bpm;
        this.stop();
        const stepTimeMs = (60 / this.bpm / 4) * 1000;
        this.intervalId = setInterval(() => {
            this.currentStep = (this.currentStep + 1) % 16;
            this.onStep(this.currentStep);
            if (this.currentStep % 4 === 0) {
                this.engine.playTone(220, 0.15, "triangle"); // Kick
            }
        }, stepTimeMs);
    }

    setBpm(bpm) {
        this.bpm = bpm;
        if (this.intervalId) this.start(bpm);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "Web AudioContext & Polyphonic Oscillator Graph",
                objective: "Initialize the Web AudioContext audio graph, create oscillator nodes, and map frequencies to musical pitches.",
                prerequisites: [
                    "Web Audio API (AudioContext, OscillatorNode, GainNode)",
                    "Browser audio gesture autoplay policies",
                    "MIDI note to frequency formula: f = 440 * 2^((n - 69) / 12)"
                ],
                specRules: [
                    "Initialize AudioContext upon user click gesture to satisfy browser security policies.",
                    "Create OscillatorNode and route: Oscillator -> Gain -> Destination.",
                    "Support sine, square, sawtooth, and triangle waveforms.",
                    "Cleanly disconnect audio nodes upon note termination to prevent memory leaks."
                ],
                hints: ["Always check `audioCtx.state === 'suspended'` and call `audioCtx.resume()` inside a user click handler."],
                testCases: [
                    { name: "AudioContext Initialization", cmd: "Initialize audio context on user gesture", expected: "Context state becomes 'running'" },
                    { name: "Oscillator Node Routing", cmd: "Verify audio graph connections", expected: "Node links cleanly to destination" },
                    { name: "Waveform Type Switching", cmd: "Select 'sawtooth' vs 'sine'", expected: "Oscillator type updates accurately" },
                    { name: "Frequency Pitch Mapping", cmd: "Play MIDI note 69 (A4)", expected: "Frequency sets to exactly 440.0Hz" }
                ]
            },
            {
                milestone: 2,
                title: "ADSR Gain Envelope Automation",
                objective: "Construct dynamic ADSR (Attack, Decay, Sustain, Release) envelope automation curves without audio clicks or pops.",
                prerequisites: [
                    "AudioParam automation methods (`linearRampToValueAtTime`, `exponentialRampToValueAtTime`)",
                    "Envelope dynamics in acoustics (Attack time, Decay time, Sustain level, Release time)",
                    "Zero-crossing transitions to prevent speaker clicks"
                ],
                specRules: [
                    "Ramp gain from 0.001 to peak gain over Attack duration.",
                    "Decay gain to Sustain level over Decay duration.",
                    "Maintain Sustain gain while note is held.",
                    "Ramp gain exponentially to 0.001 over Release duration on note release."
                ],
                hints: ["Never ramp `exponentialRampToValueAtTime` to 0.0; always use 0.0001 or 0.001 because exponential math fails at zero."],
                testCases: [
                    { name: "Attack Exponential Ramp", cmd: "Trigger note-on", expected: "Ramps to peak gain in Attack window" },
                    { name: "Decay Linear Ramp", cmd: "Transition past Attack", expected: "Decays to specified Sustain amplitude" },
                    { name: "Sustain Level Hold", cmd: "Hold note for 2 seconds", expected: "Gain remains locked at Sustain level" },
                    { name: "Release Exponential Tail", cmd: "Trigger note-off", expected: "Fades smoothly to zero over Release time" },
                    { name: "Zero Pop / Click Artifact Elimination", cmd: "Inspect waveform at note boundaries", expected: "Zero discontinuity pops" }
                ]
            },
            {
                milestone: 3,
                title: "16-Step High-Precision BPM Sequencer Clock",
                objective: "Build a rock-solid, jitter-free 16-step rhythm sequencer using high-precision web audio scheduling.",
                prerequisites: [
                    "High-precision web scheduling with `audioCtx.currentTime`",
                    "Lookahead scheduling interval loop (25ms timer with 100ms lookahead window)",
                    "Musical time subdivisions (1/16th notes per step)"
                ],
                specRules: [
                    "Schedule note triggers ahead of time using `audioCtx.currentTime`.",
                    "Support dynamic BPM adjustments (60 to 240 BPM) without tempo drift.",
                    "Trigger polyphonic drum voices (Kick, Snare, Hi-Hat) on designated active steps."
                ],
                hints: ["Avoid relying solely on `setInterval` for audio triggers; use the Web Audio clock lookahead scheduling technique."],
                testCases: [
                    { name: "High-Precision Audio Clock", cmd: "Measure step timing jitter", expected: "Jitter < 1.5ms" },
                    { name: "Lookahead Scheduling Queue", cmd: "Inspect scheduled event queue", expected: "Events scheduled 100ms in advance" },
                    { name: "Dynamic BPM Tempo Adjustment", cmd: "Change BPM from 120 to 140", expected: "Step interval updates immediately" },
                    { name: "16-Step Pattern Wrapping", cmd: "Advance past step 15", expected: "Wraps cleanly to step 0" },
                    { name: "Step Velocity Dynamics", cmd: "Trigger step with 0.8 velocity", expected: "Amplitude scales proportionally" },
                    { name: "Multi-Track Voice Layering", cmd: "Trigger Kick + Snare on step 4", expected: "Both voices play concurrently" }
                ]
            },
            {
                milestone: 4,
                title: "Real-Time Frequency Visualizer on HTML Canvas",
                objective: "Render live audio waveforms and frequency bars on an HTML5 canvas using Web Audio AnalyserNode and Fast Fourier Transform (FFT).",
                prerequisites: [
                    "Web Audio AnalyserNode (fftSize, frequencyBinCount)",
                    "Uint8Array and Float32Array frequency buffer extraction",
                    "HTML5 Canvas 60fps requestAnimationFrame drawing loop"
                ],
                specRules: [
                    "Connect AnalyserNode with `fftSize = 2048` between gain output and destination.",
                    "Extract frequency byte data on every `requestAnimationFrame` tick.",
                    "Draw reactive cyber equalizer bars with dynamic color gradients based on amplitude."
                ],
                hints: ["Use `analyser.getByteFrequencyData(dataArray)` inside the animation frame loop."],
                testCases: [
                    { name: "AnalyserNode Setup", cmd: "Inspect analyser.fftSize", expected: "Configured to 2048 samples" },
                    { name: "Frequency Data Extraction", cmd: "Extract getByteFrequencyData()", expected: "Populates 1024 bin frequency array" },
                    { name: "Canvas Waveform Path Rendering", cmd: "Verify canvas render tick", expected: "Draws 60fps smooth audio waveform" },
                    { name: "Responsive Canvas Scaling", cmd: "Resize browser window", expected: "Canvas visualizer resizes smoothly" }
                ]
            },
            {
                milestone: 5,
                title: "JSON Beat Preset Importer & Exporter",
                objective: "Serialize drum machine and synthesizer patterns into JSON files and restore preset soundscapes on load.",
                prerequisites: [
                    "JSON schema validation for musical sequences",
                    "Browser File API for file upload and download",
                    "Audio state hydration and error handling"
                ],
                specRules: [
                    "Export complete 16-step matrix, BPM, waveforms, and ADSR values to JSON string.",
                    "Import JSON preset files and restore all step states immediately.",
                    "Gracefully reject malformed or invalid preset JSON files without breaking audio engine."
                ],
                hints: ["Validate imported JSON schema before applying values to state."],
                testCases: [
                    { name: "Beat Pattern Serialization", cmd: "exportPresetToJson()", expected: "Valid JSON schema containing steps and BPM" },
                    { name: "Preset Deserialization & Playback", cmd: "importPresetFromJson(data)", expected: "Restores synth parameters and patterns" },
                    { name: "Corrupted File Error Boundary", cmd: "importPresetFromJson('{bad_json}')", expected: "Catches error and displays toast" }
                ]
            }
        ]
    },

    "cicd-runner": {
        language: "javascript",
        repoName: "skillforge/cicd-runner-node",
        files: [
            {
                name: "runner.js",
                path: "src/runner.js",
                language: "javascript",
                content: `const express = require('express');
const crypto = require('crypto');
const { executePipeline } = require('./pipeline');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "skillforge-cicd-secret";

// Milestone 1: Verify GitHub HMAC-SHA256 Webhook Signatures
app.post('/api/webhook', async (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return res.status(401).json({ error: "Missing x-hub-signature-256 header" });
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
        return res.status(401).json({ error: "Invalid webhook HMAC signature" });
    }

    const { repository, commits } = req.body;
    console.log(\`⚡ Triggering CI/CD runner for \${repository?.full_name || 'project'}...\`);

    // Milestone 3: Run pipeline
    const jobResult = await executePipeline({
        repo: repository?.clone_url,
        commit: commits?.[0]?.id || "HEAD"
    });

    res.json({ status: "pipeline_queued", result: jobResult });
});

if (require.main === module) {
    app.listen(4000, () => {
        console.log("⚡ CI/CD Matrix Runner active on port 4000");
    });
}

module.exports = app;`
            },
            {
                name: "pipeline.js",
                path: "src/pipeline.js",
                language: "javascript",
                content: `// Pipeline Step DAG Scheduler & Execution Engine
const { spawnContainer } = require('./dockerClient');

async function executePipeline(job) {
    const steps = [
        { name: "lint", cmd: "npm run lint", deps: [] },
        { name: "test", cmd: "npm test", deps: ["lint"] },
        { name: "build", cmd: "npm run build", deps: ["test"] }
    ];

    const logs = [];
    for (const step of steps) {
        logs.push(\`[CI/CD] Executing step: \${step.name}...\`);
        const result = await spawnContainer(step.cmd);
        if (!result.success) {
            logs.push(\`✗ Step \${step.name} failed with exit code \${result.exitCode}\`);
            return { success: false, failedStep: step.name, logs };
        }
        logs.push(\`✓ Step \${step.name} passed cleanly in \${result.duration}ms\`);
    }

    return { success: true, logs };
}

module.exports = { executePipeline };`
            },
            {
                name: "dockerClient.js",
                path: "src/dockerClient.js",
                language: "javascript",
                content: `// Docker Socket Communication Client (/var/run/docker.sock)
async function spawnContainer(command) {
    // Milestone 2: Ephemeral container lifecycle management
    return {
        success: true,
        exitCode: 0,
        duration: 120,
        containerId: "c7e92b04f1",
        stdout: "Running: " + command
    };
}

module.exports = { spawnContainer };`
            },
            {
                name: "package.json",
                path: "package.json",
                language: "json",
                content: `{
  "name": "cicd-runner-node",
  "version": "1.0.0",
  "main": "src/runner.js",
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.16.0"
  }
}`
            }
        ],
        milestoneGuides: [
            {
                milestone: 1,
                title: "GitHub Webhook Event Listener & HMAC-SHA256 Verification",
                objective: "Construct secure webhook listener endpoint verifying HMAC-SHA256 signatures to guard against spoofed triggers.",
                prerequisites: [
                    "HMAC-SHA256 cryptographic signature hashing",
                    "Timing-safe buffer comparison (`crypto.timingSafeEqual`)",
                    "GitHub Webhook payload structures (push, pull_request)"
                ],
                specRules: [
                    "Listen on `POST /api/webhook` with `x-hub-signature-256` header requirement.",
                    "Compute HMAC-SHA256 of raw request body using shared webhook secret.",
                    "Use constant-time comparison to prevent timing attacks.",
                    "Reject unauthenticated or forged webhooks with HTTP 401 Unauthorized."
                ],
                hints: ["Always compare HMAC digests using `crypto.timingSafeEqual` rather than `===`."],
                testCases: [
                    { name: "Valid HMAC Webhook Signature", cmd: "POST /api/webhook with valid signature", expected: "Accepted with HTTP 200/202" },
                    { name: "Forged Webhook Rejection", cmd: "POST /api/webhook with tampered payload", expected: "Rejected with HTTP 401 Unauthorized" },
                    { name: "Missing Signature Header Guard", cmd: "POST /api/webhook without signature", expected: "Rejected with HTTP 401" },
                    { name: "Push Event Payload Parsing", cmd: "Parse commit SHA and branch ref", expected: "Target commit extracted accurately" }
                ]
            },
            {
                milestone: 2,
                title: "Docker Daemon Client & Ephemeral Container Lifecycle",
                objective: "Communicate directly with the Docker Unix daemon socket to provision, execute, and destroy isolated container sandboxes.",
                prerequisites: [
                    "Docker Engine REST API over Unix domain socket (`/var/run/docker.sock`)",
                    "Container creation, start, wait, and remove lifecycles",
                    "Resource limits (cgroups memory and CPU quotas)"
                ],
                specRules: [
                    "Connect to Docker daemon via `/var/run/docker.sock`.",
                    "Create ephemeral container with memory ceiling (e.g., 512MB) and CPU quota.",
                    "Mount workspace repository volume into `/workspace` directory.",
                    "Ensure containers are forcibly destroyed (`DELETE /containers/:id?force=true`) upon job completion or crash."
                ],
                hints: ["Always implement a try/finally block ensuring `container.remove()` runs even when steps throw exceptions."],
                testCases: [
                    { name: "Docker Socket Connection", cmd: "GET /version to /var/run/docker.sock", expected: "Docker engine details returned" },
                    { name: "Ephemeral Container Creation", cmd: "POST /containers/create with alpine:latest", expected: "Container ID allocated" },
                    { name: "Memory & CPU Quota Enforcement", cmd: "Inspect container cgroup memory limits", expected: "Enforces 512MB max memory" },
                    { name: "Workspace Volume Mounting", cmd: "Verify /workspace inside container", expected: "Host code accessible in container" },
                    { name: "Guaranteed Container Destruction", cmd: "Job finishes or errors out", expected: "Container removed from daemon" },
                    { name: "Exit Code Capture", cmd: "Run container command with exit 1", expected: "Captures exitCode: 1" }
                ]
            },
            {
                milestone: 3,
                title: "Pipeline Step DAG Execution with Exit Code Traps",
                objective: "Parse YAML/JSON pipeline definitions and execute dependency DAG steps sequentially or in parallel.",
                prerequisites: [
                    "Directed Acyclic Graph (DAG) dependency resolution",
                    "Topological sorting algorithms for pipeline stages",
                    "Exit code trapping and execution abortion"
                ],
                specRules: [
                    "Parse pipeline steps and build dependency graph.",
                    "Execute steps whose dependencies have succeeded.",
                    "If any step exits with non-zero status, immediately abort downstream pipeline steps.",
                    "Mask sensitive secret environment variables in log output."
                ],
                hints: ["Topological sort (Kahn's algorithm) determines the valid sequential and concurrent execution waves."],
                testCases: [
                    { name: "Pipeline DAG Construction", cmd: "Build graph from steps with dependencies", expected: "Valid topological execution order" },
                    { name: "Step Execution Success Chain", cmd: "Run lint -> test -> build", expected: "All 3 steps execute in order" },
                    { name: "Non-Zero Exit Code Trapping", cmd: "Step 'test' exits with code 1", expected: "Pipeline aborts; build step skipped" },
                    { name: "Parallel Independent Steps", cmd: "Execute lint and typecheck concurrently", expected: "Both run concurrently" },
                    { name: "Secret Masking in Logs", cmd: "Print $API_KEY in script", expected: "Replaced with '***' in output" },
                    { name: "Execution Duration Reporting", cmd: "Measure step durations", expected: "Duration recorded accurately per step" },
                    { name: "Circular Dependency Detection", cmd: "Define A -> B and B -> A", expected: "Rejects invalid circular pipeline" }
                ]
            },
            {
                milestone: 4,
                title: "Live Streaming Container STDOUT/STDERR via WebSockets",
                objective: "Stream container terminal stdout and stderr output in real time to connected web clients using WebSockets.",
                prerequisites: [
                    "Docker multiplexed stream format (8-byte header: stream type + 4-byte size)",
                    "WebSocket binary/text chunk broadcasting",
                    "Buffer chunking and backpressure handling"
                ],
                specRules: [
                    "Demultiplex Docker container stream into stdout (stream 1) and stderr (stream 2).",
                    "Broadcast output chunks live over WebSocket channel to frontend subscribers.",
                    "Flush log chunks immediately to avoid perception of latency."
                ],
                hints: ["The first byte of Docker's 8-byte header indicates stream type (1=stdout, 2=stderr)."],
                testCases: [
                    { name: "Docker Stream Demultiplexing", cmd: "Read 8-byte header multiplexed stream", expected: "Stdout and Stderr separated" },
                    { name: "WebSocket Log Chunk Broadcast", cmd: "Connect WS client to /ws/jobs/:id", expected: "Receives real-time log chunks" },
                    { name: "Low Latency Buffer Flushing", cmd: "Stream continuous echo output", expected: "Logs delivered in < 50ms" },
                    { name: "Client Reconnect Buffer Replay", cmd: "Client reconnects mid-run", expected: "Receives historical log backlog" },
                    { name: "Stream EOF Termination Signal", cmd: "Container finishes", expected: "Sends 'exit' sentinel message" }
                ]
            },
            {
                milestone: 5,
                title: "Job Matrix Fan-Out & Artifact Storage",
                objective: "Support multi-platform build matrices (e.g. Node 18, 20, 22) and collect output build artifacts into tar archives.",
                prerequisites: [
                    "Matrix expansion algorithms (Cartesian product of matrix variables)",
                    "Tar archive generation for build artifacts",
                    "GitHub commit status API integration"
                ],
                specRules: [
                    "Expand matrix configuration: e.g. `node: [18, 20, 22]` spawns 3 isolated jobs.",
                    "Collect declared artifacts (e.g. `dist/`, `build/`) into a compressed `.tar.gz` archive.",
                    "Post commit status update to GitHub (`pending`, `success`, `failure`)."
                ],
                hints: ["Cap maximum concurrent matrix jobs to prevent exhausting host system memory."],
                testCases: [
                    { name: "Matrix Cartesian Expansion", cmd: "Expand node: [18, 20] x os: [ubuntu]", expected: "2 distinct job runners spawned" },
                    { name: "Concurrent Pool Throttling", cmd: "Fan out 10 matrix jobs", expected: "Enforces max concurrency ceiling" },
                    { name: "Artifact Tar Archive Generation", cmd: "Collect dist/ directory", expected: "Produces valid compressed tarball" },
                    { name: "GitHub Status Update Dispatch", cmd: "Job completes", expected: "Dispatches commit status 'success'" }
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
