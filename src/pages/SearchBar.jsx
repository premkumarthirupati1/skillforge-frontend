import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, BookOpen, ArrowRight, Tag, Sparkles } from "lucide-react";
import api from "../api";

/**
 * Highlights word prefixes matching the query tokens.
 * E.g., for query "re beg", highlights "Re" in "React" and "Beg" in "Beginner".
 */
export const highlightWordPrefix = (text, query) => {
    if (!text || !query || !query.trim()) return text;

    const tokens = query.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return text;

    const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    // Match word prefix (beginning of string or directly after a non-alphanumeric boundary)
    const regex = new RegExp(`(^|[^a-zA-Z0-9_])(${escapedTokens.join("|")})`, "gi");

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const prefixIndex = match.index + match[1].length;
        if (prefixIndex > lastIndex) {
            parts.push({ text: text.slice(lastIndex, prefixIndex), isMatch: false });
        }
        parts.push({ text: match[2], isMatch: true });
        lastIndex = prefixIndex + match[2].length;
    }

    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), isMatch: false });
    }

    return (
        <span>
            {parts.map((part, index) =>
                part.isMatch ? (
                    <mark
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold px-0.5 rounded shadow-sm"
                    >
                        {part.text}
                    </mark>
                ) : (
                    <span key={index}>{part.text}</span>
                )
            )}
        </span>
    );
};

/**
 * Client-side helper to check if any word in text starts with any token in query
 */
export const matchesWordPrefix = (text, query) => {
    if (!text || !query) return false;
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return false;
    const words = text.toLowerCase().split(/[^a-zA-Z0-9_]+/).filter(Boolean);

    return tokens.every((token) => words.some((word) => word.startsWith(token)));
};

function SearchBar({
    placeholder = "Search courses by title, topic, or tags...",
    className = "",
    inputClassName = "",
    onSelect,
    onSearch,
    autoFocus = false,
    maxResults = 5,
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const resultsContainerRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced prefix search against backend (250ms delay)
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 1) {
            setResults([]);
            setIsOpen(false);
            setSelectedIndex(-1);
            return;
        }

        const controller = new AbortController();
        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/course/search?q=${encodeURIComponent(trimmed)}&limit=${maxResults}`, {
                    signal: controller.signal,
                });

                // Defensively handle response formats
                let courseData = [];
                if (Array.isArray(res.data)) {
                    courseData = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    courseData = res.data.data;
                } else if (res.data && Array.isArray(res.data.results)) {
                    courseData = res.data.results;
                }

                setResults(courseData.slice(0, maxResults));
                setIsOpen(true);
                setSelectedIndex(-1);
            } catch (err) {
                if (err.name !== "CanceledError" && err.name !== "AbortError") {
                    console.error("Search fetch error:", err);
                }
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [query, maxResults]);

    // Handle course selection
    const handleSelectCourse = (courseId) => {
        setIsOpen(false);
        setSelectedIndex(-1);
        setQuery("");
        if (onSelect) {
            onSelect(courseId);
        } else {
            navigate(`/course/${courseId}`);
        }
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        setIsOpen(false);
        setSelectedIndex(-1);

        if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelectCourse(results[selectedIndex]._id);
            return;
        }

        if (onSearch) {
            onSearch(trimmed);
        } else {
            navigate(`/course-showcase?search=${encodeURIComponent(trimmed)}`);
        }
    };

    // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
    const handleKeyDown = (e) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            if (query.trim().length >= 1) {
                setIsOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : -1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleSelectCourse(results[selectedIndex]._id);
            } else {
                handleSearchSubmit();
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setSelectedIndex(-1);
            inputRef.current?.blur();
        }
    };

    // Clear search input
    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const getThumbnailUrl = (thumb) => {
        if (!thumb) return null;
        if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
        const clean = thumb.replace(/\\/g, "/");
        return `http://localhost:3000/${clean.startsWith("/") ? clean.slice(1) : clean}`;
    };

    const getDifficultyBadge = (difficulty) => {
        const diff = (difficulty || "").toLowerCase();
        if (diff === "beginner") return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
        if (diff === "intermediate") return "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
        if (diff === "advanced") return "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    };

    return (
        <div ref={searchRef} className={`relative w-full ${className}`}>
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative group flex items-center">
                {/* Search Icon */}
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Search size={18} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 1 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`w-full bg-brand-surface text-brand-text placeholder-brand-subtle border border-brand-border rounded-lg py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all shadow-sm ${inputClassName}`}
                />

                {/* Right controls: Loader and Clear Button */}
                <div className="absolute right-3 flex items-center gap-1.5">
                    {isLoading && (
                        <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
                    )}
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            title="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </form>

            {/* Autocomplete Dropdown List */}
            {isOpen && query.trim().length >= 1 && (
                <div
                    ref={resultsContainerRef}
                    className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-150"
                >
                    {results.length > 0 ? (
                        <div>
                            {/* Header */}
                            <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <Sparkles size={13} className="text-blue-500" />
                                    <span>Top Matches</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                    {results.length} found (prefix match)
                                </span>
                            </div>

                            {/* List of matches */}
                            <div className="py-1 max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                {results.map((course, index) => {
                                    const isSelected = selectedIndex === index;
                                    const thumbUrl = getThumbnailUrl(course.thumbnail);

                                    return (
                                        <button
                                            key={course._id || index}
                                            type="button"
                                            onClick={() => handleSelectCourse(course._id)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors group ${
                                                isSelected
                                                    ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                                            }`}
                                        >
                                            {/* Course Thumbnail */}
                                            <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
                                                {thumbUrl ? (
                                                    <img
                                                        src={thumbUrl}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <BookOpen size={20} className="text-slate-400" />
                                                )}
                                            </div>

                                            {/* Course Details */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {highlightWordPrefix(course.title, query)}
                                                    </h4>
                                                    {course.price !== undefined && (
                                                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                                                            {Number(course.price) === 0 ? "Free" : `$${course.price}`}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Description snippet */}
                                                {course.description && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                        {course.description}
                                                    </p>
                                                )}

                                                {/* Badges & Tags */}
                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                    {course.difficulty && (
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getDifficultyBadge(
                                                                course.difficulty
                                                            )}`}
                                                        >
                                                            {course.difficulty}
                                                        </span>
                                                    )}

                                                    {Array.isArray(course.tags) &&
                                                        course.tags.slice(0, 3).map((tag, tIdx) => (
                                                            <span
                                                                key={tIdx}
                                                                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
                                                            >
                                                                <Tag size={10} className="text-slate-400" />
                                                                {highlightWordPrefix(tag, query)}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>

                                            {/* Navigate arrow indicator */}
                                            <div className="flex items-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 self-center">
                                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dropdown Footer */}
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                                <span className="hidden sm:inline text-[11px] text-slate-400">
                                    Use <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 border rounded text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 border rounded text-[10px]">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 border rounded text-[10px]">Enter</kbd> to open
                                </span>
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-auto"
                                >
                                    <span>View all results for "{query}"</span>
                                    <ArrowRight size={13} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        !isLoading && (
                            <div className="p-6 text-center">
                                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Search size={18} />
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    No courses found matching "{query}"
                                </p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                    Try matching the start of a title (e.g., "Rea" for React, "Pyt" for Python) or search tags.
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;