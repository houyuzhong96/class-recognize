import { useState } from 'react'
import { AppShell } from './components/AppShell'
import type { AppPage } from './components/AppNavigation'
import { WorkspaceProvider } from './app/WorkspaceContext'
import { useWorkspace } from './app/useWorkspace'
import { WorkbenchPage } from './pages/WorkbenchPage'

const syncLabels = {
  saved: '已保存',
  saving: '保存中',
  offline: '等待联网',
  error: '保存失败',
} as const

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>('workbench')
  const { syncState } = useWorkspace()

  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      syncLabel={syncLabels[syncState]}
    >
      {currentPage === 'workbench' ? <WorkbenchPage /> : null}
      {currentPage === 'search' ? (
        <div className="page-placeholder">搜索功能将在下一步接入。</div>
      ) : null}
      {currentPage === 'archive' ? (
        <div className="page-placeholder">归档记录将在下一步接入。</div>
      ) : null}
      {currentPage === 'settings' ? (
        <div className="page-placeholder">本机模式已启用。</div>
      ) : null}
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
