import {
  Cloud,
  CloudOff,
  Database,
  Download,
  FileJson,
  FileText,
  LogOut,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWorkspace } from '../app/useWorkspace'
import { isCloudConfigured, supabase } from '../data/supabase'

export function SettingsPage({ email }: { email?: string }) {
  const { exportJson, exportMarkdown, refresh } = useWorkspace()
  const authClient = supabase
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )

  useEffect(() => {
    const setOnlineState = () => setOnline(navigator.onLine)
    window.addEventListener('online', setOnlineState)
    window.addEventListener('offline', setOnlineState)

    return () => {
      window.removeEventListener('online', setOnlineState)
      window.removeEventListener('offline', setOnlineState)
    }
  }, [])

  return (
    <div className="page-surface page-surface--narrow">
      <header className="page-heading">
        <div>
          <span>数据与同步</span>
          <h1>设置</h1>
        </div>
        <Database aria-hidden="true" size={22} strokeWidth={1.7} />
      </header>

      <section className="settings-section">
        <h2>数据模式</h2>
        <div className="setting-row">
          {isCloudConfigured ? (
            <Cloud aria-hidden="true" size={20} />
          ) : (
            <CloudOff aria-hidden="true" size={20} />
          )}
          <div>
            <strong>{isCloudConfigured ? '云端同步已配置' : '仅本机模式'}</strong>
            <span>
              {isCloudConfigured
                ? email
                  ? `当前账号：${email}`
                  : '登录后，电脑和手机共用同一份数据。'
                : '记录保存在当前浏览器中，可通过导出文件备份。'}
            </span>
          </div>
        </div>
        <div className="setting-row">
          {online ? (
            <Wifi aria-hidden="true" size={20} />
          ) : (
            <WifiOff aria-hidden="true" size={20} />
          )}
          <div>
            <strong>{online ? '网络正常' : '当前离线'}</strong>
            <span>
              {online
                ? '编辑内容会自动保存。'
                : '可以继续编辑，恢复联网后补传。'}
            </span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>备份</h2>
        <div className="settings-actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={exportJson}
          >
            <FileJson aria-hidden="true" size={18} />
            导出 JSON
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={exportMarkdown}
          >
            <FileText aria-hidden="true" size={18} />
            导出 Markdown
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => void refresh()}
          >
            <RefreshCw aria-hidden="true" size={18} />
            刷新数据
          </button>
        </div>
      </section>

      <section className="settings-note">
        <Download aria-hidden="true" size={18} />
        <p>
          导出的 JSON 可完整恢复记录字段，Markdown 适合长期阅读和归档。
        </p>
      </section>

      {isCloudConfigured && authClient ? (
        <div className="settings-signout">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => void authClient.auth.signOut()}
          >
            <LogOut aria-hidden="true" size={18} />
            退出登录
          </button>
        </div>
      ) : null}
    </div>
  )
}
