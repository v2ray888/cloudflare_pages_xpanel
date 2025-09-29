import { useState } from 'react'
import { authApi } from '@/lib/api'

export default function TestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await authApi.login({
        email: 'admin@xpanel.com',
        password: 'admin123'
      })
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">API 测试页面</h1>
        <p className="mb-4">API Base URL: {import.meta.env.VITE_API_BASE_URL}</p>
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          {loading ? '测试中...' : '测试登录'}
        </button>
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}