/**
 * Turn a stored path like "/uploads/resumes/foo.pdf" into a full browser URL for the API host.
 */
export function resolveUploadUrl(storedPath) {
  if (!storedPath) {
    return "";
  }
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    return storedPath;
  }
  const pathPart = storedPath.startsWith("/") ? storedPath : `/${storedPath}`;
  // Dev + default api: Vite proxies /uploads to the API (see vite.config.js)
  if (import.meta.env.DEV && !(import.meta.env.VITE_API_URL || "").trim()) {
    return pathPart;
  }
  const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const base = rawBase.replace(/\/?api\/?$/i, "");
  return `${base}${pathPart}`;
}
