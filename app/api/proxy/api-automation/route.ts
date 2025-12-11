import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log(">>> Received body:", body);
    console.log(">>> Proxying API Automation request to:", `${BACKEND_URL}/generation/automation/api`);

    const response = await fetch(
      `${BACKEND_URL}/generation/automation/api`,
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
    console.error("Proxy Error (API Automation):", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
