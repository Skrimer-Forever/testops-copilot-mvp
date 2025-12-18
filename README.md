# TestOps Copilot MVP

AI-ассистент для тестирования с интеграцией в бэкенд TestOps. Веб-интерфейс на Next.js с поддержкой чатов, прикрепления кода и анализа тестов.

# TestOps Copilot MVP AI-ассистент для автоматизации тестирования с интеграцией бэкенда TestOps. 
Веб-интерфейс на Next.js с поддержкой чатов, генерации тестов и анализа кода. 
## Технологический стек
- **Frontend**: Next.js 15, React 19, TypeScript 
- **UI**: Tailwind CSS, Radix UI, Framer Motion, GSAP 
- **Database**: PostgreSQL (Prisma ORM) 
- **3D Graphics**: Three.js, React Three Fiber 
- **Deployment**: PM2, Docker, Nginx 
- ## Системные требования 
- Node.js 20+ 
- npm 9+ 
- PostgreSQL 14+ 
- ## Структура проекта

testops-copilot-mvp/  
├── app/ # Next.js App Router  
│ ├── api/ # API routes  
│ │ ├── login/ # Авторизация  
│ │ ├── register/ # Регистрация  
│ │ ├── chats/ # Управление чатами  
│ │ └── proxy/ # Прокси к TestOps API  
│ ├── layout.tsx # Root layout  
│ └── page.tsx # Главная страница  
├── components/ # React компоненты  
│ └── ui/ # UI компоненты  
├── lib/ # Утилиты и хелперы  
├── prisma/ # Database schema и миграции  
├── .env # Environment variables  
└── package.json # Dependencies


## Установка ### 
1. Клонирование репозитория

git clone [https://github.com/Skrimer-Forever/testops-copilot-mvp.git](https://github.com/Skrimer-Forever/testops-copilot-mvp.git)  
cd testops-copilot-mvp

### 2. Установка зависимостей

npm install
### 3. Настройка PostgreSQL

# Установка PostgreSQL (Ubuntu/Debian)

sudo apt update  
sudo apt install postgresql postgresql-contrib -y

# Создание базы данных

sudo -u postgres psql << 'EOF'  
CREATE DATABASE testops_db;  
CREATE USER testops_user WITH PASSWORD 'your_secure_password';  
ALTER DATABASE testops_db OWNER TO testops_user;  
GRANT ALL PRIVILEGES ON DATABASE testops_db TO testops_user;  
\q  
EOF

### 4. Настройка окружения Создайте `.env` файл:

DATABASE_URL="postgresql://testops_user:your_secure_password@localhost:5432/testops_db"

### 5. Инициализация базы данных

npx prisma migrate deploy  
npx prisma generate


### 6. Сборка проекта

npm run build

## Запуск 
### Development режим

npm run dev

Приложение доступно на `http://localhost:3000
### Production с PM2``

pm2 start npm --name "testops-copilot" -- start  
pm2 save  
pm2 startup

### Docker

docker build -t testops-copilot .  
docker run -d  
--name testops-app  
-p 3000:3000  
-e DATABASE_URL="postgresql://testops_user:password@host:5432/testops_db"  
testops-copilot

## API Endpoints 
### Авторизация 
- **POST** `/api/login` - Вход (body: `{"email": "user@example.com", "password": "pass"}`) - **POST** `/api/register` - Регистрация (body: `{"email": "user@example.com", "password": "pass", "username": "User"}`)
- ### Чаты 
- **GET** `/api/chats?userId=1` - Получить все чаты пользователя
- **POST** `/api/chats` - Создать чат (body: `{"userId": 1, "title": "Новый чат"}`)
- **GET** `/api/chats/[id]` - Получить сообщения чата 
- **POST** `/api/chats/[id]` - Добавить сообщение (body: `{"role": "user", "content": "Текст", "attachedCode": "code", "attachedFileName": "test.py"}`) ### Прокси к TestOps API 
- **POST** `/api/proxy/chat` - LLM чат
- **POST** `/api/proxy/api-swagger` - Генерация тестов из Swagger 
- **POST** `/api/proxy/e2e-automation` - E2E автотесты 
- **POST** `/api/proxy/api-automation` - API автотесты
- **POST** `/api/proxy/ui-cases` - UI тест-кейсы из требований 
- ## Database Schema 
- ### User 
- `id` (Int, PK) 
- `email` (String, unique) 
- `username` (String, optional)
- `password` (String, hashed) 
- `createdAt` (DateTime) 
- `chats` (Chat[]) 
- ### Chat 
- `id` (String, PK) 
- `title` (String)
- `userId` (Int, FK)
- `createdAt` (DateTime)
- `messages` (Message[])
- ### Message 
- `id` (String, PK) 
- `role` (String: "user" | "assistant")
- `content` (String) 
- `chatId` (String, FK)
- `attachedCode` (String, optional) 
- `attachedFileName` (String, optional)
- `createdAt` (DateTime) 
- ## Управление PM2``
# Логи

pm2 logs testops-copilot

# Статус

pm2 status

# Рестарт

pm2 restart testops-copilot

# Остановка

pm2 stop testops-copilot

# Удаление

pm2 delete testops-copilot

## Troubleshooting 
### Build ошибки

npx prisma generate  
rm -rf .next node_modules  
npm install  
npm run build

### Database миграции

# Сброс БД (удалит все данные!)

npx prisma migrate reset

# Применить миграции

npx prisma migrate deploy

# Просмотр БД

npx prisma studio

### Проблемы с авторизацией 
- Если ошибка "Username and password are required": - Убедитесь, что схема БД содержит поле `email` 
- Проверьте, что миграции применены: `npx prisma migrate status` 
- Пересоздайте Prisma Client: `npx prisma generate` ### 504 Gateway Timeout Если nginx возвращает 504 при AI запросах, увеличьте таймауты:``

# /etc/nginx/sites-available/default

location /api/ {  
proxy_pass [http://localhost:3000](http://localhost:3000/);  
proxy_read_timeout 300s;  
proxy_connect_timeout 300s;  
proxy_send_timeout 300s;  
}

## Production Deployment 
1. Настройте `.env` с production URL БД 
2. Примените миграции: `npx prisma migrate deploy` 
3. Соберите проект: `npm run build` 
4. Запустите PM2: `pm2 start npm --name testops-copilot -- start` 
5. Сохраните конфигурацию: `pm2 save && pm2 startup` 6. Настройте nginx как reverse proxy для порта 3000 
## Nginx Configuration``

server {  
listen 80;  
server_name your-domain.com;

location / {     proxy_pass http://localhost:3000;    proxy_http_version 1.1;    proxy_set_header Upgrade $http_upgrade;    proxy_set_header Connection 'upgrade';    proxy_set_header Host $host;    proxy_cache_bypass $http_upgrade;    proxy_read_timeout 300s;    proxy_connect_timeout 300s; }

}

## Особенности 
- **Аутентификация**: bcrypt для хеширования паролей, сессии в localStorage
- **Реал-тайм**: эффект печатной машинки для AI ответов 
- **Код-вьювер**: подсветка синтаксиса, копирование в буфер 
- **3D эффекты**: анимированный фон с шейдерами 
- **Адаптивность**: responsive дизайн для мобильных устройств 
- ## Авторы 
- Разработано для хакатона Cloud.ru TestOps 
- **Skrimer-Forever** - [GitHub](https://github.com/Skrimer-Forever) 
- **sm1ley68** - [GitHub](https://github.com/sm1ley68)