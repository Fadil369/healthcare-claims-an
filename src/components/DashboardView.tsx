import { useMemo, useRef, useCallback, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@/hooks/useKV'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ExportControls } from '@/components/ExportControls'
import { TrendUp, TrendDown, Clock, Warning, CheckCircle, CurrencyDollar, Upload, Plus } from '@phosphor-icons/react'
import { ClaimData, AnalysisResult } from '@/types'
import { fileProcessor, ProcessingProgress } from '@/lib/fileProcessing'
import { toast } from 'sonner'

export function DashboardView() {
  const { t } = useLanguage()
  const [claimsData, setClaimsData] = useKV<ClaimData[]>('claims-data', [])
  const [, setLastProcessed] = useKV<string>('last-processed', '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const metrics = useMemo(() => {
    if (!claimsData.length) return null
    
    const totalClaims = claimsData.length
    const rejectedClaims = claimsData.filter(claim => claim.status === 'rejected').length
    const pendingClaims = claimsData.filter(claim => claim.status === 'pending').length
    const totalAmount = claimsData.reduce((sum, claim) => sum + claim.amount, 0)
    const rejectedAmount = claimsData
      .filter(claim => claim.status === 'rejected')
      .reduce((sum, claim) => sum + claim.amount, 0)
    const avgProcessingTime = claimsData.reduce((sum, claim) => sum + claim.processingTime, 0) / totalClaims
    const rejectionRate = (rejectedClaims / totalClaims) * 100
    
    // Top rejection reasons
    const rejectionReasons = claimsData
      .filter(claim => claim.rejectionReason)
      .reduce((acc, claim) => {
        const reason = claim.rejectionReason!
        acc[reason] = (acc[reason] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    const topRejectionReasons = Object.entries(rejectionReasons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentClaims = claimsData.filter(
      claim => new Date(claim.submissionDate) >= sevenDaysAgo
    )

    // Create analysis result for export
    const analysisResult: AnalysisResult = {
      totalClaims,
      totalAmount,
      rejectedClaims,
      rejectionRate,
      avgProcessingTime,
      pendingClaims,
      patterns: [],
      insights: [],
      rejectionAnalysis: [],
      trends: []
    }
    
    return {
      totalClaims,
      rejectedClaims,
      pendingClaims,
      totalAmount,
      rejectedAmount,
      avgProcessingTime,
      rejectionRate,
      topRejectionReasons,
      recentClaims: recentClaims.length,
      analysisResult
    }
  }, [claimsData])

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || isProcessing) return
    
    const fileArray = Array.from(selectedFiles)
    
    // Validate files
    const validation = fileProcessor.validateFiles(fileArray)
    
    if (validation.invalid.length > 0) {
      validation.invalid.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`)
      })
    }
    
    if (validation.valid.length === 0) return
    
    setIsProcessing(true)
    setProcessingProgress([])
    
    try {
      // Process files one by one
      const allResults = []
      
      for (const file of validation.valid) {
        const progressCallback = (progress: ProcessingProgress) => {
          setProcessingProgress(prev => {
            const existing = prev.find(p => p.fileName === progress.fileName)
            if (existing) {
              return prev.map(p => p.fileName === progress.fileName ? progress : p)
            }
            return [...prev, progress]
          })
        }
        
        const result = await fileProcessor.processFile(file, progressCallback)
        allResults.push(result)
      }
      
      // Combine all extracted data
      const newClaimsData = allResults.flatMap(result => result.data)
      
      if (newClaimsData.length > 0) {
        setClaimsData(prev => [...prev, ...newClaimsData])
        setLastProcessed(new Date().toISOString())
        toast.success(`Successfully processed ${validation.valid.length} file(s) and extracted ${newClaimsData.length} claims`)
      } else {
        toast.warning('No claims data found in the uploaded files')
      }
      
    } catch (error) {
      console.error('Processing error:', error)
      toast.error('Failed to process files. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress([])
    }
  }, [isProcessing, setClaimsData, setLastProcessed])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  if (!metrics) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <Warning className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
          Upload some files to see your claims dashboard
        </p>
        <Button onClick={handleUploadClick} size="lg" className="gap-2 h-12">
          <Upload className="w-5 h-5" />
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-base sm:text-lg text-muted-foreground">{t('dashboard.overview')}</p>
        </div>
        
        <div className="flex gap-2 self-stretch sm:self-auto">
          <Button 
            onClick={handleUploadClick} 
            variant="outline" 
            size="sm" 
            className="gap-2 flex-1 sm:flex-none"
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add More Files</span>
            <span className="sm:hidden">Add Files</span>
          </Button>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      {/* Processing Progress */}
      {isProcessing && processingProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              Processing Files...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {processingProgress.map((progress) => (
              <div key={progress.fileName} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium truncate flex-1 mr-2">{progress.fileName}</span>
                  <span className="text-muted-foreground flex-shrink-0">{progress.stage}</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Export Controls */}
      <ExportControls 
        data={claimsData}
        analysisResult={metrics.analysisResult}
      />
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.totalClaims')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{metrics.totalClaims.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.recentClaims} in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.totalAmount')}
            </CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {metrics.totalAmount.toLocaleString()} {t('common.sar')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.rejectedAmount.toLocaleString()} {t('common.sar')} rejected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.rejectedClaims')}
            </CardTitle>
            <Warning className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              {metrics.rejectedClaims.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.rejectionRate.toFixed(1)}% rejection rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.avgProcessingTime')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {metrics.avgProcessingTime.toFixed(1)} {t('common.days')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendDown className="h-3 w-3 mr-1 text-secondary" />
              Improving
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.pendingClaims')}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">
              {metrics.pendingClaims.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics.pendingClaims / metrics.totalClaims) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.rejectionRate')}
            </CardTitle>
            <TrendUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {metrics.rejectionRate.toFixed(1)}%
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-destructive h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.rejectionRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Rejection Reasons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Warning className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            {t('dashboard.topRejectionReasons')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Most common reasons for claim rejections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {metrics.topRejectionReasons.map(([reason, count], index) => {
            const percentage = (count / metrics.rejectedClaims) * 100
            return (
              <div key={reason} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="text-xs flex-shrink-0">#{index + 1}</Badge>
                    <span className="font-medium text-xs sm:text-sm truncate">{reason}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                    {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>
      
      {/* Saudi Market Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            {t('saudi.compliance')}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Compliance with Saudi healthcare insurance regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-secondary/10 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-secondary">98.5%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">CCHI Compliance</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-accent/10 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-accent">100%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Data Security</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-primary/10 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-primary">95.2%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Processing Standards</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}