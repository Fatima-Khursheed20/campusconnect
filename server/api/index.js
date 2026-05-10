/**
 * Vercel routes all traffic here (see vercel.json rewrites).
 * Do not rely on static serving of ../index.js — that breaks /api/* and CORS.
 */
module.exports = require("../server.js");
