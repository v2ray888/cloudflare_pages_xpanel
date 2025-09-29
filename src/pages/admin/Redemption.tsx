import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Gift, 
  Plus, 
  Search, 
  Filter,
  Download,
  Copy
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const redeemCodeSchema = z.object({
  plan_id: z.number().int().min(1, '请选择套餐'),
  quantity: z.number().int().min(1).max(1000, '数量范围1-1000'),
  prefix: z.string().optional(),
  expires_at: z.string().optional(),
})

type RedeemCodeForm = z.infer<typeof redeemCodeSchema>

export default function AdminRedemptionPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [showCodesModal, setShowCodesModal] = useState(false)
  const [planOptions, setPlanOptions] = useState<any[]>([])
  const limit = 20

  const queryClient = useQueryClient()

  const { data: codesData, isLoading, error } = useQuery({
    queryKey: ['admin-redeem-codes', { page, limit, search, status: statusFilter }],
    queryFn: async () => {
      const params: any = { page, limit }
      if (search) params.search = search
      if (statusFilter !== null) params.status = statusFilter
      const response = await adminApi.getRedeemCodes(params)
      return response.data
    },
  })

  const { data: plans } = useQuery({
    queryKey: ['admin-plans-simple'],
    queryFn: async () => {
      const response = await adminApi.getPlans()
      return response.data
    },
  })

  // 更新套餐选项
  useEffect(() => {
    if (plans && Array.isArray(plans.data)) {
      setPlanOptions(plans.data.filter((plan: any) => plan.is_active))
    }
  }, [plans])

  const form = useForm<RedeemCodeForm>({
    resolver: zodResolver(redeemCodeSchema),
    defaultValues: {
      plan_id: 0,
      quantity: 10,
      prefix: '',
      expires_at: '',
    },
  })

  // 监听数量变化并验证
  const quantityValue = form.watch('quantity')
  useEffect(() => {
    if (quantityValue < 1) {
      form.setValue('quantity', 1)
    } else if (quantityValue > 1000) {
      form.setValue('quantity', 1000)
    }
  }, [quantityValue, form])

  // 监听套餐选择变化，自动设置过期时间和前缀
  const selectedPlanId = form.watch('plan_id')
  useEffect(() => {
    if (selectedPlanId && plans && Array.isArray(plans.data)) {
      const selectedPlan = plans.data.find((plan: any) => plan.id === selectedPlanId)
      if (selectedPlan) {
        // 自动设置过期时间
        if (selectedPlan.duration_days) {
          // 计算过期时间：当前时间 + 套餐天数
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + selectedPlan.duration_days)
          
          // 格式化为datetime-local输入框所需的格式 (YYYY-MM-DDTHH:mm)
          const formattedDate = expirationDate.toISOString().slice(0, 16)
          form.setValue('expires_at', formattedDate)
        }
        
        // 自动设置前缀
        let prefix = ''
        if (selectedPlan.duration_days) {
          if (selectedPlan.duration_days <= 30) {
            prefix = 'M' // 月套餐
          } else if (selectedPlan.duration_days <= 90) {
            prefix = 'Q' // 季度套餐
          } else if (selectedPlan.duration_days <= 180) {
            prefix = 'H' // 半年套餐
          } else {
            prefix = 'Y' // 年套餐
          }
        }
        form.setValue('prefix', prefix)
      }
    }
  }, [selectedPlanId, plans, form])

  const createCodesMutation = useMutation({
    mutationFn: async (data: RedeemCodeForm) => {
      const response = await adminApi.createRedeemCodes(data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-redeem-codes'] })
      // 修复：正确访问API响应中的codes数组
      const codes = data.data?.codes || []
      toast.success(`成功生成 ${codes.length} 个兑换码`)
      setSelectedCodes(codes)
      setShowCodesModal(true)
      setShowCreateModal(false)
      form.reset({
        plan_id: 0,
        quantity: 10,
        prefix: '',
        expires_at: '',
      })
    },
    onError: (error: any) => {
      console.error('Redemption code generation error:', error)
      const message = error.response?.data?.message || error.message || '生成失败'
      toast.error(message)
    },
  })

  // 修正数据提取逻辑，添加更多保护
  const codes = codesData?.data?.data || []
  const total = codesData?.data?.total || 0
  const totalPages = Math.ceil((total || 0) / limit)

  const statusOptions = [
    { value: null, label: '全部状态' },
    { value: 0, label: '未使用' },
    { value: 1, label: '已使用' },
    { value: 2, label: '已过期' },
  ]

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { variant: 'default' as const, label: '未使用' },
      1: { variant: 'success' as const, label: '已使用' },
      2: { variant: 'secondary' as const, label: '已过期' },
    }
    return statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: '未知' }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('兑换码已复制到剪贴板')
  }

  const handleCopyAllCodes = () => {
    const codesText = selectedCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    toast.success(`已复制 ${selectedCodes.length} 个兑换码到剪贴板`)
  }

  const handleDownloadCodes = () => {
    const codesText = selectedCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `redeem-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('兑换码文件已下载')
  }

  const onSubmit = (data: RedeemCodeForm) => {
    // 确保plan_id是数字并移除前端不存在的字段
    const submitData = {
      plan_id: Number(data.plan_id),
      quantity: data.quantity,
      prefix: data.prefix || undefined,
      expires_at: data.expires_at || undefined
    }
    createCodesMutation.mutate(submitData)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">兑换码管理</h1>
          <p className="text-gray-600">管理系统中的所有兑换码</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          生成兑换码
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索兑换码..."
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

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            兑换码列表
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (共 {total} 个兑换码)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">加载失败</div>
              <div className="text-sm text-gray-600">{(error as any).message}</div>
              <Button 
                className="mt-4" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-redeem-codes'] })}
              >
                重新加载
              </Button>
            </div>
          ) : codes.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div>兑换码</div>
                <div>套餐</div>
                <div>状态</div>
                <div>使用者</div>
                <div>创建时间</div>
                <div>操作</div>
              </div>

              {/* Table Body */}
              {codes.map((code: any) => (
                <div key={code.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="space-y-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {code.code}
                    </code>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {code.plan_name || '未知套餐'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {code.duration_days ? `${code.duration_days}天` : ''}
                    </p>
                  </div>

                  <div>
                    <Badge variant={getStatusBadge(code.status).variant}>
                      {getStatusBadge(code.status).label}
                    </Badge>
                    {code.expires_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        过期: {formatDate(code.expires_at)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {code.used_by_email ? (
                      <>
                        <p className="text-sm">
                          {code.used_by_email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(code.used_at)}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">未使用</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    {formatDate(code.created_at)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(code.code)}
                    >
                      <Copy className="w-4 h-4" />
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
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无兑换码
              </h3>
              <p className="text-gray-600">
                {search || statusFilter !== null ? '没有找到匹配的兑换码' : '还没有生成任何兑换码'}
              </p>
              {total === 0 && !search && statusFilter === null && (
                <div className="mt-4">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    立即生成兑换码
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Codes Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          form.reset({
            plan_id: 0,
            quantity: 10,
            prefix: '',
            expires_at: '',
          })
        }}
        title="生成兑换码"
        size="md"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择套餐 *
            </label>
            <select
              {...form.register('plan_id', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              defaultValue=""
            >
              <option value="">请选择套餐</option>
              {planOptions.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.duration_days}天 / {plan.traffic_gb}GB
                </option>
              ))}
            </select>
            {form.formState.errors.plan_id && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.plan_id.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...form.register('quantity', { valueAsNumber: true })}
              type="number"
              min="1"
              max="1000"
              label="生成数量"
              placeholder="10"
              error={form.formState.errors.quantity?.message}
              helperText="一次最多生成1000个兑换码"
            />
          </div>

          <div>
            <Input
              {...form.register('prefix')}
              label="兑换码前缀"
              placeholder="VIP"
              error={form.formState.errors.prefix?.message}
              helperText={
                selectedPlanId && planOptions.find((plan: any) => plan.id === selectedPlanId)
                  ? `根据所选套餐自动设置前缀: ${(() => {
                      const selectedPlan = planOptions.find((plan: any) => plan.id === selectedPlanId);
                      if (selectedPlan) {
                        if (selectedPlan.duration_days <= 30) return 'M (月套餐)';
                        if (selectedPlan.duration_days <= 90) return 'Q (季度套餐)';
                        if (selectedPlan.duration_days <= 180) return 'H (半年套餐)';
                        return 'Y (年套餐)';
                      }
                      return '';
                    })()}`
                  : '可选，为兑换码添加前缀'
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              过期时间
            </label>
            <input
              {...form.register('expires_at')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {form.formState.errors.expires_at && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.expires_at.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {selectedPlanId && planOptions.find((plan: any) => plan.id === selectedPlanId)?.duration_days
                ? `根据所选套餐自动计算（${planOptions.find((plan: any) => plan.id === selectedPlanId)?.duration_days}天后过期）`
                : '可选，不设置则永不过期'}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false)
                form.reset({
                  plan_id: 0,
                  quantity: 10,
                  prefix: '',
                  expires_at: '',
                })
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              loading={createCodesMutation.isPending}
            >
              生成兑换码
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generated Codes Modal */}
      <Modal
        isOpen={showCodesModal}
        onClose={() => setShowCodesModal(false)}
        title="生成的兑换码"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              成功生成 {selectedCodes.length} 个兑换码
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyAllCodes}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制全部
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadCodes}
              >
                <Download className="w-4 h-4 mr-2" />
                下载文件
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-2 rounded border"
                >
                  <code className="text-sm font-mono">{code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCode(code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCodesModal(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}