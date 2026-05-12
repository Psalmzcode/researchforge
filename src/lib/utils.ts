import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatCurrency(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function generateInvoiceNumber() {
  return `INV-${Date.now().toString().slice(-6)}`
}

export function getDashboardPath(role: string) {
  const map: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    CLIENT: '/dashboard/client',
    RESEARCHER: '/dashboard/researcher',
    FINANCE: '/dashboard/finance',
  }
  return map[role] || '/dashboard/client'
}
