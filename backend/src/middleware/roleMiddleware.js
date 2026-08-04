export const requireRole =
  (...roles) =>
    (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403);
        return next(new Error(`Access denied. Requires role: ${roles.join(' or ')}`));
      }
      next();
    };
