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
    hintLevel = 1,
    isAgent = false
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
            hintLevel,
            isAgent
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
            hintLevel,
            isAgent
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
    hintLevel = 1,
    isAgent = false
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

    // Query intent: why did test fail?
    if (query.includes("why") && (query.includes("fail") || query.includes("test") || query.includes("error"))) {
        if (failedStep) {
            return {
                diagnosis: `Assertion Failed in '${testName}': ${testOutput}`,
                level: isAgent ? 3 : hintLevel,
                targetLine: detectedLine,
                hint: isAgent || hintLevel === 3
                    ? `Review assertion '${testName}' in the test drawer. Ensure your implementation exports the required signatures and handles edge cases.`
                    : hintLevel === 2
                    ? `Check assertion '${testName}'. The runner received an unexpected response: ${testOutput}. Inspect line ${detectedLine || 'in your active file'}.`
                    : (milestoneObjective || `The test harness expects milestone requirements to be met. Check test output in the runner.`),
                codePattern: isAgent || hintLevel === 3 ? "// Implement required return data structure\n" : "",
                quickPrompts: ["Give me a subtle hint", "Check my code for edge cases", "Explain milestone architecture"],
                modelUsed: isAgent ? "Forge Client Heuristics (Agent Mode)" : "Forge Client Heuristics (Offline)",
                isLiveAI: false
            };
        } else {
            return {
                diagnosis: `No Failing Test Detected in Workspace Runner`,
                level: hintLevel,
                targetLine: null,
                hint: `There are currently no failing test results in your runner for Milestone ${milestoneIndex + 1} (${milestoneTitle}).\n\nTo diagnose a test failure:\n1. Click the **Run Tests** button in the bottom drawer to execute the automated verification suite.\n2. If a specific assertion fails, Copilot will automatically analyze the failure trace, pinpoint the problematic line, and explain why it failed.\n\nIf you have a question about implementing this milestone, ask me how to structure the logic or request an architecture blueprint!`,
                codePattern: "",
                quickPrompts: ["What edge cases exist?", "Explain milestone architecture", "Show code pattern"],
                modelUsed: "Forge Client Heuristics (Offline)",
                isLiveAI: false
            };
        }
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
