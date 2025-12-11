import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Имитируем задержку сети (как будто бэкенд думает)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 2. Генерируем 15 фейковых файлов с кодом
  const mockFiles = Array.from({ length: 15 }, (_, i) => {
    const num = i + 1;
    return {
      filename: `test_scenario_${num}_payment.py`,
      code: `import pytest
import allure
from pages.payment_page import PaymentPage
from data.users import UserData

@allure.feature("Payment Functionality - Case ${num}")
@allure.story("User can pay with credit card")
class TestPaymentScenario${num}:
    
    @allure.severity(allure.severity_level.CRITICAL)
    @allure.title("Verify payment processing for Order #${num}")
    def test_payment_success_${num}(self, browser):
        """
        Test Description:
        1. Login as user
        2. Add item ${num} to cart
        3. Proceed to checkout
        4. Enter valid card details
        """
        page = PaymentPage(browser)
        page.open()
        
        # Step 1: Login
        page.login(UserData.standard_user)
        
        # Step 2: Add to cart
        page.add_item_to_cart(item_id=${num})
        
        # Step 3: Checkout
        page.click_checkout()
        
        # Assertion
        assert page.is_payment_successful(), "Payment failed for item ${num}"
        
        # Some extra lines to verify scroll
        # print("Test ${num} finished")
        # ...
`
    };
  });

  // 3. Возвращаем ответ в том формате, который ждет наш Page.tsx
  return NextResponse.json({
    test_files: mockFiles
  });
}
