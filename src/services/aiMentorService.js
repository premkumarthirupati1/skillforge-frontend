import api from "../api";

/**
 * SkillForge AI Coding Mentor Service (Frontend Client)
 * 
 * Communicates with /api/runner/ai-assist to fetch graduated hints,
 * bug diagnoses, and contextual code patterns for failing tests.
 */

export async function fetchAiMentorAdvice({
    projectId = "general",
    projectTitle = "Engineering Workspace",
    language = "javascript",
    milestoneIndex = 0,
    milestoneTitle = "Milestone 1",
    milestoneObjective = "",
    specRules = [],
    testCases = [],
    allFiles = [],
    activeFileName = "main.rs",
    userCode = "",
    testResults = null,
    userQuery = "",
    hintLevel = 1
}) {
    try {
        const payload = {
            projectId,
            projectTitle,
            language,
            milestoneIndex,
            milestoneTitle,
            milestoneObjective,
            specRules,
            testCases,
            allFiles,
            activeFileName,
            userCode,
            testResults,
            userQuery,
            hintLevel
        };

        const res = await api.post("/api/runner/ai-assist", payload);
        if (res.data?.success && res.data?.data) {
            return res.data.data;
        }
        return res.data;
    } catch (err) {
        console.warn("AI Mentor backend unavailable, using client-side heuristic diagnosis:", err);
        return getClientSideHeuristicFallback({
            projectId,
            milestoneIndex,
            milestoneTitle,
            milestoneObjective,
            specRules,
            testCases,
            userCode,
            testResults,
            userQuery,
            hintLevel
        });
    }
}

/**
 * Client-Side Heuristic Fallback in case backend is offline
 */
function getClientSideHeuristicFallback({
    projectId,
    milestoneIndex = 0,
    milestoneTitle = "Milestone 1",
    milestoneObjective = "",
    specRules = [],
    testCases = [],
    userCode = "",
    testResults,
    userQuery = "",
    hintLevel = 1
}) {
    const code = userCode.trim();
    const failedStep = testResults?.steps?.find(s => !s.passed);
    const testName = failedStep?.name || "Milestone Tests";
    const testOutput = failedStep?.output || "Assertion requirement not met.";
    const query = (userQuery || "").toLowerCase();

    // Check for TODO in code
    const lines = (userCode || "").split("\n");
    const todoLineIdx = lines.findIndex(l => /TODO/i.test(l));
    const detectedLine = todoLineIdx !== -1 ? todoLineIdx + 1 : null;

    // Helper to generate Mermaid SVG URL
    const getMermaidInkUrl = (mermaidCode) => {
        try {
            const payload = { code: mermaidCode.trim(), mermaid: { theme: "dark" } };
            const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
            return `https://mermaid.ink/svg/${b64}`;
        } catch (e) {
            return "";
        }
    };

    // Query intent: architecture & diagrams
    const isArch = /(architecture|system design|topology|diagram|flowchart|data flow|components|how it works|high level design|hld|low level design|lld|visual|image|structure)/i.test(query);
    if (isArch) {
        const defaultMermaid = `graph TD
    Client[Client Sockets / HTTP] --> Listener[TCP / WebSocket Listener]
    Listener --> Parser[Protocol Framing & Command Parser]
    Parser --> Dispatcher[Execution & State Engine]
    Dispatcher --> Store[(Thread-Safe In-Memory Store)]
    Store --> Worker[Active Eviction & Worker Pool]
    Dispatcher --> Serializer[Protocol Serializer]
    Serializer --> Client`;

        const imgUrl = getMermaidInkUrl(defaultMermaid);

        return {
            diagnosis: `Staff Architecture Blueprint: ${milestoneTitle}`,
            level: hintLevel,
            targetLine: null,
            hint: `High-level system topology and component architecture for **${milestoneTitle}**.\n\n### 📐 Visual Architecture Diagram\n![${milestoneTitle} Architecture Diagram](${imgUrl})\n\n\`\`\`mermaid\n${defaultMermaid}\n\`\`\`\n\n### Core System Planes\n- **I/O & Ingestion Plane**: Non-blocking event loop accepting incoming client connections.\n- **Protocol Plane**: Delimiter framing, binary parser, and error isolation boundary.\n- **Execution & Storage**: Thread-safe state maps protected by mutex concurrency primitives.\n- **Eviction & Recovery**: Active background TTL worker and disk persistence serializer.`,
            codePattern: "// Core architectural engine pattern\npub trait SystemEngine {\n    fn execute(&mut self, cmd: &str) -> Result<String, SystemError>;\n}",
            quickPrompts: [
                "How do components communicate?",
                "What concurrency primitives are used?",
                "Explain the data flow pipeline"
            ],
            modelUsed: "Forge Client Heuristics (Offline)",
            isLiveAI: false
        };
    }

    // Query intent: edge cases
    if (query.includes("edge case") || query.includes("cases")) {
        return {
            diagnosis: `Edge Cases for Milestone ${milestoneIndex + 1}: ${milestoneTitle}`,
            level: hintLevel,
            targetLine: null,
            hint: "Crucial edge cases:\n1. Empty payloads and malformed delimiters\n2. Concurrency race conditions on shared state\n3. Out of bounds indexing and buffer framing\n4. Error recovery rather than panics.",
            codePattern: "",
            quickPrompts: ["Why did my test fail?", "Give me a subtle hint", "Show code pattern"],
            modelUsed: "Forge Client Heuristics (Offline)",
            isLiveAI: false
        };
    }

    // Query intent: hint
    if (query.includes("hint") || query.includes("nudge")) {
        return {
            diagnosis: `Architectural Nudge for ${milestoneTitle}`,
            level: 1,
            targetLine: detectedLine,
            hint: milestoneObjective || "Review the production spec rules on the left panel to ensure all required contracts and invariants are met.",
            codePattern: "",
            quickPrompts: ["Pinpoint the bug", "Show code pattern", "Why did my test fail?"],
            modelUsed: "Forge Client Heuristics (Offline)",
            isLiveAI: false
        };
    }

    return {
        diagnosis: failedStep 
            ? `Assertion Failed in '${testName}': ${testOutput}` 
            : `Specification check for Milestone ${milestoneIndex + 1}: ${milestoneTitle}`,
        level: hintLevel,
        targetLine: detectedLine,
        hint: hintLevel === 1
            ? (milestoneObjective || "Review the milestone specification in the Spec Guide tab to satisfy the required assertions.")
            : hintLevel === 2
            ? `Check assertion '${testName}' in the test drawer. The runner expects conforming output rather than starter stub values.`
            : "Implement concrete data structures and return values that satisfy the unit assertions.",
        codePattern: "",
        quickPrompts: [
            "Why did my test fail?",
            "Give me a subtle hint",
            "Check my code for edge cases"
        ],
        modelUsed: "Forge Client Heuristics (Offline)",
        isLiveAI: false
    };
}
