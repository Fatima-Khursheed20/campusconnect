const { put } = require("@vercel/blob");

/**
 * @param {string} pathname - Blob path, e.g. profile-pictures/userId-123.jpg
 * @param {Buffer} buffer
 * @param {{ contentType?: string }} [opts]
 */
async function putPublicFile(pathname, buffer, opts = {}) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !String(token).trim()) {
    const err = new Error(
      "BLOB_READ_WRITE_TOKEN is missing. On Vercel: open your project → Storage → Blob, create or link a store, and add BLOB_READ_WRITE_TOKEN to Environment Variables, then redeploy."
    );
    err.code = "NO_BLOB_TOKEN";
    throw err;
  }
  return put(pathname, buffer, {
    access: "public",
    token: String(token).trim(),
    contentType: opts.contentType,
  });
}

module.exports = { putPublicFile };
