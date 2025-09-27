import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  DollarSign, 
  Share2, 
  QrCode, 
  Copy, 
  TrendingUp,
  Calendar,
  Gift
} from 'lucide-react'
import { referralApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, copyToClipboard } from '@/lib/utils'
import { ReferralCommission } from '@/types'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import QRCode from 'qrcode'

export default function ReferralPage() {
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const response = await referralApi.getStats()
      return response.data.data
    },
  })

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ['referral-commissions'],
    queryFn: async () => {
      const response = await referralApi.getCommissions()
      return response.data.data as ReferralCommission[]
    },
  })

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const response = await referralApi.getReferrals()
      return response.data.data
    },
  })

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code}`

  const handleCopyLink = () => {
    copyToClipboard(referralLink)
      .then(() => toast.success('推广链接已复制到剪贴板'))
      .catch(() => toast.error('复制失败'))
  }

  const handleShowQR = async () => {
    try {
      const url = await QRCode.toDataURL(referralLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(url)
      setShowQRModal(true)
    } catch (error) {
      toast.error('生成二维码失败')
    }
  }

  const handleWithdraw = () => {
    // Navigate to withdrawal page
    window.location.href = '/user/withdraw'
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">推广中心</h1>
        <p className="text-gray-600">邀请朋友注册，获得丰厚佣金奖励</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">推荐用户</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalReferrals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalCommission || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月佣金</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyCommission || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">可提现</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(user?.commission_balance || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            推广工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的推广码
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg font-mono text-lg">
                {user?.referral_code}
              </code>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(user?.referral_code || '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推广链接
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
              <Button
                variant="outline"
                onClick={handleShowQR}
              >
                <QrCode className="w-4 h-4 mr-1" />
                二维码
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">推广奖励规则</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 好友通过您的推广链接注册并首次购买，您可获得 10% 佣金</li>
              <li>• 佣金将在好友付款成功后 24 小时内到账</li>
              <li>• 最低提现金额为 ¥100，支持支付宝提现</li>
              <li>• 推广活动长期有效，多推多得</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            佣金提现
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">可提现余额</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(user?.commission_balance || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                最低提现金额：¥100
              </p>
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={(user?.commission_balance || 0) < 100}
            >
              申请提现
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            最近佣金
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : commissions && commissions.length > 0 ? (
            <div className="space-y-4">
              {commissions.slice(0, 5).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      推荐佣金
                    </p>
                    <p className="text-sm text-gray-600">
                      佣金比例: {commission.commission_rate}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(commission.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-success-600">
                      +{formatCurrency(commission.commission_amount)}
                    </p>
                    <Badge
                      variant={
                        commission.status === 1 ? 'success' :
                        commission.status === 2 ? 'default' : 'warning'
                      }
                    >
                      {commission.status === 1 ? '已结算' :
                       commission.status === 2 ? '已提现' : '待结算'}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  查看全部佣金记录
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无佣金记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            推荐用户
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : referrals && referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.slice(0, 5).map((referral: any) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {referral.username || referral.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      注册时间: {formatDate(referral.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={referral.status === 1 ? 'success' : 'secondary'}
                    >
                      {referral.status === 1 ? '活跃' : '未激活'}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  查看全部推荐用户
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无推荐用户</p>
              <p className="text-sm text-gray-400 mt-2">
                分享您的推广链接，邀请朋友注册获得佣金
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="推广二维码"
      >
        <div className="text-center space-y-4">
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="推广二维码"
              className="mx-auto border rounded-lg"
            />
          )}
          <p className="text-sm text-gray-600">
            扫描二维码或分享给朋友注册
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const link = document.createElement('a')
                link.download = 'referral-qr.png'
                link.href = qrCodeUrl
                link.click()
              }}
            >
              下载二维码
            </Button>
            <Button
              className="flex-1"
              onClick={handleCopyLink}
            >
              复制链接
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}