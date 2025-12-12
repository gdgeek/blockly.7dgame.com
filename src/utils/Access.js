// --- 1. 配置区域 (Config) ---

// 角色定义
export const ROLES = {
  ROOT: "root",
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  GUEST: "guest",
};

// 权限定义
export const ABILITIES = {};

// 权限配置表
export const ROLE_ABILITY = {
  [ROLES.GUEST]: [
    // 访客权限
  ],
  [ROLES.USER]: [
    // 普通用户权限
  ],
  [ROLES.MANAGER]: [
    // Manager 权限
  ],
  [ROLES.ADMIN]: [
    // Admin 拥有 Manager 的所有权限 + 高级权限
  ],
};

// --- 2. 逻辑区域 (Manager) ---

export class Access {
  constructor(userInfo) {
    this.userInfo = userInfo;
  }

  // 获取当前角色
  get role() {
    return this.userInfo?.role || ROLES.GUEST;
  }

  // 权限判断：能不能做某事？
  can(ability) {
    // Root 拥有无限权限
    if (this.role === ROLES.ROOT) return true;

    const list = ROLE_ABILITY[this.role] || [];
    return list.includes(ability);
  }

  // 身份判断：是不是某角色？
  is(role) {
    return this.role === role;
  }

  // 权重判断：是否包含某角色及以上
  atLeast(role) {
    const levels = [
      ROLES.GUEST,
      ROLES.USER,
      ROLES.MANAGER,
      ROLES.ADMIN,
      ROLES.ROOT,
    ];
    return levels.indexOf(this.role) >= levels.indexOf(role);
  }
}
