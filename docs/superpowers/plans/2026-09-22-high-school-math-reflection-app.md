# 高中数学教学反思应用实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可安装、离线可用、支持 Supabase 云端同步的高中数学教学反思记录应用。

**Architecture:** 前端采用 React + TypeScript + Vite。业务数据先写 IndexedDB，再通过仓储接口同步到 Supabase；未配置云端时仍可完整使用本地模式。界面使用单一工作台外壳，桌面端三栏、手机端单列导航。

**Tech Stack:** React 19、TypeScript、Vite、Supabase JS、idb、Lucide React、Vitest、Testing Library、Playwright、vite-plugin-pwa。

---

### Task 1: 初始化工程与质量基线

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: 创建功能分支**

Run:

```bash
git switch -c codex/math-reflection-app
```

Expected: `Switched to a new branch 'codex/math-reflection-app'`

- [ ] **Step 2: 使用 Vite 模板创建 React + TypeScript 工程**

Run:

```bash
npm create vite@latest . -- --template react-ts --force
```

Expected: 生成 `package.json`、`src/`、`vite.config.ts`，且保留已有 `docs/`。

- [ ] **Step 3: 安装运行依赖**

Run:

```bash
npm install @supabase/supabase-js idb lucide-react
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event fake-indexeddb vite-plugin-pwa @playwright/test
```

Expected: `package.json` 和 `package-lock.json` 更新，命令退出码为 0。

- [ ] **Step 4: 配置测试和构建脚本**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '数学教学反思',
        short_name: '教学反思',
        description: '高中数学教学反思与易错点记录',
        theme_color: '#f4f5f7',
        background_color: '#f4f5f7',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
```

Update `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: 验证脚手架**

Run:

```bash
npm run build
```

Expected: TypeScript 和 Vite 构建成功，命令退出码为 0。

- [ ] **Step 6: 提交脚手架**

Run:

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src .env.example .gitignore
git commit -m "chore: scaffold reflection app"
```

---

### Task 2: 定义领域模型和人教A版教材目录

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/catalog.ts`
- Test: `src/data/catalog.test.ts`

- [ ] **Step 1: 编写失败测试**

Create `src/data/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { seedCatalog } from './catalog'

describe('seedCatalog', () => {
  it('contains all five required textbooks', () => {
    expect(seedCatalog.map((book) => book.name)).toEqual([
      '必修第一册',
      '必修第二册',
      '选择性必修第一册',
      '选择性必修第二册',
      '选择性必修第三册',
    ])
  })

  it('contains standard chapters and sections', () => {
    const firstBook = seedCatalog[0]
    expect(firstBook.chapters[0].name).toBe('第一章 集合与常用逻辑用语')
    expect(firstBook.chapters[0].sections[0].name).toBe('1.1 集合的概念')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/data/catalog.test.ts
```

Expected: FAIL，错误信息包含 `Failed to resolve import "./catalog"`。

- [ ] **Step 3: 添加领域类型**

Create `src/domain/types.ts`:

```ts
export type LessonType = '新授课' | '习题课' | '复习课' | '讲评课' | '其他'

export interface Section {
  id: string
  chapterId: string
  name: string
  order: number
}

export interface Chapter {
  id: string
  textbookId: string
  name: string
  order: number
  sections: Section[]
}

export interface Textbook {
  id: string
  name: string
  edition: '人教A版2019'
  order: number
  chapters: Chapter[]
}

export interface LessonRecord {
  id: string
  sectionId: string
  lessonDate: string
  lessonType: LessonType
  title: string
  teachingReflection: string
  teachingSummary: string
  studentMistakes: string
  improvementActions: string
  tags: string[]
  version: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type SyncState = 'saved' | 'saving' | 'offline' | 'error'
```

- [ ] **Step 4: 添加目录种子数据**

Create `src/data/catalog.ts`，导出完整 `seedCatalog: Textbook[]`。每个教材使用稳定的 `book-1`、`chapter-1-1`、`section-1-1-1` ID：

