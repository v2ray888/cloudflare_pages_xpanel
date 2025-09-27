import api from '../api'

export const paymentApi = {
  // Get payment methods
  getPaymentMethods: () => api.get('/api/payments/methods'),

  // Process payment (demo)
  processPayment: (data: {
    order_no: string
    payment_method: string
    status: string
    transaction_id: string
  }) => api.post('/api/payments/callback', data),

  // Get order for payment
  getOrderForPayment: (orderId: number) => api.get(`/api/orders/${orderId}`),
}