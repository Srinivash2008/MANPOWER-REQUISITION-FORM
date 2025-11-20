const adminAuthMiddleware = (req, res, next) => {
    // Check if req.user exists from the previous authMiddleware
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const adminRoles = ['Senior Manager', 'Senior Client Support Executive'];

    // Check if the user's position is one of the allowed admin roles
    if (adminRoles.includes(req.user.emp_pos)) {
        // If the user has an admin role, proceed to the next middleware or route handler
        next();
    } else {
        // If the user is not an admin, send a 403 Forbidden response
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
};

module.exports = adminAuthMiddleware;
