const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`Access Denied for user ${req.user.email} (Role: ${req.user.role}). Required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        message: `Forbidden: Access restricted to ${roles.join(' or ')} role(s)`,
      });
    }

    next();
  };
};

module.exports = { authorize };
