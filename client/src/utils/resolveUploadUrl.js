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
  const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const base = rawBase.replace(/\/?api\/?$/i, "");
  const pathPart = storedPath.startsWith("/") ? storedPath : `/${storedPath}`;
  return `${base}${pathPart}`;
}
