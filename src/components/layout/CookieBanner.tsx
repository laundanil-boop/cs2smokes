'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import Link from 'next/link'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Показываем баннер с небольшой задержкой для плавности
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl p-3">
        <div className="flex items-center gap-3">
          {/* Иконка */}
          <Cookie className="w-4 h-4 text-cs2-accent flex-shrink-0" />

          {/* Текст */}
          <p className="text-gray-400 text-xs leading-snug flex-1">
            Мы используем cookie для работы авторизации и улучшения опыта.{' '}
            <Link href="/privacy" className="text-cs2-accent hover:underline">
              Подробнее
            </Link>
          </p>

          {/* Кнопка */}
          <button
            onClick={handleAccept}
            className="flex-shrink-0 px-3 py-1.5 bg-cs2-accent hover:bg-cs2-accent/90 text-white font-medium rounded-md transition-colors text-xs"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}
