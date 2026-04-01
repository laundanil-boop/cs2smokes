'use client'

import { useState, useCallback } from 'react'

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = useCallback((props: ToastProps) => {
    setToast(props)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const ToastContainer = () => {
    if (!toast) return null

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`px-4 py-3 rounded-lg shadow-lg ${
          toast.variant === 'destructive'
            ? 'bg-red-500 text-white'
            : 'bg-cs2-accent text-white'
        }`}>
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
        </div>
      </div>
    )
  }

  return { toast: showToast, ToastContainer }
}
