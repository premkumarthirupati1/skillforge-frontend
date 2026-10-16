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
