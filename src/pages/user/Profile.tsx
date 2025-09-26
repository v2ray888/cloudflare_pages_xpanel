import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Camera,
  Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional().or(z.literal('')),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(6, '新密码至少6位'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: '两次输入的密码不一致',
  path: ['confirm_password'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await usersApi.updateProfile(data)
      return response.data
    },
    onSuccess: (data) => {
      updateUser(data.data)
      toast.success('个人信息更新成功')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '更新失败'
      toast.error(message)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await usersApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('密码修改成功')
      passwordForm.reset()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '密码修改失败'
      toast.error(message)
    },
  })

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="text-gray-600">管理您的账户信息和安全设置</p>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            账户概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.username || user?.email}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={user?.status === 1 ? 'success' : 'secondary'}>
                  {user?.status === 1 ? '正常' : '已禁用'}
                </Badge>
                <Badge variant="outline">
                  {user?.role === 1 ? '管理员' : '普通用户'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              更换头像
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            个人信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  {...profileForm.register('username')}
                  label="用户名"
                  placeholder="请输入用户名"
                  error={profileForm.formState.errors.username?.message}
                />
              </div>
              <div>
                <Input
                  value={user?.email || ''}
                  label="邮箱地址"
                  disabled
                  helperText="邮箱地址不可修改"
                />
              </div>
              <div>
                <Input
                  {...profileForm.register('phone')}
                  label="手机号码"
                  placeholder="请输入手机号码"
                  error={profileForm.formState.errors.phone?.message}
                />
              </div>
              <div>
                <Input
                  value={user?.referral_code || ''}
                  label="推广码"
                  disabled
                  helperText="您的专属推广码"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={updateProfileMutation.isPending}
                disabled={updateProfileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                保存更改
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            账户余额
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-600 mb-2">账户余额</p>
              <p className="text-3xl font-bold text-primary-700">
                ¥{user?.balance || 0}
              </p>
              <Button size="sm" className="mt-4">
                充值
              </Button>
            </div>
            <div className="text-center p-6 bg-success-50 rounded-lg">
              <p className="text-sm text-success-600 mb-2">佣金余额</p>
              <p className="text-3xl font-bold text-success-700">
                ¥{user?.commission_balance || 0}
              </p>
              <Button size="sm" variant="outline" className="mt-4">
                提现
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            安全设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Input
                    {...passwordForm.register('current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="当前密码"
                    placeholder="请输入当前密码"
                    error={passwordForm.formState.errors.current_password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Input
                    {...passwordForm.register('new_password')}
                    type={showNewPassword ? 'text' : 'password'}
                    label="新密码"
                    placeholder="请输入新密码"
                    error={passwordForm.formState.errors.new_password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Input
                    {...passwordForm.register('confirm_password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="确认新密码"
                    placeholder="请再次输入新密码"
                    error={passwordForm.formState.errors.confirm_password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">密码安全提示</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 密码长度至少6位</li>
                <li>• 建议包含大小写字母、数字和特殊字符</li>
                <li>• 不要使用过于简单或常见的密码</li>
                <li>• 定期更换密码以保证账户安全</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={changePasswordMutation.isPending}
                disabled={changePasswordMutation.isPending}
              >
                <Lock className="w-4 h-4 mr-2" />
                修改密码
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>账户操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">登录历史</h4>
                <p className="text-sm text-gray-600">查看最近的登录记录</p>
              </div>
              <Button variant="outline" size="sm">
                查看详情
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">两步验证</h4>
                <p className="text-sm text-gray-600">为您的账户添加额外的安全保护</p>
              </div>
              <Button variant="outline" size="sm">
                启用
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">注销账户</h4>
                <p className="text-sm text-red-700">永久删除您的账户和所有数据</p>
              </div>
              <Button variant="danger" size="sm">
                注销账户
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}