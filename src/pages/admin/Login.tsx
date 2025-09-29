import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import { UserRole } from '@/types'

const adminLoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, adminLogin } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  // 监听用户状态变化，登录成功后自动跳转
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        // 如果不是管理员，跳转到用户页面
        navigate('/user/dashboard', { replace: true })
      }
    }
  }, [user, isLoading, navigate])

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true)
    try {
      // 调用管理员登录接口
      await adminLogin(data.email, data.password)
      // 跳转逻辑会在 useEffect 中处理
      toast.success('管理员登录成功')
    } catch (error: any) {
      const message = error.response?.data?.message || '登录失败'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">X</span>
            </div>
            <span className="text-2xl font-bold gradient-text">XPanel</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-2 text-primary-600" />
            管理员登录
          </h2>
          <p className="mt-2 text-gray-600">
            请输入管理员账户信息登录后台管理系统
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">管理员账户登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="管理员邮箱"
                    className="pl-10"
                    error={errors.email?.message}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="管理员密码"
                    className="pl-10 pr-10"
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                登录后台
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>
            </div>

            {/* Back to User Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                普通用户请{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  点击这里登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}