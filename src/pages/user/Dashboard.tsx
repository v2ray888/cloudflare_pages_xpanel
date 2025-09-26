import { useQuery } from '@tanstack/react-query'
import { 
  CreditCard, 
  Server, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Wifi,
  Clock
} from 'lucide-react'
import { usersApi, ordersApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatBytes, formatDate, calculateDaysRemaining, calculateUsagePercentage } from '@/lib/utils'
import { UserStats, Order } from '@/types'

export default function UserDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await usersApi.getStats()
      return response.data.data as UserStats
    },
  })

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', { limit: 5 }],
    queryFn: async () => {
      const response = await ordersApi.getUserOrders({ limit: 5 })
      return response.data.data as Order[]
    },
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const subscription = stats?.subscription
  const daysRemaining = subscription ? calculateDaysRemaining(subscription.end_date) : 0
  const usagePercentage = subscription ? calculateUsagePercentage(subscription.traffic_used, subscription.traffic_total) : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <p className="text-gray-600">查看您的账户概览和使用情况</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">当前订阅</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.plan?.name || '无订阅'}
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
                <p className="text-sm font-medium text-gray-600">总消费</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalSpent || 0)}
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
                <p className="text-sm font-medium text-gray-600">推荐用户</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.referralCount || 0}
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
                <p className="text-sm font-medium text-gray-600">佣金收益</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.commissionEarned || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="w-5 h-5 mr-2" />
                订阅状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">套餐名称</span>
                <Badge variant="default">{subscription.plan?.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">剩余天数</span>
                <span className={`font-medium ${daysRemaining <= 7 ? 'text-error-600' : 'text-success-600'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} 天` : '已过期'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">到期时间</span>
                <span className="text-sm font-medium">
                  {formatDate(subscription.end_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">设备限制</span>
                <span className="text-sm font-medium">
                  {subscription.device_limit} 台
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2" />
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Subscription */}
      {!subscription && (
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
              <a
                href="/plans"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
              >
                购买套餐
              </a>
              <a
                href="/redeem"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                使用兑换码
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            最近订单
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {order.plan?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      订单号: {order.order_no}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.final_amount)}
                    </p>
                    <Badge
                      variant={
                        order.status === 1 ? 'success' :
                        order.status === 0 ? 'warning' : 'secondary'
                      }
                    >
                      {order.status === 1 ? '已支付' :
                       order.status === 0 ? '待支付' : '已取消'}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <a
                  href="/user/orders"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  查看全部订单 →
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无订单记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}