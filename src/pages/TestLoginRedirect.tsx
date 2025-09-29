import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export default function TestLoginRedirect() {
  const [loginStatus, setLoginStatus] = useState<string>('')
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // 检查用户状态变化
    if (user) {
      setLoginStatus(`已登录，用户角色: ${user.role === 1 ? '管理员' : '普通用户'}`)
      // 根据用户角色跳转到相应页面
      if (user.role === 1) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/user/dashboard', { replace: true })
      }
    } else {
      setLoginStatus('未登录')
    }
  }, [user, navigate])

  const handleTestLogin = async () => {
    setLoginStatus('登录中...')
    try {
      await login('admin@xpanel.com', 'admin123')
      setLoginStatus('登录成功')
    } catch (error) {
      setLoginStatus('登录失败: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">登录测试页面</h1>
        <p className="mb-4">当前状态: {loginStatus}</p>
        <Button onClick={handleTestLogin} className="w-full">
          测试登录
        </Button>
        {user && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p>用户信息:</p>
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}