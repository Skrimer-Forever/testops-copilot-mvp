import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chats/[id] - Получить историю
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Ждем params (Next.js 15 style)
  
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

// POST /api/chats/[id] - Сохранить сообщение
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Ждем params

  try {
    const body = await req.json();
    console.log("Saving message for chat:", id, body); // Лог для отладки

    // Извлекаем всё, включая файлы
    const { role, content, attachedCode, attachedFileName } = body;

    const message = await prisma.message.create({
      data: {
        chatId: id, 
        role,
        content,
        // Сохраняем файлы, если они есть
        attachedCode: attachedCode || null,
        attachedFileName: attachedFileName || null,
      },
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("Save message error:", error);
    return NextResponse.json({ message: 'Error saving message' }, { status: 500 });
  }
}
