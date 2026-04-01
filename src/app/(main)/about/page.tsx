'use client'

import { Crown, Target, Users, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cs2-accent mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">О проекте</h1>
          <p className="text-muted-foreground">
            CS2Smokes — гранатные лайнапы для Counter-Strike 2
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                Мы — команда из пары любителей гранат в CS2, которым надоели постоянные флешки и гранаты под ноги.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                Наша задача проста: собрать базу актуальных раскидок и объединить людей, которые хотят развиваться и улучшать свой скилл.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                Именно для этого мы сделали этот проект. Мы не связаны с Valve Corporation. Сайт создан от фанатов для фанатов.
              </p>
            </CardContent>
          </Card>

          <div className="text-center py-8">
            <p className="text-2xl font-bold text-cs2-accent mb-2">
              Смотри — тренируйся — побеждай!
            </p>
            <p className="text-lg text-muted-foreground">Удачи!</p>
          </div>

          {/* Особенности проекта */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-10 w-10 text-cs2-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Точные лайнапы</h3>
                <p className="text-sm text-muted-foreground">
                  Проверенные раскидки для всех карт
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-10 w-10 text-cs2-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Сообщество</h3>
                <p className="text-sm text-muted-foreground">
                  Объединяем игроков для развития
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Crown className="h-10 w-10 text-cs2-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Premium контент</h3>
                <p className="text-sm text-muted-foreground">
                  Эксклюзивные тактики и гранаты
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
