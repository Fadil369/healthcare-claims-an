import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Calendar } from '@phosphor-icons/react'
import { ClaimData, RejectionPattern } from '@/types'

export function AnalysisView() {
  const { t } = useLanguage()
  const [claimsData] = useKV<ClaimData[]>('claims-data', [])
  const [timeRange, setTimeRange] = useState('30')
  
  const analysisData = useMemo(() => {
    if (!claimsData.length) return null
    
    // Filter by time range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))
    const filteredData = claimsData.filter(
      claim => new Date(claim.submissionDate) >= cutoffDate
    )
    
    const rejectedClaims = filteredData.filter(claim => claim.status === 'rejected')
    
    // Rejection patterns
    const medicalRejections = rejectedClaims.filter(claim => claim.rejectionCategory === 'medical')
    const technicalRejections = rejectedClaims.filter(claim => claim.rejectionCategory === 'technical')
    
    // Pattern analysis
    const patterns: RejectionPattern[] = []
    
    // Medical patterns
    const medicalReasons = medicalRejections.reduce((acc, claim) => {
      const reason = claim.rejectionSubcategory || 'Other'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(medicalReasons).forEach(([subcategory, count]) => {
      patterns.push({
        category: 'medical',
        subcategory,
        count,
        percentage: (count / rejectedClaims.length) * 100,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        impact: count > rejectedClaims.length * 0.1 ? 'high' : count > rejectedClaims.length * 0.05 ? 'medium' : 'low'
      })
    })
    
    // Technical patterns
    const technicalReasons = technicalRejections.reduce((acc, claim) => {
      const reason = claim.rejectionSubcategory || 'Other'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(technicalReasons).forEach(([subcategory, count]) => {
      patterns.push({
        category: 'technical',
        subcategory,
        count,
        percentage: (count / rejectedClaims.length) * 100,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        impact: count > rejectedClaims.length * 0.1 ? 'high' : count > rejectedClaims.length * 0.05 ? 'medium' : 'low'
      })
    })
    
    // Provider analysis
    const providerStats = filteredData.reduce((acc, claim) => {
      const provider = claim.providerName
      if (!acc[provider]) {
        acc[provider] = { total: 0, rejected: 0, amount: 0, rejectedAmount: 0 }
      }
      acc[provider].total++
      acc[provider].amount += claim.amount
      if (claim.status === 'rejected') {
        acc[provider].rejected++
        acc[provider].rejectedAmount += claim.amount
      }
      return acc
    }, {} as Record<string, { total: number, rejected: number, amount: number, rejectedAmount: number }>)
    
    const providerAnalysis = Object.entries(providerStats)
      .map(([provider, stats]) => ({
        provider,
        ...stats,
        rejectionRate: (stats.rejected / stats.total) * 100
      }))
      .sort((a, b) => b.rejectionRate - a.rejectionRate)
    
    // Trends over time
    const trends = []
    for (let i = parseInt(timeRange); i >= 0; i -= 7) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - i - 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i)
      
      const weekData = filteredData.filter(claim => {
        const claimDate = new Date(claim.submissionDate)
        return claimDate >= weekStart && claimDate < weekEnd
      })
      
      trends.push({
        period: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        claims: weekData.length,
        rejections: weekData.filter(c => c.status === 'rejected').length,
        amount: weekData.reduce((sum, c) => sum + c.amount, 0)
      })
    }
    
    return {
      totalClaims: filteredData.length,
      rejectedClaims: rejectedClaims.length,
      rejectionRate: (rejectedClaims.length / filteredData.length) * 100,
      medicalRejections: medicalRejections.length,
      technicalRejections: technicalRejections.length,
      patterns,
      providerAnalysis,
      trends
    }
  }, [claimsData, timeRange])
  
  if (!analysisData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Upload some files to see detailed analysis
          </p>
        </div>
      </div>
    )
  }
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-destructive" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-secondary" />
      default: return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('analysis.title')}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Deep dive into rejection patterns and trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.totalClaims.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {analysisData.rejectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical Rejections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.medicalRejections.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Technical Rejections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.technicalRejections.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">{t('analysis.patterns')}</TabsTrigger>
          <TabsTrigger value="providers">{t('analysis.byProvider')}</TabsTrigger>
          <TabsTrigger value="trends">{t('analysis.trends')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical Rejections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-destructive" />
                  {t('analysis.medical')}
                </CardTitle>
                <CardDescription>
                  Medical-related rejection patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisData.patterns
                  .filter(p => p.category === 'medical')
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((pattern) => (
                    <div key={pattern.subcategory} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getImpactColor(pattern.impact)} className="text-xs">
                            {pattern.impact}
                          </Badge>
                          <span className="font-medium text-sm">{pattern.subcategory}</span>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pattern.count} ({pattern.percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={pattern.percentage} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>
            
            {/* Technical Rejections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  {t('analysis.technical')}
                </CardTitle>
                <CardDescription>
                  Technical and administrative rejection patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisData.patterns
                  .filter(p => p.category === 'technical')
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((pattern) => (
                    <div key={pattern.subcategory} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getImpactColor(pattern.impact)} className="text-xs">
                            {pattern.impact}
                          </Badge>
                          <span className="font-medium text-sm">{pattern.subcategory}</span>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pattern.count} ({pattern.percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={pattern.percentage} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('analysis.byProvider')}</CardTitle>
              <CardDescription>
                Provider performance and rejection analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.providerAnalysis.slice(0, 10).map((provider) => (
                  <div key={provider.provider} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{provider.provider}</h3>
                      <Badge variant={provider.rejectionRate > 30 ? 'destructive' : provider.rejectionRate > 15 ? 'default' : 'secondary'}>
                        {provider.rejectionRate.toFixed(1)}% rejection rate
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Claims</div>
                        <div className="font-medium">{provider.total.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rejected</div>
                        <div className="font-medium text-destructive">{provider.rejected.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Amount</div>
                        <div className="font-medium">{provider.amount.toLocaleString()} {t('common.sar')}</div>
                      </div>
                    </div>
                    <Progress value={provider.rejectionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('analysis.trends')}</CardTitle>
              <CardDescription>
                Claims and rejection trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.trends.map((trend, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Period</div>
                      <div className="font-medium text-sm">{trend.period}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Claims</div>
                      <div className="font-medium">{trend.claims.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Rejections</div>
                      <div className="font-medium text-destructive">{trend.rejections.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="font-medium">{trend.amount.toLocaleString()} {t('common.sar')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}