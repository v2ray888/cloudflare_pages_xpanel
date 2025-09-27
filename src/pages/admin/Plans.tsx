import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  HardDrive,
  Smartphone
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const planSchema = z.object({
  name: z.string().min(1, '请输入套餐名称'),
  description: z.string().optional(),
  price: z.number().min(0, '价格不能为负数'),
  duration_days: z.number().int().min(1, '有效期至少1天'),
  traffic_gb: z.number().int().min(1, '流量至少1GB'),
  device_limit: z.number().int().min(1, '设备数至少1台'),
  features: z.array(z.string()).optional(),
  sort_order: z.number().int().min(0).optional(),
})

type PlanForm = z.infer<typeof planSchema>

export default function AdminPlansPage() {
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState('')

  const queryClient = useQueryClient()

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const response = await adminApi.getPlans()
      return response.data.data
    },
  })

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_days: 30,
      traffic_gb: 100,
      device_limit: 3,
      features: [],
      sort_order: 0,
    },
  })

  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanForm) => {
      const response = await adminApi.createPlan({
        ...data,
        features: features,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
      toast.success('套餐创建成功')
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '创建失败'
      toast.error(message)
    },
  })

  const updatePlanMutation = useMutation({
    mutationFn: async (data: PlanForm & { id: number }) => {
      const response = await adminApi.updatePlan(data.id, {
        ...data,
        features: features,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
      toast.success('套餐更新成功')
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '更新失败'
      toast.error(message)
    },
  })

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await adminApi.deletePlan(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
      toast.success('套餐删除成功')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '删除失败'
      toast.error(message)
    },
  })

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setFeatures([])
    form.reset()
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setFeatures(plan.features || [])
    form.reset({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      traffic_gb: plan.traffic_gb,
      device_limit: plan.device_limit,
      sort_order: plan.sort_order || 0,
    })
    setShowPlanModal(true)
  }

  const handleDeletePlan = (id: number) => {
    if (confirm('确定要删除这个套餐吗？此操作不可恢复。')) {
      deletePlanMutation.mutate(id)
    }
  }

  const handleCloseModal = () => {
    setShowPlanModal(false)
    setEditingPlan(null)
    setFeatures([])
    setNewFeature('')
    form.reset()
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const onSubmit = (data: PlanForm) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ ...data, id: editingPlan.id })
    } else {
      createPlanMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">套餐管理</h1>
          <p className="text-gray-600">管理系统中的所有套餐</p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="w-4 h-4 mr-2" />
          新建套餐
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.duration_days} 天有效期
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{plan.duration_days} 天有效期</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HardDrive className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{plan.traffic_gb} GB 流量</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{plan.device_limit} 台设备</span>
                  </div>
                </div>

                {/* Custom Features */}
                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">特色功能</h4>
                    <div className="space-y-1">
                      {plan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge variant={plan.status === 1 ? 'success' : 'secondary'}>
                    {plan.status === 1 ? '启用' : '禁用'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    排序: {plan.sort_order || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无套餐
            </h3>
            <p className="text-gray-600 mb-6">
              还没有创建任何套餐，点击按钮创建第一个套餐
            </p>
            <Button onClick={handleCreatePlan}>
              <Plus className="w-4 h-4 mr-2" />
              创建套餐
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={handleCloseModal}
        title={editingPlan ? '编辑套餐' : '新建套餐'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                {...form.register('name')}
                label="套餐名称"
                placeholder="请输入套餐名称"
                error={form.formState.errors.name?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                label="价格 (元)"
                placeholder="0.00"
                error={form.formState.errors.price?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('duration_days', { valueAsNumber: true })}
                type="number"
                label="有效期 (天)"
                placeholder="30"
                error={form.formState.errors.duration_days?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('traffic_gb', { valueAsNumber: true })}
                type="number"
                label="流量 (GB)"
                placeholder="100"
                error={form.formState.errors.traffic_gb?.message}
              />
            </div>
            <div>
              <Input
                {...form.register('device_limit', { valueAsNumber: true })}
                type="number"
                label="设备数限制"
                placeholder="3"
                error={form.formState.errors.device_limit?.message}
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
          </div>

          <div>
            <Input
              {...form.register('description')}
              label="套餐描述"
              placeholder="请输入套餐描述"
              error={form.formState.errors.description?.message}
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              特色功能
            </label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg">
                    {feature}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="输入功能特色"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                >
                  添加
                </Button>
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
              loading={createPlanMutation.isPending || updatePlanMutation.isPending}
            >
              {editingPlan ? '更新套餐' : '创建套餐'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}