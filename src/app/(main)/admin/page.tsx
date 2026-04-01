'use client'

import Link from 'next/link'
import { Users, MessageSquare, Crown, ClipboardList, Zap, Tag, Mic, TrendingUp, Mail, CheckCircle, Map, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Админ-панель</h1>
        <p className="text-muted-foreground">
          Управление картами, позициями и пользователями
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Карты */}
        <Link href="/admin/maps">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
                  <Map className="w-6 h-6 text-cs2-accent" />
                </div>
                <h3 className="text-xl font-semibold">Карты</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Добавление и удаление карт
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Premium */}
        <Link href="/admin/premium">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-yellow-500 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold">Premium</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Выдача Premium подписки пользователям
              </p>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" variant="default" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Тактические раунды */}
        <Link href="/admin/tactical">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-cs2-accent" />
                </div>
                <h3 className="text-xl font-semibold">Тактические раунды</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Управление тактическими раундами
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Секретные гранаты */}
        <Link href="/admin/secret">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cs2-accent" />
                </div>
                <h3 className="text-xl font-semibold">Секретные гранаты</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Управление секретными гранатами
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Пользователи */}
        <Link href="/admin/users">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Пользователи</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Управление пользователями, роли, баны
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Комментарии */}
        <Link href="/admin/comments">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Комментарии</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Модерация комментариев, удаление спама
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-8">Маркетинг</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Промокоды */}
        <Link href="/admin/promo-codes">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">Промокоды</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Создание и управление промокодами
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Промокоды блогеров */}
        <Link href="/admin/blogger-promo-codes">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold">Промокоды блогеров</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Персональные промокоды для партнеров
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Партнерская программа */}
        <Link href="/admin/partners">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold">Партнерская</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Статистика рефералов и промокодов
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-8">Обратная связь</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Модерация лайнапов */}
        <Link href="/admin/moderation">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Модерация</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Проверка пользовательских лайнапов
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Сообщения */}
        <Link href="/admin/messages">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Сообщения</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Управление обращениями пользователей
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4 mt-8">Лайнапы</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Управление лайнапами */}
        <Link href="/admin/lineups">
          <Card className="bg-cs2-gray border-cs2-light overflow-hidden hover:border-cs2-accent transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold">Все лайнапы</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Просмотр и удаление любых лайнапов
              </p>
              <Button className="w-full" variant="outline" size="sm">
                Управление
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
