module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/generation/automation/api/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(req) {
    // 1. Имитируем задержку сети (как будто бэкенд думает)
    await new Promise((resolve)=>setTimeout(resolve, 2000));
    // 2. Генерируем 15 фейковых файлов с кодом
    const mockFiles = Array.from({
        length: 15
    }, (_, i)=>{
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        test_files: mockFiles
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2dc48fdd._.js.map