import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "../../components/NavBar";
import api from "../../api";
import ProjectLaunchModal from "../../components/ProjectLaunchModal";
import { PROJECTS } from "../../data/projectsData";
import {
    ArrowRight,
    ArrowUpRight,
    Terminal,
    Layers,
    Cpu,
    Server,
    Shield,
    CheckCircle2,
    Sparkles,
    Check,
    Copy,
    Play,
    Zap,
    BookOpen,
    Database,
    Network,
    Activity,
    Box,
    ChevronRight,
    Flame,
    GitBranch
} from "lucide-react";

// Interactive Architecture Cockpit Scenarios for the Hero
const HERO_SCENARIOS = {
    redis: {
        id: "redis",
        name: "Redis Clone in Rust",
        badge: "Systems Kernel",
        tag: "epoll & RESP protocol",
        lang: "Rust",
        file: "server.rs",
        metrics: { throughput: "148,200 req/s", latency: "0.8ms p99", memory: "12.4 MB" },
        code: `// High-concurrency RESP2/3 Server with non-blocking epoll
use tokio::net::TcpListener;
use bytes::BytesMut;

pub struct RedisEngine {
    store: Arc<RwLock<HashMap<String, Entry>>>,
}

impl RedisEngine {
    pub async fn handle_command(&self, cmd: &Command) -> Result<BytesMut> {
        match cmd {
            Command::Set { key, val, ttl } => {
                let mut guard = self.store.write().await;
                guard.insert(key.clone(), Entry::new(val, *ttl));
                Ok(BytesMut::from("+OK\\r\\n"))
            }
            Command::Get { key } => {
                let guard = self.store.read().await;
                match guard.get(key) {
                    Some(e) if !e.is_expired() => Ok(BytesMut::from(format!("$\\{}\\r\\n{}\\{}\\r\\n", e.len(), e.val()))),
                    _ => Ok(BytesMut::from("$-1\\r\\n")),
                }
            }
        }
    }
}`,
        assertions: [
            "✓ TCP Handshake & Connection Pool (1024 conns) — Passed",
            "✓ RESP Protocol Serialization & Binary Safeties — Passed",
            "✓ Thread-safe O(1) TTL Eviction Lock — Passed",
            "✓ Benchmark: 148,200 req/sec at 0.8ms p99 — Verified"
        ]
    },
    raft: {
        id: "raft",
        name: "Distributed Raft Consensus",
        badge: "Distributed Infrastructure",
        tag: "Consensus & Leader Election",
        lang: "Go",
        file: "consensus.go",
        metrics: { throughput: "Zero data loss", latency: "1.2ms quorum", memory: "24.1 MB" },
        code: `// Raft Consensus Engine: Randomized Election & Log Replication
type RaftNode struct {
    mu          sync.Mutex
    peers       []*rpc.Client
    currentTerm int
    votedFor    int
    log         []LogEntry
    state       NodeState // Leader, Candidate, Follower
}

func (rf *RaftNode) RequestVote(args *VoteArgs, reply *VoteReply) {
    rf.mu.Lock()
    defer rf.mu.Unlock()
    
    // Reject votes from stale terms
    if args.Term < rf.currentTerm {
        reply.VoteGranted = false
        return
    }
    rf.resetElectionTimer()
    reply.VoteGranted = true
}`,
        assertions: [
            "✓ Jittered Election Timeout with Heartbeat Ping — Passed",
            "✓ Quorum Consensus on 5-Node Partition — Passed",
            "✓ Strict Log Matching Invariant — Passed",
            "✓ Zero data loss under simulated node split-brain — Verified"
        ]
    },
    crdt: {
        id: "crdt",
        name: "Real-Time CRDT Canvas",
        badge: "Multiplayer Web",
        tag: "Fractional Indexing",
        lang: "TypeScript",
        file: "canvas_crdt.ts",
        metrics: { throughput: "60 FPS Cursors", latency: "14ms sync", memory: "8.6 MB" },
        code: `// Conflict-free Replicated Data Type (LWW-Element-Set)
export class CollaborativeCanvas {
    private localClock = 0;
    private state = new Map<string, ElementNode>();

    applyRemoteOp(op: CRDTOperation): void {
        const current = this.state.get(op.elementId);
        // Deterministic tie-breaker with Lamport Timestamps
        if (!current || op.lamportTime > current.lamportTime) {
            this.state.set(op.elementId, {
                ...op.payload,
                lamportTime: op.lamportTime,
                peerId: op.peerId
            });
            this.renderBatch();
        }
    }
}`,
        assertions: [
            "✓ Multi-cursor presence broadcasting (50 peers) — Passed",
            "✓ Zero server-side merge latency with CRDT — Passed",
            "✓ Fractional Indexing conflict elimination — Passed",
            "✓ Offline re-sync resolution with zero state drift — Verified"
        ]
    },
    ai: {
        id: "ai",
        name: "Autonomous Agent Runtime",
        badge: "AI Engineering",
        tag: "ReAct Loop & Tool Execution",
        lang: "Python",
        file: "runtime_agent.py",
        metrics: { throughput: "Tri-modal streaming", latency: "38ms TTFT", memory: "110 MB" },
        code: `class AutonomousKernel:
    def __init__(self, sandbox_vm, model_client):
        self.vm = sandbox_vm
        self.llm = model_client

    async def execute_thought_loop(self, prd_spec: str):
        plan = await self.llm.generate_plan(prd_spec)
        for step in plan.milestones:
            res = await self.vm.run_command(step.shell_cmd)
            diagnosis = await self.llm.diagnose_ast(res.logs)
            if not diagnosis.passed:
                patch = await self.llm.synthesize_diff(step.file, diagnosis)
                await self.vm.apply_patch(patch)
        return True`,
        assertions: [
            "✓ AST-aware error localization — Passed",
            "✓ Isolated microVM container execution — Passed",
            "✓ Unified Diff patch synthesis & rollback — Passed",
            "✓ 100% milestone test suite pass verification — Verified"
        ]
    }
};

