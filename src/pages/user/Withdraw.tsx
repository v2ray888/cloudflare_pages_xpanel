import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  DollarSign, 
  CreditCard, 
  Smartphone,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { withdrawalApi, usersApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

const withdrawalSchema = z.object({
  amount: z.number().min(100, '最低提现金额为100元'),
  payment_method: z.enum(['alipay', 'wechat', 'bank'], { message: '请选择支付方式' }),
  payment_account: z.string().min(1, '支付账户不能为空'),
  real_name: z.string().min(1, '真实姓名不能为空'),
})

type WithdrawalForm = z.infer<typeof withdrawalSchema>

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState<'alipay' | 'wechat' | 'bank'>('alipay')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 获取用户统计数据
  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await usersApi.getStats()
      return response.data.data
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      payment_method: 'alipay'
    }
  })

  const amount = watch('amount')

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const response = await withdrawalApi.getWithdrawals()
      return response.data.data
    },
  })

  // 确保withdrawals是数组类型
  const withdrawalList = Array.isArray(withdrawals) ? withdrawals : (withdrawals?.data || [])

  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalForm) => {
      const response = await withdrawalApi.submitWithdrawal(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('提现申请已提交，请等待审核')
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '提现申请失败')
    },
  })

  const onSubmit = (data: WithdrawalForm) => {
    if ((stats?.commissionBalance || 0) < data.amount) {
      toast.error('余额不足')
      return
    }
    withdrawalMutation.mutate(data)
  }

  const handleMethodChange = (method: 'alipay' | 'wechat' | 'bank') => {
    setSelectedMethod(method)
    setValue('payment_method', method)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />待审核</Badge>
      case 1:
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />已批准</Badge>
      case 2:
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'alipay':
        return <Smartphone className="w-4 h-4" />
      case 'wechat':
        return <Smartphone className="w-4 h-4" />
      case 'bank':
        return <Building className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'alipay':
        return '支付宝'
      case 'wechat':
        return '微信'
      case 'bank':
        return '银行卡'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">佣金提现</h1>
        <p className="text-gray-600">申请提现您的推广佣金</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                提现申请
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Balance Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">可提现余额</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(stats?.commissionBalance || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">最低提现</p>
                      <p className="text-lg font-semibold text-blue-900">¥100</p>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提现金额
                  </label>
                  <Input
                    type="number"
                    placeholder="请输入提现金额"
                    {...register('amount', { valueAsNumber: true })}
                    error={errors.amount?.message}
                  />
                  {amount && (
                    <p className="text-sm text-gray-500 mt-1">
                      实际到账: {formatCurrency(amount * 0.99)} (扣除1%手续费)
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    提现方式
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'alipay', name: '支付宝', icon: Smartphone },
                      { id: 'wechat', name: '微信', icon: Smartphone },
                      { id: 'bank', name: '银行卡', icon: Building },
                    ].map((method) => {
                      const Icon = method.icon
                      return (
                        <div
                          key={method.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMethod === method.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleMethodChange(method.id as any)}
                        >
                          <div className="text-center">
                            <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                            <p className="text-sm font-medium">{method.name}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Account Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedMethod === 'bank' ? '银行卡号' : '账号'}
                    </label>
                    <Input
                      placeholder={
                        selectedMethod === 'alipay' ? '支付宝账号/手机号' :
                        selectedMethod === 'wechat' ? '微信号/手机号' :
                        '银行卡号'
                      }
                      {...register('payment_account')}
                      error={errors.payment_account?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      真实姓名
                    </label>
                    <Input
                      placeholder="请输入真实姓名"
                      {...register('real_name')}
                      error={errors.real_name?.message}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={withdrawalMutation.isPending}
                  disabled={(stats?.commissionBalance || 0) < 100}
                >
                  提交申请
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Rules */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                提现规则
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p>最低提现金额为100元</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p>提现手续费为1%</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p>工作日24小时内处理</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p>请确保账户信息准确</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p>银行卡提现需1-3个工作日</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            提现记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : withdrawalList && withdrawalList.length > 0 ? (
            <div className="space-y-4">
              {withdrawalList.map((withdrawal: any) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getMethodIcon(withdrawal.payment_method)}
                      <span className="font-medium text-gray-900">
                        {getMethodName(withdrawal.payment_method)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      账户: {withdrawal.payment_account}
                    </p>
                    <p className="text-sm text-gray-500">
                      申请时间: {formatDate(withdrawal.created_at)}
                    </p>
                    {withdrawal.admin_note && (
                      <p className="text-sm text-gray-500">
                        备注: {withdrawal.admin_note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 mb-1">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无提现记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}