import { test, expect } from "@playwright/test";

test.describe("Head checklist rule management", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("desk head edits checklist rule and verifies preview and open claim", async ({ page }) => {
    // 1. Sign in as Meera Kulkarni (Desk Head)
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /Meera Kulkarni/i }).click();
    await expect(page).toHaveURL(/\/claims/);

    // 2. Open Settings -> Checklist rules
    await page.goto("/settings/checklists");
    await expect(page.getByRole("heading", { name: "Rule Matrix" })).toBeVisible();

    // 3. Find rule for "Pre-auth request form" in the matrix table
    const targetRow = page
      .locator("tr")
      .filter({ hasText: /Pre-auth request form/i })
      .first();
    await expect(targetRow).toBeVisible();

    // 4. Click "Not needed" toggle within that row
    const notNeededBtn = targetRow.getByRole("button", { name: /Not needed/i });
    await expect(notNeededBtn).toBeVisible();
    await notNeededBtn.click();
    await expect(notNeededBtn).toHaveAttribute("aria-pressed", "true");

    // 5. Check Effective Checklist Preview reflects 6 items
    await expect(page.getByText(/6 items/i).first()).toBeVisible();

    // 5. Check CLM-3381 or claims view is healthy
    await page.goto("/claims/CLM-3381");
    await expect(page.getByText(/CLM-3381/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Checklist" })).toBeVisible();
  });
});
