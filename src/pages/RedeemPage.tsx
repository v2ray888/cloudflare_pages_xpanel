import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gift, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { redemptionApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const redeemSchema = z.object({
  code: z.string().min(1, '请输入兑换码'),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
})

type RedeemForm = z.infer<typeof redeemSchema>

export default function RedeemPage() {
  const [redeemResult, setRedeemResult] = useState<any>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RedeemForm>({
    resolver: zodResolver(redeemSchema),
  })

  const redeemMutation = useMutation({
    mutationFn: async (data: RedeemForm) => {
      const response = await redemptionApi.redeem({
        code: data.code,
        email: data.email || undefined,
      })
      return response.data
    },
    onSuccess: (data) => {
      setRedeemResult(data)
      toast.success('兑换成功！')
      reset()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '兑换失败'
      toast.error(message)
    },
  })

  const onSubmit = (data: RedeemForm) => {
    redeemMutation.mutate(data)
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleGoToDashboard = () => {
    navigate('/user/dashboard')
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
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            兑换码兑换
          </h2>
          <p className="mt-2 text-gray-600">
            输入您的兑换码，立即获取VPN服务
          </p>
        </div>

        {/* Success Result */}
        {redeemResult && (
          <Card className="shadow-xl border-success-200 bg-success-50">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-success-800 mb-2">
                  兑换成功！
                </h3>
                <p className="text-success-700 mb-4">
                  您已成功兑换 <strong>{redeemResult.data?.plan?.name}</strong> 套餐
                </p>
                <div className="space-y-2 text-sm text-success-600">
                  <p>有效期：{redeemResult.data?.duration_days} 天</p>
                  <p>流量：{redeemResult.data?.plan?.traffic_gb} GB</p>
                  <p>设备数：{redeemResult.data?.plan?.device_limit} 台</p>
                </div>
                <div className="mt-6 space-y-2">
                  {user ? (
                    <Button
                      className="w-full"
                      onClick={handleGoToDashboard}
                    >
                      前往用户中心
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        onClick={handleGoToLogin}
                      >
                        登录账户
                      </Button>
                      <p className="text-xs text-success-600">
                        请登录账户查看您的订阅详情
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redeem Form */}
        {!redeemResult && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">输入兑换码</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Redemption Code */}
                <div>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      {...register('code')}
                      type="text"
                      placeholder="请输入兑换码"
                      className="pl-10 uppercase"
                      error={errors.code?.message}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                {/* Email (for non-logged users) */}
                {!user && (
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="邮箱地址（可选）"
                        className="pl-10"
                        error={errors.email?.message}
                        helperText="填写邮箱可将兑换结果发送给您"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  loading={redeemMutation.isPending}
                  disabled={redeemMutation.isPending}
                >
                  立即兑换
                </Button>
              </form>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">兑换说明：</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 每个兑换码只能使用一次</li>
                      <li>• 兑换码有有效期限制</li>
                      <li>• 兑换成功后服务立即生效</li>
                      <li>• 如有问题请联系客服</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Login/Register Links */}
              {!user && (
                <>
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

                  <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      已有账户？{' '}
                      <Link
                        to="/login"
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        立即登录
                      </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                      没有账户？{' '}
                      <Link
                        to="/register"
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        免费注册
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <Link
            to="/plans"
            className="text-primary-600 hover:text-primary-500 text-sm"
          >
            查看套餐价格
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