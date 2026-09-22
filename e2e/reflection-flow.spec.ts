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

  await page.getByLabel('标题').fill('集合概念第一课时')
  await page.getByLabel('教学总结').fill('完成集合概念讲解')
  await page.getByLabel('学生易错点').fill('混淆空集和含零集合')
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
  await expect(page.getByText('集合概念第一课时')).toBeVisible()
})
