'use client'

import { Shield, Database, Eye, Lock, UserCheck, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cs2-accent mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Политика конфиденциальности</h1>
          <p className="text-muted-foreground">
            Защита ваших персональных данных
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed mb-6">
                Мы уважаем вашу приватность. Эта политика объясняет, как мы собираем и используем информацию о вас при посещении сайта CS2Smokes.
              </p>

              <div className="space-y-6">
                {/* Какую информацию мы собираем */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">1. Какую информацию мы собираем</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="leading-relaxed">
                        <strong className="text-foreground">Технические данные:</strong> Когда вы заходите на сайт, мы автоматически получаем информацию о вашем браузере, IP-адресе и устройстве. Это нужно для корректной работы сайта.
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-foreground">Данные аккаунта:</strong> Если вы регистрируетесь, мы храним ваш никнейм и email (для восстановления пароля и уведомлений).
                      </li>
                      <li className="leading-relaxed">
                        <strong className="text-foreground">Cookies:</strong> Мы используем куки-файлы, чтобы запомнить ваши настройки и анализировать трафик (через Яндекс.Метрику / Google Analytics).
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Зачем нам это нужно */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">2. Зачем нам это нужно</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="leading-relaxed flex items-start gap-2">
                        <span className="text-cs2-accent mt-1">•</span>
                        Чтобы сайт открывался быстро и без ошибок.
                      </li>
                      <li className="leading-relaxed flex items-start gap-2">
                        <span className="text-cs2-accent mt-1">•</span>
                        Чтобы вы могли комментировать гайды и сохранять избранное.
                      </li>
                      <li className="leading-relaxed flex items-start gap-2">
                        <span className="text-cs2-accent mt-1">•</span>
                        Чтобы понимать, какие карты и гранаты вам интереснее всего.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Передача данных */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">3. Передача данных</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Мы не продаем и не передаем ваши личные данные третьим лицам, за исключением случаев, предусмотренных законом, или сервисам, которые помогают нам хостить сайт (хостинг-провайдер).
                    </p>
                  </div>
                </div>

                {/* Ваши права */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">4. Ваши права</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Вы можете в любой момент запросить удаление своих данных, написав нам в поддержку.
                    </p>
                  </div>
                </div>

                {/* Изменения */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-cs2-accent/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-cs2-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">5. Изменения</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Мы можем обновлять эту политику. Актуальная версия всегда находится на этой странице.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительная информация */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Контакты для вопросов по конфиденциальности</h3>
              <p className="text-muted-foreground mb-4">
                Если у вас возникли вопросы по поводу защиты ваших данных, вы можете связаться с нашей службой поддержки через форму обратной связи на странице &quot;Условия использования&quot;.
              </p>
              <p className="text-sm text-muted-foreground">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
