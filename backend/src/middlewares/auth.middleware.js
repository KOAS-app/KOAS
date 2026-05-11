import { verifyToken } from '../utils/jwt.js';

/**
 * Verifies the Bearer token and attaches the decoded payload to req.user.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Restricts access to the specified roles.
 * Must be used after authenticate.
 *
 * @param  {...string} roles - e.g. authorizeRoles('ADMIN', 'OWNER')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
