import axios, { AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { toast } from 'react-hot-toast'

// 使用生产环境URL作为默认值，同时支持开发环境
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname.endsWith('.pages.dev') 
    ? `https://${window.location.hostname}` 
    : 'https://xpanel.121858.xyz')

console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          toast.error('登录已过期，请重新登录')
          break
        case 403:
          toast.error('权限不足')
          break
        case 404:
          toast.error('请求的资源不存在')
          break
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).forEach((error: any) => {
              toast.error(error[0])
            })
          } else {
            toast.error(data.message || '请求参数错误')
          }
          break
        case 429:
          toast.error('请求过于频繁，请稍后再试')
          break
        case 500:
          toast.error('服务器内部错误')
          break
        default:
          toast.error(data.message || '请求失败')
      }
    } else if (error.request) {
      toast.error('网络连接失败，请检查网络设置')
    } else {
      toast.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  register: (data: { email: string; password: string; username?: string; referral_code?: string }) =>
    api.post('/api/auth/register', data),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  me: () =>
    api.get('/api/auth/me'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/api/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/api/auth/reset-password', data),
}

// Plans API
export const plansApi = {
  getAll: () =>
    api.get('/api/plans'),
  
  getById: (id: number) =>
    api.get(`/api/plans/${id}`),
  
  create: (data: any) =>
    api.post('/api/admin/plans', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/admin/plans/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/admin/plans/${id}`),
}

// Orders API
export const ordersApi = {
  create: (data: { plan_id: number; payment_method: string }) =>
    api.post('/api/orders', data),
  
  getById: (id: number) =>
    api.get(`/api/orders/${id}`),
  
  getOrder: (id: number) =>
    api.get(`/api/orders/${id}`),
  
  pay: (id: number) =>
    api.post(`/api/orders/${id}/pay`),
  
  getUserOrders: (params?: any) =>
    api.get('/api/user/orders', { params }),
  
  getAll: (params?: any) =>
    api.get('/api/admin/orders', { params }),
  
  updateStatus: (id: number, status: number) =>
    api.put(`/api/admin/orders/${id}/status`, { status }),
}

// Payment API
export const paymentApi = {
  createPayment: (data: any) => api.post('/api/payments', data),
  getPaymentStatus: (id: string) => api.get(`/api/payments/${id}/status`),
  getPaymentMethods: () => api.get('/api/payments/methods'),
  processPayment: (data: any) => api.post('/api/payments/process', data),
}

// Servers API
export const serversApi = {
  getAll: () =>
    api.get('/api/servers'),
  
  getUserServers: () =>
    api.get('/api/user/servers'),
  
  create: (data: any) =>
    api.post('/api/admin/servers', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/admin/servers/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/admin/servers/${id}`),
  
  testConnection: (id: number) =>
    api.post(`/api/admin/servers/${id}/test`),
}

// Users API
export const usersApi = {
  getProfile: () =>
    api.get('/api/user/profile'),
  
  updateProfile: (data: any) =>
    api.put('/api/user/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/api/user/password', data),
  
  getSubscription: () =>
    api.get('/api/user/subscription'),
  
  getStats: () =>
    api.get('/api/user/stats'),
  
  // Admin endpoints
  getAll: (params?: any) =>
    api.get('/api/admin/users', { params }),
  
  getById: (id: number) =>
    api.get(`/api/admin/users/${id}`),
  
  update: (id: number, data: any) =>
    api.put(`/api/admin/users/${id}`, data),
  
  updateStatus: (id: number, status: number) =>
    api.put(`/api/admin/users/${id}/status`, { status }),
  
  resetTraffic: (id: number) =>
    api.post(`/api/admin/users/${id}/reset-traffic`),
}

// Redemption API
export const redemptionApi = {
  redeem: (data: { code: string; email?: string }) =>
    api.post('/api/redemption/redeem', data),
  
  generate: (data: { plan_id: number; count: number; expires_at?: string; batch_id?: string }) =>
    api.post('/api/admin/redemption-codes/generate', data),
  
  getAll: (params?: any) =>
    api.get('/api/admin/redemption-codes', { params }),
  
  delete: (id: number) =>
    api.delete(`/api/admin/redemption-codes/${id}`),
  
  batchDelete: (ids: number[]) =>
    api.post('/api/admin/redemption-codes/batch-delete', { ids }),
}

// Referral API
export const referralApi = {
  getStats: () =>
    api.get('/api/user/referral/stats'),
  
  getCommissions: (params?: any) =>
    api.get('/api/user/referral/commissions', { params }),
  
  getReferrals: (params?: any) =>
    api.get('/api/user/referral/referrals', { params }),
  
  withdraw: (amount: number) =>
    api.post('/api/user/referral/withdraw', { amount }),
  
  // Admin endpoints
  getAllCommissions: (params?: any) =>
    api.get('/api/admin/referrals/commissions', { params }),
  
  settleCommission: (id: number) =>
    api.post(`/api/admin/referrals/commissions/${id}/settle`),
  
  getSettings: () =>
    api.get('/api/admin/referrals/settings'),
  
  updateSettings: (data: any) =>
    api.put('/api/admin/referrals/settings', data),
}

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    api.get('/api/admin/dashboard/stats'),
  
  getChartData: (type: string, period: string) =>
    api.get(`/api/admin/dashboard/chart/${type}`, { params: { period } }),
  
  getRecentActivity: () =>
    api.get('/api/admin/dashboard/activity'),
}

