/**
 * Curated Engineering Curriculum Catalog
 * Provides production-grade curriculum data for course discovery, syllabus previews,
 * and fallback resilience when the backend database is initializing or offline.
 */

export const CURATED_COURSES = [
    {
        _id: "course-systems-rust-redis",
        slug: "rust-redis-engine",
        title: "High-Performance In-Memory Key-Value Engine in Rust",
        description: "Architect and implement an in-memory key-value database from scratch using Rust, Linux epoll/kqueue non-blocking I/O primitives, the RESP protocol parser, and zero-copy memory serialization.",
        author: "Alex Rivera (Ex-Stripe Systems Lead)",
        authorRole: "Principal Systems Architect",
        difficulty: "Advanced",
        price: 0,
        averageRating: 4.95,
        reviewCount: 342,
        enrolledCount: 1820,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
        tags: ["rust", "systems", "epoll", "redis", "database", "concurrency", "low-latency"],
        category: "sysdesign",
        durationHours: 24,
        modules: [
            {
                _id: "mod-1",
                title: "Linux I/O Multiplexing & Non-Blocking Sockets",
                description: "Deep dive into edge-triggered vs level-triggered epoll, TCP buffer management, and non-blocking sockets in Rust.",
                lessons: [
                    { _id: "les-1-1", title: "Non-blocking TCP socket initialization and flags", duration: 18, contentType: "video" },
                    { _id: "les-1-2", title: "Linux epoll event loop architecture in raw Rust", duration: 25, contentType: "video" },
                    { _id: "les-1-3", title: "Benchmark harness: Measuring syscall latency", duration: 15, contentType: "reading" }
                ]
            },
            {
                _id: "mod-2",
                title: "RESP Protocol Parser (Zero Allocation)",
                description: "Build a zero-copy streaming parser for Redis Serialization Protocol (RESP3) using Nom and SIMD vector instructions.",
                lessons: [
                    { _id: "les-2-1", title: "RESP wire protocol spec: Simple strings, bulk arrays & errors", duration: 20, contentType: "video" },
                    { _id: "les-2-2", title: "Zero-copy slice parsing with Rust lifetimes", duration: 32, contentType: "video" },
                    { _id: "les-2-3", title: "Fuzzing the parser with AFL and cargo-fuzz", duration: 22, contentType: "video" }
                ]
            },
            {
                _id: "mod-3",
                title: "Concurrent Hash Table & Memory Compaction",
                description: "Design lock-striping and epoch-based reclamation for safe concurrent reads without global mutex locks.",
                lessons: [
                    { _id: "les-3-1", title: "Lock striping vs sharded RWLocks", duration: 28, contentType: "video" },
                    { _id: "les-3-2", title: "Implementing LRU eviction with O(1) amortized cost", duration: 24, contentType: "video" },
                    { _id: "les-3-3", title: "AOF disk persistence & background rewrite fsync", duration: 30, contentType: "video" }
                ]
            }
        ]
    },
    {
        _id: "course-distributed-raft-go",
        slug: "distributed-raft-consensus",
        title: "Distributed Consensus Engine & Raft Implementation in Go",
        description: "Master distributed systems fundamentals by building a fault-tolerant replicated state machine with Raft consensus, leader elections, log compaction, and cluster membership reconfiguration.",
        author: "Sarah Chen (Distributed Systems Staff)",
        authorRole: "Staff Infrastructure Engineer",
        difficulty: "Expert",
        price: 899,
        averageRating: 4.98,
        reviewCount: 289,
        enrolledCount: 1450,
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
        tags: ["go", "golang", "distributed", "raft", "consensus", "sysdesign", "microservices"],
        category: "sysdesign",
        durationHours: 32,
        modules: [
            {
                _id: "mod-raft-1",
                title: "Consensus Theory & The Replicated State Machine Model",
                description: "Linearizability, split-brain hazards, Byzantine fault tolerance vs crash fault tolerance.",
                lessons: [
                    { _id: "les-r1-1", title: "Why two-phase commit is insufficient for partitions", duration: 22, contentType: "video" },
                    { _id: "les-r1-2", title: "Raft RPC specifications: RequestVote and AppendEntries", duration: 30, contentType: "video" }
                ]
            },
            {
                _id: "mod-raft-2",
                title: "Leader Election with Randomized Heartbeat Timers",
                description: "Handling split votes, term increments, and network partition heal scenarios.",
                lessons: [
                    { _id: "les-r2-1", title: "Implementing jittered election timers with Go channels", duration: 26, contentType: "video" },
                    { _id: "les-r2-2", title: "Jepsen-style network partition chaos simulation", duration: 35, contentType: "video" }
                ]
            },
            {
                _id: "mod-raft-3",
                title: "Log Replication, Commit Index & Snapshot Compaction",
                description: "Safe disk persistence, log trimming, and fast recovery across node reboots.",
                lessons: [
                    { _id: "les-r3-1", title: "Log matching invariant & rollback synchronization", duration: 28, contentType: "video" },
                    { _id: "les-r3-2", title: "Snapshot installation RPCs for slow followers", duration: 25, contentType: "video" }
                ]
            }
        ]
    },
    {
        _id: "course-crdt-collaborative-engine",
        slug: "crdt-collaborative-canvas",
        title: "Real-Time Collaborative Canvas with CRDTs & WebSockets",
        description: "Construct a Google Docs-grade real-time collaborative workspace using Conflict-free Replicated Data Types (CRDTs), fractional indexing, and binary delta compression.",
        author: "Marcus Thorne (Web Performance Architect)",
        authorRole: "Frontend Infrastructure Principal",
        difficulty: "Advanced",
        price: 499,
        averageRating: 4.92,
        reviewCount: 215,
        enrolledCount: 1210,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        tags: ["typescript", "crdt", "websockets", "react", "fullstack", "concurrency"],
        category: "fullstack",
        durationHours: 20,
        modules: [
            {
                _id: "mod-crdt-1",
                title: "CRDTs vs Operational Transformation (OT)",
                description: "State-based (CvRDT) vs Operation-based (CmRDT) convergence mathematical guarantees.",
                lessons: [
                    { _id: "les-c1-1", title: "The mathematical proof of Strong Eventual Consistency", duration: 20, contentType: "video" },
                    { _id: "les-c1-2", title: "LWW-Element-Set and RGA (Replicated Growable Array)", duration: 28, contentType: "video" }
                ]
            },
            {
                _id: "mod-crdt-2",
                title: "Fractional Indexing & Peer-to-Peer Synchronization",
                description: "Generating non-colliding order keys for concurrent list reordering without server locks.",
                lessons: [
                    { _id: "les-c2-1", title: "Arbitrary-precision floating point string keys", duration: 24, contentType: "video" },
                    { _id: "les-c2-2", title: "Multiplexed WebSocket channels with awareness state", duration: 30, contentType: "video" }
                ]
            }
        ]
    },
    {
        _id: "course-autonomous-ai-agents",
        slug: "autonomous-ai-orchestration",
        title: "Autonomous Multi-Agent AI Workflow Orchestrator in Python",
        description: "Engineer an industrial agentic framework with dynamic tool routing, self-correcting code execution sandboxes, long-term vector memory, and DAG execution plans.",
        author: "Elena Rostova (AI Systems Researcher)",
        authorRole: "Staff AI Systems Engineer",
        difficulty: "Intermediate",
        price: 0,
        averageRating: 4.96,
        reviewCount: 420,
        enrolledCount: 3100,
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        tags: ["python", "ai", "machine learning", "llm", "agents", "langchain", "embeddings"],
        category: "ai",
        durationHours: 26,
        modules: [
            {
                _id: "mod-ai-1",
                title: "ReAct Loop Architecture & Structured Function Calling",
                description: "Designing deterministic thought-action-observation cycles with strict schema validation.",
                lessons: [
                    { _id: "les-a1-1", title: "Building a token-efficient scratchpad parser", duration: 22, contentType: "video" },
                    { _id: "les-a1-2", title: "Dynamic tool schema synthesis with Pydantic v2", duration: 26, contentType: "video" }
                ]
            },
            {
                _id: "mod-ai-2",
                title: "Hierarchical Memory: Short-Term Buffer to HNSW Vectors",
                description: "Implementing hierarchical semantic search with reciprocal rank fusion (RRF).",
                lessons: [
                    { _id: "les-a2-1", title: "HNSW graph indexing and cosine similarity math", duration: 25, contentType: "video" },
                    { _id: "les-a2-2", title: "Self-healing code execution sandbox in Docker", duration: 35, contentType: "video" }
                ]
            }
        ]
    },
    {
        _id: "course-kubernetes-ebpf-observability",
        slug: "kubernetes-ebpf-observability",
        title: "Production Kubernetes, eBPF & Cloud-Native Observability",
        description: "Kernel-level tracing without bytecode modification. Inspect TCP packet lifecycles, kernel drops, and high-frequency Prometheus metrics with zero overhead.",
        author: "David Miller (Cloud Infrastructure Architect)",
        authorRole: "Principal DevOps Architect",
        difficulty: "Advanced",
        price: 799,
        averageRating: 4.89,
        reviewCount: 168,
        enrolledCount: 920,
        thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
        tags: ["docker", "k8s", "kubernetes", "aws", "cloud", "devops", "ebpf", "linux", "kernel", "security"],
        category: "cloud",
        durationHours: 28,
        modules: [
            {
                _id: "mod-k8s-1",
                title: "Linux Kernel eBPF Verification & BCC Tooling",
                description: "Writing and loading safe eBPF bytecode programs into kernel tracepoints.",
                lessons: [
                    { _id: "les-k1-1", title: "The eBPF bytecode verifier: Registers and bounds checks", duration: 25, contentType: "video" },
                    { _id: "les-k1-2", title: "Tracking socket connect latency via kprobes", duration: 30, contentType: "video" }
                ]
            },
            {
                _id: "mod-k8s-2",
                title: "Custom Kubernetes Operators with Kubebuilder",
                description: "Writing custom controllers with reconciliation loops, leader elections, and status patches.",
                lessons: [
                    { _id: "les-k2-1", title: "The Kubernetes client-go informer cache", duration: 28, contentType: "video" },
                    { _id: "les-k2-2", title: "Zero-downtime Canary rollout operator", duration: 32, contentType: "video" }
                ]
            }
        ]
    },
    {
        _id: "course-advanced-react-concurrent",
        slug: "advanced-react-concurrent-internals",
        title: "Modern React 19 Architecture: Concurrent UI & Compiler Internals",
        description: "Unravel React fiber reconciliation, lane priorities, selective hydration, Suspense boundaries, and building custom micro-frontend federated runtimes.",
        author: "Devon Vance (Lead Frontend Architect)",
        authorRole: "Senior Staff UI Engineer",
        difficulty: "Intermediate",
        price: 0,
        averageRating: 4.97,
        reviewCount: 512,
        enrolledCount: 4200,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
        tags: ["react", "typescript", "javascript", "fullstack", "web", "nextjs"],
        category: "fullstack",
        durationHours: 22,
        modules: [
            {
                _id: "mod-react-1",
                title: "Fiber Work Loop & Lane Prioritization",
                description: "Understanding time-slicing, non-blocking interruption, and synthetic scheduler events.",
                lessons: [
                    { _id: "les-rec-1", title: "Building a mini-reconciler with requestIdleCallback", duration: 30, contentType: "video" },
                    { _id: "les-rec-2", title: "Server Actions & Streaming HTML payload parsing", duration: 25, contentType: "video" }
                ]
            }
        ]
    }
];
