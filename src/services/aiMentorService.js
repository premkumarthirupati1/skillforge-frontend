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
            language,
            milestoneIndex,
            userCode,
            testResults,
            hintLevel
        });
    }
}

/**
 * Client-Side Heuristic Fallback in case of network issue
 */
function getClientSideHeuristicFallback({
    projectId,
    language,
    milestoneIndex,
    userCode = "",
    testResults,
    hintLevel = 1
}) {
    const code = userCode.trim();
    const hasTodo = /TODO[:\s]+implement/i.test(code) || code.includes("# TODO") || code.includes("// TODO");
    const failedStep = testResults?.steps?.find(s => !s.passed);

    if (hasTodo) {
        return {
            diagnosis: "Incomplete Template: Code contains uncompleted TODO placeholder stubs.",
            level: hintLevel,
            targetLine: 1,
            hint: hintLevel === 1 
                ? "The test suite requires real logic instead of starter placeholder return values."
                : hintLevel === 2
                ? "Locate the TODO comments and replace them with the necessary algorithmic functions."
                : "Remove the placeholder return and write the required struct or function implementation.",
            codePattern: "// Replace with actual logic\nreturn { status: 'initialized', ready: true };",
            quickPrompts: [
                "What functions are required?",
                "How do I pass the first test?",
                "Show milestone constraints"
            ],
            modelUsed: "Forge Client Heuristics (Offline)",
            isLiveAI: false
        };
    }

    return {
        diagnosis: failedStep?.output 
            ? `Assertion Failed: ${failedStep.output}` 
            : `Tests failed for Milestone ${milestoneIndex + 1}.`,
        level: hintLevel,
        targetLine: 1,
        hint: hintLevel === 1
            ? "Review the Spec Guide rules on the left panel to ensure all required contracts and invariants are met."
            : hintLevel === 2
            ? `Check assertion '${failedStep?.name || "Test"}' in the test drawer. Review the expected format against your code's output.`
            : "Ensure input parameters are validated, error handling covers boundary conditions, and return types match.",
        codePattern: "",
        quickPrompts: [
            "Why did this test fail?",
            "Explain milestone objective",
            "Give me a subtle hint"
        ],
        modelUsed: "Forge Client Heuristics (Offline)",
        isLiveAI: false
    };
}
