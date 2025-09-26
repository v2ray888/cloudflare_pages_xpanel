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
  config: z.string().min(1, '请输入服务器配置'),
  location: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
})

type ServerForm = z.infer<typeof serverSchema>

export default function AdminServersPage() {
  const [showServerModal, setShowServerModal] = useState(false)
  const [editingServer, setEditingServer] = useState<any>(null)

  const queryClient = useQueryClient()

  const { data: servers, isLoading } = useQuery({
    queryKey: ['admin-servers'],
    queryFn: async () => {
      const response = await adminApi.getServers()
      return response.data.data
    },
  })

  const form = useForm<ServerForm>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: '',
      host: '',
      port: 443,
      protocol: 'vmess',
      config: '',
      location: '',
      sort_order: 0,
    },
  })

  const createServerMutation = useMutation({
    mutationFn: async (data: ServerForm) => {
      const response = await adminApi.createServer(data)
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
      const response = await adminApi.updateServer(data.id, data)
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
      config: server.config,
      location: server.location || '',
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

      {/* Servers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : servers && servers.length > 0 ? (
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
                  {server.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{server.location}</span>
                    </div>
                  )}
                </div>

                {/* Protocol */}
                <div>
                  <Badge variant="primary">
                    {server.protocol.toUpperCase()}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge variant={server.status === 1 ? 'success' : 'secondary'}>
                    {server.status === 1 ? '在线' : '离线'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    排序: {server.sort_order || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
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
                {...form.register('location')}
                label="服务器位置"
                placeholder="如：香港、美国"
                error={form.formState.errors.location?.message}
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
                协议类型
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
                {...form.register('sort_order', { valueAsNumber: true })}
                type="number"
                label="排序"
                placeholder="0"
                error={form.formState.errors.sort_order?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              服务器配置
            </label>
            <textarea
              {...form.register('config')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="请输入服务器配置信息（JSON格式）"
            />
            {form.formState.errors.config && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.config.message}
              </p>
            )}
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