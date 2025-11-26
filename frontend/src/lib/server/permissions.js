// src/lib/server/permissions.js

/**
 * Lucky Star Frontend / SSR RBAC Helper
 * ------------------------------------------------------------
 * 用于在 +page.server.js / +layout.server.js / actions 中
 * 对当前用户进行角色/权限检查。
 *
 * 注意：
 *  - SSR 阶段不做真正安全验证（安全在 Express 后端）
 *  - SSR 只基于 event.locals.authUser（由 hooks.server.js 提供）
 */


// ------------------------------------------------------
// 1) 获取当前用户（SSR）
// ------------------------------------------------------
export function getUser(event) {
    return event.locals?.authUser || null;
}


// ------------------------------------------------------
// 2) 要求已登录
// ------------------------------------------------------
export function requireLogin(event) {
    const user = getUser(event);
    if (!user) {
        throw failAuth("Not logged in");
    }
    return user;
}


// ------------------------------------------------------
// 3) 角色检查（admin / manager / sales）
// ------------------------------------------------------
export function requireRole(event, roles) {
    const user = requireLogin(event);

    if (!Array.isArray(roles)) roles = [roles];

    if (!user.role) {
        throw failAuth("User has no role assigned");
    }

    if (!roles.includes(user.role)) {
        throw failPermission(
            `Requires role: ${roles.join(", ")}`,
            { user_role: user.role }
        );
    }

    return user;
}


// ------------------------------------------------------
// 4) 权限节点检查（基于后端 permissions 表）
// ------------------------------------------------------
export function requirePermission(event, permission) {
    const user = requireLogin(event);

    if (!user.permissions) {
        throw failPermission("User has no permission list provided", {});
    }

    if (!user.permissions.includes(permission)) {
        throw failPermission(`Permission required: ${permission}`, {
            missing: permission
        });
    }

    return user;
}


// ------------------------------------------------------
// 5) 多权限（任意满足一个即可）
// ------------------------------------------------------
export function requireAnyPermission(event, permissionList = []) {
    const user = requireLogin(event);

    if (!Array.isArray(permissionList)) {
        permissionList = [permissionList];
    }

    if (!user.permissions) {
        throw failPermission("User has no permission list", {});
    }

    for (const p of permissionList) {
        if (user.permissions.includes(p)) {
            return user;    // OK
        }
    }

    throw failPermission(
        `Requires any of permissions: ${permissionList.join(", ")}`,
        { missing_any_of: permissionList }
    );
}


// ------------------------------------------------------
// 6) Staff-only
// ------------------------------------------------------
export function requireStaff(event) {
    const user = requireLogin(event);

    if (user.type !== "staff") {
        throw failPermission("Staff-only page", { user_type: user.type });
    }

    return user;
}


// ------------------------------------------------------
// 7) Admin-only
// ------------------------------------------------------
export function requireAdmin(event) {
    return requireRole(event, "admin");
}


// ------------------------------------------------------
// 8) 辅助错误
// ------------------------------------------------------
function failAuth(message) {
    const error = new Error(message);
    error.status = 401;
    return error;
}

function failPermission(message, info = {}) {
    const error = new Error(message);
    error.status = 403;
    error.detail = info;
    return error;
}

export const errors = {
    failAuth,
    failPermission
};
