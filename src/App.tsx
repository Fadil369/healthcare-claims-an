import { useKV } from '@/hooks/useKV'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Header } from '@/components/Header'
import { FileUploadView } from '@/components/FileUploadView'
import { DashboardView } from '@/components/DashboardView'
import { AnalysisView } from '@/components/AnalysisView'
import { InsightsView } from '@/components/InsightsView'
import { RejectionRulesView } from '@/components/RejectionRulesView'
import { RejectionCategoriesView } from '@/components/RejectionCategoriesView'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [activeView, setActiveView] = useKV<string>('active-view', 'upload')
  
  const renderView = () => {
    switch (activeView) {
      case 'upload':
        return <FileUploadView />
      case 'dashboard':
        return <DashboardView />
      case 'analysis':
        return <AnalysisView />
      case 'insights':
        return <InsightsView />
      case 'rules':
        return <RejectionRulesView />
      case 'categories':
        return <RejectionCategoriesView />
      default:
        return <FileUploadView />
    }
  }
  
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 container mx-auto px-4 py-4 lg:px-6 lg:py-8 max-w-7xl">
          <div className="h-full">
            {renderView()}
          </div>
        </main>
        <Toaster />
      </div>
    </LanguageProvider>
  )
}

export default App