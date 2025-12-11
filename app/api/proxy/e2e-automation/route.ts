import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Извлекаем base_url из BODY, а не из query параметров
    const baseUrl = body.base_url || "https://example.com";
    
    console.log(">>> Received body:", body);
    console.log(">>> Extracted base_url:", baseUrl);
    console.log(">>> Proxying E2E Automation request to:", `${BACKEND_URL}/generation/automation/e2e?base_url=${encodeURIComponent(baseUrl)}`);

    const response = await fetch(
      `${BACKEND_URL}/generation/automation/e2e?base_url=${encodeURIComponent(baseUrl)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend Error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "Backend Error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(">>> Backend response:", data);
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Proxy Error (E2E Automation):", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
