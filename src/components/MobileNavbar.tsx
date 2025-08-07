import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, FileText, BarChart3, Lightbulb, Languages, Gear, Tag, List, X } from '@phosphor-icons/react'

interface MobileNavbarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function MobileNavbar({ activeView, onViewChange }: MobileNavbarProps) {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = [
    { id: 'upload', label: t('header.upload'), icon: FileText },
    { id: 'dashboard', label: t('header.dashboard'), icon: Activity },
    { id: 'analysis', label: t('header.analysis'), icon: BarChart3 },
    { id: 'insights', label: t('header.insights'), icon: Lightbulb },
    { id: 'rules', label: t('header.rules'), icon: Gear },
    { id: 'categories', label: t('header.categories'), icon: Tag },
  ]

  const handleNavigation = (viewId: string) => {
    onViewChange(viewId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <List className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('app.title')}</span>
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="h-auto p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="space-y-4">
          {/* Navigation Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('navigation')}
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full justify-start gap-3 h-12 ${
                      isActive ? 'shadow-sm' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-base">{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>

          {/* Language Selector */}
          <div className="pt-6 border-t space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('settings')}
            </h3>
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5 text-muted-foreground" />
              <Select value={language} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}