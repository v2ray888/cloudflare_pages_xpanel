import { Link } from 'react-router-dom'
import { Home, ShoppingBag, Download, User, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'

export function MobileNav() {
  const { user } = useAuth()
  
  const navItems = [
    { name: '首页', href: '/', icon: Home },
    { name: '套餐', href: '/plans', icon: ShoppingBag },
    { name: '兑换', href: '/redeem', icon: Download },
  ]
  
  const userItems = [
    { name: '用户中心', href: '/user/dashboard', icon: User },
    { name: '管理后台', href: '/admin/dashboard', icon: Shield, adminOnly: true },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mobile-nav">
      <div className="grid grid-cols-5 gap-1">
        {/* Public navigation */}
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
        
        {/* User navigation */}
        {user ? (
          <>
            {userItems.map((item) => {
              // Skip admin items if user is not admin
              if (item.adminOnly && user.role !== UserRole.ADMIN) return null
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.name}</span>
                </Link>
              )
            })}
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">登录</span>
            </Link>
            <Link
              to="/register"
              className="flex flex-col items-center justify-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">注册</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}