```ts
import type { Textbook } from '../domain/types'

interface SeedChapter {
  title: string
  sections: string[]
}

function createBook(
  order: number,
  name: string,
  chapters: SeedChapter[],
): Textbook {
  const textbookId = `book-${order}`
  return {
    id: textbookId,
    name,
    edition: '人教A版2019',
    order,
    chapters: chapters.map((chapter, chapterIndex) => {
      const chapterNumber = chapterIndex + 1
      const chapterId = `chapter-${order}-${chapterNumber}`
      return {
        id: chapterId,
        textbookId,
        name: chapter.title,
        order: chapterNumber,
        sections: chapter.sections.map((sectionName, sectionIndex) => ({
          id: `section-${order}-${chapterNumber}-${sectionIndex + 1}`,
          chapterId,
          name: sectionName,
          order: sectionIndex + 1,
        })),
      }
    }),
  }
}

export const seedCatalog: Textbook[] = [
  createBook(1, '必修第一册', [
    {
      title: '第一章 集合与常用逻辑用语',
      sections: [
        '1.1 集合的概念',
        '1.2 集合间的基本关系',
        '1.3 集合的基本运算',
        '1.4 充分条件与必要条件',
        '1.5 全称量词与存在量词',
      ],
    },
    {
      title: '第二章 一元二次函数、方程和不等式',
      sections: [
        '2.1 等式性质与不等式性质',
        '2.2 基本不等式',
        '2.3 二次函数与一元二次方程、不等式',
      ],
    },
    {
      title: '第三章 函数的概念与性质',
      sections: [
        '3.1 函数的概念及其表示',
        '3.2 函数的基本性质',
        '3.3 幂函数',
        '3.4 函数的应用（一）',
      ],
    },
    {
      title: '第四章 指数函数与对数函数',
      sections: [
        '4.1 指数',
        '4.2 指数函数',
        '4.3 对数',
        '4.4 对数函数',
        '4.5 函数的应用（二）',
      ],
    },
    {
      title: '第五章 三角函数',
      sections: [
        '5.1 任意角和弧度制',
        '5.2 三角函数的概念',
        '5.3 诱导公式',
        '5.4 三角函数的图象与性质',
        '5.5 三角恒等变换',
        '5.6 函数 y=Asin(ωx+φ)',
        '5.7 三角函数的应用',
      ],
    },
  ]),
  createBook(2, '必修第二册', [
    {
      title: '第六章 平面向量及其应用',
      sections: [
        '6.1 平面向量的概念',
        '6.2 平面向量的运算',
        '6.3 平面向量基本定理及坐标表示',
        '6.4 平面向量的应用',
      ],
    },
    {
      title: '第七章 复数',
      sections: ['7.1 复数的概念', '7.2 复数的四则运算', '7.3 复数的三角表示'],
    },
    {
      title: '第八章 立体几何初步',
      sections: [
        '8.1 基本立体图形',
        '8.2 立体图形的直观图',
        '8.3 简单几何体的表面积与体积',
        '8.4 空间点、直线、平面之间的位置关系',
        '8.5 空间直线、平面的平行',
        '8.6 空间直线、平面的垂直',
      ],
    },
    {
      title: '第九章 统计',
      sections: [
        '9.1 随机抽样',
        '9.2 用样本估计总体',
        '9.3 统计分析案例 公司员工的肥胖情况调查分析',
      ],
    },
    {
      title: '第十章 概率',
      sections: ['10.1 随机事件与概率', '10.2 事件的相互独立性', '10.3 频率与概率'],
    },
  ]),
  createBook(3, '选择性必修第一册', [
    {
      title: '第一章 空间向量与立体几何',
      sections: [
        '1.1 空间向量及其运算',
        '1.2 空间向量基本定理',
        '1.3 空间向量及其运算的坐标表示',
        '1.4 空间向量的应用',
      ],
    },
    {
      title: '第二章 直线和圆的方程',
      sections: [
        '2.1 直线的倾斜角与斜率',
        '2.2 直线的方程',
        '2.3 直线的交点坐标与距离公式',
        '2.4 圆的方程',
        '2.5 直线与圆、圆与圆的位置关系',
      ],
    },
    {
      title: '第三章 圆锥曲线的方程',
      sections: ['3.1 椭圆', '3.2 双曲线', '3.3 抛物线'],
    },
  ]),
  createBook(4, '选择性必修第二册', [
    {
      title: '第四章 数列',
      sections: [
        '4.1 数列的概念',
        '4.2 等差数列',
        '4.3 等比数列',
        '4.4 数学归纳法',
      ],
    },
    {
      title: '第五章 一元函数的导数及其应用',
      sections: [
        '5.1 导数的概念及其意义',
        '5.2 导数的运算',
        '5.3 导数在研究函数中的应用',
      ],
    },
  ]),
  createBook(5, '选择性必修第三册', [
    {
      title: '第六章 计数原理',
      sections: [
        '6.1 分类加法计数原理与分步乘法计数原理',
        '6.2 排列与组合',
        '6.3 二项式定理',
      ],
    },
    {
      title: '第七章 随机变量及其分布',
      sections: [
        '7.1 条件概率与全概率公式',
        '7.2 离散型随机变量及其分布列',
        '7.3 离散型随机变量的数字特征',
        '7.4 二项分布与超几何分布',
        '7.5 正态分布',
      ],
    },
    {
      title: '第八章 成对数据的统计分析',
      sections: [
        '8.1 成对数据的相关关系',
        '8.2 一元线性回归模型及其应用',
        '8.3 列联表与独立性检验',
      ],
    },
  ]),
]
```

- [ ] **Step 5: 运行测试并确认通过**

Run:

```bash
npm test -- src/data/catalog.test.ts
```

