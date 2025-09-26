import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'


const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
  username: z.string().optional(),
  referralCode: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, '请同意服务条款'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const referralCode = searchParams.get('ref') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode,
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await registerUser(data.email, data.password, data.username, data.referralCode)
      navigate('/user/dashboard')
    } catch (error) {
      // Error is handled in AuthContext
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
          <h2 className="text-3xl font-bold text-gray-900">
            创建账户
          </h2>
          <p className="mt-2 text-gray-600">
            注册XPanel账户，开始您的安全网络之旅
          </p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">注册新账户</CardTitle>
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
                    placeholder="邮箱地址"
                    className="pl-10"
                    error={errors.email?.message}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    {...register('username')}
                    type="text"
                    placeholder="用户名（可选）"
                    className="pl-10"
                    error={errors.username?.message}
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
                    placeholder="密码"
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

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="确认密码"
                    className="pl-10 pr-10"
                    error={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              {/* Referral Code */}
              <div>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    {...register('referralCode')}
                    type="text"
                    placeholder="推荐码（可选）"
                    className="pl-10"
                    error={errors.referralCode?.message}
                    helperText="填写推荐码可获得额外优惠"
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  {...register('agreeTerms')}
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="ml-3 text-sm">
                  <label className="text-gray-700">
                    我已阅读并同意{' '}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-500"
                      target="_blank"
                    >
                      服务条款
                    </Link>
                    {' '}和{' '}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-500"
                      target="_blank"
                    >
                      隐私政策
                    </Link>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                注册账户
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

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账户？{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <Link
            to="/redeem"
            className="text-primary-600 hover:text-primary-500 text-sm"
          >
            有兑换码？点击兑换
          </Link>
          <br />
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