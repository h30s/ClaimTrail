import { test, expect } from "@playwright/test";

test.describe("Access control", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("executive cannot access settings and cannot view another executive's claim", async ({ page }) => {
    // 1. Sign in as Arjun Patil (Executive)
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /Arjun Patil/i }).click();
    await expect(page).toHaveURL(/\/claims/);

    // 2. Arjun visits /settings/checklists -> Access Denied
    await page.goto("/settings/checklists");
    await expect(page.getByText(/Only the desk head can change checklist rules/i)).toBeVisible();

    // 3. Arjun visits CLM-3385 (assigned to Sneha Joshi) -> 404 Not Found
    await page.goto("/claims/CLM-3385");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
});
