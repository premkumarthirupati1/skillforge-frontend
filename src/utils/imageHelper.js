export const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${cleanPath}`;
};
