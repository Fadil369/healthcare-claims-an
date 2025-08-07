import { useState } from 'react'
import { useKV } from '@/hooks/useKV'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Header } from '@/components/Header'
import { FileUploadView } from '@/components/FileUploadView'
import { DashboardView } from '@/components/DashboardView'
import { AnalysisView } from '@/components/AnalysisView'
import { InsightsView } from '@/components/InsightsView'
import { RejectionRulesView } from '@/components/RejectionRulesView'
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
      default:
        return <FileUploadView />
    }
  }
  
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onViewChange={setActiveView} />
        <main className="pb-8">
          {renderView()}
        </main>
        <Toaster />
      </div>
    </LanguageProvider>
  )
}

export default App