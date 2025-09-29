import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2,
  Globe
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'

const serverSchema = z.object({
  name: z.string().min(1, '请输入服务器名称'),
  host: z.string().min(1, '请输入服务器地址'),
  port: z.number().int().min(1).max(65535, '端口范围1-65535'),
  protocol: z.enum(['vmess', 'vless', 'trojan', 'shadowsocks']),
  method: z.string().optional(),
  password: z.string().optional(),
  uuid: z.string().optional(),
  path: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  flag_emoji: z.string().optional(),
  load_balance: z.number().int().min(0).optional(),
  max_users: z.number().int().min(0).optional(),
  device_limit: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})

type ServerForm = z.infer<typeof serverSchema>

export default function AdminServersPage() {
  const [showServerModal, setShowServerModal] = useState(false)
  const [editingServer, setEditingServer] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | ''>('')

  const queryClient = useQueryClient()

  const { data: serversData, isLoading } = useQuery({
    queryKey: ['admin-servers', { page, search, status: statusFilter }],
    queryFn: async () => {
      const params: any = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter !== '') params.status = statusFilter
      const response = await adminApi.getServers(params)
      return response.data
    },
  })

  const form = useForm<ServerForm>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: '',
      host: '',
      port: 443,
      protocol: 'vmess',
      method: '',
      password: '',
      uuid: '',
      path: '',
      country: '',
      city: '',
      flag_emoji: '',
      load_balance: 0,
      max_users: 1000,
      device_limit: 3,
      is_active: true,
      sort_order: 0,
    },
  })

  const createServerMutation = useMutation({
    mutationFn: async (data: ServerForm) => {
      // Convert boolean to number for is_active
      const serverData = {
        ...data,
        is_active: data.is_active ? 1 : 0
      }
      const response = await adminApi.createServer(serverData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servers'] })
      toast.success('服务器创建成功')
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '创建失败'
      toast.error(message)
    },
  })

  const updateServerMutation = useMutation({
    mutationFn: async (data: ServerForm & { id: number }) => {
      // Convert boolean to number for is_active
      const serverData = {
        ...data,
        is_active: data.is_active ? 1 : 0
      }
      const response = await adminApi.updateServer(data.id, serverData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servers'] })
      toast.success('服务器更新成功')
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '更新失败'
      toast.error(message)
    },
  })

  const deleteServerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await adminApi.deleteServer(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servers'] })
      toast.success('服务器删除成功')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '删除失败'
      toast.error(message)
    },
  })

  const handleCreateServer = () => {
    setEditingServer(null)
    form.reset()
    setShowServerModal(true)
  }

  const handleEditServer = (server: any) => {
    setEditingServer(server)
    form.reset({
      name: server.name,
      host: server.host,
      port: server.port,
      protocol: server.protocol,
      method: server.method || '',
      password: server.password || '',
      uuid: server.uuid || '',
      path: server.path || '',
      country: server.country || '',
      city: server.city || '',
      flag_emoji: server.flag_emoji || '',
      load_balance: server.load_balance || 0,
      max_users: server.max_users || 1000,
      device_limit: server.device_limit || 3,
      is_active: server.is_active === 1,
      sort_order: server.sort_order || 0,
    })
    setShowServerModal(true)
  }

  const handleDeleteServer = (id: number) => {
    if (confirm('确定要删除这个服务器吗？此操作不可恢复。')) {
      deleteServerMutation.mutate(id)
    }
  }

  const handleCloseModal = () => {
    setShowServerModal(false)
    setEditingServer(null)
    form.reset()
  }

  const onSubmit = (data: ServerForm) => {
    if (editingServer) {
      updateServerMutation.mutate({ ...data, id: editingServer.id })
    } else {
      createServerMutation.mutate(data)
    }
  }

  const protocolOptions = [
    { value: 'vmess', label: 'VMess' },
    { value: 'vless', label: 'VLESS' },
    { value: 'trojan', label: 'Trojan' },
    { value: 'shadowsocks', label: 'Shadowsocks' },
  ]

  const servers = serversData?.data || []
  const totalPages = Math.ceil((serversData?.total || 0) / 20)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务器管理</h1>
          <p className="text-gray-600">管理系统中的所有服务器节点</p>
        </div>
        <Button onClick={handleCreateServer}>
          <Plus className="w-4 h-4 mr-2" />
          新建服务器
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索服务器名称或地址..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">全部状态</option>
                <option value="1">在线</option>
                <option value="0">离线</option>
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setPage(1)
                  setSearch('')
                  setStatusFilter('')
                }}
              >
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : servers && servers.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server: any) => (
              <Card key={server.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Server className="w-5 h-5 mr-2" />
                      {server.name}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditServer(server)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Server Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-mono">{server.host}:{server.port}</span>
                    </div>
                    {server.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span>{server.flag_emoji} {server.country} {server.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Protocol */}
                  <div>
                    <Badge variant="default">
                      {server.protocol.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge variant={server.is_active === 1 ? 'success' : 'secondary'}>
                      {server.is_active === 1 ? '在线' : '离线'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      排序: {server.sort_order || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无服务器
            </h3>
            <p className="text-gray-600 mb-6">
              还没有添加任何服务器，点击按钮添加第一个服务器
            </p>
            <Button onClick={handleCreateServer}>
              <Plus className="w-4 h-4 mr-2" />
              添加服务器
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Server Modal */}
      <Modal
        isOpen={showServerModal}
        onClose={handleCloseModal}
        title={editingServer ? '编辑服务器' : '新建服务器'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...form.register('name')}
                label="服务器名称"
                placeholder="请输入服务器名称"
                error={form.formState.errors.name?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('host')}
                label="服务器地址"
                placeholder="example.com"
                error={form.formState.errors.host?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('port', { valueAsNumber: true })}
                type="number"
                label="端口"
                placeholder="443"
                error={form.formState.errors.port?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                协议类型 *
              </label>
              <select
                {...form.register('protocol')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {protocolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.protocol && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.protocol.message}
                </p>
              )}
            </div>
            <div>
              <Input
                {...form.register('country')}
                label="国家"
                placeholder="如：中国"
                error={form.formState.errors.country?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('city')}
                label="城市"
                placeholder="如：香港"
                error={form.formState.errors.city?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('flag_emoji')}
                label="国旗Emoji"
                placeholder="如：🇭🇰"
                error={form.formState.errors.flag_emoji?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('load_balance', { valueAsNumber: true })}
                type="number"
                label="负载权重"
                placeholder="0"
                error={form.formState.errors.load_balance?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('sort_order', { valueAsNumber: true })}
                type="number"
                label="排序"
                placeholder="0"
                error={form.formState.errors.sort_order?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...form.register('is_active')}
                  id="is_active"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  在线
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配置信息
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  {...form.register('method')}
                  label="加密方式"
                  placeholder="aes-256-gcm"
                  error={form.formState.errors.method?.message}
                />
              </div>
              <div>
                <Input
                  {...form.register('password')}
                  label="密码"
                  placeholder="password"
                  error={form.formState.errors.password?.message}
                />
              </div>
              <div>
                <Input
                  {...form.register('uuid')}
                  label="UUID"
                  placeholder="uuid"
                  error={form.formState.errors.uuid?.message}
                />
              </div>
              <div>
                <Input
                  {...form.register('path')}
                  label="路径"
                  placeholder="/path"
                  error={form.formState.errors.path?.message}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              取消
            </Button>
            <Button
              type="submit"
              loading={createServerMutation.isPending || updateServerMutation.isPending}
            >
              {editingServer ? '更新服务器' : '创建服务器'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}