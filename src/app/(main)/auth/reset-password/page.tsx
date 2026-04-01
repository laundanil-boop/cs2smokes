'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail } from 'lucide-react'
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

const resetRequestSchema = z.object({
  email: z.string().email('Некорректный email'),
})

type ResetRequestForm = z.infer<typeof resetRequestSchema>

export default function ResetPasswordRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetRequestForm>({
    resolver: zodResolver(resetRequestSchema),
  })

  const onSubmit = async (data: ResetRequestForm) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Ошибка')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md bg-cs2-gray border-cs2-light">
          <CardHeader className="space-y-1 text-center">
            <Mail className="mx-auto h-12 w-12 text-cs2-accent" />
            <CardTitle className="text-2xl font-bold">Проверьте почту</CardTitle>
            <CardDescription>
              Если пользователь с таким email существует, вы получите письмо для сброса пароля
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Письмо действительно в течение 1 часа.</p>
            <p className="mt-4">
              Не получили письмо? Проверьте папку «Спам» или{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-cs2-accent hover:underline"
              >
                попробуйте ещё раз
              </button>
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                Вернуться ко входу
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md bg-cs2-gray border-cs2-light">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Сброс пароля</CardTitle>
          <CardDescription>
            Введите email для получения инструкции по сбросу пароля
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
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
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
              Отправить инструкцию
            </Button>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                Вернуться ко входу
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
