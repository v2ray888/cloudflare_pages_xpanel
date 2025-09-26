import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return formatDate(date)
  }
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateOrderNo(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${timestamp}${random}`
}

export function generateReferralCode(): string {
  return generateRandomString(8).toUpperCase()
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function getStatusText(status: number, type: 'order' | 'user' | 'subscription' | 'redemption' | 'commission'): string {
  switch (type) {
    case 'order':
      switch (status) {
        case 0: return '待支付'
        case 1: return '已支付'
        case 2: return '已取消'
        case 3: return '已退款'
        default: return '未知'
      }
    case 'user':
      switch (status) {
        case 0: return '已禁用'
        case 1: return '正常'
        default: return '未知'
      }
    case 'subscription':
      switch (status) {
        case 0: return '已过期'
        case 1: return '有效'
        case 2: return '已暂停'
        default: return '未知'
      }
    case 'redemption':
      switch (status) {
        case 0: return '未使用'
        case 1: return '已使用'
        case 2: return '已过期'
        default: return '未知'
      }
    case 'commission':
      switch (status) {
        case 0: return '待结算'
        case 1: return '已结算'
        case 2: return '已提现'
        default: return '未知'
      }
    default:
      return '未知'
  }
}

export function getStatusColor(status: number, type: 'order' | 'user' | 'subscription' | 'redemption' | 'commission'): string {
  switch (type) {
    case 'order':
      switch (status) {
        case 0: return 'text-warning-600 bg-warning-50'
        case 1: return 'text-success-600 bg-success-50'
        case 2: return 'text-secondary-600 bg-secondary-50'
        case 3: return 'text-error-600 bg-error-50'
        default: return 'text-secondary-600 bg-secondary-50'
      }
    case 'user':
      switch (status) {
        case 0: return 'text-error-600 bg-error-50'
        case 1: return 'text-success-600 bg-success-50'
        default: return 'text-secondary-600 bg-secondary-50'
      }
    case 'subscription':
      switch (status) {
        case 0: return 'text-error-600 bg-error-50'
        case 1: return 'text-success-600 bg-success-50'
        case 2: return 'text-warning-600 bg-warning-50'
        default: return 'text-secondary-600 bg-secondary-50'
      }
    case 'redemption':
      switch (status) {
        case 0: return 'text-primary-600 bg-primary-50'
        case 1: return 'text-success-600 bg-success-50'
        case 2: return 'text-error-600 bg-error-50'
        default: return 'text-secondary-600 bg-secondary-50'
      }
    case 'commission':
      switch (status) {
        case 0: return 'text-warning-600 bg-warning-50'
        case 1: return 'text-success-600 bg-success-50'
        case 2: return 'text-primary-600 bg-primary-50'
        default: return 'text-secondary-600 bg-secondary-50'
      }
    default:
      return 'text-secondary-600 bg-secondary-50'
  }
}

export function calculateDaysRemaining(endDate: string): number {
  const now = new Date()
  const end = new Date(endDate)
  const diffInMs = end.getTime() - now.getTime()
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.min((used / total) * 100, 100)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    document.body.prepend(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
    } catch (error) {
      console.error('Failed to copy text: ', error)
      throw error
    } finally {
      textArea.remove()
    }
    
    return Promise.resolve()
  }
}