export interface ClaimData {
  id: string
  claimNumber: string
  patientName: string
  providerId: string
  providerName: string
  serviceDate: string
  submissionDate: string
  amount: number
  status: 'approved' | 'rejected' | 'pending'
  rejectionReason?: string
  rejectionCategory?: 'medical' | 'technical'
  rejectionSubcategory?: string
  processingTime: number
  diagnosisCode: string
  procedureCode: string
  membershipNumber: string
  policyNumber: string
}

export interface RejectionPattern {
  category: 'medical' | 'technical'
  subcategory: string
  count: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  impact: 'high' | 'medium' | 'low'
}

export interface RejectionRule {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  category: 'medical' | 'technical'
  subcategory: string
  subcategoryAr: string
  keywords: string[]
  keywordsAr: string[]
  codes: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  autoFix: boolean
  fixSuggestion: string
  fixSuggestionAr: string
  providerId?: string
  providerSpecific: boolean
  isActive: boolean
  createdDate: string
  lastModified: string
}

export interface InsuranceProvider {
  id: string
  name: string
  nameAr: string
  code: string
  country: string
  specificRules: RejectionRule[]
  customCategories: {
    medical: string[]
    technical: string[]
  }
  customCategoriesAr: {
    medical: string[]
    technical: string[]
  }
  contactInfo: {
    phone: string
    email: string
    website: string
  }
  isActive: boolean
}

export interface RejectionAnalysis {
  ruleId: string
  ruleName: string
  matches: ClaimData[]
  confidence: number
  suggestedAction: string
  estimatedSavings: number
}

export interface InsightData {
  id: string
  title: string
  description: string
  category: 'actionable' | 'informational' | 'warning'
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
  estimatedImpact: string
  timeline: string
}

export interface AnalysisResult {
  totalClaims: number
  totalAmount: number
  rejectedClaims: number
  rejectionRate: number
  avgProcessingTime: number
  pendingClaims: number
  patterns: RejectionPattern[]
  insights: InsightData[]
  rejectionAnalysis: RejectionAnalysis[]
  trends: {
    period: string
    claims: number
    rejections: number
    amount: number
  }[]
  // Enhanced analysis features
  statisticalAnalysis?: StatisticalAnalysis
  trendAnalysis?: TrendAnalysis
  comparativeAnalysis?: ComparativeAnalysis
  predictionResults?: PredictionResults
}

export interface StatisticalAnalysis {
  claimAmounts: {
    mean: number
    median: number
    standardDeviation: number
    min: number
    max: number
    quartiles: [number, number, number]
  }
  processingTimes: {
    mean: number
    median: number
    standardDeviation: number
  }
  correlations: {
    amountVsProcessingTime: number
    rejectionRateByProvider: { [providerId: string]: number }
  }
  outliers: {
    highValueClaims: ClaimData[]
    longProcessingClaims: ClaimData[]
  }
}

export interface TrendAnalysis {
  monthlyTrends: {
    month: string
    totalClaims: number
    rejectedClaims: number
    averageAmount: number
    rejectionRate: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }[]
  seasonalPatterns: {
    season: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    averageClaims: number
    averageRejectionRate: number
  }[]
  yearOverYearComparison?: {
    currentYear: number
    previousYear: number
    growthRate: number
    rejectionRateChange: number
  }
}

export interface ComparativeAnalysis {
  providerComparison: {
    providerId: string
    providerName: string
    totalClaims: number
    rejectionRate: number
    averageAmount: number
    ranking: number
    benchmarkComparison: 'above' | 'below' | 'at' // compared to industry average
  }[]
  categoryComparison: {
    category: 'medical' | 'technical'
    subcategory: string
    frequency: number
    impact: 'high' | 'medium' | 'low'
    trend: 'increasing' | 'decreasing' | 'stable'
  }[]
  timeComparison: {
    currentPeriod: {
      startDate: string
      endDate: string
      totalClaims: number
      rejectionRate: number
    }
    previousPeriod: {
      startDate: string
      endDate: string
      totalClaims: number
      rejectionRate: number
    }
    percentageChange: number
  }
}

export interface PredictionResults {
  claimApprovalModel: {
    accuracy: number
    predictions: {
      claimId: string
      predictedStatus: 'approved' | 'rejected'
      confidence: number
      riskFactors: string[]
    }[]
  }
  fraudDetection: {
    suspiciousClaims: {
      claimId: string
      riskScore: number
      riskLevel: 'high' | 'medium' | 'low'
      flags: string[]
    }[]
    overallFraudRate: number
  }
  costPrediction: {
    nextPeriodEstimate: number
    confidence: number
    factors: string[]
  }
  trendForecasting: {
    nextMonthPrediction: {
      expectedClaims: number
      expectedRejectionRate: number
      confidence: number
    }
    nextQuarterPrediction: {
      expectedClaims: number
      expectedRejectionRate: number
      confidence: number
    }
  }
}

// Enhanced ClaimData with ML features
export interface EnhancedClaimData extends ClaimData {
  predictionScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  fraudProbability?: number
  recommendedAction?: string
}