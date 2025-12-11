import { NextResponse } from "next/server";

// Убедись, что адрес бэкенда правильный (обычно localhost:8000 или из .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://176.123.161.105:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Перенаправляем на нужный тебе эндпоинт Python-бэкенда
    const targetUrl = `${API_URL}/generation/allure-code/ui`;

    console.log("Proxying to:", targetUrl);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Backend Error: ${res.status} ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
