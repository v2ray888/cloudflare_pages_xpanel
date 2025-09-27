import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function AdminFinancePage() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      const response = await financeApi.getStats()
      return response.data.data
    },
  })

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const response = await financeApi.getWithdrawals()
      return response.data.data
    },
  })

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: number, status: number, note?: string }) => {
      const response = await financeApi.processWithdrawal(id, { status, admin_note: note })
      return response.data
    },
    onSuccess: () => {
      toast.success('处理成功')
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
      setShowWithdrawalModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '处理失败')
    },
  })

  const handleViewWithdrawal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal)
    setShowWithdrawalModal(true)
  }

  const handleProcessWithdrawal = (status: number, note?: string) => {
    if (!selectedWithdrawal) return
    processWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      status,
      note
    })
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

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">财务管理</h1>
        <p className="text-gray-600">管理系统中的财务数据和提现申请</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总收入</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月收入</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Users className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待处理提现</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pendingWithdrawals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总提现金额</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalWithdrawals || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            提现申请
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal: any) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {withdrawal.user_email}
                      </span>
                      <Badge variant="outline">
                        {getMethodName(withdrawal.payment_method)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      账户: {withdrawal.payment_account}
                    </p>
                    <p className="text-sm text-gray-600">
                      姓名: {withdrawal.real_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      申请时间: {formatDate(withdrawal.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 mb-1">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                    {getStatusBadge(withdrawal.status)}
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewWithdrawal(withdrawal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无提现申请</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Detail Modal */}
      <Modal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        title="提现申请详情"
        size="lg"
      >
        {selectedWithdrawal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">用户邮箱</p>
                <p className="font-medium">{selectedWithdrawal.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">提现金额</p>
                <p className="font-medium text-lg">{formatCurrency(selectedWithdrawal.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">提现方式</p>
                <p className="font-medium">{getMethodName(selectedWithdrawal.payment_method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">收款账户</p>
                <p className="font-medium">{selectedWithdrawal.payment_account}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">真实姓名</p>
                <p className="font-medium">{selectedWithdrawal.real_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">申请时间</p>
                <p className="font-medium">{formatDate(selectedWithdrawal.created_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">当前状态</p>
              {getStatusBadge(selectedWithdrawal.status)}
            </div>

            {selectedWithdrawal.admin_note && (
              <div>
                <p className="text-sm text-gray-600 mb-1">管理员备注</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedWithdrawal.admin_note}</p>
              </div>
            )}

            {selectedWithdrawal.status === 0 && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleProcessWithdrawal(2, '审核不通过')}
                  loading={processWithdrawalMutation.isPending}
                >
                  拒绝
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleProcessWithdrawal(1, '审核通过')}
                  loading={processWithdrawalMutation.isPending}
                >
                  批准
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}