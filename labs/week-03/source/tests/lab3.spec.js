import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
});

test('หน้าเว็บเปิดได้และมีฟอร์ม', async ({ page }) => {
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('form input').first()).toBeVisible();
  await expect(page.locator('form select')).toBeVisible();
  await expect(page.locator('form textarea')).toBeVisible();
});

test('หน้าจอมือถือไม่มี horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.document,
    `หน้าเว็บกว้างเกินหน้าจอ: ${JSON.stringify(dimensions)}`
  ).toBeLessThanOrEqual(dimensions.viewport);
});

test('ฟอร์มแสดงข้อผิดพลาดเมื่อส่งข้อมูลว่าง', async ({ page }) => {
  await page.locator(
    'form button[type="submit"], form input[type="submit"]'
  ).first().click();

  await expect(
    page.locator('form [aria-invalid="true"]').first()
  ).toBeVisible();
});

test('กรอกข้อมูลได้โดยไม่มี JavaScript error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  const form = page.locator('form');
  const nameInput = form.locator('input').first();
  const select = form.locator('select');
  const details = form.locator('textarea');

  await nameInput.fill('Test User');

  const options = await select.locator('option').evaluateAll(items =>
    items.map(item => ({ value: item.value, disabled: item.disabled }))
  );
  const validOption = options.find(option => option.value && !option.disabled);

  expect(validOption, 'ต้องมีตัวเลือกประเภทคำร้อง').toBeTruthy();
  await select.selectOption(validOption.value);
  await details.fill('ทดสอบระบบส่งคำร้อง Lab 3');

  await expect(nameInput).toHaveValue('Test User');
  await expect(details).toHaveValue('ทดสอบระบบส่งคำร้อง Lab 3');
  expect(errors).toEqual([]);
});

test('ส่งข้อมูลถูกต้องแล้วเพิ่มรายการและล้างฟอร์ม', async ({ page }) => {
  const form = page.locator('form');

  await form.locator('input').first().fill('Playwright Tester');

  const select = form.locator('select');
  const validOption = await select.locator('option').evaluateAll(items => {
    const item = items.find(option => option.value && !option.disabled);
    return item ? item.value : null;
  });

  expect(validOption).toBeTruthy();
  await select.selectOption(validOption);
  await form.locator('textarea').fill('ทดสอบส่งคำร้องด้วย Playwright');

  await form.locator(
    'button[type="submit"], input[type="submit"]'
  ).first().click();

  await expect(
    page.locator('#request-list .request-item h4').first()
  ).toContainText('Playwright Tester');

  await expect(form.locator('input').first()).toHaveValue('');
});
