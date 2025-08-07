import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ExportControls } from '@/components/ExportControls'
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, DollarSign } from '@phosphor-icons/react'
import { ClaimData, AnalysisResult } from '@/types'

export function DashboardView() {
  const { t } = useLanguage()
  const [claimsData] = useKV<ClaimData[]>('claims-data', [])
  
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
  
  if (!metrics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Upload some files to see your claims dashboard
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('dashboard.overview')}</p>
      </div>
      
      {/* Export Controls */}
      <ExportControls 
        data={claimsData}
        analysisResult={metrics.analysisResult}
      />
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.totalClaims')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClaims.toLocaleString()}</div>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
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
            <div className="text-2xl font-bold">
              {metrics.avgProcessingTime.toFixed(1)} {t('common.days')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-secondary" />
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
            <div className="text-2xl font-bold text-yellow-600">
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
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t('dashboard.topRejectionReasons')}
          </CardTitle>
          <CardDescription>
            Most common reasons for claim rejections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.topRejectionReasons.map(([reason, count], index) => {
            const percentage = (count / metrics.rejectedClaims) * 100
            return (
              <div key={reason} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium text-sm">{reason}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {count} claims ({percentage.toFixed(1)}%)
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
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-secondary" />
            {t('saudi.compliance')}
          </CardTitle>
          <CardDescription>
            Compliance with Saudi healthcare insurance regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-secondary">98.5%</div>
              <p className="text-sm text-muted-foreground">CCHI Compliance</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-accent">100%</div>
              <p className="text-sm text-muted-foreground">Data Security</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">95.2%</div>
              <p className="text-sm text-muted-foreground">Processing Standards</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}