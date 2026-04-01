'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/contexts/UserContext'

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email или имя пользователя обязательны'),
  password: z.string().min(1, 'Пароль обязателен'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // Обновляем контекст пользователя
        await refreshUser()
        // Отправляем событие для Header
        window.dispatchEvent(new CustomEvent('auth-change'))
        router.push('/')
      } else {
        setError(result.error || 'Ошибка входа')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md bg-cs2-gray border-cs2-light">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Вход</CardTitle>
          <CardDescription>
            Введите свои данные для входа в аккаунт
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="emailOrUsername" className="text-sm font-medium">
                Email или имя пользователя
              </label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="name@example.com или username"
                {...register('emailOrUsername')}
                disabled={loading}
              />
              {errors.emailOrUsername && (
                <p className="text-sm text-destructive">{errors.emailOrUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="cs2"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
            <div className="flex flex-col items-center space-y-2 w-full">
              <Link
                href="/auth/reset-password"
                className="text-sm text-cs2-accent hover:underline"
              >
                Забыли пароль?
              </Link>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link
                  href="/auth/register"
                  className="text-cs2-accent hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