Expected: 2 tests passed。

- [ ] **Step 6: 提交领域模型**

Run:

```bash
git add src/domain/types.ts src/data/catalog.ts src/data/catalog.test.ts
git commit -m "feat: add textbook catalog and domain model"
```

---

### Task 3: 实现本地持久化和仓储接口

**Files:**
- Create: `src/data/repository.ts`
- Create: `src/data/localRepository.ts`
- Test: `src/data/localRepository.test.ts`

- [ ] **Step 1: 编写失败测试**

Create `src/data/localRepository.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createLocalRepository } from './localRepository'

describe('localRepository', () => {
  it('persists and reloads a lesson record', async () => {
    const repository = createLocalRepository(`test-${crypto.randomUUID()}`)
    const saved = await repository.saveRecord({
      sectionId: 'section-1-1-1',
      lessonDate: '2026-09-22',
      lessonType: '新授课',
      title: '集合概念',
      teachingReflection: '例子需要更贴近生活',
      teachingSummary: '完成集合定义和元素特性',
      studentMistakes: '混淆空集和含零集合',
      improvementActions: '增加反例辨析',
      tags: ['集合'],
    })

    await expect(repository.getRecord(saved.id)).resolves.toMatchObject({
      title: '集合概念',
      studentMistakes: '混淆空集和含零集合',
    })
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/data/localRepository.test.ts
```

Expected: FAIL，错误信息包含 `Failed to resolve import "./localRepository"`。

- [ ] **Step 3: 定义仓储接口**

Create `src/data/repository.ts`:

```ts
import type { LessonRecord } from '../domain/types'

export type LessonRecordInput = Omit<
  LessonRecord,
  'id' | 'version' | 'isArchived' | 'createdAt' | 'updatedAt'
>

export interface ReflectionRepository {
  listRecords(): Promise<LessonRecord[]>
  getRecord(id: string): Promise<LessonRecord | undefined>
  saveRecord(input: Partial<LessonRecord> & LessonRecordInput): Promise<LessonRecord>
  setArchived(id: string, isArchived: boolean): Promise<void>
  replaceRecords(records: LessonRecord[]): Promise<void>
}
```

- [ ] **Step 4: 实现 IndexedDB 仓储**

Create `src/data/localRepository.ts`，使用 `idb` 打开数据库 `math-reflection-${databaseName}`，创建 `records` store，并按以下规则实现：

```ts
export function createLocalRepository(databaseName = 'default'): ReflectionRepository {
  return {
    async listRecords() {
      const db = await openDatabase(databaseName)
      const records = await db.getAll('records')
      return records.sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))
    },
    async getRecord(id) {
      const db = await openDatabase(databaseName)
      return db.get('records', id)
    },
    async saveRecord(input) {
      const db = await openDatabase(databaseName)
      const existing = input.id ? await db.get('records', input.id) : undefined
      const now = new Date().toISOString()
      const record: LessonRecord = {
        id: input.id ?? crypto.randomUUID(),
        version: (existing?.version ?? 0) + 1,
        isArchived: existing?.isArchived ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...input,
      }
      await db.put('records', record)
      return record
    },
    async setArchived(id, isArchived) {
      const db = await openDatabase(databaseName)
      const record = await db.get('records', id)
      if (!record) return
      await db.put('records', {
        ...record,
        isArchived,
        version: record.version + 1,
        updatedAt: new Date().toISOString(),
      })
    },
    async replaceRecords(records) {
      const db = await openDatabase(databaseName)
      const transaction = db.transaction('records', 'readwrite')
      await transaction.store.clear()
      await Promise.all(records.map((record) => transaction.store.put(record)))
      await transaction.done
    },
  }
}
```

- [ ] **Step 5: 运行测试并确认通过**

Run:

```bash
npm test -- src/data/localRepository.test.ts
```

Expected: 1 test passed。

- [ ] **Step 6: 提交本地仓储**

Run:

```bash
git add src/data/repository.ts src/data/localRepository.ts src/data/localRepository.test.ts
git commit -m "feat: add local record repository"
```

---

### Task 4: 实现搜索、Markdown 和数据导出

**Files:**
- Create: `src/domain/search.ts`
- Create: `src/domain/export.ts`
- Test: `src/domain/search.test.ts`
- Test: `src/domain/export.test.ts`

- [ ] **Step 1: 编写失败测试**

Create `src/domain/search.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { matchesRecord } from './search'

const record = {
  title: '函数单调性',
  teachingSummary: '完成定义证明',
  studentMistakes: '忽略定义域',
} as never

describe('matchesRecord', () => {
  it('matches normalized full-text input', () => {
    expect(matchesRecord(record, '定义域')).toBe(true)
    expect(matchesRecord(record, '导数')).toBe(false)
  })
})
```

