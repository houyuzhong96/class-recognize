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
        type="button"
        onClick={() =>
          void saveRecord({
            sectionId: 'section-1-1-1',
            teachingSummary: '<p>理论完成概念讲解</p>',
            studentMistakes: '<p>混淆空集</p>',
            teachingReflection: '',
            classicExample: '<p>集合概念例题</p>',
          })
        }
      >
        新增记录
      </button>
      <span data-testid="record-count">{records.length}</span>
      <span>{syncState === 'saved' ? '已保存' : '保存中'}</span>
    </>
  )
}

it('saves a record to the local workspace', async () => {
  render(
    <WorkspaceProvider
      databaseName={`workspace-${crypto.randomUUID()}`}
      cloudEnabled={false}
    >
      <Harness />
    </WorkspaceProvider>,
  )

  await userEvent.click(screen.getByRole('button', { name: '新增记录' }))

  expect(await screen.findByText('1')).toBeInTheDocument()
  expect(await screen.findByText('已保存')).toBeInTheDocument()
})
