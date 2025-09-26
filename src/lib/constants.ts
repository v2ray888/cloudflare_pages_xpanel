export const APP_NAME = 'XPanel'
export const APP_DESCRIPTION = '专业的VPN销售管理系统'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export const ROUTES = {
  HOME: '/',
  PLANS: '/plans',
  LOGIN: '/login',
  REGISTER: '/register',
  REDEEM: '/redeem',
  USER_DASHBOARD: '/user/dashboard',
  USER_SUBSCRIPTION: '/user/subscription',
  USER_SERVERS: '/user/servers',
  USER_ORDERS: '/user/orders',
  USER_REFERRAL: '/user/referral',
  USER_PROFILE: '/user/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PAYMENT: '/payment',
} as const

export const ORDER_STATUS = {
  PENDING: 0,
  PAID: 1,
  CANCELLED: 2,
  REFUNDED: 3,
} as const

export const USER_STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
} as const

export const USER_ROLE = {
  USER: 0,
  ADMIN: 1,
} as const

export const SUBSCRIPTION_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  EXPIRED: 2,
} as const

export const REDEMPTION_CODE_STATUS = {
  UNUSED: 0,
  USED: 1,
} as const

export const SERVER_STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
  MAINTENANCE: 2,
} as const

export const COMMISSION_STATUS = {
  PENDING: 0,
  SETTLED: 1,
  WITHDRAWN: 2,
} as const