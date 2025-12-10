import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requirements_text } = body;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResponse = {
      test_cases: [
        {
          id: "TC-001",
          title: "Проверка авторизации",
          steps: ["Открыть страницу", "Ввести логин", "Нажать вход"],
          expected: "Успешный вход"
        },
        {
          id: "TC-002",
          title: "Проверка API генерации",
          steps: [`Отправить запрос: ${requirements_text || "пусто"}`],
          expected: "Получен ответ 200 OK"
        }
      ]
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
