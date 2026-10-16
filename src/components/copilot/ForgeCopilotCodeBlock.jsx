import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export default function ForgeCopilotCodeBlock({ language, code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    const displayLang = (language || "code").toLowerCase();

    return (
        <div className="my-3 rounded-xl border border-white/10 bg-[#070A12] overflow-hidden shadow-lg">
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0C101A] border-b border-white/5 text-xs text-brand-muted">
                <div className="flex items-center gap-1.5 font-mono">
                    <Terminal size={12} className="text-brand-primary" />
                    <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-300">
                        {displayLang}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-[11px]"
                    title="Copy code to clipboard"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <pre className="p-3.5 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed scrollbar-thin">
                <code>{code}</code>
            </pre>
        </div>
    );
}
