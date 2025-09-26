import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const limit = 20

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const response = await adminApi.getOrders({ 
        page, 
        limit, 
        search, 
        status: statusFilter 
      })
      return response.data
    },
  })

  const orders = ordersData?.data || []
  const totalPages = Math.ceil((ordersData?.total || 0) / limit)

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const statusOptions = [
    { value: null, label: '全部状态' },
    { value: 0, label: '待支付' },
    { value: 1, label: '已支付' },
    { value: 2, label: '已取消' },
    { value: 3, label: '已退款' },
  ]

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { variant: 'secondary' as const, label: '待支付' },
      1: { variant: 'success' as const, label: '已支付' },
      2: { variant: 'danger' as const, label: '已取消' },
      3: { variant: 'warning' as const, label: '已退款' },
    }
    return statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: '未知' }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-600">管理系统中的所有订单</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索订单号或用户邮箱..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={statusFilter === option.value ? 'primary' : 'outline'}
                    onClick={() => {
                      setStatusFilter(option.value)
                      setPage(1)
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            订单列表
            {ordersData?.total && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (共 {ordersData.total} 个订单)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div>订单信息</div>
                <div>用户</div>
                <div>套餐</div>
                <div>金额</div>
                <div>状态</div>
                <div>操作</div>
              </div>

              {/* Table Body */}
              {orders.map((order: any) => (
                <div key={order.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-medium">
                      #{order.order_no}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.payment_method}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {order.user?.email || '未知用户'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {order.user_id}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {order.plan?.name || '未知套餐'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.plan?.duration_days}天 / {order.plan?.traffic_gb}GB
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(order.amount)}
                    </p>
                    {order.discount_amount > 0 && (
                      <p className="text-xs text-gray-500">
                        优惠: -{formatCurrency(order.discount_amount)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Badge variant={getStatusBadge(order.status).variant}>
                      {getStatusBadge(order.status).label}
                    </Badge>
                    {order.paid_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(order.paid_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    上一页
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={page === pageNum ? 'primary' : 'outline'}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无订单数据
              </h3>
              <p className="text-gray-600">
                {search || statusFilter !== null ? '没有找到匹配的订单' : '系统中还没有订单'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="订单详情"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">订单信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">订单号:</span>
                  <span className="ml-2 font-mono">{selectedOrder.order_no}</span>
                </div>
                <div>
                  <span className="text-gray-600">订单状态:</span>
                  <Badge 
                    variant={getStatusBadge(selectedOrder.status).variant}
                    className="ml-2"
                  >
                    {getStatusBadge(selectedOrder.status).label}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">支付方式:</span>
                  <span className="ml-2">{selectedOrder.payment_method}</span>
                </div>
                <div>
                  <span className="text-gray-600">创建时间:</span>
                  <span className="ml-2">{formatDate(selectedOrder.created_at)}</span>
                </div>
                {selectedOrder.paid_at && (
                  <div>
                    <span className="text-gray-600">支付时间:</span>
                    <span className="ml-2">{formatDate(selectedOrder.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">用户信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">用户ID:</span>
                  <span className="ml-2">{selectedOrder.user_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">邮箱:</span>
                  <span className="ml-2">{selectedOrder.user?.email || '未知'}</span>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">套餐信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">套餐名称:</span>
                  <span className="ml-2">{selectedOrder.plan?.name || '未知套餐'}</span>
                </div>
                <div>
                  <span className="text-gray-600">有效期:</span>
                  <span className="ml-2">{selectedOrder.plan?.duration_days || 0} 天</span>
                </div>
                <div>
                  <span className="text-gray-600">流量:</span>
                  <span className="ml-2">{selectedOrder.plan?.traffic_gb || 0} GB</span>
                </div>
                <div>
                  <span className="text-gray-600">设备数:</span>
                  <span className="ml-2">{selectedOrder.plan?.device_limit || 0} 台</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">费用信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">原价:</span>
                  <span className="ml-2">{formatCurrency(selectedOrder.original_amount || selectedOrder.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">优惠金额:</span>
                  <span className="ml-2 text-red-600">-{formatCurrency(selectedOrder.discount_amount || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">实付金额:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(selectedOrder.amount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowOrderModal(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}