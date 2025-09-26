import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  CreditCard, 
  Calendar, 
  Wifi, 
  Smartphone, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { usersApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatBytes, formatDate, calculateDaysRemaining, calculateUsagePercentage } from '@/lib/utils'
import { UserSubscription } from '@/types'

export default function SubscriptionPage() {
  const [showRenewModal, setShowRenewModal] = useState(false)

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const response = await usersApi.getSubscription()
      return response.data.data as UserSubscription
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
          <p className="text-gray-600">管理您的VPN订阅服务</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无有效订阅
            </h3>
            <p className="text-gray-600 mb-6">
              您当前没有有效的订阅，请购买套餐或使用兑换码激活服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/plans">购买套餐</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/redeem">使用兑换码</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysRemaining = calculateDaysRemaining(subscription.end_date)
  const usagePercentage = calculateUsagePercentage(subscription.traffic_used, subscription.traffic_total)
  const isExpired = daysRemaining <= 0
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
        <p className="text-gray-600">管理您的VPN订阅服务</p>
      </div>

      {/* Status Alert */}
      {isExpired && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-error-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-error-800">订阅已过期</h3>
              <p className="text-sm text-error-700 mt-1">
                您的订阅已于 {formatDate(subscription.end_date)} 过期，请及时续费以继续使用服务。
              </p>
            </div>
          </div>
        </div>
      )}

      {isExpiringSoon && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-warning-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-warning-800">订阅即将过期</h3>
              <p className="text-sm text-warning-700 mt-1">
                您的订阅将在 {daysRemaining} 天后过期，建议提前续费以避免服务中断。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              订阅信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">套餐名称</span>
              <Badge variant="default">{subscription.plan?.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">订阅状态</span>
              <Badge
                variant={
                  subscription.status === 1 ? 'success' :
                  subscription.status === 2 ? 'warning' : 'secondary'
                }
              >
                {subscription.status === 1 ? '有效' :
                 subscription.status === 2 ? '已暂停' : '已过期'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">开始时间</span>
              <span className="text-sm font-medium">
                {formatDate(subscription.start_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">到期时间</span>
              <span className={`text-sm font-medium ${isExpired ? 'text-error-600' : ''}`}>
                {formatDate(subscription.end_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">剩余天数</span>
              <span className={`font-medium ${
                isExpired ? 'text-error-600' :
                isExpiringSoon ? 'text-warning-600' : 'text-success-600'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} 天` : '已过期'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 mr-2" />
              流量使用
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已用流量</span>
                <span className="text-sm font-medium">
                  {formatBytes(subscription.traffic_used)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">总流量</span>
                <span className="text-sm font-medium">
                  {formatBytes(subscription.traffic_total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    usagePercentage >= 90 ? 'bg-error-500' :
                    usagePercentage >= 70 ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <div className="text-center">
                <span className={`text-sm font-medium ${
                  usagePercentage >= 90 ? 'text-error-600' :
                  usagePercentage >= 70 ? 'text-warning-600' : 'text-success-600'
                }`}>
                  已使用 {usagePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {usagePercentage >= 90 && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-sm text-error-700">
                  流量使用已超过90%，建议升级套餐或购买流量包
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            设备限制
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">同时连接设备数</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscription.device_limit} 台
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">当前在线</p>
              <p className="text-lg font-medium text-success-600">0 台</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="w-full"
              onClick={() => setShowRenewModal(true)}
            >
              续费订阅
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href="/plans">升级套餐</a>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新状态
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <a href="/user/servers">查看节点</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            订阅历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {subscription.plan?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                  </p>
                </div>
              </div>
              <Badge
                variant={subscription.status === 1 ? 'success' : 'secondary'}
              >
                {subscription.status === 1 ? '当前订阅' : '已过期'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renew Modal */}
      <Modal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        title="续费订阅"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            选择续费方式来延长您的订阅服务
          </p>
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              asChild
            >
              <a href="/plans">
                <CreditCard className="w-4 h-4 mr-2" />
                购买相同套餐
              </a>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              asChild
            >
              <a href="/plans">
                <RefreshCw className="w-4 h-4 mr-2" />
                升级到更高套餐
              </a>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              asChild
            >
              <a href="/redeem">
                <CheckCircle className="w-4 h-4 mr-2" />
                使用兑换码续费
              </a>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}