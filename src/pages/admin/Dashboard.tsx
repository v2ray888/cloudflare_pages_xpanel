import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  Server,
  Gift,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminApi.getStats()
      return response.data.data
    },
  })

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const response = await adminApi.getRecentOrders()
      return response.data.data
    },
  })

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const response = await adminApi.getRecentUsers()
      return response.data.data
    },
  })

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
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <p className="text-gray-600">系统运营数据总览</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600">
                    +{stats?.newUsersToday || 0} 今日新增
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">总收入</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600">
                    {formatCurrency(stats?.todayRevenue || 0)} 今日收入
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">总订单数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600">
                    +{stats?.todayOrders || 0} 今日订单
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">活跃节点</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeServers || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    共 {stats?.totalServers || 0} 个节点
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              收入趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              收入图表 (待实现)
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              用户增长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              用户增长图表 (待实现)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
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
                {recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {order.plan?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.user?.email}
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
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无订单数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              最新用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.username || user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={user.status === 1 ? 'success' : 'secondary'}
                    >
                      {user.status === 1 ? '正常' : '已禁用'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无用户数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">系统状态</h3>
            <p className="text-success-600 font-medium">运行正常</p>
            <p className="text-sm text-gray-500 mt-1">
              运行时间: 15天 8小时
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">兑换码</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalRedemptionCodes || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              已使用: {stats?.usedRedemptionCodes || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">推广统计</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalReferrals || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              佣金: {formatCurrency(stats?.totalCommissions || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}