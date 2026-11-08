import path from "node:path";
import { test, expect } from "@playwright/test";

test.describe("Executive workflow: gap to ready", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("executive views CLM-3381 and uploads missing ultrasound document", async ({ page }) => {
    // 1. Sign in as Arjun Patil (Executive)
    await page.goto("/sign-in");
    await page.getByRole("button", { name: /Arjun Patil/i }).click();
    await expect(page).toHaveURL(/\/claims/, { timeout: 10000 });

    // 2. Locate CLM-3381 in the worklist (under All open tab)
    await page.getByRole("link", { name: /All open/i }).click();
    const claimLink = page.locator("a[href*='/claims/CLM-3381']").first();
    await expect(claimLink).toBeVisible();
    await claimLink.click();
    await page.waitForURL("**/claims/CLM-3381");

    // 3. Confirm Attention strip or Checklist is visible
    await expect(page.getByRole("heading", { name: "Checklist" })).toBeVisible();

    // 4. Upload sample ultrasound PDF
    const samplePdf = path.resolve(process.cwd(), "sample-uploads/usg-abdomen-rajendra-pawar.pdf");
    const fileInput = page.locator("input[type='file']").first();
    await fileInput.setInputFiles(samplePdf);

    // 5. Wait for upload and Gemini AI processing to complete (toast or file chip appears)
    await expect(page.getByText(/Processed|Uploaded|Ultrasound|usg-abdomen/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
