import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  CreditCard, 
  Smartphone, 
  QrCode,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { ordersApi, paymentApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await ordersApi.getOrder(parseInt(orderId!))
      return response.data.data
    },
    enabled: !!orderId,
  })

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await paymentApi.getPaymentMethods()
      return response.data.data
    },
  })

  const paymentMutation = useMutation({
    mutationFn: async (method: string) => {
      // Simulate payment process
      setPaymentStatus('processing')
      
      // In real implementation, this would redirect to payment gateway
      // For demo purposes, we'll simulate success after 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulate payment callback
      const response = await paymentApi.processPayment({
        order_no: order.order_no,
        payment_method: method,
        status: 'success',
        transaction_id: `txn_${Date.now()}`,
      })
      
      return response.data
    },
    onSuccess: () => {
      setPaymentStatus('success')
      toast.success('支付成功！')
      setTimeout(() => {
        navigate('/user/orders')
      }, 2000)
    },
    onError: () => {
      setPaymentStatus('failed')
      toast.error('支付失败，请重试')
    },
  })

  const handlePayment = () => {
    if (!selectedMethod) {
      toast.error('请选择支付方式')
      return
    }
    paymentMutation.mutate(selectedMethod)
  }

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">订单不存在</h2>
            <p className="text-gray-600 mb-6">请检查订单号是否正确</p>
            <Button onClick={() => navigate('/plans')}>
              返回套餐页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (order.status !== 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">订单已支付</h2>
            <p className="text-gray-600 mb-6">该订单已经完成支付</p>
            <Button onClick={() => navigate('/user/orders')}>
              查看订单
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">订单支付</h1>
          <p className="text-gray-600">请选择支付方式完成订单</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>选择支付方式</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStatus === 'processing' ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="text-lg font-medium text-gray-900 mt-4">正在处理支付...</p>
                    <p className="text-gray-600">请不要关闭页面</p>
                  </div>
                ) : paymentStatus === 'success' ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">支付成功！</p>
                    <p className="text-gray-600">正在跳转到订单页面...</p>
                  </div>
                ) : paymentStatus === 'failed' ? (
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">支付失败</p>
                    <p className="text-gray-600 mb-6">请重新选择支付方式</p>
                    <Button onClick={() => setPaymentStatus('pending')}>
                      重新支付
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods?.map((method: any) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            {method.id === 'alipay' && <Smartphone className="w-5 h-5 text-blue-600" />}
                            {method.id === 'wechat' && <QrCode className="w-5 h-5 text-green-600" />}
                            {method.id === 'stripe' && <CreditCard className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{method.name}</p>
                            {!method.enabled && (
                              <p className="text-sm text-gray-500">暂不可用</p>
                            )}
                          </div>
                          <div className="w-5 h-5">
                            {selectedMethod === method.id && (
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-6">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handlePayment}
                        disabled={!selectedMethod || paymentMutation.isPending}
                        loading={paymentMutation.isPending}
                      >
                        确认支付 {formatCurrency(order.final_amount)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">订单号</p>
                  <p className="font-mono text-sm">{order.order_no}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">套餐名称</p>
                  <p className="font-medium">{order.plan_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">创建时间</p>
                  <p className="text-sm">{formatDate(order.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">状态</p>
                  <Badge variant="warning">
                    <Clock className="w-3 h-3 mr-1" />
                    待支付
                  </Badge>
                </div>

                <hr />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">套餐价格</span>
                    <span>{formatCurrency(order.amount)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>优惠金额</span>
                      <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>实付金额</span>
                    <span className="text-primary-600">
                      {formatCurrency(order.final_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">安全保障</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 支付信息采用SSL加密传输</li>
                      <li>• 支持主流支付方式</li>
                      <li>• 7天无理由退款</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}