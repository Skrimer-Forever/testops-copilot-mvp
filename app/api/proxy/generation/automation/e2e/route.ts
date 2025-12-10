import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Получаем параметры из URL запроса к Next.js
    const { searchParams } = new URL(req.url);
    const baseUrlParam = searchParams.get("base_url");

    // 2. Формируем URL для бэкенда с учетом параметра
    let targetUrl = `${BACKEND_URL}/generation/automation/e2e`;
    if (baseUrlParam) {
      targetUrl += `?base_url=${encodeURIComponent(baseUrlParam)}`;
    }

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
    console.error("Proxy Error (E2E Auto):", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
