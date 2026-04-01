'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, LogOut, PlusCircle, Heart, Settings, Crown, Target, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface User {
  username: string
  avatar?: string | null
  role?: string
  premium?: {
    isActive: boolean
    expiresAt: Date | null
    isLifetime: boolean
  } | null
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, refreshUser } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Подписка на событие кастомного входа/выхода
    const handleAuthChange = () => refreshUser()
    window.addEventListener('auth-change', handleAuthChange)
    return () => window.removeEventListener('auth-change', handleAuthChange)
  }, [refreshUser])

  const hasPremium = user?.premium?.isActive

  const navigation = [
    { name: 'Premium', href: '/profile?tab=premium', protected: false, premium: true },
    { name: 'Карты', href: '/maps' },
    { name: 'Тактические раунды', href: '/tactical', protected: true, premiumOnly: true, icon: Target },
    { name: 'Секретные гранаты', href: '/secret', protected: true, premiumOnly: true, icon: Zap },
    { name: 'Загрузить', href: '/upload', protected: true },
    { name: 'Избранное', href: '/favorites', protected: true },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cs2-light bg-cs2-darker/95 backdrop-blur supports-[backdrop-filter]:bg-cs2-darker/80">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cs2-accent">
              <span className="text-white font-bold text-lg">CS</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:inline-block">
              CS2Smokes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              if (item.protected && !user) return null
              if (item.premiumOnly && !hasPremium) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-cs2-accent flex items-center gap-1',
                    pathname === item.href || (item.href !== '/maps' && pathname.startsWith(item.href.split('?')[0]))
                      ? 'text-cs2-accent'
                      : 'text-muted-foreground',
                    item.premium && 'text-yellow-500 hover:text-yellow-400'
                  )}
                >
                  {item.premium && <Crown className="h-4 w-4" />}
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск лайнапов..."
                className="pl-10 bg-cs2-light border-cs2-gray"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Кнопка админ-панели (только для admin и moderator) */}
              {(user.role === 'admin' || user.role === 'moderator') && (
                <Link href="/admin">
                  <Button variant="destructive" size="sm" className="hidden lg:flex gap-2">
                    <Settings className="h-4 w-4" />
                    Админ
                  </Button>
                </Link>
              )}
              
              <Link href="/upload">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/favorites">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium hover:text-cs2-accent transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-cs2-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="hidden lg:inline-block">{user?.username || 'User'}</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="cs2" size="sm">
                  Регистрация
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cs2-light py-4">
          <nav className="flex flex-col space-y-4 px-4">
            {navigation.map((item) => {
              if (item.protected && !user) return null
              if (item.premiumOnly && !hasPremium) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-cs2-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.premium && <Crown className="h-4 w-4 text-yellow-500" />}
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              )
            })}
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground hover:text-cs2-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium text-cs2-accent hover:text-cs2-accent/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
