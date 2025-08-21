export const USER_ROLES = {
  HOMEOWNER: 'homeowner',
  CONTRACTOR: 'contractor',
  ADMIN: 'admin',
  SUPPORT: 'support'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);
