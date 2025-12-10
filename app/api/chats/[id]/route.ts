import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chats/[id] - Получить историю чата
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <--- Promise (для Next.js 15)
) {
  try {
    const { id } = await params; // <--- await (ОБЯЗАТЕЛЬНО)

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
  { params }: { params: Promise<{ id: string }> } // <--- Promise (для Next.js 15)
) {
  try {
    const { id } = await params; // <--- await (ОБЯЗАТЕЛЬНО)
    
    const body = await req.json();
    console.log(`Saving message to DB for ChatID: ${id}`); // Лог для проверки

    const { role, content, attachedCode, attachedFileName } = body;

    const message = await prisma.message.create({
      data: {
        chatId: id,
        role,
        content,
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
