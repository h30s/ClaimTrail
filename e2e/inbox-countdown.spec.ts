import { test, expect } from "@playwright/test";

test.describe("Inbox and countdown", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("shows query list, original email, and records reply to update chip to answered", async ({ page }) => {
    // 1. Sign in as Meera Kulkarni (Desk Head)
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /Meera Kulkarni/i }).click();
    await expect(page).toHaveURL(/\/claims/);

    // 2. Navigate to Inbox
    await page.goto("/inbox");
    await expect(page.getByRole("heading", { name: "Query Inbox" })).toBeVisible();

    // 3. Find and click an open query item that is linked to a claim
    const queryItem = page.locator("a[href^='/inbox/']").filter({ hasText: /CLM-/ }).first();
    await expect(queryItem).toBeVisible();
    await queryItem.click();

    // 4. Verify original email is visible; link claim if needed
    await expect(page.getByText(/Original email/i)).toBeVisible();
    const linkButton = page.getByRole("button", { name: /Link to this claim/i });
    if (await linkButton.isVisible()) {
      await linkButton.click();
    }
    await expect(page.getByRole("heading", { name: "Reply" })).toBeVisible();

    // 5. Fill reply text and click "Mark reply as sent"
    const textarea = page.locator("textarea").first();
    await textarea.fill("Please find attached the requested consultation papers. Regards, Claims Desk");

    const markButton = page.getByRole("button", { name: /Mark reply as sent/i });
    await expect(markButton).toBeEnabled();
    await markButton.click();

    // In the confirmation dialog, click "Confirm sent"
    await expect(page.getByRole("heading", { name: /Mark reply as sent\?/i })).toBeVisible();
    await page.getByRole("button", { name: /Confirm sent/i }).click();

    // Status updates to "Recorded reply"
    await expect(page.getByText(/Recorded reply/i)).toBeVisible({ timeout: 10000 });
  });
});
