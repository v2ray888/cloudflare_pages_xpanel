import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'info' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
  
  const variantClasses = {
    default: 'bg-primary-100 text-primary-800 border border-primary-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'border border-gray-300 text-gray-700',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    destructive: 'bg-red-100 text-red-800 border border-red-200',
  }
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}