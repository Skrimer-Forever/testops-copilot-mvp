import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log(">>> Proxying API Manual Cases to:", `${BACKEND_URL}/generation/allure-code/api`);

    const response = await fetch(
      `${BACKEND_URL}/generation/allure-code/api`,
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
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