Create `src/domain/export.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { recordsToMarkdown } from './export'

describe('recordsToMarkdown', () => {
  it('renders a readable heading and mistake section', () => {
    const markdown = recordsToMarkdown([
      {
        title: '函数单调性',
        lessonDate: '2026-09-22',
        lessonType: '新授课',
        teachingSummary: '完成定义证明',
        studentMistakes: '忽略定义域',
        teachingReflection: '',
        improvementActions: '',
        tags: ['函数'],
      } as never,
    ])

    expect(markdown).toContain('## 2026-09-22 函数单调性')
    expect(markdown).toContain('忽略定义域')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/domain/search.test.ts src/domain/export.test.ts
```

Expected: FAIL，两个模块均无法解析。

- [ ] **Step 3: 实现搜索和导出**

Create `src/domain/search.ts`：

```ts
import type { LessonRecord } from './types'

export function normalizeSearchText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '')
}

export function matchesRecord(record: LessonRecord, query: string): boolean {
  const needle = normalizeSearchText(query)
  if (!needle) return true
  return normalizeSearchText(
    [
      record.title,
      record.teachingReflection,
      record.teachingSummary,
      record.studentMistakes,
      record.improvementActions,
      record.tags.join(' '),
    ].join(' '),
  ).includes(needle)
}
```

Create `src/domain/export.ts`：

```ts
import type { LessonRecord } from './types'

export function recordsToJson(records: LessonRecord[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)
}

export function recordsToMarkdown(records: LessonRecord[]): string {
  return records
    .map(
      (record) => [
        `## ${record.lessonDate} ${record.title || record.lessonType}`,
        '',
        `- 课型：${record.lessonType}`,
        `- 标签：${record.tags.join('、') || '无'}`,
        '',
        '### 教学总结',
        record.teachingSummary || '未填写',
        '',
        '### 教学反思',
        record.teachingReflection || '未填写',
        '',
        '### 学生易错点',
        record.studentMistakes || '未填写',
        '',
        '### 改进措施',
        record.improvementActions || '未填写',
      ].join('\n'),
    )
    .join('\n\n---\n\n')
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run:

```bash
npm test -- src/domain/search.test.ts src/domain/export.test.ts
```

Expected: 2 test files passed。

- [ ] **Step 5: 提交搜索与导出**

Run:

```bash
git add src/domain/search.ts src/domain/search.test.ts src/domain/export.ts src/domain/export.test.ts
git commit -m "feat: add search and data export"
```

---

### Task 5: 建立 Supabase 数据库结构和同步适配器

**Files:**
- Create: `supabase/migrations/0001_initial.sql`
- Create: `src/data/supabase.ts`
- Create: `src/data/cloudRepository.ts`
- Test: `src/data/cloudRepository.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: 编写云端映射失败测试**

Create `src/data/cloudRepository.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { fromCloudRecord, toCloudRecord } from './cloudRepository'

