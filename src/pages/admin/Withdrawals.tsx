import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

interface Withdrawal {
  id: number
  user_id: number
  user_email: string
  user_name: string
  amount: number
  payment_method: string
  payment_account: string
  real_name: string
  status: number
  admin_note?: string
  created_at: string
  processed_at?: string
}

const statusMap = {
  0: { label: '待处理', color: 'yellow' },
  1: { label: '已完成', color: 'green' },
  2: { label: '已拒绝', color: 'red' }
}

export default function AdminWithdrawals() {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processStatus, setProcessStatus] = useState<number>(1)
  const [adminNote, setAdminNote] = useState('')
  const [page, setPage] = useState(1)

  const queryClient = useQueryClient()

  const { data: withdrawalsData, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', page, selectedStatus],
    queryFn: () => financeApi.getWithdrawals({
      page,
      limit: 20,
      status: selectedStatus || undefined
    })
  })

  const processWithdrawalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: number; admin_note?: string } }) =>
      financeApi.processWithdrawal(id, data),
    onSuccess: () => {
      toast.success('提现处理成功')
      setShowProcessModal(false)
      setSelectedWithdrawal(null)
      setAdminNote('')
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '处理失败')
    }
  })

  const handleProcess = () => {
    if (!selectedWithdrawal) return

    processWithdrawalMutation.mutate({
      id: selectedWithdrawal.id,
      data: {
        status: processStatus,
        admin_note: adminNote || undefined
      }
    })
  }

  const openProcessModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setProcessStatus(1)
    setAdminNote('')
    setShowProcessModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const withdrawals = withdrawalsData?.data?.data?.withdrawals || []
  const pagination = withdrawalsData?.data?.data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">提现管理</h1>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">状态筛选:</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1 border rounded-md"
          >
            <option value="">全部</option>
            <option value="0">待处理</option>
            <option value="1">已完成</option>
            <option value="2">已拒绝</option>
          </select>
        </div>
      </Card>

      {/* Withdrawals List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">用户</th>
                <th className="text-left p-4">金额</th>
                <th className="text-left p-4">支付方式</th>
                <th className="text-left p-4">收款账户</th>
                <th className="text-left p-4">真实姓名</th>
                <th className="text-left p-4">状态</th>
                <th className="text-left p-4">申请时间</th>
                <th className="text-left p-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal: Withdrawal) => (
                <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{withdrawal.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{withdrawal.user_name || '未设置'}</div>
                      <div className="text-sm text-gray-500">{withdrawal.user_email}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">¥{withdrawal.amount.toFixed(2)}</td>
                  <td className="p-4">{withdrawal.payment_method}</td>
                  <td className="p-4">{withdrawal.payment_account}</td>
                  <td className="p-4">{withdrawal.real_name}</td>
                  <td className="p-4">
                    <Badge color={statusMap[withdrawal.status as keyof typeof statusMap].color}>
                      {statusMap[withdrawal.status as keyof typeof statusMap].label}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {withdrawal.status === 0 && (
                      <Button
                        size="sm"
                        onClick={() => openProcessModal(withdrawal)}
                      >
                        处理
                      </Button>
                    )}
                    {withdrawal.status !== 0 && (
                      <span className="text-sm text-gray-500">已处理</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-600">
              第 {page} 页，共 {pagination.totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </Card>

      {/* Process Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title="处理提现申请"
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">提现信息</h3>
              <div className="space-y-2 text-sm">
                <div>用户: {selectedWithdrawal.user_email}</div>
                <div>金额: ¥{selectedWithdrawal.amount.toFixed(2)}</div>
                <div>支付方式: {selectedWithdrawal.payment_method}</div>
                <div>收款账户: {selectedWithdrawal.payment_account}</div>
                <div>真实姓名: {selectedWithdrawal.real_name}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">处理结果</label>
              <select
                value={processStatus}
                onChange={(e) => setProcessStatus(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={1}>批准</option>
                <option value={2}>拒绝</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">备注</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="请输入处理备注..."
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowProcessModal(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleProcess}
                loading={processWithdrawalMutation.isPending}
              >
                确认处理
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}