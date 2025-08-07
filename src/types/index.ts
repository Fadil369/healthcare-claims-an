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
}