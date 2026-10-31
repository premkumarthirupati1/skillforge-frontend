import React, { useState } from "react";
import { 
    Award, 
    Sparkles, 
    Zap, 
    CheckCircle2, 
    AlertTriangle, 
    Layers, 
    ShieldCheck, 
    Check, 
    Copy, 
    RefreshCw, 
    FileCode, 
    ArrowUpRight,
    Sliders,
    Flame,
    Cpu,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function CodeReviewPanel({
    review,
    isLoading = false,
    onApplyFix,
    onJumpToLine,
    onRefreshReview,
    activeFileName = ""
}) {
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState("all");

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Cpu size={28} className="animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-400 animate-ping opacity-75" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-sm font-semibold text-slate-200">
                        Analyzing Code Architecture & Complexity...
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Evaluating Big-O time and space complexity, memory allocations, language idioms, and edge cases.
                    </p>
                </div>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#131926] border border-[#1E2738] flex items-center justify-center text-slate-400">
                    <Award size={24} />
                </div>
                <div className="space-y-1 max-w-sm">
                    <h3 className="text-sm font-semibold text-slate-200">No Code Review Yet</h3>
                    <p className="text-xs text-slate-400">
                        Run tests or submit this milestone to receive an automated architecture and complexity evaluation.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onRefreshReview}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                    <Sparkles size={13} />
                    <span>Generate Review Now</span>
                </button>
            </div>
        );
    }

    const {
        score = 85,
        grade = "B+",
        summary = "",
        complexity = { time: "O(N)", space: "O(1)", analysis: "" },
        categories = {},
        praise = [],
        suggestions = []
    } = review;

    // Filter suggestions by severity
    const filteredSuggestions = suggestions.filter(s => {
        if (filterSeverity === "all") return true;
        return (s.severity || "").toLowerCase() === filterSeverity;
    });

    const handleCopy = (code, index) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        toast.success("Replacement snippet copied!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getGradeColor = (g = "B") => {
        if (g.startsWith("A")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
        if (g.startsWith("B")) return "text-sky-400 bg-sky-500/10 border-sky-500/30";
        if (g.startsWith("C")) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    };

    const getSeverityBadge = (sev = "improvement") => {
        switch (sev.toLowerCase()) {
            case "bug_risk":
                return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">Bug Risk</span>;
            case "optimization":
                return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">Optimization</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">Improvement</span>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4 scrollbar-thin select-text bg-[#0B0F19]">
            
            {/* Top Bar: Overview & Score */}
            <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1B2438] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Grade & Score */}
                <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono border font-bold ${getGradeColor(grade)} shadow-sm shrink-0`}>
                        <span className="text-xl leading-none">{grade}</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">{score}/100</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-100">
                                Staff Architecture Review
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-medium border border-slate-700">
                                Verified Pass
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                            {summary}
                        </p>
                    </div>
                </div>

                {/* Big-O Badges & Action */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 self-stretch md:self-auto justify-between">
                    <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-lg bg-[#141B2D] border border-sky-500/20 text-xs font-mono text-sky-300 flex items-center gap-1.5">
                            <Clock size={12} className="text-sky-400" />
                            <span>Time: {complexity.time || "O(N)"}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-[#141B2D] border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                            <Cpu size={12} className="text-indigo-400" />
                            <span>Space: {complexity.space || "O(1)"}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onRefreshReview}
                        className="text-[11px] text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1 mt-1"
                        title="Re-run AI review against latest code"
                    >
                        <RefreshCw size={11} />
                        <span>Re-evaluate</span>
                    </button>
                </div>
            </div>

            {/* Complexity Analysis Note */}
            {complexity.analysis && (
                <div className="px-3.5 py-2.5 rounded-lg bg-[#0F1626]/80 border border-sky-500/20 text-xs text-sky-200/90 flex items-start gap-2.5 leading-relaxed">
                    <Sparkles size={14} className="text-sky-400 shrink-0 mt-0.5" />
                    <span><strong>Complexity Insight:</strong> {complexity.analysis}</span>
                </div>
            )}

            {/* 3 Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Architecture */}
                <div className="p-3 rounded-lg bg-[#0E1322] border border-[#1B2438] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Layers size={13} className="text-sky-400" />
                            Architecture
                        </span>
                        <span className="font-mono text-sky-400 font-bold">
                            {categories.architecture?.score || 85}%
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        {categories.architecture?.feedback || "Clean separation of components and state management."}
                    </p>
                </div>

                {/* Performance */}
                <div className="p-3 rounded-lg bg-[#0E1322] border border-[#1B2438] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Zap size={13} className="text-amber-400" />
                            Performance
                        </span>
                        <span className="font-mono text-amber-400 font-bold">
                            {categories.performance?.score || 85}%
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        {categories.performance?.feedback || "Bounded loop execution and minimal heap allocations."}
                    </p>
                </div>

                {/* Safety & Robustness */}
                <div className="p-3 rounded-lg bg-[#0E1322] border border-[#1B2438] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-400" />
                            Safety & Invariants
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                            {categories.safety?.score || 90}%
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        {categories.safety?.feedback || "Handles error states and boundary conditions properly."}
                    </p>
                </div>
            </div>

            {/* Praise Section */}
            {praise.length > 0 && (
                <div className="p-3.5 rounded-lg bg-[#0E1524] border border-emerald-500/20 space-y-2">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Strengths in this Submission</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                        {praise.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions & Actionable Refactorings */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                            Refactoring Recommendations ({suggestions.length})
                        </h4>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 p-0.5 bg-[#080B12] rounded-lg border border-[#1B2232] text-[11px]">
                        {["all", "bug_risk", "optimization", "improvement"].map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilterSeverity(f)}
                                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                                    filterSeverity === f
                                        ? "bg-slate-700 text-white font-medium shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {f.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredSuggestions.length === 0 ? (
                    <div className="p-6 rounded-lg bg-[#0E1322] border border-[#1B2438] text-center text-xs text-slate-400">
                        No actionable issues in this category. Your code looks exceptionally clean!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSuggestions.map((item, idx) => {
                            const isCopied = copiedIndex === idx;

                            return (
                                <div 
                                    key={idx}
                                    className="p-3.5 rounded-xl bg-[#0E1322] border border-[#1B2438] space-y-3 transition-all hover:border-[#2B354C]"
                                >
                                    {/* Suggestion Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {getSeverityBadge(item.severity)}
                                                <span className="text-xs font-semibold text-slate-100">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {item.explanation}
                                            </p>
                                        </div>

                                        {item.line && (
                                            <button
                                                type="button"
                                                onClick={() => onJumpToLine && onJumpToLine(item.line)}
                                                className="px-2 py-1 rounded bg-[#162032] hover:bg-[#1E293B] text-sky-400 text-[11px] font-mono font-medium flex items-center gap-1 shrink-0 border border-sky-500/20 transition-colors"
                                                title={`Navigate to Line ${item.line} in Editor`}
                                            >
                                                <span>Line {item.line}</span>
                                                <ArrowUpRight size={11} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Before / After Code Diff */}
                                    {(item.currentCode || item.suggestedCode) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                                            {/* Before */}
                                            {item.currentCode && (
                                                <div className="rounded-lg bg-[#140E14] border border-rose-500/30 overflow-hidden">
                                                    <div className="px-2.5 py-1 bg-rose-950/40 border-b border-rose-500/20 text-[10px] text-rose-300 font-semibold flex items-center justify-between">
                                                        <span>CURRENT CODE</span>
                                                        <span className="text-rose-400 font-mono">-</span>
                                                    </div>
                                                    <pre className="p-2.5 text-rose-200/90 overflow-x-auto whitespace-pre-wrap text-[11px]">
                                                        {item.currentCode}
                                                    </pre>
                                                </div>
                                            )}

                                            {/* After */}
                                            {item.suggestedCode && (
                                                <div className="rounded-lg bg-[#0E1514] border border-emerald-500/30 overflow-hidden">
                                                    <div className="px-2.5 py-1 bg-emerald-950/40 border-b border-emerald-500/20 text-[10px] text-emerald-300 font-semibold flex items-center justify-between">
                                                        <span>RECOMMENDED REFACTOR</span>
                                                        <span className="text-emerald-400 font-mono">+</span>
                                                    </div>
                                                    <pre className="p-2.5 text-emerald-200/90 overflow-x-auto whitespace-pre-wrap text-[11px]">
                                                        {item.suggestedCode}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#182030]">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(item.suggestedCode, idx)}
                                            className="px-2.5 py-1 rounded-md bg-[#162032] hover:bg-[#1E293B] text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-[#253248]"
                                        >
                                            {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>{isCopied ? "Copied" : "Copy Replacement"}</span>
                                        </button>

                                        {item.suggestedCode && onApplyFix && (
                                            <button
                                                type="button"
                                                onClick={() => onApplyFix(item.suggestedCode, item.currentCode)}
                                                className="px-3 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-sky-400/40 shadow-sm"
                                            >
                                                <Sparkles size={11} className="text-sky-400" />
                                                <span>Apply to Editor</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
