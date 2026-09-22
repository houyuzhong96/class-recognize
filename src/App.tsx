import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { AppPage } from './components/AppNavigation'
import { WorkspaceProvider } from './app/WorkspaceContext'
import { useWorkspace } from './app/useWorkspace'
import { ArchivePage } from './pages/ArchivePage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { WorkbenchPage } from './pages/WorkbenchPage'
import type { LessonRecord } from './domain/types'

const syncLabels = {
  saved: '已保存',
  saving: '保存中',
  offline: '等待联网',
  error: '保存失败',
} as const

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>('workbench')
  const [targetRecordId, setTargetRecordId] = useState<string>()
  const { records, syncState } = useWorkspace()

  function openRecord(record: LessonRecord) {
    setTargetRecordId(record.id)
    setCurrentPage('workbench')
  }

  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={(page) => {
        setCurrentPage(page)
        if (page !== 'workbench') setTargetRecordId(undefined)
      }}
      syncLabel={syncLabels[syncState]}
    >
      {currentPage === 'workbench' ? (
        <WorkbenchPage
          targetRecordId={targetRecordId}
          onTargetHandled={() => setTargetRecordId(undefined)}
        />
      ) : null}
      {currentPage === 'search' ? (
        <SearchPage records={records} onOpen={openRecord} />
      ) : null}
      {currentPage === 'archive' ? <ArchivePage onOpen={openRecord} /> : null}
      {currentPage === 'settings' ? <SettingsPage /> : null}
    </AppShell>
  )
}

export function App() {
  return (
    <WorkspaceProvider cloudEnabled={false}>
      <AppContent />
    </WorkspaceProvider>
  )
}

export default App
