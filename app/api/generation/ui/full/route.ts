import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pythonPayload = {
        requirements_text: body.requirements_text || "",
        url: body.url || null,
        html: body.html || null
    };

    console.log(">>> Proxying default request to:", `${BACKEND_URL}/generation/ui/full`);

    const response = await fetch(`${BACKEND_URL}/generation/ui/full`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(pythonPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend Error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: "Backend Error", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
