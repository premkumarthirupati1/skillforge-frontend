import React, { useState, useEffect, useRef, useId } from "react";
import mermaid from "mermaid";
import { 
    Maximize2, 
    Minimize2, 
    Copy, 
    Check, 
    Code2, 
    Eye, 
    Download, 
    ExternalLink, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw,
    Sparkles
} from "lucide-react";

// Initialize mermaid once globally with dark theme
try {
    mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        darkMode: true,
        securityLevel: "loose",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        themeVariables: {
            darkMode: true,
            background: "#0A0E17",
            primaryColor: "#1E293B",
            primaryTextColor: "#F1F5F9",
            primaryBorderColor: "#3B82F6",
            lineColor: "#60A5FA",
            secondaryColor: "#0F172A",
            tertiaryColor: "#070A12"
        }
    });
} catch (e) {
    console.warn("Mermaid init error:", e);
}

function getMermaidInkUrl(code) {
    if (!code) return "";
    try {
        const payload = {
            code: code.trim(),
            mermaid: { theme: "dark" }
        };
        const jsonStr = JSON.stringify(payload);
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        return `https://mermaid.ink/svg/${base64}`;
    } catch (e) {
        return "";
    }
}

export default function MermaidDiagram({ code = "" }) {
    const rawId = useId().replace(/:/g, "");
    const containerId = useRef(`mermaid-${rawId}-${Math.random().toString(36).substring(2, 7)}`).current;
    
    const [svgHtml, setSvgHtml] = useState("");
    const [renderError, setRenderError] = useState(false);
    const [viewMode, setViewMode] = useState("diagram"); // 'diagram' | 'source'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imgLoading, setImgLoading] = useState(true);

    const inkUrl = getMermaidInkUrl(code);

    useEffect(() => {
        let isMounted = true;
        setRenderError(false);
        setSvgHtml("");

        if (!code || !code.trim()) return;

        const renderDiagram = async () => {
            try {
                // Ensure unique ID for every render pass
                const renderId = `${containerId}-${Date.now()}`;
                const { svg } = await mermaid.render(renderId, code.trim());
                if (isMounted) {
                    setSvgHtml(svg);
                    setRenderError(false);
                }
            } catch (err) {
                console.warn("Client-side Mermaid parse failed, falling back to SVG renderer:", err.message);
                if (isMounted) {
                    setRenderError(true);
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code, containerId]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleDownloadSvg = () => {
        if (!inkUrl && !svgHtml) return;
        if (svgHtml) {
            const blob = new Blob([svgHtml], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `architecture-diagram-${Date.now()}.svg`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (inkUrl) {
            window.open(inkUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="my-4 rounded-xl border border-[#1e293b] bg-[#070A12] shadow-2xl overflow-hidden group">
            {/* Diagram Header / Toolbar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#0C101A] border-b border-white/5 text-xs">
                {/* View Mode Toggle: Diagram vs Source */}
                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                        type="button"
                        onClick={() => setViewMode("diagram")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                            viewMode === "diagram"
                                ? "bg-blue-600 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Eye size={12} />
                        <span>Architecture Diagram</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("source")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                            viewMode === "source"
                                ? "bg-blue-600 text-white shadow"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        <Code2 size={12} />
                        <span>Mermaid Code</span>
                    </button>
                </div>

                {/* Actions: Copy, Download, Fullscreen */}
                <div className="flex items-center gap-1 text-slate-400">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[11px] text-slate-300 hover:text-white transition-colors"
                        title="Copy Mermaid source"
                    >
                        {copied ? (
                            <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadSvg}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[11px] text-slate-300 hover:text-white transition-colors"
                        title="Download or open SVG"
                    >
                        <Download size={12} />
                        <span className="hidden sm:inline">SVG</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsFullscreen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[11px] text-slate-300 hover:text-white transition-colors"
                        title="Fullscreen Lightbox"
                    >
                        <Maximize2 size={12} />
                        <span className="hidden sm:inline">Expand</span>
                    </button>
                </div>
            </div>

            {/* Diagram View */}
            {viewMode === "diagram" ? (
                <div className="p-4 sm:p-6 overflow-x-auto flex items-center justify-center min-h-[160px] bg-[#070A12]/90 relative">
                    {/* Rendered SVG if client mermaid succeeds */}
                    {svgHtml && !renderError ? (
                        <div 
                            className="mermaid-svg-container max-w-full flex items-center justify-center transition-transform duration-200"
                            style={{ transform: `scale(${zoomLevel})` }}
                            dangerouslySetInnerHTML={{ __html: svgHtml }}
                        />
                    ) : (
                        /* Fallback: High-res dark SVG from mermaid.ink */
                        <div className="flex flex-col items-center justify-center max-w-full">
                            {imgLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#070A12]/80 backdrop-blur-sm z-10">
                                    <div className="flex items-center gap-2 text-xs text-blue-400">
                                        <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Rendering diagram...</span>
                                    </div>
                                </div>
                            )}
                            <img
                                src={inkUrl}
                                alt="System Architecture Diagram"
                                onLoad={() => setImgLoading(false)}
                                onError={() => setImgLoading(false)}
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* Source View */
                <pre className="p-4 text-xs font-mono text-slate-300 bg-[#06080F] overflow-x-auto leading-relaxed border-t border-white/5">
                    <code>{code.trim()}</code>
                </pre>
            )}

            {/* Lightbox / Fullscreen Modal */}
            {isFullscreen && (
                <div 
                    className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md p-4 sm:p-6"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsFullscreen(false);
                    }}
                >
                    {/* Modal Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                            <Sparkles size={16} className="text-blue-400" />
                            <span>System Architecture Blueprint</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/10 mr-2">
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.2))}
                                    className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <span className="text-[11px] font-mono px-2 text-slate-300">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.2))}
                                    className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(1)}
                                    className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10"
                                    title="Reset Zoom"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleDownloadSvg}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <Download size={14} />
                                <span>Export SVG</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Close modal"
                            >
                                <Minimize2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#070A12] rounded-xl border border-white/10">
                        {svgHtml && !renderError ? (
                            <div 
                                className="max-w-none flex items-center justify-center transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})` }}
                                dangerouslySetInnerHTML={{ __html: svgHtml }}
                            />
                        ) : (
                            <img
                                src={inkUrl}
                                alt="System Architecture Diagram"
                                className="max-w-none h-auto transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
