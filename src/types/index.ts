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
  trends: {
    period: string
    claims: number
    rejections: number
    amount: number
  }[]
}