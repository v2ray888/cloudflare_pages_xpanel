import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Star, Zap } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { plansApi } from '@/lib/api'
import { Plan } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function PlansPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await plansApi.getAll()
      return response.data.data as Plan[]
    },
  })

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    setSelectedPlan(plan)
    // 这里可以跳转到支付页面或打开支付模态框
    toast.success(`已选择 ${plan.name}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h2>
          <p className="text-gray-600">请刷新页面重试</p>
        </div>
      </div>
    )
  }

  const sortedPlans = plans?.sort((a, b) => a.sort_order - b.sort_order) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            选择适合您的套餐
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
            灵活的价格方案，满足不同用户需求。所有套餐均享受相同的高品质服务。
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.is_popular
                    ? 'ring-2 ring-primary-500 scale-105'
                    : 'hover:scale-105'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      推荐
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  {plan.description && (
                    <p className="text-gray-600">{plan.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      {plan.original_price && plan.original_price > plan.price && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatCurrency(plan.original_price)}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-primary-600">
                        {formatCurrency(plan.price)}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {plan.duration_days}天有效期
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-success-600 mr-3" />
                      <span>{plan.traffic_gb}GB 流量</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-success-600 mr-3" />
                      <span>支持 {plan.device_limit} 台设备</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-success-600 mr-3" />
                      <span>全球高速节点</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-success-600 mr-3" />
                      <span>24/7 技术支持</span>
                    </div>
                    
                    {/* Additional Features */}
                    {plan.features && plan.features.length > 0 && (
                      <>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="w-5 h-5 text-success-600 mr-3" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      variant={plan.is_popular ? 'primary' : 'outline'}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {plan.is_popular && <Zap className="w-4 h-4 mr-2" />}
                      立即购买
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              所有套餐均包含
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold mb-2">无日志政策</h4>
                <p className="text-gray-600">严格的零日志政策，保护您的隐私</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold mb-2">30天退款保证</h4>
                <p className="text-gray-600">不满意可申请全额退款</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold mb-2">多平台支持</h4>
                <p className="text-gray-600">支持所有主流操作系统和设备</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
              常见问题
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold mb-2">如何选择合适的套餐？</h4>
                <p className="text-gray-600">
                  根据您的使用频率和流量需求选择。轻度用户推荐体验套餐，重度用户推荐专业套餐。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">支持哪些支付方式？</h4>
                <p className="text-gray-600">
                  支持支付宝、微信支付、PayPal等多种支付方式，安全便捷。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">可以随时升级套餐吗？</h4>
                <p className="text-gray-600">
                  可以，您可以随时在用户中心升级到更高级的套餐，差价会自动计算。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">流量用完了怎么办？</h4>
                <p className="text-gray-600">
                  流量用完后服务会暂停，您可以购买流量包或升级到更大流量的套餐。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            还没有账户？
          </h2>
          <p className="text-xl mb-8">
            立即注册，享受专业VPN服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100" asChild>
              <Link to="/register">
                免费注册
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
              <Link to="/redeem">
                使用兑换码
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}