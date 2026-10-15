/**
 * SkillForge Project Forge Catalog
 * Production-grade engineering projects with real-world specifications and testable milestones.
 */

export const PROJECT_TRACKS = [
    { id: "all", label: "All Tracks", icon: "Layers" },
    { id: "systems", label: "Systems & Cloud", icon: "Cpu" },
    { id: "fullstack", label: "Full-Stack Web", icon: "Globe" },
    { id: "ai", label: "AI Engineering", icon: "Sparkles" },
    { id: "devops", label: "DevOps & Infra", icon: "Terminal" },
    { id: "creative", label: "Creative & Web Audio", icon: "Sliders" }
];

export const DIFFICULTY_LEVELS = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { id: "intermediate", label: "Intermediate", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { id: "advanced", label: "Advanced", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
];

export const PROJECTS = [
    {
        id: "redis-clone",
        title: "Build Your Own Redis Server",
        track: "systems",
        difficulty: "advanced",
        timeEstimate: "6-8 hrs",
        popularity: 2410,
        rating: 4.9,
        tagline: "Build an in-memory database capable of handling real-world Redis CLI clients",
        description: "Implement a low-level, high-throughput in-memory key-value store from scratch. Parse the RESP (Redis Serialization Protocol), manage TCP streams, handle concurrent client requests with non-blocking I/O, implement SET/GET with expiration timestamps (TTL), and write an LRU cache eviction algorithm.",
        techStack: ["Go", "Rust", "Node.js", "TCP Sockets", "RESP"],
        keySkills: [
            "Binary protocol serialization & deserialization (RESP)",
            "Non-blocking TCP socket event loops",
            "Thread-safe data structures with mutex synchronization",
            "O(1) LRU (Least Recently Used) cache eviction",
            "RDB snapshot file persistence"
        ],
        prerequisites: [
            "Rust toolchain 1.75+ or Go 1.21+ or Node.js 18+ installed",
            "Working knowledge of TCP sockets, byte buffers, and stream I/O",
            "Familiarity with concurrent threads / async event loops & mutex synchronization",
            "Understanding of HashMaps, doubly linked lists, and O(1) LRU eviction mechanics",
            "Redis CLI client (optional for manual end-to-end socket testing)"
        ],
        milestones: [
            { id: 1, title: "Bind TCP Socket & Ping-Pong Handshake", testCount: 4 },
            { id: 2, title: "RESP Array & Bulk String Protocol Parser", testCount: 8 },
            { id: 3, title: "Thread-Safe Key/Value Store with TTL Expiry", testCount: 6 },
            { id: 4, title: "LRU Memory Eviction & Concurrent Connections", testCount: 7 },
            { id: 5, title: "RDB Disk Snapshot Encoding & Recovery", testCount: 5 }
        ],
        badge: "Hot • Systems Core",
        colorTheme: "from-blue-600/20 via-cyan-500/10 to-transparent",
        accentColor: "#2563EB"
    },
    {
        id: "collaborative-canvas",
        title: "Multiplayer Real-Time Code & Diagram Canvas",
        track: "fullstack",
        difficulty: "intermediate",
        timeEstimate: "5 hrs",
        popularity: 1890,
        rating: 4.8,
        tagline: "Engineering Figma & Excalidraw-style collaborative vector workspaces",
        description: "Construct an interactive infinite-canvas whiteboard with live multiplayer presence. Learn how real-time sync works across distributed browser clients using WebSockets, operational transformations, vector math, and optimistic local updates.",
        techStack: ["React", "TypeScript", "WebSockets", "Canvas API", "Node.js"],
        keySkills: [
            "Mathematical 2D viewport camera panning and zoom transformations",
            "WebSocket room broadcasting & heartbeat reconnection",
            "Multi-cursor coordinates interpolation with latency smoothing",
            "Undo / Redo state management using command pattern",
            "Binary SVG & PNG export generation"
        ],
        prerequisites: [
            "Modern web browser with HTML5 Canvas 2D Context & WebSocket support",
            "TypeScript 5+ and modern React 18+ (hooks, useRef, useCallback)",
            "Fundamental 2D coordinate geometry and camera affine transformations (pan/zoom matrix)",
            "Basic understanding of WebSocket rooms, connection heartbeats, and reconnect backoff",
            "Linear interpolation (lerp) concept for cursor position smoothing"
        ],
        milestones: [
            { id: 1, title: "Infinite HTML5 2D Vector Canvas Viewport", testCount: 5 },
            { id: 2, title: "Multiplayer WebSocket Connection & Presence Broadcast", testCount: 6 },
            { id: 3, title: "Smoothing Live Cursors with Linear Interpolation", testCount: 4 },
            { id: 4, title: "Concurrent Shape Mutations & Conflict Resolution", testCount: 8 },
            { id: 5, title: "Local History Tree & High-Res Image Export", testCount: 4 }
        ],
        badge: "Featured • Architecture",
        colorTheme: "from-indigo-600/20 via-purple-500/10 to-transparent",
        accentColor: "#6366F1"
    },
    {
        id: "url-shortener-distributed",
        title: "High-Throughput Distributed URL Shortener",
        track: "systems",
        difficulty: "intermediate",
        timeEstimate: "4 hrs",
        popularity: 3120,
        rating: 4.9,
        tagline: "Architect a resilient system handling 100,000 queries per second",
        description: "Build a scalable link shortening engine with sub-10ms redirection latencies. Implement collision-free 64-bit ID generation, Base62 tokenization, Redis write-through caching, sliding-window rate limiting to counter brute-force attacks, and analytics aggregation.",
        techStack: ["Node.js", "Redis", "PostgreSQL", "Docker", "Nginx"],
        keySkills: [
            "Base62 mathematical bijective mapping algorithms",
            "Database indexing optimization for O(1) hash lookups",
            "Redis cache-stampede mitigation with probabilistic early expiration",
            "Sliding-window counter rate limiting middleware",
            "Docker Compose multi-container networking"
        ],
        prerequisites: [
            "Node.js 18+ / Express runtime environment",
            "Understanding of HTTP status codes (301 Permanent vs 302 Temporary redirects)",
            "Mathematical Base62 bijective encoding & decoding using modulo arithmetic",
            "Basic understanding of Redis in-memory key-value caching & TTL expiration",
            "Relational database indexing principles (B-Tree unique constraints in PostgreSQL)"
        ],
        milestones: [
            { id: 1, title: "Base62 Encoding Engine & Hash Generator", testCount: 6 },
            { id: 2, title: "PostgreSQL Schema & Unique Hash Indexing", testCount: 4 },
            { id: 3, title: "Redis Write-Through Cache with Cache-Stampede Shield", testCount: 7 },
            { id: 4, title: "Sliding-Window Rate Limiting Middleware", testCount: 5 },
            { id: 5, title: "Telemetry Analytics Worker & Click Geo-tracking", testCount: 6 }
        ],
        badge: "Most Popular",
        colorTheme: "from-emerald-600/20 via-teal-500/10 to-transparent",
        accentColor: "#10B981"
    },
    {
        id: "local-rag-agent",
        title: "Autonomous Local RAG & Codebase Assistant",
        track: "ai",
        difficulty: "advanced",
        timeEstimate: "6 hrs",
        popularity: 1640,
        rating: 5.0,
        tagline: "Vector embeddings, AST semantic parsing, and streaming LLM agent loops",
        description: "Engineer an AI developer agent capable of answering complex architectural questions about any codebase. Chunk source code using Abstract Syntax Trees (AST), compute dense vector embeddings with local models or OpenAI, query ChromaDB vector indices, and stream precision answers.",
        techStack: ["Python", "FastAPI", "ChromaDB", "LangChain", "Vector Embeddings"],
        keySkills: [
            "AST-aware semantic code parsing and function boundary splitting",
            "Dense vector embeddings computation & cosine similarity search",
            "Reciprocal Rank Fusion (RRF) for hybrid keyword + vector retrieval",
            "System prompt engineering with few-shot code schema enforcement",
            "Server-Sent Events (SSE) token streaming pipeline"
        ],
        prerequisites: [
            "Python 3.10+ (with typing, ast, and standard library json modules)",
            "Understanding of Abstract Syntax Trees (AST) and Python syntax node traversal",
            "Familiarity with vector embeddings, dimensional vector spaces, and cosine similarity",
            "FastAPI or asynchronous HTTP request lifecycle fundamentals",
            "Concepts of Server-Sent Events (SSE) for token-by-token streaming responses"
        ],
        milestones: [
            { id: 1, title: "AST Python/JS Code Chunking & Boundary Extractor", testCount: 5 },
            { id: 2, title: "ChromaDB Vector Store Ingestion & Embeddings", testCount: 6 },
            { id: 3, title: "Hybrid Lexical + Dense Semantic Search Engine", testCount: 7 },
            { id: 4, title: "Agent Reasoning Loop with Context Window Truncation", testCount: 6 },
            { id: 5, title: "Real-Time SSE Streaming Output & Syntax Highlighter", testCount: 5 }
        ],
        badge: "Trending • AI Tech",
        colorTheme: "from-violet-600/20 via-fuchsia-500/10 to-transparent",
        accentColor: "#8B5CF6"
    },
    {
        id: "git-clone",
        title: "Build Your Own Git Version Control",
        track: "systems",
        difficulty: "advanced",
        timeEstimate: "7 hrs",
        popularity: 2780,
        rating: 4.9,
        tagline: "Master cryptographic hashing, DAG commits, and internal object databases",
        description: "Demystify Git by building it from the ground up. Write a CLI binary that creates `.git` repos, hashes blobs with SHA-1, compresses with zlib, links parent commits in a Directed Acyclic Graph (DAG), and manages branches with atomic HEAD ref updates.",
        techStack: ["Rust", "Python", "Go", "Zlib", "CLI"],
        keySkills: [
            "SHA-1 deterministic hashing & object format encoding",
            "Zlib compression & deflated file format storage",
            "Tree object hierarchy & directory recursion",
            "Commit DAG construction and parent pointer chaining",
            "Working directory diffing and atomic HEAD manipulation"
        ],
        prerequisites: [
            "Rust 1.75+ or Python 3.10+ or Go 1.21+ runtime installed",
            "Understanding of SHA-1 cryptographic hashing & hexadecimal digest formatting",
            "Zlib deflate / inflate compression algorithms for binary blob storage",
            "Directed Acyclic Graph (DAG) data structures and parent pointer trees",
            "CLI argument parsing and recursive directory tree traversal"
        ],
        milestones: [
            { id: 1, title: "Git Directory Schema & `init` Command", testCount: 4 },
            { id: 2, title: "SHA-1 Hash-Object & Zlib Blob Storage", testCount: 6 },
            { id: 3, title: "Recursive Tree Objects & Directory Serialization", testCount: 7 },
            { id: 4, title: "Commit Objects with Author Timestamps & Parents", testCount: 8 },
            { id: 5, title: "Branch Ref Pointers & Working Directory `checkout`", testCount: 6 }
        ],
        badge: "Foundational • Systems",
        colorTheme: "from-amber-600/20 via-orange-500/10 to-transparent",
        accentColor: "#F59E0B"
    },
    {
        id: "api-gateway-proxy",
        title: "Microservice API Gateway & Reverse Proxy",
        track: "devops",
        difficulty: "intermediate",
        timeEstimate: "5 hrs",
        popularity: 1420,
        rating: 4.8,
        tagline: "Build the traffic hub for distributed cloud microservices",
        description: "Design a high-performance reverse proxy that sits in front of backend microservices. Implement Round-Robin & Least-Connection load balancing, cryptographic JWT verification at the edge, dynamic route config loading, and Prometheus telemetry metrics.",
        techStack: ["Go", "Docker", "JWT", "Prometheus", "Networking"],
        keySkills: [
            "HTTP reverse proxying and connection pool dialing",
            "Health-checking algorithms & automatic failover fail-open circuits",
            "Cryptographic signature validation of JWT tokens at the boundary",
            "Live JSON configuration hot-reloading without downtime",
            "Prometheus gauge & histogram metric instrumentation"
        ],
        prerequisites: [
            "Go 1.21+ or Node.js 18+ runtime with HTTP net package familiarity",
            "Fundamental understanding of Reverse Proxies vs Forward Proxies",
            "Load balancing algorithms (Round-Robin with modulo indexing, Least Connections)",
            "JWT (JSON Web Token) standard, claims extraction, and HMAC-SHA256 verification",
            "Prometheus metrics instrumentation principles (Counters and Gauges)"
        ],
        milestones: [
            { id: 1, title: "Basic TCP/HTTP Reverse Proxy Forwarder", testCount: 4 },
            { id: 2, title: "Round-Robin Load Balancer with Background Health Checks", testCount: 6 },
            { id: 3, title: "Cryptographic Edge JWT Authentication Layer", testCount: 5 },
            { id: 4, title: "Dynamic Routing Rules with Path Rewriting", testCount: 7 },
            { id: 5, title: "Prometheus Latency Metrics & Docker Cluster Spec", testCount: 5 }
        ],
        badge: "Cloud Infrastructure",
        colorTheme: "from-sky-600/20 via-blue-500/10 to-transparent",
        accentColor: "#0284C7"
    },
    {
        id: "audio-synthesizer",
        title: "Web Audio Drum Machine & Synthesizer",
        track: "creative",
        difficulty: "beginner",
        timeEstimate: "3 hrs",
        popularity: 980,
        rating: 4.7,
        tagline: "Explore digital sound synthesis with the browser Web Audio API",
        description: "Harness the Web Audio API to construct an interactive 16-step polyphonic drum machine and synthesizer. Sculpt sound waves (sine, square, sawtooth), control ADSR envelopes, and build a retro cyber visualizer.",
        techStack: ["React", "Web Audio API", "Tailwind CSS", "Canvas API"],
        keySkills: [
            "AudioContext node graph routing (Oscillator -> Gain -> Destination)",
            "ADSR (Attack, Decay, Sustain, Release) envelope automation curves",
            "High-precision web timing scheduling for jitter-free audio loops",
            "Fast Fourier Transform (FFT) frequency waveform visualizer",
            "Custom sound preset state serialization"
        ],
        prerequisites: [
            "Modern web browser with Web Audio API support (AudioContext, OscillatorNode)",
            "React 18+ with state management for musical step sequencers",
            "Basic acoustics and synthesis theory (Frequency in Hz, Sine / Square / Sawtooth waveforms)",
            "ADSR (Attack, Decay, Sustain, Release) envelope dynamics",
            "High-precision web scheduling with AudioContext.currentTime"
        ],
        milestones: [
            { id: 1, title: "Web AudioContext & Polyphonic Oscillator Graph", testCount: 4 },
            { id: 2, title: "ADSR Gain Envelope Automation", testCount: 5 },
            { id: 3, title: "16-Step High-Precision BPM Sequencer Clock", testCount: 6 },
            { id: 4, title: "Real-Time Frequency Visualizer on HTML Canvas", testCount: 4 },
            { id: 5, title: "JSON Beat Preset Importer & Exporter", testCount: 3 }
        ],
        badge: "Creative Tech",
        colorTheme: "from-pink-600/20 via-rose-500/10 to-transparent",
        accentColor: "#EC4899"
    },
    {
        id: "cicd-runner",
        title: "Automated Containerized CI/CD Matrix Runner",
        track: "devops",
        difficulty: "advanced",
        timeEstimate: "6 hrs",
        popularity: 1150,
        rating: 4.9,
        tagline: "Miniature GitHub Actions engine running jobs in Docker sandboxes",
        description: "Build a miniature continuous integration engine that clones repositories into isolated Docker sandboxes, runs unit and lint matrices concurrently, streams stdout logs live, and generates GitHub commit status checks.",
        techStack: ["Node.js", "Docker", "WebSockets", "Bash", "GitHub Webhooks"],
        keySkills: [
            "Interfacing directly with the Docker Unix daemon socket",
            "Ephemeral sandbox provisioning, volume mounting, and cgroup isolation",
            "Multi-step job matrix parallelization with dependency DAGs",
            "Real-time WebSocket stdout/stderr terminal log streaming",
            "Webhook signature verification and GitHub commit statuses"
        ],
        prerequisites: [
            "Node.js 18+ with child_process and WebSocket server capabilities",
            "Docker Desktop or Docker Daemon socket (/var/run/docker.sock or Windows named pipe)",
            "Basic knowledge of GitHub Webhooks and HMAC-SHA256 signature verification",
            "Topological sorting / Directed Acyclic Graph (DAG) for pipeline step dependencies",
            "Standard UNIX streams (stdout / stderr) redirection and exit code traps"
        ],
        milestones: [
            { id: 1, title: "GitHub Webhook Event Listener & HMAC-SHA256 Verification", testCount: 4 },
            { id: 2, title: "Docker Daemon Client & Ephemeral Container Lifecycle", testCount: 6 },
            { id: 3, title: "Pipeline Step DAG Execution with Exit Code Traps", testCount: 7 },
            { id: 4, title: "Live Streaming Container STDOUT/STDERR via WebSockets", testCount: 5 },
            { id: 5, title: "Job Matrix Fan-Out & Artifact Storage", testCount: 4 }
        ],
        badge: "DevOps Heavy",
        colorTheme: "from-cyan-600/20 via-blue-500/10 to-transparent",
        accentColor: "#06B6D4"
    }
];