// Announcements API
export const announcementsApi = {
  getAll: () =>
    api.get('/api/announcements'),
  
  create: (data: any) =>
    api.post('/api/admin/announcements', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/admin/announcements/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/admin/announcements/${id}`),
}

// Settings API
export const settingsApi = {
  getAll: () =>
    api.get('/api/admin/settings'),
  
  update: (key: string, value: string) =>
    api.put('/api/admin/settings', { key, value }),
  
  batchUpdate: (settings: Record<string, string>) =>
    api.put('/api/admin/settings/batch', { settings }),
}

// Withdrawal API
export const withdrawalApi = {
  submitWithdrawal: (data: {
    amount: number
    payment_method: string
    payment_account: string
    real_name: string
  }) => api.post('/api/withdrawals', data),

  getWithdrawals: (params?: { page?: number; limit?: number }) =>
    api.get('/api/withdrawals', { params }),
}

// Finance API
export const financeApi = {
  getStats: () => api.get('/api/admin/finance/stats'),
  getWithdrawals: (params?: { page?: number; limit?: number; status?: number }) =>
    api.get('/api/withdrawals/admin', { params }),
  processWithdrawal: (id: number, data: { status: number; admin_note?: string }) =>
    api.put(`/api/withdrawals/admin/${id}`, data),
}

// Admin API (consolidated)
export const adminApi = {
  // Users
  getUsers: (params?: any) => usersApi.getAll(params),
  updateUserStatus: (id: number, status: number) => usersApi.updateStatus(id, status),
  
  // Plans
  getPlans: () => plansApi.getAll(),
  createPlan: (data: any) => plansApi.create(data),
  updatePlan: (id: number, data: any) => plansApi.update(id, data),
  deletePlan: (id: number) => plansApi.delete(id),
  
  // Servers
  getServers: () => serversApi.getAll(),
  createServer: (data: any) => serversApi.create(data),
  updateServer: (id: number, data: any) => serversApi.update(id, data),
  deleteServer: (id: number) => serversApi.delete(id),
  
  // Orders
  getOrders: (params?: any) => ordersApi.getAll(params),
  
  // Redeem Codes
  getRedeemCodes: (params?: any) => redemptionApi.getAll(params),
  createRedeemCodes: (data: any) => redemptionApi.generate(data),
  
  // Dashboard Stats
  getDashboardStats: () => dashboardApi.getStats(),
  getStats: () => dashboardApi.getStats(),
  getRecentOrders: () => api.get('/api/admin/orders/recent'),
  getRecentUsers: () => api.get('/api/admin/users/recent'),
}