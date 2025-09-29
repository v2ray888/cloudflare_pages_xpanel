import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { MobileNav } from '@/components/layout/MobileNav'

// Public pages
import HomePage from '@/pages/HomePage'
import PlansPage from '@/pages/PlansPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import RedeemPage from '@/pages/RedeemPage'
import TestPage from '@/pages/TestPage'
import TestLoginRedirect from '@/pages/TestLoginRedirect'

// User pages
import UserLayout from '@/layouts/UserLayout'
import UserDashboard from '@/pages/user/Dashboard'
import UserSubscription from '@/pages/user/Subscription'
import UserServers from '@/pages/user/Servers'
import UserReferral from '@/pages/user/Referral'
import UserOrders from '@/pages/user/Orders'
import UserProfile from '@/pages/user/Profile'
import UserWithdraw from '@/pages/user/Withdraw'

// Admin pages
import AdminLayout from '@/layouts/AdminLayout'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminPlans from '@/pages/admin/Plans'
import AdminServers from '@/pages/admin/Servers'
import AdminOrders from '@/pages/admin/Orders'
import AdminRedemption from '@/pages/admin/Redemption'
import AdminReferrals from '@/pages/admin/Referrals'
import AdminFinance from '@/pages/admin/Finance'
import AdminWithdrawals from '@/pages/admin/Withdrawals'
import AdminSettings from '@/pages/admin/Settings'
import AdminLogin from '@/pages/admin/Login'

// Layout
import PublicLayout from '@/layouts/PublicLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="redeem" element={<RedeemPage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="test-login" element={<TestLoginRedirect />} />
        </Route>

        {/* User routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="subscription" element={<UserSubscription />} />
          <Route path="servers" element={<UserServers />} />
          <Route path="referral" element={<UserReferral />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="withdraw" element={<UserWithdraw />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="servers" element={<AdminServers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="redemption" element={<AdminRedemption />} />
          <Route path="referrals" element={<AdminReferrals />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      <MobileNav />
    </AuthProvider>
  )
}

export default App