// Architecture Tracks data
const ARCHITECTURE_TRACKS = [
    {
        id: "systems",
        title: "Systems & Kernels",
        tagline: "epoll, memory layout, custom allocators, and protocol parsers",
        icon: Cpu,
        tech: ["Rust", "C++", "Linux Sockets", "Assembly"],
        badge: "High Performance",
        color: "from-indigo-500/20 via-purple-500/10 to-transparent",
        accent: "text-indigo-400 border-indigo-500/30"
    },
    {
        id: "distributed",
        title: "Distributed Infrastructure",
        tagline: "Raft consensus, partitioning, gossip protocols, and event brokers",
        icon: Server,
        tech: ["Go", "gRPC", "Nomad", "Kafka"],
        badge: "Scale & Consensus",
        color: "from-cyan-500/20 via-blue-500/10 to-transparent",
        accent: "text-cyan-400 border-cyan-500/30"
    },
    {
        id: "realtime",
        title: "Real-Time Networking",
        tagline: "CRDTs, fractional indexing, WebSockets, and multiplayer engines",
        icon: Network,
        tech: ["TypeScript", "WebSockets", "WebRTC", "Redis"],
        badge: "Low Latency",
        color: "from-emerald-500/20 via-teal-500/10 to-transparent",
        accent: "text-emerald-400 border-emerald-500/30"
    },
    {
        id: "ai-runtime",
        title: "Autonomous AI Agents",
        tagline: "ReAct loops, AST parsing, automated code synthesis, and sandboxing",
        icon: Sparkles,
        tech: ["Python", "PyTorch", "LLM APIs", "Docker"],
        badge: "Next-Gen AI",
        color: "from-purple-500/20 via-pink-500/10 to-transparent",
        accent: "text-purple-400 border-purple-500/30"
    },
    {
        id: "fullstack",
        title: "Cloud Scale Architecture",
        tagline: "PostgreSQL internals, read-replicas, rate limiters, and microVMs",
        icon: Database,
        tech: ["React", "Node.js", "PostgreSQL", "Docker"],
        badge: "Production Ready",
        color: "from-amber-500/20 via-orange-500/10 to-transparent",
        accent: "text-amber-400 border-amber-500/30"
    },
    {
        id: "security",
        title: "Cryptographic Security",
        tagline: "Zero-knowledge proofs, refresh token rotation, and threat modeling",
        icon: Shield,
        tech: ["OAuth 2.1", "JWT RTR", "NIST", "OWASP"],
        badge: "Defense in Depth",
        color: "from-rose-500/20 via-red-500/10 to-transparent",
        accent: "text-rose-400 border-rose-500/30"
    }
];

