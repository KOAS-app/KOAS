import jwt from 'jsonwebtoken';

export const generateToken = (user, req = null) => {
  let expiresIn = process.env.JWT_EXPIRES_IN || '2h';

  // Make token expire in 90 days for mobile/PLAYER clients
  const isMobile = user.role === 'PLAYER' || 
    (req && req.headers && req.headers['user-agent'] && 
     /expo|react-native|okhttp|darwin|android/i.test(req.headers['user-agent']));

  if (isMobile) {
    expiresIn = '90d';
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};