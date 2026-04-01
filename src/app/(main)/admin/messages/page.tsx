'use client'

import { useState, useEffect } from 'react'
import { Mail, Reply, Trash2, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/Toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  adminReply: string | null
  createdAt: Date
  updatedAt: Date
}

export default function AdminMessagesPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const response = await fetch('/api/admin/contact')
      const result = await response.json()

      if (result.success) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessage.id,
          reply: replyText,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ответ отправлен')
        setReplyOpen(false)
        setReplyText('')
        setSelectedMessage(null)
        fetchMessages()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Ошибка при отправке')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сообщение?')) return

    try {
      const response = await fetch('/api/admin/contact', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Сообщение удалено')
        fetchMessages()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Ошибка при удалении')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REPLIED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает'
      case 'REPLIED':
        return 'Отвечено'
      case 'CLOSED':
        return 'Закрыто'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cs2-accent" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-cs2-accent/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-cs2-accent" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Сообщения</h1>
        </div>
        <p className="text-muted-foreground">
          Управление обращениями пользователей
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Входящие ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Сообщений нет
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-cs2-light/50 hover:bg-cs2-light transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{msg.name}</p>
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-cs2-darker">
                        {getStatusIcon(msg.status)}
                        {getStatusLabel(msg.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.email}</p>
                    <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMessage(msg)
                        setReplyText(msg.adminReply || '')
                        setReplyOpen(true)
                      }}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог ответа */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ответ пользователю</DialogTitle>
            <DialogDescription>
              Заполните форму для ответа
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-cs2-light/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">От:</span>
                  <span>{selectedMessage.name}</span>
                  <span className="text-muted-foreground">&lt;{selectedMessage.email}&gt;</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Тема:</span>
                  <span className="ml-2">{selectedMessage.subject}</span>
                </div>
                <div className="pt-2 border-t border-cs2-light">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ваш ответ</label>
                <Textarea
                  placeholder="Введите ваш ответ..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Отправить ответ
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
