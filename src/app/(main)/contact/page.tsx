import { Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ContactPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cs2-accent mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Контакты</h1>
          <p className="text-muted-foreground">
            Свяжитесь с нами по любым вопросам
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg leading-relaxed mb-4">
                По всем вопросам пишите нам на электронную почту:
              </p>
              <a 
                href="mailto:cs2smokes@mail.ru" 
                className="text-2xl font-bold text-cs2-accent hover:underline"
              >
                cs2smokes@mail.ru
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
