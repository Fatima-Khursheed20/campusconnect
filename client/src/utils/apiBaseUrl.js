/**
 * Axios baseURL and upload host must include the `/api` path prefix (see server: app.use("/api", ...)).
 * Accepts either `https://host` or `https://host/api` (trailing slashes OK).
 */
export function normalizeApiBaseUrl(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const noTrail = s.replace(/\/+$/, "");
  if (/\/api$/i.test(noTrail)) return noTrail;
  return `${noTrail}/api`;
}

export function getConfiguredApiBaseUrl() {
  const raw =
    import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || "";
  return normalizeApiBaseUrl(raw);
}
