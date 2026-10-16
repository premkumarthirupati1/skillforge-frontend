import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgeCopilotCodeBlock from "./ForgeCopilotCodeBlock";
import MermaidDiagram from "./MermaidDiagram";
import { Sparkles, Maximize2, ExternalLink, X, Download } from "lucide-react";

/**
 * Architecture Diagram & Visual Asset Card with Lightbox Zoom
 */
function ArchitectureImageCard({ src, alt }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (!src || error) return null;

    return (
        <div className="my-3 rounded-xl border border-[#1e293b] bg-[#070A12] overflow-hidden shadow-xl group">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0C101A] border-b border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-300 truncate max-w-[75%]">
                    <Sparkles size={12} className="text-blue-400 shrink-0" />
                    <span className="truncate">{alt || "System Architecture Diagram"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                        className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors text-slate-400"
                        title="Open image in new tab"
                    >
                        <ExternalLink size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-blue-400 hover:text-blue-300 font-medium text-[11px] transition-colors"
                    >
                        <Maximize2 size={11} />
                        <span>Zoom</span>
                    </button>
                </div>
            </div>

            {/* Image Preview Container */}
            <div 
                className="p-3 sm:p-5 flex items-center justify-center bg-[#070A12]/95 cursor-zoom-in min-h-[140px] relative"
                onClick={() => setIsOpen(true)}
            >
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#070A12]">
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span>Loading diagram...</span>
                        </div>
                    </div>
                )}
                <img
                    src={src}
                    alt={alt || "System Architecture Diagram"}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className="max-w-full h-auto rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.01]"
                />
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-md p-4 sm:p-6"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                            <Sparkles size={16} className="text-blue-400" />
                            <span>{alt || "System Architecture Diagram"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <ExternalLink size={13} />
                                <span>Full Resolution</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                        <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ForgeCopilotMarkdown({ content, onLinkClick }) {
    const navigate = useNavigate();

    if (!content) return null;

    // Split text into code blocks and prose
    // Code block regex: ```[language]?\n[\s\S]*?```
    const parts = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                content: content.slice(lastIndex, match.index)
            });
        }
        parts.push({
            type: "code",
            language: match[1] || "text",
            code: match[2].trimEnd()
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push({
            type: "text",
            content: content.slice(lastIndex)
        });
    }

    // Helper to format inline elements (images, bold, italic, code, links)
    const formatInline = (text) => {
        // 1. Tokenize images first: ![alt](url)
        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const imgTokens = [];
        let iIndex = 0;
        let iMatch;

        while ((iMatch = imgRegex.exec(text)) !== null) {
            if (iMatch.index > iIndex) {
                imgTokens.push(text.slice(iIndex, iMatch.index));
            }
            imgTokens.push({
                isImage: true,
                alt: iMatch[1],
                url: iMatch[2]
            });
            iIndex = iMatch.index + iMatch[0].length;
        }
        if (iIndex < text.length) {
            imgTokens.push(text.slice(iIndex));
        }

        return imgTokens.map((imgToken, idx) => {
            if (typeof imgToken === "object" && imgToken.isImage) {
                return (
                    <ArchitectureImageCard key={`img-${idx}`} src={imgToken.url} alt={imgToken.alt} />
                );
            }

            // 2. Tokenize links: [label](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const tokens = [];
            let lIndex = 0;
            let lMatch;

            while ((lMatch = linkRegex.exec(imgToken)) !== null) {
                if (lMatch.index > lIndex) {
                    tokens.push(imgToken.slice(lIndex, lMatch.index));
                }
                tokens.push({
                    isLink: true,
                    label: lMatch[1],
                    url: lMatch[2]
                });
                lIndex = lMatch.index + lMatch[0].length;
            }
            if (lIndex < imgToken.length) {
                tokens.push(imgToken.slice(lIndex));
            }

            return tokens.map((token, i) => {
                if (typeof token === "object" && token.isLink) {
                    const isInternal = token.url.startsWith("/");
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                if (isInternal) {
                                    if (onLinkClick) onLinkClick();
                                    navigate(token.url);
                                } else {
                                    window.open(token.url, "_blank", "noopener,noreferrer");
                                }
                            }}
                            className="text-brand-primary underline hover:text-blue-300 font-medium cursor-pointer transition-colors inline"
                        >
                            {token.label}
                        </button>
                    );
                }

                // 3. Inline formatting (bold, italic, inline code)
                const codeParts = String(token).split(/`([^`]+)`/g);
                return (
                    <React.Fragment key={i}>
                        {codeParts.map((sub, j) => {
                            if (j % 2 === 1) {
                                return (
                                    <code
                                        key={j}
                                        className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[12px] text-cyan-300 border border-white/5 break-all break-words [overflow-wrap:anywhere] inline max-w-full"
                                    >
                                        {sub}
                                    </code>
                                );
                            }

                            // Parse bold: **text**
                            const boldParts = sub.split(/\*\*([^*]+)\*\*/g);
                            return boldParts.map((bText, k) => {
                                if (k % 2 === 1) {
                                    return (
                                        <strong key={k} className="font-semibold text-white">
                                            {bText}
                                        </strong>
                                    );
                                }

                                // Parse italic: *text*
                                const italicParts = bText.split(/\*([^*]+)\*/g);
                                return italicParts.map((iText, l) => {
                                    if (l % 2 === 1) {
                                        return <em key={l} className="italic text-slate-300">{iText}</em>;
                                    }
                                    return iText;
                                });
                            });
                        })}
                    </React.Fragment>
                );
            });
        });
    };

    // Render prose blocks (paragraphs, headers, lists, tables)
    const renderProse = (proseText, blockIdx) => {
        const lines = proseText.split("\n");
        const elements = [];
        let currentList = [];
        let listType = null; // 'ul' or 'ol'
        let currentTable = [];

        const flushList = () => {
            if (currentList.length > 0) {
                if (listType === "ul") {
                    elements.push(
                        <ul key={`ul-${elements.length}`} className="my-2 space-y-1 pl-4 list-disc marker:text-brand-primary">
                            {currentList.map((li, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    {formatInline(li)}
                                </li>
                            ))}
                        </ul>
                    );
                } else if (listType === "ol") {
                    elements.push(
                        <ol key={`ol-${elements.length}`} className="my-2 space-y-1 pl-4 list-decimal marker:text-brand-primary">
                            {currentList.map((li, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    {formatInline(li)}
                                </li>
                            ))}
                        </ol>
                    );
                }
                currentList = [];
                listType = null;
            }
        };

        const flushTable = () => {
            if (currentTable.length > 0) {
                // Parse markdown table rows
                const rows = currentTable.map(r => 
                    r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
                );
                // Filter out divider row (e.g. |---|---|)
                const dataRows = rows.filter(r => !r.every(c => /^[-:\s]+$/.test(c)));
                if (dataRows.length > 0) {
                    const header = dataRows[0];
                    const body = dataRows.slice(1);
                    elements.push(
                        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-[#1e293b] bg-[#070A12] shadow-md">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0C101A] border-b border-white/10 text-slate-200">
                                        {header.map((col, cIdx) => (
                                            <th key={cIdx} className="px-3 py-2 font-semibold font-mono text-[11px] uppercase tracking-wider text-slate-300">
                                                {formatInline(col)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {body.map((row, rIdx) => (
                                        <tr key={rIdx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="px-3 py-2 text-slate-300 text-xs">
                                                    {formatInline(cell)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                currentTable = [];
            }
        };

        lines.forEach((rawLine, idx) => {
            const line = rawLine.trim();

            if (!line) {
                flushList();
                flushTable();
                return;
            }

            // Standalone image line: ![alt](url)
            const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
                flushList();
                flushTable();
                elements.push(
                    <ArchitectureImageCard key={`img-line-${idx}`} alt={imgMatch[1]} src={imgMatch[2]} />
                );
                return;
            }

            // Table rows: | col | col |
            if (line.startsWith("|") && line.endsWith("|")) {
                flushList();
                currentTable.push(line);
                return;
            } else {
                flushTable();
            }

            // Headers
            if (line.startsWith("### ")) {
                flushList();
                elements.push(
                    <h4 key={idx} className="text-sm font-bold text-white mt-3.5 mb-1.5 flex items-center gap-1.5">
                        {formatInline(line.replace("### ", ""))}
                    </h4>
                );
                return;
            }
            if (line.startsWith("## ")) {
                flushList();
                elements.push(
                    <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-1.5">
                        {formatInline(line.replace("## ", ""))}
                    </h3>
                );
                return;
            }
            if (line.startsWith("# ")) {
                flushList();
                elements.push(
                    <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
                        {formatInline(line.replace("# ", ""))}
                    </h2>
                );
                return;
            }

            // Bullet list
            if (line.startsWith("- ") || line.startsWith("* ")) {
                if (listType !== "ul") flushList();
                listType = "ul";
                currentList.push(line.replace(/^[-*]\s+/, ""));
                return;
            }

            // Numbered list: e.g. 1. 2.
            const numMatch = line.match(/^\d+\.\s+(.*)/);
            if (numMatch) {
                if (listType !== "ol") flushList();
                listType = "ol";
                currentList.push(numMatch[1]);
                return;
            }

            // Normal paragraph
            flushList();
            elements.push(
                <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1.5">
                    {formatInline(line)}
                </p>
            );
        });

        flushList();
        flushTable();

        return <div key={blockIdx} className="space-y-1">{elements}</div>;
    };

    return (
        <div className="text-brand-text">
            {parts.map((part, i) => {
                if (part.type === "code") {
                    const lang = (part.language || "").toLowerCase().trim();
                    if (lang === "mermaid") {
                        return <MermaidDiagram key={i} code={part.code} />;
                    }
                    return <ForgeCopilotCodeBlock key={i} language={part.language} code={part.code} />;
                }
                return renderProse(part.content, i);
            })}
        </div>
    );
}
