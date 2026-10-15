/**
 * Extracts duration in seconds and rounded minutes from an HTML5 video File object.
 * Reads the video timeline metadata directly in the browser without uploading.
 * 
 * @param {File} file - Video file (mp4, webm, mov, etc.)
 * @returns {Promise<{ minutes: number, seconds: number, formatted: string }>}
 */
export const extractVideoDuration = (file) => {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith("video/")) {
            return resolve({ minutes: 5, seconds: 300, formatted: "5:00" });
        }

        try {
            const video = document.createElement("video");
            video.preload = "metadata";
            const objectUrl = URL.createObjectURL(file);
            video.src = objectUrl;

            video.onloadedmetadata = () => {
                URL.revokeObjectURL(objectUrl);
                const rawSeconds = video.duration;

                if (!rawSeconds || isNaN(rawSeconds) || !isFinite(rawSeconds)) {
                    return resolve({ minutes: 5, seconds: 300, formatted: "5:00" });
                }

                const totalSeconds = Math.round(rawSeconds);
                const minutes = Math.max(1, Math.round(totalSeconds / 60));
                
                const m = Math.floor(totalSeconds / 60);
                const s = totalSeconds % 60;
                const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;

                resolve({
                    minutes,
                    seconds: totalSeconds,
                    formatted
                });
            };

            video.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({ minutes: 5, seconds: 300, formatted: "5:00" });
            };
        } catch (err) {
            resolve({ minutes: 5, seconds: 300, formatted: "5:00" });
        }
    });
};
