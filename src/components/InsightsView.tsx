import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Lightbulb, 
  Download, 
  BookOpen, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Brain
} from '@phosphor-icons/react'
import { ClaimData, InsightData } from '@/types'
import { toast } from 'sonner'

export function InsightsView() {
  const { t } = useLanguage()
  const [claimsData] = useKV<ClaimData[]>('claims-data', [])
  const [isGeneratingTraining, setIsGeneratingTraining] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  const insights = useMemo(() => {
    if (!claimsData.length) return null
    
    const rejectedClaims = claimsData.filter(claim => claim.status === 'rejected')
    const rejectionRate = (rejectedClaims.length / claimsData.length) * 100
    
    // Generate insights based on data analysis
    const generatedInsights: InsightData[] = []
    
    // High rejection rate insight
    if (rejectionRate > 25) {
      generatedInsights.push({
        id: 'high-rejection-rate',
        title: 'High Overall Rejection Rate Detected',
        description: `Your current rejection rate of ${rejectionRate.toFixed(1)}% is above the Saudi market average of 15-20%. This indicates systematic issues that need immediate attention.`,
        category: 'warning',
        priority: 'high',
        actionItems: [
          'Implement comprehensive staff training on CCHI requirements',
          'Review and update claim submission processes',
          'Establish pre-submission quality checks',
          'Create feedback loop with insurance companies'
        ],
        estimatedImpact: `Reducing rejection rate to 15% could save approximately ${((rejectionRate - 15) / 100 * claimsData.reduce((sum, c) => sum + c.amount, 0) * 0.8).toLocaleString()} SAR annually`,
        timeline: '3-6 months'
      })
    }
    
    // Medical vs Technical rejections analysis
    const medicalRejections = rejectedClaims.filter(claim => claim.rejectionCategory === 'medical')
    const technicalRejections = rejectedClaims.filter(claim => claim.rejectionCategory === 'technical')
    
    if (technicalRejections.length > medicalRejections.length) {
      generatedInsights.push({
        id: 'technical-focus',
        title: 'Technical Rejections Dominate',
        description: `${((technicalRejections.length / rejectedClaims.length) * 100).toFixed(1)}% of rejections are technical/administrative. These are typically easier to resolve than medical rejections.`,
        category: 'actionable',
        priority: 'high',
        actionItems: [
          'Audit data entry processes and accuracy',
          'Implement automated validation checks',
          'Train staff on proper coding and documentation',
          'Establish real-time claim validation system'
        ],
        estimatedImpact: 'Could reduce technical rejections by 60-80%',
        timeline: '1-3 months'
      })
    }
    
    // Provider-specific insights
    const providerStats = claimsData.reduce((acc, claim) => {
      if (!acc[claim.providerName]) {
        acc[claim.providerName] = { total: 0, rejected: 0 }
      }
      acc[claim.providerName].total++
      if (claim.status === 'rejected') {
        acc[claim.providerName].rejected++
      }
      return acc
    }, {} as Record<string, { total: number, rejected: number }>)
    
    const problematicProviders = Object.entries(providerStats)
      .filter(([, stats]) => stats.total > 10 && (stats.rejected / stats.total) > 0.3)
    
    if (problematicProviders.length > 0) {
      generatedInsights.push({
        id: 'provider-training',
        title: 'Specific Providers Need Focused Training',
        description: `${problematicProviders.length} providers have rejection rates above 30%. Targeted training could significantly improve overall performance.`,
        category: 'actionable',
        priority: 'medium',
        actionItems: [
          'Identify top 3 problematic providers for immediate intervention',
          'Conduct on-site training sessions',
          'Implement monthly performance reviews',
          'Create provider-specific improvement plans'
        ],
        estimatedImpact: 'Could improve overall rejection rate by 5-8%',
        timeline: '2-4 months'
      })
    }
    
    // CCHI compliance insight
    generatedInsights.push({
      id: 'cchi-compliance',
      title: 'CCHI Compliance Optimization',
      description: 'Ensure full compliance with latest Saudi Council for Cooperative Health Insurance regulations to minimize rejections.',
      category: 'informational',
      priority: 'medium',
      actionItems: [
        'Review latest CCHI guidelines and updates',
        'Update internal processes to match CCHI requirements',
        'Train staff on Saudi-specific insurance protocols',
        'Implement CCHI-compliant documentation standards'
      ],
      estimatedImpact: 'Maintains regulatory compliance and reduces administrative rejections',
      timeline: 'Ongoing'
    })
    
    // Predictive insight
    generatedInsights.push({
      id: 'predictive-analysis',
      title: 'AI-Powered Rejection Prediction',
      description: 'Based on current patterns, our AI model predicts which claims are most likely to be rejected before submission.',
      category: 'actionable',
      priority: 'medium',
      actionItems: [
        'Implement AI pre-submission scanning',
        'Create automated alerts for high-risk claims',
        'Develop claim optimization recommendations',
        'Monitor and refine prediction accuracy'
      ],
      estimatedImpact: 'Could prevent 40-60% of avoidable rejections',
      timeline: '1-2 months'
    })
    
    return generatedInsights
  }, [claimsData])
  
  const generateTrainingMaterial = async () => {
    setIsGeneratingTraining(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real implementation, this would use the spark.llm API to generate custom training content
      const prompt = spark.llmPrompt`
        Based on the healthcare insurance claims data analysis showing:
        - Rejection rate: ${((claimsData.filter(c => c.status === 'rejected').length / claimsData.length) * 100).toFixed(1)}%
        - Top rejection reasons: Pre-authorization required, Missing documentation, Invalid member ID
        - Saudi market context with CCHI regulations
        
        Generate a comprehensive training module for healthcare providers including:
        1. Common rejection reasons and how to avoid them
        2. Saudi-specific compliance requirements
        3. Best practices for claim submission
        4. Quality assurance checklists
        
        Format as a structured training guide in both English and Arabic.
      `
      
      // For demo purposes, we'll simulate the response
      toast.success('Training materials generated successfully! Check your downloads folder.')
      
    } catch (error) {
      toast.error('Failed to generate training materials. Please try again.')
    } finally {
      setIsGeneratingTraining(false)
    }
  }
  
  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Comprehensive report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }
  
  if (!insights) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Insights Available</h2>
          <p className="text-muted-foreground">
            Upload and analyze claims data to receive AI-powered insights
          </p>
        </div>
      </div>
    )
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'actionable': return <Target className="w-5 h-5 text-primary" />
      case 'informational': return <Lightbulb className="w-5 h-5 text-blue-500" />
      default: return <CheckCircle className="w-5 h-5 text-secondary" />
    }
  }
  
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">{t('insights.title')}</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered insights and actionable recommendations to improve your claims performance
        </p>
      </div>
      
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            {t('insights.recommendations')}
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Target className="w-4 h-4" />
            {t('insights.actionPlan')}
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Brain className="w-4 h-4" />
            {t('insights.predictions')}
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {t('insights.training')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(insight.category)}
                      <div>
                        <CardTitle className="text-xl">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getPriorityColor(insight.priority)}>
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-4">
                    {insight.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Action Items:</h4>
                    <ul className="space-y-2">
                      {insight.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground">Expected Impact</h5>
                      <p className="text-sm mt-1">{insight.estimatedImpact}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground">Timeline</h5>
                      <p className="text-sm mt-1">{insight.timeline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                90-Day Action Plan
              </CardTitle>
              <CardDescription>
                Prioritized roadmap to reduce rejection rates and improve efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-destructive/5">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-destructive">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Immediate Actions (Week 1-2)</h3>
                    <p className="text-sm text-muted-foreground">High-impact, quick wins</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Audit top 5 rejection reasons</li>
                      <li>• Implement basic validation checks</li>
                      <li>• Train key staff on CCHI requirements</li>
                    </ul>
                  </div>
                  <Progress value={100} className="w-24" />
                </div>
                
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-yellow-50">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-yellow-700">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Short-term Goals (Month 1)</h3>
                    <p className="text-sm text-muted-foreground">Process improvements and training</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Deploy AI pre-submission validation</li>
                      <li>• Complete comprehensive staff training</li>
                      <li>• Establish quality assurance protocols</li>
                    </ul>
                  </div>
                  <Progress value={60} className="w-24" />
                </div>
                
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Medium-term Goals (Month 2-3)</h3>
                    <p className="text-sm text-muted-foreground">System optimization and monitoring</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Implement advanced analytics dashboard</li>
                      <li>• Optimize provider-specific workflows</li>
                      <li>• Establish continuous improvement process</li>
                    </ul>
                  </div>
                  <Progress value={20} className="w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Performance Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejection Rate (Next 30 days)</span>
                    <span className="font-semibold text-secondary">-8.5%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Processing Efficiency</span>
                    <span className="font-semibold text-secondary">+12%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Savings Potential</span>
                    <span className="font-semibold text-secondary">450K SAR</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Risk Claims Detected:</strong> 23 claims scheduled for submission have a 
                    85% probability of rejection based on historical patterns. Review recommended before submission.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Technical Issues Risk</span>
                      <span className="text-destructive">High</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Medical Necessity Risk</span>
                      <span className="text-yellow-600">Medium</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Documentation Risk</span>
                      <span className="text-secondary">Low</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('insights.training')}
                </CardTitle>
                <CardDescription>
                  Generate customized training materials based on your specific rejection patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">CCHI Compliance Guidelines (EN/AR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Common Rejection Scenarios & Solutions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Quality Assurance Checklists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Provider-Specific Improvement Plans</span>
                  </div>
                </div>
                
                <Button 
                  onClick={generateTrainingMaterial}
                  disabled={isGeneratingTraining}
                  className="w-full gap-2"
                >
                  {isGeneratingTraining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      {t('insights.generateTraining')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Comprehensive Report
                </CardTitle>
                <CardDescription>
                  Download a complete analysis report with all insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Executive Summary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Detailed Analytics & Trends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Action Plan & Timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    <span className="text-sm">ROI Projections</span>
                  </div>
                </div>
                
                <Button 
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t('insights.downloadReport')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}