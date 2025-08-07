import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@/hooks/useKV'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartBar, TrendUp, TrendDown, Warning, CheckCircle, CurrencyDollar, Calendar, Brain, Target } from '@phosphor-icons/react'
import { ClaimData, StatisticalAnalysis, TrendAnalysis, ComparativeAnalysis, PredictionResults } from '@/types'
import { advancedAnalytics } from '@/lib/advancedAnalytics'
import { ExportControls } from '@/components/ExportControls'
import { toast } from 'sonner'

export function EnhancedAnalysisView() {
  const [claimsData] = useKV<ClaimData[]>('claims-data', [])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [statisticalAnalysis, setStatisticalAnalysis] = useState<StatisticalAnalysis | null>(null)
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null)
  const [comparativeAnalysis, setComparativeAnalysis] = useState<ComparativeAnalysis | null>(null)
  const [predictionResults, setPredictionResults] = useState<PredictionResults | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Run analysis when data changes
  useEffect(() => {
    if (claimsData.length > 0) {
      performComprehensiveAnalysis()
    }
  }, [claimsData])

  const performComprehensiveAnalysis = async () => {
    if (claimsData.length === 0) {
      toast.error('No claims data available for analysis')
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Perform all analyses
      const [statistical, trend, comparative, prediction] = await Promise.all([
        Promise.resolve(advancedAnalytics.performStatisticalAnalysis(claimsData)),
        Promise.resolve(advancedAnalytics.performTrendAnalysis(claimsData)),
        Promise.resolve(advancedAnalytics.performComparativeAnalysis(claimsData)),
        Promise.resolve(advancedAnalytics.performPredictionAnalysis(claimsData))
      ])

      setStatisticalAnalysis(statistical)
      setTrendAnalysis(trend)
      setComparativeAnalysis(comparative)
      setPredictionResults(prediction)
      
      toast.success('Comprehensive analysis completed successfully!')
      
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analysisProgress = useMemo(() => {
    let completed = 0
    if (statisticalAnalysis) completed++
    if (trendAnalysis) completed++
    if (comparativeAnalysis) completed++
    if (predictionResults) completed++
    return (completed / 4) * 100
  }, [statisticalAnalysis, trendAnalysis, comparativeAnalysis, predictionResults])

  if (claimsData.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <ChartBar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-6">
            Upload claims data to begin advanced analysis with AI-powered insights.
          </p>
          <Button onClick={() => window.location.href = '#upload'}>
            Upload Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Claims Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered insights and predictions for {claimsData.length.toLocaleString()} claims
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={performComprehensiveAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
            <ExportControls 
              data={claimsData}
              analysisResult={{
                totalClaims: claimsData.length,
                totalAmount: claimsData.reduce((sum, c) => sum + c.amount, 0),
                rejectedClaims: claimsData.filter(c => c.status === 'rejected').length,
                rejectionRate: (claimsData.filter(c => c.status === 'rejected').length / claimsData.length) * 100,
                avgProcessingTime: claimsData.reduce((sum, c) => sum + c.processingTime, 0) / claimsData.length,
                pendingClaims: claimsData.filter(c => c.status === 'pending').length,
                patterns: [],
                insights: [],
                rejectionAnalysis: [],
                trends: [],
                statisticalAnalysis,
                trendAnalysis,
                comparativeAnalysis,
                predictionResults
              }}
            />
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                Running Advanced Analysis
              </CardTitle>
              <CardDescription>
                Processing claims data with AI and statistical models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(analysisProgress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistical">Statistical</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparative">Comparative</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                  <ChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{claimsData.length.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All processed claims
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
                  <Warning className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((claimsData.filter(c => c.status === 'rejected').length / claimsData.length) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Claims rejected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(claimsData.reduce((sum, c) => sum + c.amount, 0) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    SAR total value
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(claimsData.reduce((sum, c) => sum + c.processingTime, 0) / claimsData.length)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days average
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(claimsData.filter(c => c.status === 'approved').length / claimsData.length) * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium">
                        {((claimsData.filter(c => c.status === 'approved').length / claimsData.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Processing Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(100, (30 / Math.max(1, claimsData.reduce((sum, c) => sum + c.processingTime, 0) / claimsData.length)) * 100)} className="w-20 h-2" />
                      <span className="text-sm font-medium">
                        {Math.min(100, (30 / Math.max(1, claimsData.reduce((sum, c) => sum + c.processingTime, 0) / claimsData.length)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {predictionResults && (
                    <div className="flex justify-between items-center">
                      <span>ML Model Accuracy</span>
                      <div className="flex items-center gap-2">
                        <Progress value={predictionResults.claimApprovalModel.accuracy} className="w-20 h-2" />
                        <span className="text-sm font-medium">
                          {predictionResults.claimApprovalModel.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Statistical Analysis</span>
                    {statisticalAnalysis ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Trend Analysis</span>
                    {trendAnalysis ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>ML Predictions</span>
                    {predictionResults ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistical Analysis Tab */}
          <TabsContent value="statistical" className="space-y-6">
            {statisticalAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Amount Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Mean</p>
                        <p className="text-lg font-semibold">{statisticalAnalysis.claimAmounts.mean.toLocaleString()} SAR</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Median</p>
                        <p className="text-lg font-semibold">{statisticalAnalysis.claimAmounts.median.toLocaleString()} SAR</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Std Deviation</p>
                        <p className="text-lg font-semibold">{statisticalAnalysis.claimAmounts.standardDeviation.toLocaleString()} SAR</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Range</p>
                        <p className="text-lg font-semibold">
                          {statisticalAnalysis.claimAmounts.min.toLocaleString()} - {statisticalAnalysis.claimAmounts.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processing Time Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-lg font-semibold">{statisticalAnalysis.processingTimes.mean.toFixed(1)} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Median</p>
                        <p className="text-lg font-semibold">{statisticalAnalysis.processingTimes.median.toFixed(1)} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>High-Value Claims (Outliers)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Claims exceeding 2 standard deviations from mean
                    </p>
                    <div className="text-2xl font-bold">
                      {statisticalAnalysis.outliers.highValueClaims.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((statisticalAnalysis.outliers.highValueClaims.length / claimsData.length) * 100).toFixed(1)}% of total claims
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Correlations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Amount vs Processing Time</span>
                        <span className="font-semibold">
                          {statisticalAnalysis.correlations.amountVsProcessingTime.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Statistical analysis not available. Please ensure claims data is loaded and refresh the analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Trend Analysis Tab */}
          <TabsContent value="trends" className="space-y-6">
            {trendAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trendAnalysis.monthlyTrends.slice(-6).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{trend.month}</p>
                            <p className="text-sm text-muted-foreground">
                              {trend.totalClaims} claims • {trend.rejectionRate.toFixed(1)}% rejection rate
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {trend.trend === 'increasing' && <TrendUp className="w-4 h-4 text-destructive" />}
                            {trend.trend === 'decreasing' && <TrendDown className="w-4 h-4 text-secondary" />}
                            <Badge variant={trend.trend === 'increasing' ? 'destructive' : trend.trend === 'decreasing' ? 'default' : 'secondary'}>
                              {trend.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Seasonal Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {trendAnalysis.seasonalPatterns.map((season, index) => (
                        <div key={index} className="text-center p-4 border rounded-lg">
                          <p className="font-semibold">{season.season}</p>
                          <p className="text-2xl font-bold">{season.averageClaims}</p>
                          <p className="text-xs text-muted-foreground">avg claims</p>
                          <p className="text-sm mt-1">{season.averageRejectionRate.toFixed(1)}% rejection</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {trendAnalysis.yearOverYearComparison && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Year-over-Year Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Growth Rate</p>
                          <p className="text-2xl font-bold flex items-center gap-2">
                            {trendAnalysis.yearOverYearComparison.growthRate > 0 ? 
                              <TrendUp className="w-5 h-5 text-destructive" /> : 
                              <TrendDown className="w-5 h-5 text-secondary" />
                            }
                            {Math.abs(trendAnalysis.yearOverYearComparison.growthRate).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rejection Rate Change</p>
                          <p className="text-2xl font-bold">
                            {trendAnalysis.yearOverYearComparison.rejectionRateChange > 0 ? '+' : ''}
                            {trendAnalysis.yearOverYearComparison.rejectionRateChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Trend analysis not available. Please ensure claims data is loaded and refresh the analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Comparative Analysis Tab */}
          <TabsContent value="comparative" className="space-y-6">
            {comparativeAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Performance Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparativeAnalysis.providerComparison.slice(0, 10).map((provider, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{provider.ranking}</Badge>
                            <div>
                              <p className="font-medium">{provider.providerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {provider.totalClaims} claims • {provider.averageAmount.toLocaleString()} SAR avg
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{provider.rejectionRate.toFixed(1)}%</p>
                            <Badge variant={
                              provider.benchmarkComparison === 'below' ? 'default' :
                              provider.benchmarkComparison === 'above' ? 'destructive' : 'secondary'
                            }>
                              {provider.benchmarkComparison} benchmark
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Period Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Current Period</h4>
                        <p className="text-sm text-muted-foreground">{comparativeAnalysis.timeComparison.currentPeriod.startDate} to {comparativeAnalysis.timeComparison.currentPeriod.endDate}</p>
                        <p className="text-2xl font-bold">{comparativeAnalysis.timeComparison.currentPeriod.totalClaims}</p>
                        <p className="text-sm">claims • {comparativeAnalysis.timeComparison.currentPeriod.rejectionRate.toFixed(1)}% rejected</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Previous Period</h4>
                        <p className="text-sm text-muted-foreground">{comparativeAnalysis.timeComparison.previousPeriod.startDate} to {comparativeAnalysis.timeComparison.previousPeriod.endDate}</p>
                        <p className="text-2xl font-bold">{comparativeAnalysis.timeComparison.previousPeriod.totalClaims}</p>
                        <p className="text-sm">claims • {comparativeAnalysis.timeComparison.previousPeriod.rejectionRate.toFixed(1)}% rejected</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Change: {comparativeAnalysis.timeComparison.percentageChange > 0 ? '+' : ''}{comparativeAnalysis.timeComparison.percentageChange.toFixed(1)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Comparative analysis not available. Please ensure claims data is loaded and refresh the analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            {predictionResults ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      ML Model Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{predictionResults.claimApprovalModel.accuracy.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Model Accuracy</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{predictionResults.fraudDetection.overallFraudRate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Fraud Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{predictionResults.fraudDetection.suspiciousClaims.length}</p>
                        <p className="text-sm text-muted-foreground">Suspicious Claims</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Period Estimate</p>
                        <p className="text-2xl font-bold">{(predictionResults.costPrediction.nextPeriodEstimate / 1000000).toFixed(1)}M SAR</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(predictionResults.costPrediction.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trend Forecasting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Next Month</h4>
                        <p className="text-xl font-bold">{predictionResults.trendForecasting.nextMonthPrediction.expectedClaims}</p>
                        <p className="text-sm text-muted-foreground">expected claims</p>
                        <p className="text-sm">{predictionResults.trendForecasting.nextMonthPrediction.expectedRejectionRate.toFixed(1)}% rejection rate</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Next Quarter</h4>
                        <p className="text-xl font-bold">{predictionResults.trendForecasting.nextQuarterPrediction.expectedClaims}</p>
                        <p className="text-sm text-muted-foreground">expected claims</p>
                        <p className="text-sm">{predictionResults.trendForecasting.nextQuarterPrediction.expectedRejectionRate.toFixed(1)}% rejection rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {predictionResults.fraudDetection.suspiciousClaims.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>High-Risk Claims Requiring Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {predictionResults.fraudDetection.suspiciousClaims.slice(0, 5).map((suspicious, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Claim ID: {suspicious.claimId}</p>
                              <p className="text-sm text-muted-foreground">
                                Flags: {suspicious.flags.join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                suspicious.riskLevel === 'high' ? 'destructive' :
                                suspicious.riskLevel === 'medium' ? 'default' : 'secondary'
                              }>
                                {suspicious.riskLevel} risk
                              </Badge>
                              <p className="text-sm mt-1">Score: {suspicious.riskScore}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  Prediction analysis not available. Please ensure claims data is loaded and refresh the analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}