export default function HomePage() {
    const navigate = useNavigate();

    // Active Hero scenario state
    const [selectedScenarioKey, setSelectedScenarioKey] = useState("redis");
    const activeScenario = HERO_SCENARIOS[selectedScenarioKey];

    // Interactive runner state
    const [isExecutingScenario, setIsExecutingScenario] = useState(false);
    const [testProgress, setTestProgress] = useState(4); // number of passed steps
    const [copiedCode, setCopiedCode] = useState(false);

    // Architecture failure simulation state (interactive playground)
    const [simActiveScenario, setSimActiveScenario] = useState("partition");
    const [simLogs, setSimLogs] = useState([
        "[00:00:01] 5-node cluster healthy (node-1 LEADER, nodes 2..5 FOLLOWERS)",
        "[00:00:02] Heartbeat interval 50ms stable. Replication latency: 0.8ms"
    ]);
    const [isSimRunning, setIsSimRunning] = useState(false);

    // Project launch modal state
    const [activeModalProject, setActiveModalProject] = useState(null);

    // Handle running test assertions in hero
    const handleTriggerTestRun = () => {
        if (isExecutingScenario) return;
        setIsExecutingScenario(true);
        setTestProgress(0);

        const interval = setInterval(() => {
            setTestProgress(prev => {
                if (prev >= 4) {
                    clearInterval(interval);
                    setIsExecutingScenario(false);
                    return 4;
                }
                return prev + 1;
            });
        }, 320);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(activeScenario.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Handle Interactive Architecture Failure Simulation
    const handleRunSimulation = (type) => {
        if (isSimRunning) return;
        setIsSimRunning(true);
        setSimActiveScenario(type);

        if (type === "partition") {
            setSimLogs([
                "[SIMULATION: NETWORK PARTITION INJECTED]",
                "[!] Isolated node-1 (old leader) from nodes 2, 3, 4, 5",
                "[⚡] Nodes 2..5 detected missed heartbeat (150ms timeout)",
                "[✓] Node-3 started new election for Term 42",
                "[✓] Received 3/4 quorum votes. Node-3 promoted to LEADER",
                "[🎉] Cluster restored in 12ms with ZERO DATA LOSS"
            ]);
        } else if (type === "load") {
            setSimLogs([
                "[SIMULATION: 100K CONCURRENT WEBSOCKET SPIKE]",
                "[!] Ingesting 100,000 parallel client connections...",
                "[⚡] epoll event loop multiplexing on 8 worker threads",
                "[✓] Zero memory allocations on GET commands (zero-copy buffer)",
                "[✓] Resident memory: 14.8 MB (stable across 30s benchmark)",
                "[🎉] Benchmark completed: 142,400 req/s @ 0.9ms p99"
            ]);
        } else {
            setSimLogs([
                "[SIMULATION: THREAD-SAFE CACHE EVICTION TRIGGERED]",
                "[!] Memory capacity threshold (95%) reached",
                "[⚡] Background eviction thread sweep initiated",
                "[✓] Evaluated 2,400 candidate keys with sample-based LRU",
                "[✓] Evicted 240 expired keys in 0.4ms with non-blocking read lock",
                "[🎉] Memory normalized back to 70% threshold"
            ]);
        }

        setTimeout(() => setIsSimRunning(false), 800);
    };

    return (
        <div className="min-h-screen bg-[#04060A] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
            
            {/* ======================================================== */}
            {/* 1. AMBIENT BIOLUMINESCENT ATMOSPHERE                     */}
            {/* ======================================================== */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-7xl h-[650px] aurora-backdrop blur-[140px] opacity-75" />
                <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-[380px] perspective-grid opacity-35" />
                <div className="absolute top-[45rem] -right-40 w-[45vw] h-[450px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute top-[75rem] -left-40 w-[40vw] h-[450px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
            </div>

            {/* Global Floating Frosted Header */}
            <NavBar />

            {/* ======================================================== */}
            {/* 2. LIVING HERO STAGE                                     */}
            {/* ======================================================== */}
            <section className="relative z-10 pt-16 sm:pt-24 lg:pt-28 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                
                {/* Magnetic Radar Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl mb-8 group hover:border-indigo-500/40 transition-all cursor-pointer"
                    onClick={() => navigate("/projects")}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                    <span className="text-xs font-mono font-medium tracking-wide text-slate-300">
                        <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent font-bold">
                            SKILLFORGE FORGE 2.5
                        </span>
                        <span className="text-slate-600 mx-1.5">•</span>
                        <span>Autonomous Architecture Engine</span>
                    </span>
                    <ChevronRight size={13} className="text-slate-500 group-hover:translate-x-0.5 text-slate-300 transition-transform" />
                </motion.div>

                {/* Hero Headline */}
                <motion.h1 
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight max-w-4xl"
                >
                    Where Senior Engineers <br />
                    <span className="shimmer-text">
                        Forge Real Systems.
                    </span>
                </motion.h1>

                {/* Hero Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl leading-relaxed font-normal"
                >
                    Stop memorizing shallow syntax. Build distributed cache servers, Raft consensus engines, and real-time CRDT canvases from production PRDs inside isolated Linux sandboxes.
                </motion.p>

                {/* Hero Action Cluster */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
                >
                    <button
                        onClick={() => navigate("/projects")}
                        className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/25 border border-indigo-400/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] group"
                    >
                        <Zap size={16} className="text-cyan-300 fill-cyan-300/30 group-hover:rotate-12 transition-transform" />
                        <span>Launch Projects Forge</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate("/courses")}
                        className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm sm:text-base backdrop-blur-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <BookOpen size={16} className="text-indigo-400" />
                        <span>Browse Curricula</span>
                    </button>
                </motion.div>

                {/* Micro-Metrics Ribbon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-400"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>MicroVM Linux Runtimes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Automated Test Assertions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>AI Code Review via Forge Copilot</span>
                    </div>
                </motion.div>

                {/* ======================================================== */}
                {/* 3. HERO CENTERPIECE: LIVING ARCHITECTURE COCKPIT         */}
                {/* ======================================================== */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="mt-12 sm:mt-16 w-full max-w-5xl mx-auto rounded-3xl glass-card-luxury overflow-hidden border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-left relative"
                >
                    {/* Glowing Top Edge Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

                    {/* Window Header */}
                    <div className="px-4 py-3 bg-[#070A11] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="text-slate-400 font-bold hidden sm:inline">
                                skillforge-cockpit :: {activeScenario.file}
                            </span>
                        </div>

                        {/* Scenario Switcher Tabs */}
                        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto">
                            {Object.entries(HERO_SCENARIOS).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedScenarioKey(key);
                                        setTestProgress(4);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                                        selectedScenarioKey === key
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        {/* Telemetry pill */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 hidden md:flex">
                            <span className="flex items-center gap-1">
                                <Activity size={12} className="text-emerald-400 animate-pulse" />
                                <span className="text-slate-300">{activeScenario.metrics.throughput}</span>
                            </span>
                            <span>p99: {activeScenario.metrics.latency}</span>
                        </div>
                    </div>

                    {/* Code & Assertions Split Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#060910]">
                        
                        {/* Left Code Editor Panel */}
                        <div className="lg:col-span-7 p-5 font-mono text-xs overflow-x-auto border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-white/5">
                                <span>LANGUAGE: {activeScenario.lang.toUpperCase()}</span>
                                <button 
                                    onClick={handleCopyCode}
                                    className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                                >
                                    {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                                </button>
                            </div>
                            <pre className="text-slate-300 leading-relaxed font-mono selection:bg-indigo-500/40">
                                <code>{activeScenario.code}</code>
                            </pre>
                        </div>

                        {/* Right Test Assertion & Execution Panel */}
                        <div className="lg:col-span-5 p-5 bg-[#080C14] flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                                        <Shield size={14} className="text-cyan-400" />
                                        <span>Automated Test Runner</span>
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                        {testProgress}/4 VERIFIED
                                    </span>
                                </div>

                                {/* Assertion Steps */}
                                <div className="space-y-2 pt-1 font-mono text-xs">
                                    {activeScenario.assertions.map((step, idx) => {
                                        const isDone = idx < testProgress;
                                        return (
                                            <div 
                                                key={idx}
                                                className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                                                    isDone 
                                                        ? "bg-white/[0.02] border-emerald-500/30 text-emerald-300"
                                                        : "bg-white/[0.01] border-white/5 text-slate-500 opacity-60"
                                                }`}
                                            >
                                                <CheckCircle2 
                                                    size={14} 
                                                    className={`mt-0.5 shrink-0 ${isDone ? "text-emerald-400" : "text-slate-600"}`} 
                                                />
                                                <span className="leading-snug">{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Runner Action Button */}
                            <div className="pt-2">
                                <button
                                    onClick={handleTriggerTestRun}
                                    disabled={isExecutingScenario}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Play size={13} fill="currentColor" />
                                    <span>{isExecutingScenario ? "Executing Test Harness..." : "Re-Run Automated Assertions"}</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Cockpit Footer Stats */}
                    <div className="p-3 bg-[#070A11] border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-slate-400">Sandbox status: Isolated Container Active (Alpine Linux 6.6)</span>
                        </div>
                        <span className="text-slate-400">WebSocket Ping: 12ms • Memory: {activeScenario.metrics.memory}</span>
                    </div>
                </motion.div>

            </section>

            {/* ======================================================== */}
            {/* 4. ENTERPRISE ENGINEERING LOGO MARQUEE                   */}
            {/* ======================================================== */}
            <section className="border-y border-white/10 py-10 bg-white/[0.01] relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center mb-6">
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        Architectures inspired by production engineering at
                    </p>
                </div>

                <div className="mask-marquee flex overflow-hidden">
                    <div className="flex shrink-0 items-center gap-12 sm:gap-20 animate-marquee text-slate-400 font-bold text-sm sm:text-base tracking-wider font-mono">
                        {["STRIPE", "VERCEL", "LINEAR", "CLOUDFLARE", "DATADOG", "HASHICORP", "META", "AMAZON AWS", "NETFLIX", "DOCKER"].map((logo, idx) => (
                            <span key={idx} className="hover:text-white transition-colors opacity-60 hover:opacity-100 flex items-center gap-2">
                                <Box size={14} className="text-indigo-400" />
                                <span>{logo}</span>
                            </span>
                        ))}
                    </div>
                    <div className="flex shrink-0 items-center gap-12 sm:gap-20 animate-marquee text-slate-400 font-bold text-sm sm:text-base tracking-wider font-mono" aria-hidden="true">
                        {["STRIPE", "VERCEL", "LINEAR", "CLOUDFLARE", "DATADOG", "HASHICORP", "META", "AMAZON AWS", "NETFLIX", "DOCKER"].map((logo, idx) => (
                            <span key={`dup-${idx}`} className="hover:text-white transition-colors opacity-60 hover:opacity-100 flex items-center gap-2">
                                <Box size={14} className="text-indigo-400" />
                                <span>{logo}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 5. INTERACTIVE ARCHITECTURE PLAYGROUND                   */}
            {/* ======================================================== */}
            <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase">
                        <Flame size={13} />
                        <span>Interactive Playground</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                        Test Real-World Failure Scenarios. <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Before You Deploy.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Click any system stress scenario below to watch how our compiled runtimes handle partitions, memory pressure, and high-concurrency spikes in real-time.
                    </p>
                </div>

                {/* Interactive Simulator Cockpit */}
                <div className="rounded-3xl glass-card-luxury border border-white/10 p-6 sm:p-8 overflow-hidden space-y-6">
                    
                    {/* Scenario Triggers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                id: "partition",
                                title: "Network Partition",
                                subtitle: "Split-brain consensus election",
                                icon: Network,
                                color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                            },
                            {
                                id: "load",
                                title: "100k Concurrent Conns",
                                subtitle: "epoll non-blocking multiplexer",
                                icon: Activity,
                                color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                            },
                            {
                                id: "eviction",
                                title: "Cache Eviction Spike",
                                subtitle: "Thread-safe O(1) LRU cleanup",
                                icon: Database,
                                color: "border-purple-500/40 bg-purple-500/10 text-purple-300"
                            }
                        ].map((btn) => {
                            const Icon = btn.icon;
                            const isSelected = simActiveScenario === btn.id;
                            return (
                                <button
                                    key={btn.id}
                                    onClick={() => handleRunSimulation(btn.id)}
                                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                                        isSelected
                                            ? "bg-white/[0.08] border-indigo-400 shadow-lg shadow-indigo-500/20"
                                            : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-xl border ${btn.color} shrink-0`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                            <span>{btn.title}</span>
                                            {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                                        </h4>
                                        <p className="text-xs text-slate-400">{btn.subtitle}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Live Simulation Terminal Console */}
                    <div className="rounded-2xl bg-[#060910] border border-white/10 p-5 font-mono text-xs space-y-2 min-h-[180px]">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-white/5">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>SIMULATION_ENGINE :: RUNTIME_TELEMETRY</span>
                            </span>
                            <span>STATUS: READY</span>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            {simLogs.map((log, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex items-start gap-2 ${
                                        log.startsWith("[🎉]") 
                                            ? "text-cyan-300 font-bold" 
                                            : log.startsWith("[✓]")
                                            ? "text-emerald-400 font-medium"
                                            : log.startsWith("[!]")
                                            ? "text-amber-400 font-semibold"
                                            : log.startsWith("[⚡]")
                                            ? "text-indigo-400 font-semibold"
                                            : "text-slate-400"
                                    }`}
                                >
                                    <span className="text-slate-600 select-none">&gt;</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </section>

            {/* ======================================================== */}
            {/* 6. BENTO GRID 2.0: THE FIVE ENGINEERING PILLARS         */}
            {/* ======================================================== */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase">
                        <Layers size={13} />
                        <span>The SkillForge Method</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Built for Engineers Who Value Depth.
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Five core principles that transform your engineering capabilities from syntax-memorizer to distributed systems architect.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Bento 1: MicroVM Container Isolation (Col span 2) */}
                    <div className="md:col-span-2 p-8 rounded-3xl glass-card-luxury border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6 group">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <Terminal size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                In-Browser Linux MicroVM Containers
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                Full Alpine Linux microVM running directly in your browser. Real POSIX sockets, thread scheduling, file systems, and compiler toolchains (Rust, Go, Node.js, Python).
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#060910] border border-white/10 font-mono text-xs text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>$ cargo test --release -- --nocapture</span>
                            </span>
                            <span className="text-emerald-400 font-bold">ALL 18 PASSED (0.24s)</span>
                        </div>
                    </div>

                    {/* Bento 2: Production PRDs & RFCs */}
                    <div className="p-8 rounded-3xl glass-card-luxury border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-6 group">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                Real Production RFCs & PRDs
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Never code from vague prompts. Every project includes architectural RFCs, sequence diagrams, and mathematical invariants.
                            </p>
                        </div>
                        <div className="pt-2 text-xs font-mono text-purple-400 flex items-center gap-1 font-bold">
                            <span>Read Sample Specification</span>
                            <ChevronRight size={13} />
                        </div>
                    </div>

                    {/* Bento 3: Tri-Modal Forge Copilot AI */}
                    <div className="p-8 rounded-3xl glass-card-luxury border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-6 group">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                Forge Copilot Tri-Modal AI
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Not just a generic chat. An autonomous mentor that inspects failing test logs, analyzes Big-O space complexity, and guides you without giving away solutions.
                            </p>
                        </div>
                        <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1 font-bold">
                            <span>Explore Copilot Capabilities</span>
                            <ChevronRight size={13} />
                        </div>
                    </div>

                    {/* Bento 4: 1-Click GitHub Portfolio Sync (Col span 2) */}
                    <div className="md:col-span-2 p-8 rounded-3xl glass-card-luxury border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-6 group">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <GitBranch size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                One-Click Verified GitHub Portfolio Sync
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                Once all milestone test assertions pass at 100%, push clean git commits with architecture READMEs directly to your GitHub portfolio. Stand out to engineering leaders immediately.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs font-mono">
                            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                                ✦ Automated Git Commit Trees
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                                ✦ Verified Test Badge
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                                ✦ Architecture Benchmark Report
                            </span>
                        </div>
                    </div>

                </div>

            </section>

            {/* ======================================================== */}
            {/* 7. CURATED ARCHITECTURE TRACKS                           */}
            {/* ======================================================== */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase">
                            <Cpu size={13} />
                            <span>Curated Tracks</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Master Core Domains of Scale
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate("/courses")}
                        className="text-xs font-bold font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                        <span>View All Curricula</span>
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ARCHITECTURE_TRACKS.map((track) => {
                        const Icon = track.icon;
                        return (
                            <div
                                key={track.id}
                                className="p-6 rounded-3xl glass-card-luxury border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5 group hover:shadow-[0_15px_35px_rgba(99,102,241,0.15)]"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-indigo-400 flex items-center justify-center">
                                            <Icon size={20} />
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${track.accent}`}>
                                            {track.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                                            {track.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                            {track.tagline}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {track.tech.map((t) => (
                                            <span 
                                                key={t}
                                                className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] font-mono text-slate-400 border border-white/5"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/courses?search=${track.id}`)}
                                    className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>Explore Track</span>
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>

            </section>

            {/* ======================================================== */}
            {/* 8. FEATURED SPECIFICATIONS (PROJECTS FORGE PREVIEW)       */}
            {/* ======================================================== */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
                
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase">
                            <Terminal size={13} />
                            <span>Featured Specs</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Build Real Engineering Specs
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate("/projects")}
                        className="text-xs font-bold font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                        <span>View All 8 Specs</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PROJECTS.slice(0, 3).map((project) => (
                        <div
                            key={project.id}
                            className="p-6 rounded-3xl glass-card-luxury border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5 group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300">
                                        {project.badge}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full text-indigo-400 bg-indigo-500/10 border border-indigo-500/30">
                                        {project.difficulty}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                        {project.tagline}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {project.techStack.map((tech) => (
                                        <span 
                                            key={tech}
                                            className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] font-mono text-slate-400 border border-white/5"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveModalProject(project)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                <Play size={13} fill="currentColor" />
                                <span>Launch Workspace</span>
                            </button>
                        </div>
                    ))}
                </div>

            </section>

            {/* ======================================================== */}
            {/* 9. HIGH-CONVERSION GRAND FINALE CTA PORTAL               */}
            {/* ======================================================== */}
            <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                <div className="p-10 sm:p-16 rounded-3xl glass-card-luxury border border-indigo-500/30 relative overflow-hidden space-y-8 shadow-[0_0_60px_rgba(99,102,241,0.2)]">
                    
                    {/* Background Radial Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-[100px] pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-cyan-300">
                            <Sparkles size={13} />
                            <span>Zero Fluff • 100% Real Architecture</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                            Ready to Build Systems That <br />
                            <span className="shimmer-text">
                                Define Your Career?
                            </span>
                        </h2>

                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                            Join thousands of engineers deploying production architectures, mastering deep systems, and creating verified GitHub portfolios.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate("/signup")}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/30 border border-indigo-400/40 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Create Free Engineer Account</span>
                            <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={() => navigate("/projects")}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-bold text-sm sm:text-base backdrop-blur-xl transition-all"
                        >
                            <span>Launch Live Sandbox</span>
                        </button>
                    </div>

                    <div className="relative z-10 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
                        <span>✓ No credit card required</span>
                        <span>•</span>
                        <span>✓ Instant in-browser runtime</span>
                        <span>•</span>
                        <span>✓ 100% open source friendly</span>
                    </div>

                </div>
            </section>

            {/* Launch Workspace Modal */}
            <ProjectLaunchModal
                project={activeModalProject}
                isOpen={!!activeModalProject}
                onClose={() => setActiveModalProject(null)}
            />

        </div>
    );
}
