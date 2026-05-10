const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify CSRF token
const verifyCSRFToken = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const cookieToken = req.cookies?.['_csrf'];

  if (!token || !cookieToken) {
    return res.status(403).json({ 
      message: 'CSRF token missing',
      code: 'EBADCSRFTOKEN'
    });
  }

  if (token !== cookieToken) {
    return res.status(403).json({ 
      message: 'Invalid CSRF token',
      code: 'EBADCSRFTOKEN'
    });
  }

  next();
};

/**
 * Single handler for GET /csrf-token: one token value for both Set-Cookie and JSON body.
 * Do not stack a second middleware that also generates a token — the incoming request
 * never carries the cookie yet, so two generators would emit mismatched cookies vs body.
 */
const getCsrfToken = (req, res) => {
  try {
    const token = req.cookies?.['_csrf'] || generateCSRFToken();

    if (!req.cookies?.['_csrf']) {
      res.cookie('_csrf', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    res.json({ csrfToken: token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate CSRF token' });
  }
};

// CSRF protection middleware (alias for verifyCSRFToken)
const csrfProtection = verifyCSRFToken;

module.exports = {
  csrfProtection,
  getCsrfToken,
};
