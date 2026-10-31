import api from "../api";

export const DEFAULT_EDITOR_SETTINGS = {
    theme: "skillforge-dark",
    fontSize: 13.5,
    fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    tabSize: 4,
    wordWrap: "on",
    minimap: true,
    lineNumbers: "on"
};

export const DEFAULT_AI_SETTINGS = {
    copilotAutoSuggest: true,
    socraticMode: true,
    verbosity: "balanced"
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
    emailAnnouncements: true,
    milestoneCompletions: true,
    trackReleases: true,
    securityAdvisories: true
};

export const DEFAULT_PRIVACY_SETTINGS = {
    publicProfile: true,
    showProgress: true,
    showBadges: true
};

/**
 * Fetch all user settings
 */
export async function getSettings() {
    const res = await api.get("/user/settings");
    if (res.data?.success && res.data.settings) {
        // Cache editor settings locally for fast workspace loading
        try {
            localStorage.setItem("skillforge_editor_settings", JSON.stringify(res.data.settings.editor));
        } catch (e) {
            console.warn("Could not cache editor settings to localStorage", e);
        }
        return res.data.settings;
    }
    return {
        editor: DEFAULT_EDITOR_SETTINGS,
        ai: DEFAULT_AI_SETTINGS,
        notifications: DEFAULT_NOTIFICATION_SETTINGS,
        privacy: DEFAULT_PRIVACY_SETTINGS
    };
}

/**
 * Update user settings
 */
export async function saveSettings(settingsPayload) {
    const res = await api.put("/user/settings", settingsPayload);
    if (res.data?.success && res.data.settings) {
        try {
            localStorage.setItem("skillforge_editor_settings", JSON.stringify(res.data.settings.editor));
            window.dispatchEvent(new CustomEvent("skillforge_editor_settings_changed", {
                detail: res.data.settings.editor
            }));
        } catch (e) {
            console.warn("Could not update local editor settings", e);
        }
        return res.data.settings;
    }
    return res.data;
}

/**
 * Trigger GDPR JSON Data Export
 */
export async function exportUserData(username = "developer") {
    const res = await api.get("/user/settings/export", { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skillforge-data-export-${username}-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
}

/**
 * Permanently delete user account
 */
export async function deleteAccount(password) {
    const res = await api.delete("/user/settings/account", {
        data: { password }
    });
    return res.data;
}
