import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requirements_text, base_url, url, html } = body;

    const pythonPayload = {
      requirements_text: requirements_text || "",
      url: url || null,
      html: html || null
    };
    const queryParams = base_url ? `?base_url=${encodeURIComponent(base_url)}` : "";
    const targetUrl = `${BACKEND_URL}/generation/allure_code/api${queryParams}`;

    console.log(">>> Calling New Endpoint:", targetUrl);

    const res = await fetch(targetUrl, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pythonPayload),
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
    console.error("Proxy Error (Allure Code):", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}