const { put } = require("@vercel/blob");

/** Vercel dashboard uses BLOB_READ_WRITE_TOKEN; keep one optional alias for manual setups */
function getReadWriteToken() {
  const raw =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    "";
  return String(raw).trim() || null;
}

/** Blob pathnames must not contain certain characters; keep segments URL-safe */
function toBlobPathname(relPath) {
  const noLead = String(relPath || "").replace(/^\/+/, "");
  return noLead
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.replace(/[^a-zA-Z0-9._-]/g, "_"))
    .join("/");
}

/**
 * @param {string} pathname - Blob path, e.g. profile-pictures/userId-123.jpg
 * @param {Buffer} buffer
 * @param {{ contentType?: string }} [opts]
 */
async function putPublicFile(pathname, buffer, opts = {}) {
  const safe = toBlobPathname(pathname);
  if (!safe) {
    const err = new Error("Invalid upload path");
    err.code = "BLOB_BAD_PATH";
    throw err;
  }

  const token = getReadWriteToken();
  if (!token) {
    const err = new Error(
      "BLOB_READ_WRITE_TOKEN is missing. On Vercel: Project → Storage → Blob → connect a store to this project (deploy once so the token is injected), or add BLOB_READ_WRITE_TOKEN under Settings → Environment Variables."
    );
    err.code = "NO_BLOB_TOKEN";
    throw err;
  }

  try {
    const result = await put(safe, buffer, {
      access: "public",
      token,
      contentType: opts.contentType,
    });
    if (!result?.url) {
      const err = new Error("Blob upload returned no URL");
      err.code = "BLOB_NO_URL";
      throw err;
    }
    return result;
  } catch (e) {
    if (e.code === "NO_BLOB_TOKEN" || e.code === "BLOB_BAD_PATH") throw e;
    e.code = e.code || "BLOB_UPLOAD_FAILED";
    throw e;
  }
}

module.exports = { putPublicFile, getReadWriteToken, toBlobPathname };
