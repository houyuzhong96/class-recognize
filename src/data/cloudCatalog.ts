import type { SupabaseClient } from '@supabase/supabase-js'
import { seedCatalog } from './catalog'

interface CloudTextbookRow {
  id: string
  name: string
  edition: string
  display_order: number
  is_archived: boolean
}

interface CloudChapterRow {
  id: string
  textbook_id: string
  name: string
  display_order: number
  is_archived: boolean
}

interface CloudSectionRow {
  id: string
  chapter_id: string
  name: string
  display_order: number
  is_archived: boolean
}

export interface CloudCatalogRows {
  textbooks: CloudTextbookRow[]
  chapters: CloudChapterRow[]
  sections: CloudSectionRow[]
}

export function catalogToCloudRows(): CloudCatalogRows {
  return {
    textbooks: seedCatalog.map((book) => ({
      id: book.id,
      name: book.name,
      edition: book.edition,
      display_order: book.order,
      is_archived: false,
    })),
    chapters: seedCatalog.flatMap((book) =>
      book.chapters.map((chapter) => ({
        id: chapter.id,
        textbook_id: book.id,
        name: chapter.name,
        display_order: chapter.order,
        is_archived: false,
      })),
    ),
    sections: seedCatalog.flatMap((book) =>
      book.chapters.flatMap((chapter) =>
        chapter.sections.map((section) => ({
          id: section.id,
          chapter_id: chapter.id,
          name: section.name,
          display_order: section.order,
          is_archived: false,
        })),
      ),
    ),
  }
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function ensureCloudCatalog(client: SupabaseClient) {
  const rows = catalogToCloudRows()

  const textbooks = await client
    .from('textbooks')
    .upsert(rows.textbooks, { onConflict: 'owner_id,id' })
  throwIfError(textbooks.error)

  const chapters = await client
    .from('chapters')
    .upsert(rows.chapters, { onConflict: 'owner_id,id' })
  throwIfError(chapters.error)

  const sections = await client
    .from('sections')
    .upsert(rows.sections, { onConflict: 'owner_id,id' })
  throwIfError(sections.error)
}
