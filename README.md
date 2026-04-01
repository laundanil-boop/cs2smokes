# CS2Smokes - Гранатные лайнапы для Counter-Strike 2

Веб-приложение для просмотра и загрузки гранатных лайнапов для CS2. Аналог cs2tricks.com.

## 🚀 Технологии

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **База данных:** PostgreSQL + Prisma ORM
- **Аутентификация:** Iron Session
- **Видео:** YouTube API / React Player
- **UI компоненты:** Radix UI, shadcn/ui

## 📁 Структура проекта

```
cs2smokes/
├── prisma/
│   ├── schema.prisma          # Схема базы данных
│   └── seed.ts                # Seed данные
├── src/
│   ├── app/
│   │   ├── (main)/            # Основное приложение
│   │   │   ├── page.tsx       # Главная страница
│   │   │   ├── maps/
│   │   │   │   ├── page.tsx   # Список карт
│   │   │   │   └── [map]/
│   │   │   │       └── page.tsx  # Страница карты
│   │   │   ├── lineups/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Страница лайнапа
│   │   │   ├── upload/
│   │   │   │   └── page.tsx   # Загрузка лайнапа
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx   # Избранное
│   │   │   ├── profile/
│   │   │   │   └── page.tsx   # Профиль
│   │   │   ├── search/
│   │   │   │   └── page.tsx   # Поиск
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       └── register/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── logout/
│   │   │   │   └── me/
│   │   │   ├── lineups/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── maps/
│   │   │   │   └── route.ts
│   │   │   ├── user/
│   │   │   │   └── favorites/
│   │   │   │       └── route.ts
│   │   │   └── search/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── skeleton.tsx
│   │   ├── lineups/
│   │   │   ├── LineupCard.tsx
│   │   │   ├── LineupFilters.tsx
│   │   │   └── VideoPlayer.tsx
│   │   └── maps/
│   │       └── MapCard.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── session.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🗄️ Схема базы данных

```prisma
User
├── id, email, username, password
├── lineups, favorites, sessions

Map
├── id, name, displayName, imageUrl, description
└── lineups

Lineup
├── id, title, description
├── mapId, grenadeType, side, difficulty
├── youtubeId, thumbnailUrl
├── position, lineups (JSON)
├── views, userId
└── favorites, comments, tags

Favorite
├── id, userId, lineupId
└── createdAt

Comment
├── id, content, userId, lineupId
└── createdAt, updatedAt

Tag
├── id, name
└── lineups (many-to-many)
```

## 🔌 API Endpoints

### Аутентификация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |

### Лайнапы
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/lineups` | Список лайнапов (с фильтрами) |
| POST | `/api/lineups` | Создать лайнап |
| GET | `/api/lineups/:id` | Получить лайнап |
| PATCH | `/api/lineups/:id` | Обновить лайнап |
| DELETE | `/api/lineups/:id` | Удалить лайнап |

### Карты
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/maps` | Список всех карт |

### Избранное
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/user/favorites` | Получить избранное |
| POST | `/api/user/favorites` | Добавить в избранное |
| DELETE | `/api/user/favorites` | Удалить из избранного |

### Поиск
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/search?q=` | Поиск лайнапов и карт |

## 🛠️ Установка и запуск

### 1. Установка зависимостей
```bash
cd cs2smokes
npm install
```

### 2. Настройка базы данных
```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Отредактируйте DATABASE_URL в .env
DATABASE_URL="postgresql://user:password@localhost:5432/cs2smokes?schema=public"

# Запустите миграции
npx prisma migrate dev

# Запустите seed данные
npm run db:seed
```

### 3. Запуск разработки
```bash
npm run dev
```

Приложение доступно по адресу: http://localhost:3000

## 🎮 Карты

Поддерживаемые карты:
- Mirage
- Dust II
- Inferno
- Nuke
- Overpass
- Ancient
- Anubis

## 🔑 Типы гранат

- **Smoke** - Дымовые гранаты
- **Molotov** - Коктейли Молотова
- **Flash** - Световые гранаты
- **HE** - Осколочные гранаты

## 📝 Демо аккаунт

После запуска seed данных:
- Email: `demo@cs2smokes.com`
- Пароль: `demo123`

## 🎨 Особенности дизайна

- Тёмная тема в стиле CS2
- Адаптивный дизайн для мобильных устройств
- Кастомные цвета для типов гранат
- Анимации при наведении и загрузке

## 📄 Лицензия

MIT

---

**Not affiliated with Valve Corporation.** Counter-Strike is a registered trademark of Valve Corporation.
