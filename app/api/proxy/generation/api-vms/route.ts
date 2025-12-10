import { NextResponse } from "next/server";

const BACKEND_URL = "http://176.123.161.105:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();


    const res = await fetch(`${BACKEND_URL}/generation/api/vms`, {
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
    console.error("Proxy Error (API VMs):", error);
    return NextResponse.json(
      { error: "Internal Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
