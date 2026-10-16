import React from "react";
import { useNavigate } from "react-router-dom";
import ForgeCopilotCodeBlock from "./ForgeCopilotCodeBlock";

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

    // Helper to format inline elements (bold, italic, code, links)
    const formatInline = (text) => {
        // Tokenize links: [label](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const tokens = [];
        let lIndex = 0;
        let lMatch;

        while ((lMatch = linkRegex.exec(text)) !== null) {
            if (lMatch.index > lIndex) {
                tokens.push(text.slice(lIndex, lMatch.index));
            }
            tokens.push({
                isLink: true,
                label: lMatch[1],
                url: lMatch[2]
            });
            lIndex = lMatch.index + lMatch[0].length;
        }
        if (lIndex < text.length) {
            tokens.push(text.slice(lIndex));
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

            // Inline formatting (bold, italic, inline code)
            // Split by inline code: `code`
            const codeParts = token.split(/`([^`]+)`/g);
            return (
                <React.Fragment key={i}>
                    {codeParts.map((sub, j) => {
                        if (j % 2 === 1) {
                            return (
                                <code
                                    key={j}
                                    className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[12px] text-cyan-300 border border-white/5"
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
    };

    // Render prose blocks (paragraphs, headers, lists)
    const renderProse = (proseText, blockIdx) => {
        const lines = proseText.split("\n");
        const elements = [];
        let currentList = [];
        let listType = null; // 'ul' or 'ol'

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

        lines.forEach((rawLine, idx) => {
            const line = rawLine.trim();

            if (!line) {
                flushList();
                return;
            }

            // Headers
            if (line.startsWith("### ")) {
                flushList();
                elements.push(
                    <h4 key={idx} className="text-sm font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
                        {formatInline(line.replace("### ", ""))}
                    </h4>
                );
                return;
            }
            if (line.startsWith("## ")) {
                flushList();
                elements.push(
                    <h3 key={idx} className="text-base font-bold text-white mt-3.5 mb-2">
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

        return <div key={blockIdx} className="space-y-1">{elements}</div>;
    };

    return (
        <div className="text-brand-text">
            {parts.map((part, i) => {
                if (part.type === "code") {
                    return <ForgeCopilotCodeBlock key={i} language={part.language} code={part.code} />;
                }
                return renderProse(part.content, i);
            })}
        </div>
    );
}
