import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

interface SystemSettings {
  site_name: string
  site_description: string
  site_logo: string
  commission_rate: number
  min_withdrawal: number
  currency: string
  payment_methods: string[]
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_pass: string
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.getAll(),
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, any>) => settingsApi.update(data),
    onSuccess: () => {
      toast.success('设置保存成功')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '保存失败')
    },
  })

  const settings = settingsData?.data?.data || {}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data: Record<string, any> = {}
    
    // Collect all form data
    for (const [key, value] of formData.entries()) {
      if (key === 'commission_rate' || key === 'min_withdrawal' || key === 'smtp_port') {
        data[key] = parseFloat(value as string) || 0
      } else if (key === 'payment_methods') {
        data[key] = (value as string).split(',').map(method => method.trim()).filter(method => method)
      } else {
        data[key] = value
      }
    }
    
    updateSettingsMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600">管理系统配置</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '取消编辑' : '编辑设置'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="网站名称"
                name="site_name"
                defaultValue={settings.site_name}
                readOnly={!isEditing}
              />
              <Input
                label="网站Logo"
                name="site_logo"
                defaultValue={settings.site_logo}
                readOnly={!isEditing}
              />
            </div>
            <Input
              label="网站描述"
              name="site_description"
              defaultValue={settings.site_description}
              readOnly={!isEditing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>财务设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="默认佣金比例"
                name="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                defaultValue={settings.commission_rate}
                readOnly={!isEditing}
                helperText="推荐佣金占订单金额的比例，范围0-1"
              />
              <Input
                label="最低提现金额"
                name="min_withdrawal"
                type="number"
                step="0.01"
                min="0"
                defaultValue={settings.min_withdrawal}
                readOnly={!isEditing}
                helperText="用户申请提现的最低金额要求"
              />
            </div>
            <Input
              label="货币单位"
              name="currency"
              defaultValue={settings.currency}
              readOnly={!isEditing}
            />
            <Input
              label="支付方式"
              name="payment_methods"
              defaultValue={settings.payment_methods?.join(', ')}
              readOnly={!isEditing}
              helperText="多种支付方式请用逗号分隔，如：alipay, wechat"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>邮件设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SMTP服务器"
                name="smtp_host"
                defaultValue={settings.smtp_host}
                readOnly={!isEditing}
              />
              <Input
                label="SMTP端口"
                name="smtp_port"
                type="number"
                defaultValue={settings.smtp_port}
                readOnly={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SMTP用户名"
                name="smtp_user"
                defaultValue={settings.smtp_user}
                readOnly={!isEditing}
              />
              <Input
                label="SMTP密码"
                name="smtp_pass"
                type="password"
                defaultValue={settings.smtp_pass}
                readOnly={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              loading={updateSettingsMutation.isPending}
            >
              保存设置
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}