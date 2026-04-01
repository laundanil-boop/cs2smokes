# Деплой CS2Smokes на Vercel

## Быстрый старт

### 1. Установка Vercel CLI
```bash
npm i -g vercel
```

### 2. Логин в Vercel
```bash
vercel login
```

### 3. Инициализация проекта
```bash
cd cs2smokes
vercel link
```
Или создайте новый проект:
```bash
vercel
```

### 4. Настройка переменных окружения

Добавьте переменные окружения в Vercel:

```bash
vercel env add DATABASE_URL
# Вставьте ваш Neon PostgreSQL URL:
# postgresql://neondb_owner:npg_your_password@ep-your-endpoint-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require

vercel env add IRON_SESSION_PASSWORD
# Минимум 32 символа

vercel env add YOUTUBE_API_KEY
# Опционально

vercel env add NEXT_PUBLIC_APP_URL
# https://your-project.vercel.app

vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_SECURE
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add SMTP_FROM_EMAIL
```

Или добавьте через веб-интерфейс: https://vercel.com/dashboard

### 5. Деплой

**Development деплой:**
```bash
vercel
```

**Production деплой:**
```bash
vercel --prod
```

## Автоматический деплой через GitHub

1. Запушьте код в GitHub репозиторий
2. Подключите репозиторий в Vercel Dashboard
3. Vercel будет автоматически деплоить при каждом push

## Настройки Vercel

### Build Settings

- **Framework Preset:** Next.js
- **Root Directory:** `./cs2smokes`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Environment Variables (обязательно)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Ваш Neon PostgreSQL URL |
| `IRON_SESSION_PASSWORD` | 32+ символов |
| `NEXT_PUBLIC_APP_URL` | URL вашего приложения |
| `SMTP_*` | Настройки почты (опционально) |

## Prisma в production

Vercel автоматически выполнит `prisma generate` при сборке.

Для применения миграций в production:
```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Полезные команды

```bash
# Проверка статуса
vercel ls

# Просмотр логов
vercel logs

# Локальный запуск production сборки
vercel dev

# Удаление деплоя
vercel rm <deployment-url>
```

## Ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
