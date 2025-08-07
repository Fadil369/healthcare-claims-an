import { useMemo, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ExportControls } from '@/components/ExportControls'
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
    
    const totalClaims = claimsData.length
    const rejectedClaims = claimsData.filter(claim => claim.status === 'rejected')
    const rejectionRate = (rejectedClaims.length / totalClaims) * 100
    
    const generatedInsights: InsightData[] = []
    
    // High rejection rate insight
    if (rejectionRate > 20) {
      generatedInsights.push({
        id: 'high-rejection-rate',
        title: 'High Overall Rejection Rate Detected',
        description: `Current rejection rate is ${rejectionRate.toFixed(1)}%, significantly above the Saudi market average of 15%. This represents potential revenue loss and operational inefficiency.`,
        category: 'actionable',
        priority: 'high',
        actionItems: [
          'Review and update pre-submission validation processes',
          'Create feedback loop with insurance companies',
          'Implement real-time claim validation system',
          'Focus training on top rejection categories'
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
        description: `${problematicProviders.length} provider(s) have rejection rates above 30%. Targeted training could significantly improve overall performance.`,
        category: 'actionable',
        priority: 'medium',
        actionItems: [
          'Schedule one-on-one training sessions with high-rejection providers',
          'Create provider-specific rejection reports',
          'Implement monthly performance reviews',
          'Establish best practice sharing sessions'
        ],
        estimatedImpact: 'Could reduce provider-specific rejections by 40-60%',
        timeline: '2-4 months'
      })
    }
    
    // CCHI compliance insight
    generatedInsights.push({
      id: 'cchi-compliance',
      title: 'CCHI Compliance Status',
      description: 'Ensure all claims meet Saudi Arabia\'s Council of Cooperative Health Insurance regulations and standards.',
      category: 'informational',
      priority: 'high',
      actionItems: [
        'Update internal processes to match latest CCHI guidelines',
        'Implement CCHI-specific validation rules',
        'Train staff on Saudi regulatory requirements',
        'Establish compliance monitoring dashboard'
      ],
      estimatedImpact: 'Maintains regulatory compliance and reduces administrative overhead',
      timeline: 'Ongoing'
    })
    
    // Predictive insight
    generatedInsights.push({
      id: 'predictive-analysis',
      title: 'AI-Powered Predictive Analysis',
      description: 'Based on current trends, the system predicts rejection patterns and suggests proactive measures.',
      category: 'informational',
      priority: 'medium',
      actionItems: [
        'Implement AI pre-submission screening',
        'Create predictive rejection alerts',
        'Develop trend-based training materials',
        'Establish early warning systems'
      ],
      estimatedImpact: 'Could prevent 25-35% of future rejections',
      timeline: '6-12 months'
    })
    
    return generatedInsights
  }, [claimsData])
  
  const generateTrainingMaterial = async () => {
    setIsGeneratingTraining(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      // In a real implementation, this would call the LLM API
      const prompt = spark.llmPrompt`
        Based on the healthcare insurance claims data analysis:
        - Total claims: ${claimsData.length}
        - Top rejection patterns: Technical documentation errors, Missing authorization codes
        - Provider performance variations
        
        Generate comprehensive training material covering:
        1. Common rejection reasons and how to avoid them
        2. Saudi CCHI compliance requirements
        3. Best practices for claim submission
        4. Provider-specific improvement areas
      `
      // For demo purposes, we'll simulate the response
      toast.success('Training material generated successfully')
    } catch (error) {
      toast.error('Failed to generate training material')
    } finally {
      setIsGeneratingTraining(false)
    }
  }
  
  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Comprehensive report downloaded successfully')
    } catch (error) {
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }
  
  if (!insights) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('insights.title')}</h2>
          <p className="text-muted-foreground">
            Upload and analyze claims data to generate insights and recommendations.
          </p>
        </div>
      </div>
    )
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'actionable': return <Target className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('insights.title')}</h1>
          <p className="text-muted-foreground">
            AI-powered insights and actionable recommendations to reduce rejection rates
          </p>
        </div>
        
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {t('insights.recommendations')}
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t('insights.actionPlan')}
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t('insights.predictions')}
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t('insights.training')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {insights.map(insight => (
                <Card key={insight.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">
                          {getCategoryIcon(insight.category)}
                          {insight.title}
                          <Badge variant={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-base">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Action Items:</h4>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <span className="text-sm font-medium">Estimated Impact:</span>
                          <p className="text-sm text-muted-foreground">{insight.estimatedImpact}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Timeline:</span>
                          <p className="text-sm text-muted-foreground">{insight.timeline}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="action-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  90-Day Action Plan
                </CardTitle>
                <CardDescription>
                  Prioritized implementation roadmap for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <span className="font-bold text-destructive">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Days 1-30: Immediate Fixes</h4>
                      <p className="text-sm text-muted-foreground">Focus on technical rejections and data quality</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Audit current data entry processes</li>
                        <li>• Implement basic validation checks</li>
                        <li>• Train staff on common rejection patterns</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                      <span className="font-bold text-secondary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Days 31-60: System Enhancement</h4>
                      <p className="text-sm text-muted-foreground">Deploy advanced validation and provider training</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Deploy AI validation system</li>
                        <li>• Establish provider feedback loops</li>
                        <li>• Create rejection pattern dashboards</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                      <span className="font-bold text-accent">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Days 61-90: Optimization</h4>
                      <p className="text-sm text-muted-foreground">System optimization and continuous improvement</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Implement advanced analytics dashboard</li>
                        <li>• Establish continuous improvement process</li>
                        <li>• Deploy predictive rejection prevention</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Performance Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Processing Efficiency</span>
                    <span className="text-sm font-medium">+35%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejection Rate Reduction</span>
                    <span className="text-sm font-medium">-45%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    85% confidence in rejection pattern predictions based on current data trends
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Risk Claims</span>
                    <span className="text-sm font-medium text-destructive">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Risk Claims</span>
                    <span className="text-sm font-medium text-secondary">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Risk Claims</span>
                    <span className="text-sm font-medium text-secondary">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('insights.training')}
                </CardTitle>
                <CardDescription>
                  AI-generated training materials for providers and staff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-primary">12</span>
                    <p className="text-sm text-muted-foreground">Training Modules</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-primary">45</span>
                    <p className="text-sm text-muted-foreground">Best Practices</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-primary">8</span>
                    <p className="text-sm text-muted-foreground">Case Studies</p>
                  </div>
                </div>
                
                <Button 
                  onClick={generateTrainingMaterial}
                  disabled={isGeneratingTraining}
                  className="w-full"
                >
                  {isGeneratingTraining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
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
                  Generate detailed insights and recommendations report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Executive Summary</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Detailed Analysis</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Action Plans</span>
                  </div>
                </div>
                
                <Button 
                  onClick={generateReport}
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {t('insights.downloadReport')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <ExportControls 
              data={claimsData}
              insights={insights}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}