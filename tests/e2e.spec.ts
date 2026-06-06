import { test, expect } from '@playwright/test';

test('mystery 1 query execution', async ({ page }) => {
    // Navigate to the first mystery page
    await page.goto('http://localhost:4321/sql-learning-platform/mystery/1');

    // Wait for duckdb WASM to initialize (it might take a few seconds)
    await page.waitForTimeout(5000);

    // Expand the "Need a Clue?" section to verify hints are loaded
    const clueButton = page.locator('button:has-text("Need a Clue?")');
    if (await clueButton.count() > 0) {
        await clueButton.click();
        await page.waitForTimeout(500);
    }

    // Verify hint text includes expected columns
    const expectedHint = "Expected output columns: id, name, alibi";
    await expect(page.locator('body')).toContainText(expectedHint);

    // Click "Execute Query" (assuming the code editor has the correct query already)
    // The default value should be the setup_sql + expected query in the mystery
    await page.getByRole('button', { name: 'Execute Query' }).click();

    // Wait for the query to execute and results to appear
    await page.waitForTimeout(2000);

    // Take a screenshot to document a successful query
    await page.screenshot({ path: 'tests/mystery1-success.png', fullPage: true });

    // Wait for the query to execute and results to appear
    await page.waitForTimeout(4000);
});
