import { expect, test } from '@playwright/test'

test('creates and finds a reflection record', async ({ page }, testInfo) => {
  await page.goto('/')

  await page
    .getByRole('button', { name: '必修第一册', exact: true })
    .click()
  await page
    .getByRole('button', { name: '第一章 集合与常用逻辑用语' })
    .click()
  await page.getByRole('button', { name: '1.1 集合的概念' }).click()
  await page.getByRole('button', { name: '新建记录' }).click()

  await page
    .getByRole('textbox', { name: '教学总结' })
    .fill('完成集合概念讲解，并补充元素与集合关系。')
  await page.getByRole('button', { name: '插入公式' }).first().click()
  await page.getByLabel('LaTeX').fill('x^2+y^2=1')
  await page
    .getByRole('dialog', { name: '编辑公式' })
    .getByRole('button', { name: '插入公式' })
    .click()
  await expect(page.locator('.katex').first()).toBeVisible()

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('public/icons/app-icon.svg')
  await expect(page.locator('.lesson-image').first()).toBeVisible()

  await page
    .getByRole('textbox', { name: '学生易错点' })
    .fill('混淆空集和含零集合')
  await page
    .getByRole('textbox', { name: '经典例题' })
    .fill('判断元素与集合的关系。')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: `output/playwright/${testInfo.project.name}-editor.png`,
  })
  await page.getByRole('button', { name: '保存记录' }).click()
  await expect(page.getByText('已保存').first()).toBeVisible()

  await page
    .getByRole('navigation', {
      name: testInfo.project.name === 'mobile-chromium' ? '手机导航' : '桌面导航',
    })
    .getByRole('button', { name: '搜索' })
    .click()
  await page.getByRole('searchbox').fill('含零集合')
  await expect(page.getByText(/完成集合概念讲解/)).toBeVisible()
})
