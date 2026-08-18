import { ApiError } from '../utils/ApiError.js';

/**
 * Restrict route access to specific role names.
 * Usage: router.post('/', authenticate, authorizeRoles('super_admin', 'operations_manager'), handler)
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const roleName = req.user?.Role?.name;
  if (!roleName || !allowedRoles.includes(roleName)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }
  next();
};

/**
 * Restrict route access based on fine-grained permission strings stored on the Role,
 * e.g. "air:write", "billing:*". Supports wildcard module permissions.
 * Usage: router.post('/', authenticate, authorizePermissions('billing:write'), handler)
 */
export const authorizePermissions = (...requiredPermissions) => (req, res, next) => {
  const rolePermissions = req.user?.Role?.permissions || [];

  if (rolePermissions.includes('*:*') || rolePermissions.includes('*')) {
    return next(); // super admin wildcard
  }

  const hasPermission = requiredPermissions.some((perm) => {
    const [module] = perm.split(':');
    return rolePermissions.includes(perm) || rolePermissions.includes(`${module}:*`);
  });

  if (!hasPermission) {
    return next(new ApiError(403, 'You do not have the required permission for this action.'));
  }
  next();
};