describe('cloud record mapping', () => {
  it('round trips snake case fields', () => {
    const local = fromCloudRecord({
      id: 'r1',
      section_id: 's1',
      lesson_date: '2026-09-22',
      lesson_type: '新授课',
      title: '集合',
      teaching_reflection: '',
      teaching_summary: '',
      student_mistakes: '',
      improvement_actions: '',
      tags: [],
      version: 1,
      is_archived: false,
      created_at: '2026-09-22T00:00:00.000Z',
      updated_at: '2026-09-22T00:00:00.000Z',
      owner_id: 'u1',
    })

    expect(toCloudRecord(local)).toMatchObject({
      id: 'r1',
      section_id: 's1',
      lesson_type: '新授课',
    })
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/data/cloudRepository.test.ts
```

Expected: FAIL，`./cloudRepository` 无法解析。

- [ ] **Step 3: 创建 Supabase 表和 RLS**

Create `supabase/migrations/0001_initial.sql`，定义：

- `profiles`
- `textbooks`
- `chapters`
- `sections`
- `lesson_records`
- `record_revisions`

所有表包含 `owner_id uuid not null references auth.users(id) on delete cascade`。为业务表启用 RLS，并创建 select、insert、update、delete 策略，条件均为 `owner_id = auth.uid()`。

`lesson_records` 的关键定义：

```sql
create table public.lesson_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  section_id text not null,
  lesson_date date not null,
  lesson_type text not null,
  title text not null default '',
  teaching_reflection text not null default '',
  teaching_summary text not null default '',
  student_mistakes text not null default '',
  improvement_actions text not null default '',
  tags text[] not null default '{}',
  version integer not null default 1,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_records enable row level security;

create policy "lesson_records_owner_all"
on public.lesson_records for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
```

- [ ] **Step 4: 实现 Supabase 客户端和字段映射**

Create `src/data/supabase.ts`：

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isCloudConfigured = Boolean(url && anonKey)
export const supabase = isCloudConfigured ? createClient(url, anonKey) : null
```

Create `src/data/cloudRepository.ts`，导出：

```ts
export interface CloudLessonRecord {
  id: string
  owner_id: string
  section_id: string
  lesson_date: string
  lesson_type: LessonType
  title: string
  teaching_reflection: string
  teaching_summary: string
  student_mistakes: string
  improvement_actions: string
  tags: string[]
  version: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export function fromCloudRecord(record: CloudLessonRecord): LessonRecord
export function toCloudRecord(record: LessonRecord): Omit<CloudLessonRecord, 'owner_id'>
```

- [ ] **Step 5: 运行测试并确认通过**

Run:

```bash
npm test -- src/data/cloudRepository.test.ts
```

Expected: 1 test passed。

- [ ] **Step 6: 提交云端数据层**

Run:

```bash
git add supabase src/data/supabase.ts src/data/cloudRepository.ts src/data/cloudRepository.test.ts .env.example
git commit -m "feat: add supabase schema and cloud mapping"
```

---

### Task 6: 实现应用状态、本地草稿和同步队列

**Files:**
- Create: `src/app/WorkspaceContext.tsx`
- Create: `src/app/useWorkspace.ts`
- Create: `src/data/syncQueue.ts`
- Create: `src/test/renderWithWorkspace.tsx`
- Test: `src/app/WorkspaceContext.test.tsx`
- Test: `src/data/syncQueue.test.ts`

- [ ] **Step 1: 编写同步队列失败测试**

Create `src/data/syncQueue.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { createSyncQueue } from './syncQueue'

describe('syncQueue', () => {
  it('preserves an offline draft until flushed', async () => {
    const queue = createSyncQueue(`queue-${crypto.randomUUID()}`)
    await queue.put({ recordId: 'r1', operation: 'upsert' })

    await expect(queue.list()).resolves.toEqual([
      expect.objectContaining({ recordId: 'r1', operation: 'upsert' }),
    ])
    await queue.remove('r1')
    await expect(queue.list()).resolves.toEqual([])
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/data/syncQueue.test.ts
```

Expected: FAIL，模块无法解析。

- [ ] **Step 3: 实现同步队列**

Create `src/data/syncQueue.ts`，使用 IndexedDB `syncQueue` store：

```ts
export interface SyncOperation {
  recordId: string
  operation: 'upsert' | 'archive' | 'restore'
  updatedAt: string
}

export interface SyncQueue {
  put(operation: Omit<SyncOperation, 'updatedAt'>): Promise<void>
  list(): Promise<SyncOperation[]>
  remove(recordId: string): Promise<void>
  clear(): Promise<void>
}

export function createSyncQueue(databaseName = 'default'): SyncQueue
```

- [ ] **Step 4: 实现工作区上下文**

Create `src/app/WorkspaceContext.tsx` 和 `src/app/useWorkspace.ts`。上下文暴露：

```ts
interface WorkspaceValue {
  records: LessonRecord[]
  isLoading: boolean
  syncState: SyncState
  saveRecord(input: LessonRecordInput & { id?: string }): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
  refresh(): Promise<void>
  exportJson(): void
  exportMarkdown(): void
}
```

加载顺序：

1. 从 `localRepository.listRecords()` 读取。
2. 如果云端已配置且已有登录会话，读取云端记录并合并。
3. 每次保存先写本地仓储，再写同步队列。
4. `navigator.onLine` 为真且云端可用时，清空队列。
5. 上传失败时保留队列并将 `syncState` 设为 `error`。

- [ ] **Step 5: 编写上下文集成测试**

Create `src/app/WorkspaceContext.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { WorkspaceProvider } from './WorkspaceContext'
import { useWorkspace } from './useWorkspace'

function Harness() {
  const { records, saveRecord, syncState } = useWorkspace()

  return (
    <>
      <button
        onClick={() =>
          saveRecord({
            sectionId: 'section-1-1-1',
            lessonDate: '2026-09-22',
            lessonType: '新授课',
            title: '集合概念',
            teachingReflection: '',
            teachingSummary: '完成概念讲解',
            studentMistakes: '',
            improvementActions: '',
            tags: [],
          })
        }
      >
        新增记录
      </button>
      <span>{records.length}</span>
      <span>{syncState === 'saved' ? '已保存' : '保存中'}</span>
    </>
  )
}

it('saves a record to the local workspace', async () => {
  render(
    <WorkspaceProvider databaseName={`workspace-${crypto.randomUUID()}`}>
      <Harness />
    </WorkspaceProvider>,
  )

  await userEvent.click(screen.getByRole('button', { name: '新增记录' }))
  expect(await screen.findByText('1')).toBeInTheDocument()
  expect(await screen.findByText('已保存')).toBeInTheDocument()
})
```

- [ ] **Step 6: 运行测试并确认通过**

Run:

```bash
npm test -- src/data/syncQueue.test.ts src/app/WorkspaceContext.test.tsx
```

Expected: 2 test files passed。

- [ ] **Step 7: 提交状态和同步队列**

Run:

```bash
git add src/app src/data/syncQueue.ts src/data/syncQueue.test.ts src/test
git commit -m "feat: add local-first workspace state"
```

---

### Task 7: 构建工作台外壳、目录导航和记录列表

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/components/BookTree.tsx`
- Create: `src/components/RecordList.tsx`
- Create: `src/pages/WorkbenchPage.tsx`
- Create: `src/components/EmptyState.tsx`
- Test: `src/components/BookTree.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: 编写目录导航失败测试**

Create `src/components/BookTree.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BookTree } from './BookTree'

it('opens a book and selects a section', async () => {
  const onSelect = vi.fn()
  render(<BookTree onSelect={onSelect} selectedSectionId={undefined} />)

  await userEvent.click(screen.getByRole('button', { name: /必修第一册/ }))
  await userEvent.click(screen.getByRole('button', { name: /第一章/ }))
  await userEvent.click(screen.getByRole('button', { name: /1.1 集合的概念/ }))

  expect(onSelect).toHaveBeenCalledWith('section-1-1-1')
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/components/BookTree.test.tsx
```

Expected: FAIL，`./BookTree` 无法解析。

- [ ] **Step 3: 实现桌面与手机工作台**

使用语义化 `button`、`nav`、`main` 和 `aside` 构建：

- `AppShell`：桌面顶部工具栏及内容网格；手机底部导航。
- `BookTree`：教材、章、节三级展开，使用 `ChevronRight`、`BookOpen` 图标。
- `RecordList`：按日期显示记录摘要、课型标签和易错点提示。
- `WorkbenchPage`：组合目录、列表和编辑器；空闲时显示简洁空状态。
- `App.tsx`：用 `WorkspaceProvider` 包裹 `AppShell`。

CSS 使用变量：

```css
:root {
  color-scheme: light;
  --bg: #f4f5f7;
  --surface: #ffffff;
  --surface-muted: #eceef1;
  --ink: #17202a;
  --muted: #65707c;
  --line: #d9dde2;
  --accent: #2563a8;
  --accent-strong: #184b82;
  --warning: #b4532a;
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
}
```

桌面端使用 `grid-template-columns: 280px 330px minmax(0, 1fr)`；`max-width: 768px` 时改为单列，列表和编辑器通过当前视图状态切换，避免横向溢出。

- [ ] **Step 4: 运行组件测试和类型检查**

Run:

```bash
npm test -- src/components/BookTree.test.tsx
npm run build
```

Expected: 测试通过，构建退出码为 0。

- [ ] **Step 5: 提交导航工作台**

Run:

```bash
git add src/components src/pages/WorkbenchPage.tsx src/App.tsx src/index.css
git commit -m "feat: add responsive reflection workbench"
```

---

### Task 8: 实现课次编辑、自动保存和版本冲突提示

**Files:**
- Create: `src/components/RecordEditor.tsx`
- Create: `src/hooks/useDebouncedValue.ts`
- Test: `src/components/RecordEditor.test.tsx`
- Modify: `src/pages/WorkbenchPage.tsx`

- [ ] **Step 1: 编写编辑器失败测试**

Create `src/components/RecordEditor.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { RecordEditor } from './RecordEditor'

it('submits all reflection fields', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(<RecordEditor sectionId="section-1-1-1" onSave={onSave} />)

  await userEvent.type(screen.getByLabelText('学生易错点'), '忽略定义域')
  await userEvent.type(screen.getByLabelText('教学总结'), '完成概念讲解')
  await userEvent.click(screen.getByRole('button', { name: '保存记录' }))

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      studentMistakes: '忽略定义域',
      teachingSummary: '完成概念讲解',
    }),
  )
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/components/RecordEditor.test.tsx
```

Expected: FAIL，`./RecordEditor` 无法解析。

- [ ] **Step 3: 实现完整表单**

字段顺序固定为日期、课型、标题、教学总结、教学反思、学生易错点、改进措施、标签。每个 label 使用 `htmlFor` 与控件关联。

自动保存规则：

1. 输入变化后等待 800ms。
2. 内容非空时调用 `onSave`。
3. `saving` 期间显示“保存中”，成功后显示“已保存”。
4. 离线时显示“等待联网”，错误时显示“保存失败，可重试”。
5. 保存失败不清空表单。

- [ ] **Step 4: 实现版本冲突比较对话框**

当云端返回值版本与本地 `version` 不同：

1. 保留“当前本机版本”和“云端已有版本”两个只读文本区。
2. 提供“使用我的版本”和“加载云端版本”两个明确操作。
3. 默认不覆盖任何一边，关闭对话框后继续保留本机草稿。

- [ ] **Step 5: 运行测试和构建**

Run:

```bash
npm test -- src/components/RecordEditor.test.tsx
npm run build
```

Expected: 测试通过，构建退出码为 0。

- [ ] **Step 6: 提交编辑器**

Run:

```bash
git add src/components/RecordEditor.tsx src/components/RecordEditor.test.tsx src/hooks/useDebouncedValue.ts src/pages/WorkbenchPage.tsx
git commit -m "feat: add lesson editor with autosave"
```

---

### Task 9: 实现搜索、归档和设置页

**Files:**
- Create: `src/pages/SearchPage.tsx`
- Create: `src/pages/ArchivePage.tsx`
- Create: `src/pages/SettingsPage.tsx`
- Create: `src/components/AppNavigation.tsx`
- Test: `src/pages/SearchPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: 编写搜索页失败测试**

Create `src/pages/SearchPage.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SearchPage } from './SearchPage'

it('filters records by Chinese keyword', async () => {
  render(
    <SearchPage
      records={[
        {
          id: 'r1',
          title: '函数单调性',
          studentMistakes: '忽略定义域',
          sectionId: 'section-1-1-1',
          lessonDate: '2026-09-22',
          lessonType: '新授课',
          teachingSummary: '',
          teachingReflection: '',
          improvementActions: '',
          tags: [],
          version: 1,
          isArchived: false,
          createdAt: '',
          updatedAt: '',
        },
      ]}
      onOpen={() => undefined}
    />,
  )

  await userEvent.type(screen.getByRole('searchbox'), '定义域')
  expect(screen.getByText('函数单调性')).toBeInTheDocument()
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/pages/SearchPage.test.tsx
```

Expected: FAIL，`./SearchPage` 无法解析。

- [ ] **Step 3: 实现搜索、归档和设置**

搜索页提供关键词、教材、章节和日期范围筛选，使用 `matchesRecord` 进行本地筛选。

归档页显示 `isArchived === true` 的记录，提供恢复操作。

设置页显示：

- 数据模式：云端同步或仅本机。
- 当前账号邮箱；未配置时显示“未连接云端”。
- 在线状态和待同步数量。
- 导出 JSON、导出 Markdown、刷新数据。
- 退出登录；仅云端模式显示。

- [ ] **Step 4: 接入导航**

桌面顶部使用图标加短文字的导航按钮；手机底部使用“目录、搜索、归档、设置”四个导航项。导航项必须包含可访问名称并标明当前页。

- [ ] **Step 5: 运行测试和构建**

Run:

```bash
npm test -- src/pages/SearchPage.test.tsx
npm run build
```

Expected: 测试通过，构建退出码为 0。

- [ ] **Step 6: 提交辅助页面**

Run:

```bash
git add src/pages src/components/AppNavigation.tsx src/components/AppShell.tsx src/App.tsx src/index.css
git commit -m "feat: add search archive and settings"
```

---

### Task 10: 补齐云端认证和同步行为

**Files:**
- Create: `src/app/AuthGate.tsx`
- Create: `src/data/cloudSync.ts`
- Test: `src/data/cloudSync.test.ts`
- Modify: `src/app/WorkspaceContext.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `.env.example`

- [ ] **Step 1: 编写同步失败测试**

Create `src/data/cloudSync.test.ts`：

```ts
import { describe, expect, it, vi } from 'vitest'
import { flushSyncQueue } from './cloudSync'

describe('flushSyncQueue', () => {
  it('keeps failed operations queued', async () => {
    const queue = {
      list: vi.fn().mockResolvedValue([
        { recordId: 'r1', operation: 'upsert', updatedAt: '2026-09-22T00:00:00Z' },
      ]),
      remove: vi.fn(),
    }
    const repository = {
      getRecord: vi.fn().mockResolvedValue({ id: 'r1' }),
      saveRecord: vi.fn().mockRejectedValue(new Error('network')),
    }

    await expect(
      flushSyncQueue(queue as never, repository as never),
    ).resolves.toEqual({ synced: 0, failed: 1 })
    expect(queue.remove).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/data/cloudSync.test.ts
```

Expected: FAIL，`./cloudSync` 无法解析。

- [ ] **Step 3: 实现同步执行器**

Create `src/data/cloudSync.ts`：

```ts
export interface QueuePort {
  list(): Promise<SyncOperation[]>
  remove(recordId: string): Promise<void>
}

export interface CloudPort {
  getRecord(id: string): Promise<LessonRecord | undefined>
  saveRecord(record: LessonRecord): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
}

export async function flushSyncQueue(
  queue: QueuePort,
  cloud: CloudPort,
): Promise<{ synced: number; failed: number }>
```

逐条处理，成功才从队列删除；单条失败不阻止后续记录，最终返回成功和失败数量。

- [ ] **Step 4: 实现登录门和会话**

云端配置存在时使用邮箱魔法链接登录：

```ts
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: window.location.origin },
})
```

页面说明只需保留输入 label、提交按钮、发送结果和错误文本，不做营销式登录页。

- [ ] **Step 5: 验证同步测试**

Run:

```bash
npm test -- src/data/cloudSync.test.ts
npm run build
```

Expected: 1 test passed，构建退出码为 0。

- [ ] **Step 6: 提交认证与同步**

Run:

```bash
git add src/app/AuthGate.tsx src/app/WorkspaceContext.tsx src/data/cloudSync.ts src/data/cloudSync.test.ts src/pages/SettingsPage.tsx .env.example
git commit -m "feat: add authentication and cloud sync"
```

---

### Task 11: 完善 PWA、无障碍和响应式体验

**Files:**
- Create: `public/icons/app-icon.svg`
- Create: `public/icons/app-icon-maskable.svg`
- Modify: `vite.config.ts`
- Modify: `index.html`
- Modify: `src/index.css`
- Test: `src/app/accessibility.test.tsx`

- [ ] **Step 1: 编写无障碍测试**

Create `src/app/accessibility.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../App'

it('exposes the primary navigation and work area', () => {
  render(<App />)
  expect(screen.getByRole('navigation', { name: '主要导航' })).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
npm test -- src/app/accessibility.test.tsx
```

Expected: FAIL，缺少命名导航或 main 角色。

- [ ] **Step 3: 完善 PWA 元数据和图标**

在 `index.html` 设置 `lang="zh-CN"`、viewport、theme-color 和 manifest 关联。创建简洁的蓝灰色教材图标；普通图标与 maskable 图标分开。Workbox 预缓存应用外壳，网络优先策略只用于 Supabase 请求。

- [ ] **Step 4: 完成响应式和可访问性检查**

确保：

- 颜色对比达到 WCAG AA。
- 所有输入都有可见 label。
- 键盘焦点环清晰可见。
- `prefers-reduced-motion` 时禁用非必要动画。
- 手机宽度 375px 无横向滚动。
- 桌面宽度 1440px 三栏稳定，不重叠。

- [ ] **Step 5: 运行测试与生产构建**

Run:

```bash
npm test
npm run build
```

Expected: 所有测试通过，构建退出码为 0，并生成 manifest 和 service worker。

- [ ] **Step 6: 提交 PWA 与无障碍改进**

Run:

```bash
git add public vite.config.ts index.html src/index.css src/app/accessibility.test.tsx
git commit -m "feat: complete pwa and accessibility"
```

---

### Task 12: 端到端验证、部署说明和最终验收

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/reflection-flow.spec.ts`
- Create: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: 编写端到端测试**

Create `e2e/reflection-flow.spec.ts`：

```ts
import { expect, test } from '@playwright/test'

test('creates, finds and exports a reflection record', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /必修第一册/ }).click()
  await page.getByRole('button', { name: /第一章/ }).click()
  await page.getByRole('button', { name: /1.1 集合的概念/ }).click()
  await page.getByRole('button', { name: '新建记录' }).click()
  await page.getByLabel('教学总结').fill('完成集合概念讲解')
  await page.getByLabel('学生易错点').fill('混淆空集和含零集合')
  await page.getByRole('button', { name: '保存记录' }).click()
  await expect(page.getByText('已保存')).toBeVisible()

  await page.getByRole('link', { name: '搜索' }).click()
  await page.getByRole('searchbox').fill('含零集合')
  await expect(page.getByText('集合概念')).toBeVisible()
})
```

- [ ] **Step 2: 配置桌面和手机项目**

Create `playwright.config.ts`，包含：

- `desktop-chromium`：`1440 x 900`
- `mobile-chromium`：iPhone 13 设备参数
- `webServer` 使用 `npm run dev -- --host 127.0.0.1`
- `reuseExistingServer: true`

- [ ] **Step 3: 运行端到端测试**

Run:

```bash
npx playwright install chromium
npm run test:e2e
```

Expected: 桌面和手机两个项目均通过。

- [ ] **Step 4: 编写部署说明**

`README.md` 必须包含：

1. 本机运行步骤。
2. Supabase 建表和 RLS 迁移步骤。
3. `.env.local` 配置项：

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Vercel 导入 GitHub 仓库和设置环境变量的步骤。
5. 手机添加到主屏幕的步骤。
6. JSON 和 Markdown 备份说明。
7. GitHub 不作为主数据库同步通道的原因。

- [ ] **Step 5: 最终验证**

Run:

```bash
npm test
npm run build
npm run test:e2e
git diff --check
git status --short
```

Expected:

- 单元和组件测试全部通过。
- 生产构建退出码为 0。
- 桌面和手机端端到端测试通过。
- `git diff --check` 无输出。
- 工作区没有未提交代码。

- [ ] **Step 6: 提交最终交付**

Run:

```bash
git add playwright.config.ts e2e README.md .gitignore
git commit -m "docs: add deployment and e2e verification"
```
