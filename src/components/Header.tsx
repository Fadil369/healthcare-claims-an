import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, FileText, ChartBar, Lightbulb, Translate, Gear, Tag } from '@phosphor-icons/react'
import { MobileNavbar } from '@/components/MobileNavbar'

interface HeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  
  const navItems = [
    { id: 'upload', label: t('header.upload'), icon: FileText },
    { id: 'dashboard', label: t('header.dashboard'), icon: Activity },
    { id: 'analysis', label: t('header.analysis'), icon: ChartBar },
    { id: 'insights', label: t('header.insights'), icon: Lightbulb },
    { id: 'rules', label: t('header.rules'), icon: Gear },
    { id: 'categories', label: t('header.categories'), icon: Tag },
  ]
  
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Navigation and Logo */}
          <div className="flex items-center gap-3">
            <MobileNavbar activeView={activeView} onViewChange={onViewChange} />
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">
                {t('app.title')}
              </h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? 'default' : 'ghost'}
                    onClick={() => onViewChange(item.id)}
                    className="gap-2 h-9 flex-shrink-0"
                    size="sm"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Translate className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={language} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
              <SelectTrigger className="w-16 h-8 text-xs sm:w-20 sm:h-9 sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ar">AR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}