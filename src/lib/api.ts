import axios, { AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { toast } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    api.post('/auth/login', data),
  
  register: (data: { email: string; password: string; username?: string; referral_code?: string }) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  me: () =>
    api.get('/auth/me'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
}

// Plans API
export const plansApi = {
  getAll: () =>
    api.get('/plans'),
  
  getById: (id: number) =>
    api.get(`/plans/${id}`),
  
  create: (data: any) =>
    api.post('/admin/plans', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/plans/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/plans/${id}`),
}

// Orders API
export const ordersApi = {
  create: (data: { plan_id: number; payment_method: string }) =>
    api.post('/orders', data),
  
  getById: (id: number) =>
    api.get(`/orders/${id}`),
  
  getOrder: (id: number) =>
    api.get(`/orders/${id}`),
  
  pay: (id: number) =>
    api.post(`/orders/${id}/pay`),
  
  getUserOrders: (params?: any) =>
    api.get('/user/orders', { params }),
  
  getAll: (params?: any) =>
    api.get('/admin/orders', { params }),
  
  updateStatus: (id: number, status: number) =>
    api.put(`/admin/orders/${id}/status`, { status }),
}

// Payment API
export const paymentApi = {
  createPayment: (data: any) => api.post('/payments', data),
  getPaymentStatus: (id: string) => api.get(`/payments/${id}/status`),
}

// Servers API
export const serversApi = {
  getAll: () =>
    api.get('/servers'),
  
  getUserServers: () =>
    api.get('/user/servers'),
  
  create: (data: any) =>
    api.post('/admin/servers', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/servers/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/servers/${id}`),
  
  testConnection: (id: number) =>
    api.post(`/admin/servers/${id}/test`),
}

// Users API
export const usersApi = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data: any) =>
    api.put('/user/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/user/password', data),
  
  getSubscription: () =>
    api.get('/user/subscription'),
  
  getStats: () =>
    api.get('/user/stats'),
  
  // Admin endpoints
  getAll: (params?: any) =>
    api.get('/admin/users', { params }),
  
  getById: (id: number) =>
    api.get(`/admin/users/${id}`),
  
  update: (id: number, data: any) =>
    api.put(`/admin/users/${id}`, data),
  
  updateStatus: (id: number, status: number) =>
    api.put(`/admin/users/${id}/status`, { status }),
  
  resetTraffic: (id: number) =>
    api.post(`/admin/users/${id}/reset-traffic`),
}

// Redemption API
export const redemptionApi = {
  redeem: (data: { code: string; email?: string }) =>
    api.post('/redeem', data),
  
  generate: (data: { plan_id: number; count: number; expires_at?: string; batch_id?: string }) =>
    api.post('/admin/redemption-codes/generate', data),
  
  getAll: (params?: any) =>
    api.get('/admin/redemption-codes', { params }),
  
  delete: (id: number) =>
    api.delete(`/admin/redemption-codes/${id}`),
  
  batchDelete: (ids: number[]) =>
    api.post('/admin/redemption-codes/batch-delete', { ids }),
}

// Referral API
export const referralApi = {
  getStats: () =>
    api.get('/user/referral/stats'),
  
  getCommissions: (params?: any) =>
    api.get('/user/referral/commissions', { params }),
  
  getReferrals: (params?: any) =>
    api.get('/user/referral/referrals', { params }),
  
  withdraw: (amount: number) =>
    api.post('/user/referral/withdraw', { amount }),
  
  // Admin endpoints
  getAllCommissions: (params?: any) =>
    api.get('/admin/referrals/commissions', { params }),
  
  settleCommission: (id: number) =>
    api.post(`/admin/referrals/commissions/${id}/settle`),
  
  getSettings: () =>
    api.get('/admin/referrals/settings'),
  
  updateSettings: (data: any) =>
    api.put('/admin/referrals/settings', data),
}

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    api.get('/admin/dashboard/stats'),
  
  getChartData: (type: string, period: string) =>
    api.get(`/admin/dashboard/chart/${type}`, { params: { period } }),
  
  getRecentActivity: () =>
    api.get('/admin/dashboard/activity'),
}

// Announcements API
export const announcementsApi = {
  getAll: () =>
    api.get('/announcements'),
  
  create: (data: any) =>
    api.post('/admin/announcements', data),
  
  update: (id: number, data: any) =>
    api.put(`/admin/announcements/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/admin/announcements/${id}`),
}

// Settings API
export const settingsApi = {
  getAll: () =>
    api.get('/admin/settings'),
  
  update: (key: string, value: string) =>
    api.put('/admin/settings', { key, value }),
  
  batchUpdate: (settings: Record<string, string>) =>
    api.put('/admin/settings/batch', { settings }),
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
}