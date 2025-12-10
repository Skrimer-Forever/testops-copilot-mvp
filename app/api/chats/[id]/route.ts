import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chats/[id] - Получить сообщения
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Тип Promise
) {
  const { id } = await params; // 2. Ждем params
  
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: id }, // Используем id после await
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

// POST /api/chats/[id] - Сохранить сообщение
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Тип Promise
) {
  const { id } = await params; // 2. Ждем params

  try {
    const { role, content } = await req.json();

    const message = await prisma.message.create({
      data: {
        chatId: id, // Используем id
        role,
        content,
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error("Save message error:", error);
    return NextResponse.json({ message: 'Error saving message' }, { status: 500 });
  }
}
