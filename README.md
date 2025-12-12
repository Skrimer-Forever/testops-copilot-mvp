Понял проблему! Вот готовый файл, который можно скопировать целиком без кавычек и блоков - просто весь текст как есть:

---

# TestOps Copilot MVP

AI-ассистент для тестирования с интеграцией в бэкенд TestOps. Веб-интерфейс на Next.js с поддержкой чатов, прикрепления кода и анализа тестов.

## Технологический стек

- **Frontend**: Next.js 16, React 19, TypeScript
    
- **UI**: Tailwind CSS 4, Radix UI, Framer Motion, GSAP
    
- **Database**: PostgreSQL/SQLite (Prisma ORM)
    
- **3D**: Three.js, React Three Fiber
    
- **Deployment**: PM2, Docker
    

## Системные требования

- Node.js 18+
    
- npm 9+
    
- PostgreSQL 14+ (опционально SQLite для dev)
    

## Установка

## Клонирование репозитория

`git clone https://github.com/Skrimer-Forever/testops-copilot-mvp.git cd testops-copilot-mvp`

## Установка зависимостей


`npm install`

## Настройка окружения

Создай `.env` файл с переменными:

- **DATABASE_URL** - подключение к БД (PostgreSQL: `postgresql://user:pass@localhost:5432/db` или SQLite: `file:./prisma/dev.db`)
    
- **NEXT_PUBLIC_BACKEND_URL** - URL бэкенда TestOps (например: `http://176.123.161.105:8000`)
    

## Инициализация базы данных


`npx prisma migrate deploy npx prisma generate`

## Сборка проекта

`npm run build`

## Запуск

## Development режим


`npm run dev`

Приложение доступно на [http://localhost:3000](http://localhost:3000/)

## Production с PM2


`pm2 start npm --name "testops-copilot" -- start pm2 save pm2 startup`

## Docker


`docker build -t testops-copilot . docker run -d --name testops-app -p 3000:3000 -e DATABASE_URL="postgresql://..." -e NEXT_PUBLIC_BACKEND_URL="http://..." testops-copilot`

## API Endpoints

## Чаты

- **GET** `/api/chats?userId=1` - получить все чаты пользователя
    
- **POST** `/api/chats` - создать чат (body: `{"userId": 1, "title": "Новый чат"}`)
    
- **DELETE** `/api/chats?chatId=abc123` - удалить чат
    

## Сообщения

- **GET** `/api/messages?chatId=abc123` - получить все сообщения чата
    
- **POST** `/api/messages` - создать сообщение (body: `{"chatId": "abc123", "role": "user", "content": "Текст", "attachedCode": "code", "attachedFileName": "test.py"}`)
    

## Database Schema

**User**: id, email (unique), username, password, chats[]

**Chat**: id, title, userId (FK), messages[]

**Message**: id, role, content, chatId (FK), attachedCode?, attachedFileName?

## Управление PM2


`pm2 logs testops-copilot pm2 status pm2 restart testops-copilot pm2 stop testops-copilot`

## Troubleshooting

## Build ошибки


`npx prisma generate rm -rf .next node_modules npm install`

## Database миграции


`npx prisma migrate reset npx prisma migrate deploy`

## Production Deployment

1. Настрой `.env` с production URL
    
2. Примени миграции: `npx prisma migrate deploy`
    
3. Собери проект: `npm run build`
    
4. Запусти PM2: `pm2 start npm --name testops-copilot -- start`
    
5. Сохрани конфиг: `pm2 save && pm2 startup`
    

## .env
DATABASE_URL="postgresql://testops_user:3323@localhost:5432/testops_db?schema=public"
NEXT_PUBLIC_BACKEND_URL=http://176.123.161.105:8000

## Авторы

Разработано для хакатона Cloud.ru TestOps by Skrimer-Forever and sm1ley68