import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Введите email и пароль' }, { status: 400 });
    }

    // Ищем пользователя (или по email, или можно по username докрутить)
    // Здесь упрощенно считаем, что логин = email. 
    // Если хочешь вход по username ИЛИ email, логика чуть сложнее (OR).
    const user = await prisma.user.findUnique({
      where: { email }, // Prisma требует уникальное поле
    });

    if (!user) {
      return NextResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
    }

    // Сверяем пароль
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ message: 'Неверный email или пароль' }, { status: 401 });
    }

    // ВАЖНО: В реальном продакшене здесь нужно выдавать JWT токен или куку session.
    // Пока для MVP вернем просто успешный ответ и данные юзера,
    // а фронт сохранит это в localStorage (простой вариант).
    
    return NextResponse.json({
      message: 'Успешный вход',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
