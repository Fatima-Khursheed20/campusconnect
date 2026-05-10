const envTruthy = (v) => /^(1|true|yes)$/i.test(String(v ?? "").trim());

/** Vercel serverless has a read-only filesystem under /var/task; use memory + Blob instead of disk. */
function usesServerlessFileStorage() {
  return (
    envTruthy(process.env.VERCEL) ||
    Boolean(String(process.env.VERCEL_URL || "").trim())
  );
}

module.exports = { usesServerlessFileStorage };
