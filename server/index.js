/**
 * Deployment entry (Vercel detects index.js / server.js with `module.exports = app`).
 * Local dev still uses: npm run dev → nodemon server.js
 */
module.exports = require("./server.js");
