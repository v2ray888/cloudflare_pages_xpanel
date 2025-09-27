import api from '../api'

export const withdrawalApi = {
  // Submit withdrawal request
  submitWithdrawal: (data: {
    amount: number
    payment_method: string
    payment_account: string
    real_name: string
  }) => api.post('/api/withdrawals', data),

  // Get user's withdrawal history
  getWithdrawals: (params?: { page?: number; limit?: number }) =>
    api.get('/api/withdrawals', { params }),
}

export const financeApi = {
  // Get finance stats (admin)
  getStats: () => api.get('/api/admin/finance/stats'),

  // Get all withdrawal requests (admin)
  getWithdrawals: (params?: { page?: number; limit?: number; status?: number }) =>
    api.get('/api/withdrawals/admin', { params }),

  // Process withdrawal request (admin)
  processWithdrawal: (id: number, data: { status: number; admin_note?: string }) =>
    api.put(`/api/withdrawals/admin/${id}`, data),
}