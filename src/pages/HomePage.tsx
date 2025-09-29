import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Zap, Globe, Users, Star, CheckCircle, Lock, Server } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: '军用级加密',
      description: '采用AES-256加密技术，保护您的网络隐私安全',
    },
    {
      icon: Zap,
      title: '极速连接',
      description: '全球优质节点，提供稳定高速的网络体验',
    },
    {
      icon: Globe,
      title: '全球节点',
      description: '覆盖全球主要国家和地区，随时随地畅享网络',
    },
    {
      icon: Users,
      title: '多设备支持',
      description: '支持Windows、Mac、iOS、Android等多平台',
    },
    {
      icon: Lock,
      title: '隐私保护',
      description: '严格的零日志政策，确保您的隐私安全',
    },
    {
      icon: Server,
      title: '稳定服务',
      description: '99.9%在线时间保证，提供稳定可靠的服务',
    },
  ]

  const testimonials = [
    {
      name: '张先生',
      role: '企业用户',
      content: '使用XPanel已经一年多了，速度稳定，客服响应及时，非常满意！',
      rating: 5,
    },
    {
      name: '李女士',
      role: '个人用户',
      content: '界面简洁易用，连接速度很快，价格也很合理，推荐给朋友们！',
      rating: 5,
    },
    {
      name: '王先生',
      role: '开发者',
      content: '作为程序员经常需要访问国外资源，XPanel帮了大忙，值得信赖！',
      rating: 5,
    },
  ]

  const stats = [
    { label: '全球用户', value: '50,000+' },
    { label: '服务器节点', value: '100+' },
    { label: '覆盖国家', value: '30+' },
    { label: '在线时长', value: '99.9%' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              安全快速的
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                VPN服务
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto animate-slide-up">
              保护您的网络隐私，畅享全球互联网。军用级加密，全球优质节点，24/7技术支持。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100" asChild>
                <Link to="/plans">
                  立即开始
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600" asChild>
                <Link to="/redeem">
                  兑换码
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="text-center stat-card">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2 stat-value">
                  {stat.value}
                </div>
                <div className="text-gray-600 stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择XPanel？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们致力于为用户提供最安全、最快速、最稳定的VPN服务体验
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 flex-grow">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              简单三步，畅享安全网络
            </h2>
            <p className="text-xl text-gray-600">
              快速开始您的安全网络之旅
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">注册账户</h3>
              <p className="text-gray-600">
                创建您的XPanel账户，只需几秒钟即可完成
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">选择套餐</h3>
              <p className="text-gray-600">
                根据需求选择合适的套餐，支持多种支付方式
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">开始使用</h3>
              <p className="text-gray-600">
                下载客户端，连接任意节点，畅享安全网络
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              用户评价
            </h2>
            <p className="text-xl text-gray-600">
              看看我们的用户怎么说
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备开始了吗？
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            立即注册XPanel，享受安全快速的网络体验。30天无理由退款保证。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center footer-cta">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 footer-cta-button" asChild>
              <Link to="/register">
                免费注册
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 footer-cta-button" asChild>
              <Link to="/plans">
                查看套餐
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}