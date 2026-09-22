import {
  Archive,
  BookOpenText,
  Search,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type AppPage = 'workbench' | 'search' | 'archive' | 'settings'

interface AppNavigationProps {
  currentPage: AppPage
  onNavigate(page: AppPage): void
  variant: 'desktop' | 'mobile'
}

const navigationItems: Array<{
  page: AppPage
  label: string
  icon: LucideIcon
}> = [
  { page: 'workbench', label: '目录', icon: BookOpenText },
  { page: 'search', label: '搜索', icon: Search },
  { page: 'archive', label: '归档', icon: Archive },
  { page: 'settings', label: '设置', icon: Settings },
]

export function AppNavigation({
  currentPage,
  onNavigate,
  variant,
}: AppNavigationProps) {
  return (
    <nav className={`app-navigation app-navigation--${variant}`} aria-label="主要导航">
      {navigationItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.page}
            type="button"
            className="navigation-item"
            aria-current={currentPage === item.page ? 'page' : undefined}
            onClick={() => onNavigate(item.page)}
          >
            <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
