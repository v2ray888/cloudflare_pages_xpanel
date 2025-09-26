import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
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
import { toast } from 'react-hot-toast'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const limit = 20

  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const response = await adminApi.getUsers({ 
        page, 
        limit, 
        search, 
        status: statusFilter 
      })
      return response.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: number }) => {
      const response = await adminApi.updateUserStatus(userId, status)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('用户状态更新成功')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '更新失败'
      toast.error(message)
    },
  })

  const users = usersData?.data || []
  const totalPages = Math.ceil((usersData?.total || 0) / limit)

  const handleStatusChange = (userId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    updateStatusMutation.mutate({ userId, status: newStatus })
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const statusOptions = [
    { value: null, label: '全部状态' },
    { value: 1, label: '正常' },
    { value: 0, label: '已禁用' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600">管理系统中的所有用户</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索用户邮箱或用户名..."
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            用户列表
            {usersData?.total && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (共 {usersData.total} 个用户)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div>用户信息</div>
                <div>状态</div>
                <div>余额</div>
                <div>推广码</div>
                <div>注册时间</div>
                <div>操作</div>
              </div>

              {/* Table Body */}
              {users.map((user: any) => (
                <div key={user.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">
                      {user.username || '未设置'}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Badge
                      variant={user.status === 1 ? 'success' : 'secondary'}
                    >
                      {user.status === 1 ? '正常' : '已禁用'}
                    </Badge>
                    {user.role === 1 && (
                      <Badge variant="primary" className="ml-2">
                        管理员
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm">
                      余额: {formatCurrency(user.balance || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      佣金: {formatCurrency(user.commission_balance || 0)}
                    </p>
                  </div>

                  <div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {user.referral_code}
                    </code>
                  </div>

                  <div className="text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={user.status === 1 ? 'danger' : 'success'}
                      onClick={() => handleStatusChange(user.id, user.status)}
                      loading={updateStatusMutation.isPending}
                    >
                      {user.status === 1 ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
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
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无用户数据
              </h3>
              <p className="text-gray-600">
                {search || statusFilter !== null ? '没有找到匹配的用户' : '系统中还没有用户'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="用户详情"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">基本信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">用户ID:</span>
                  <span className="ml-2 font-mono">{selectedUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">邮箱:</span>
                  <span className="ml-2">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">用户名:</span>
                  <span className="ml-2">{selectedUser.username || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-600">手机号:</span>
                  <span className="ml-2">{selectedUser.phone || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-600">推广码:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                    {selectedUser.referral_code}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600">角色:</span>
                  <Badge variant={selectedUser.role === 1 ? 'primary' : 'secondary'} className="ml-2">
                    {selectedUser.role === 1 ? '管理员' : '普通用户'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">账户信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">账户余额:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatCurrency(selectedUser.balance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">佣金余额:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {formatCurrency(selectedUser.commission_balance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">账户状态:</span>
                  <Badge 
                    variant={selectedUser.status === 1 ? 'success' : 'secondary'}
                    className="ml-2"
                  >
                    {selectedUser.status === 1 ? '正常' : '已禁用'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">时间信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">注册时间:</span>
                  <span className="ml-2">{formatDate(selectedUser.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-600">最后登录:</span>
                  <span className="ml-2">
                    {selectedUser.last_login_at 
                      ? formatDate(selectedUser.last_login_at)
                      : '从未登录'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant={selectedUser.status === 1 ? 'danger' : 'success'}
                onClick={() => {
                  handleStatusChange(selectedUser.id, selectedUser.status)
                  setShowUserModal(false)
                }}
              >
                {selectedUser.status === 1 ? '禁用用户' : '启用用户'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
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