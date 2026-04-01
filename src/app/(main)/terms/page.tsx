'use client'

import { useState } from 'react'
import { Shield, Target, Users, Copyright, AlertTriangle, Mail, Send, Loader2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/Toast'

export default function TermsPage() {
  const toast = useToast()
  const [contactOpen, setContactOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Сообщение отправлено! Мы ответим вам в ближайшее время.')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setContactOpen(false)
      } else {
        toast.error(result.error || 'Ошибка при отправке')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Ошибка при отправке сообщения')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cs2-accent mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Условия использования</h1>
          <p className="text-muted-foreground">
            Правила использования сайта CS2Smokes
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed mb-6">
                Используя этот сайт, вы соглашаетесь со следующими правилами:
              </p>

              <div className="space-y-6">
                {/* Контент */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">1. Контент</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Все гайды и раскидки предоставлены &quot;как есть&quot;. Мы стараемся проверять их актуальность, но обновления CS2 могут изменить физику гранат. Мы не гарантируем, что каждая раскидка сработает на 100% после очередного патча Valve.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      Контент на сайте предназначен только для образовательных и развлекательных целей.
                    </p>
                  </div>
                </div>

                {/* Поведение пользователей */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">2. Поведение пользователей</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Запрещено публиковать оскорбления, спам, рекламу сторонних ресурсов, читов или запрещенного софта.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      За нарушение правил администрация вправе заблокировать ваш аккаунт без предупреждения.
                    </p>
                  </div>
                </div>

                {/* Авторские права */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Copyright className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">3. Авторские права</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Материалы сайта (тексты, скриншоты, схемы) принадлежат CS2Smokes или их авторам. Копирование материалов разрешено только с указанием активной ссылки на источник.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      Counter-Strike 2 и логотипы Valve являются собственностью Valve Corporation. Мы используем их в рамках добросовестного использования (fair use) как фанатский ресурс.
                    </p>
                  </div>
                </div>

                {/* Ограничение ответственности */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">4. Ограничение ответственности</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Администрация не несет ответственности за возможные убытки или баны в игре, возникшие в результате использования советов с сайта.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      Мы не поддерживаем использование читов, скриптов и любого ПО, нарушающего правила игры Valve.
                    </p>
                  </div>
                </div>

                {/* Контакты */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">5. Контакты</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Если у вас возникли вопросы или предложения, свяжитесь с нами через форму обратной связи.
                    </p>
                    <Button
                      onClick={() => setContactOpen(true)}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Связаться с поддержкой
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалог обратной связи */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Связаться с поддержкой
            </DialogTitle>
            <DialogDescription>
              Заполните форму и мы ответим вам в ближайшее время
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ваше имя</label>
              <Input
                placeholder="Иван"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тема</label>
              <Input
                placeholder="Вопрос по сайту"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Сообщение</label>
              <Textarea
                placeholder="Опишите ваш вопрос..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setContactOpen(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
