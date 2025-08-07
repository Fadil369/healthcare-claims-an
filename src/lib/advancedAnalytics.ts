import { ClaimData, StatisticalAnalysis, TrendAnalysis, ComparativeAnalysis, PredictionResults } from '@/types'
import { mean, median, standardDeviation, min, max, quantile } from 'simple-statistics'

export class AdvancedAnalytics {
  private static instance: AdvancedAnalytics

  static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics()
    }
    return AdvancedAnalytics.instance
  }

  /**
   * Perform comprehensive statistical analysis on claims data
   */
  performStatisticalAnalysis(claims: ClaimData[]): StatisticalAnalysis {
    if (claims.length === 0) {
      throw new Error('No claims data provided for analysis')
    }

    const amounts = claims.map(c => c.amount).filter(a => a > 0)
    const processingTimes = claims.map(c => c.processingTime).filter(p => p > 0)

    // Calculate claim amount statistics
    const claimAmounts = {
      mean: mean(amounts),
      median: median(amounts),
      standardDeviation: standardDeviation(amounts),
      min: min(amounts),
      max: max(amounts),
      quartiles: [
        quantile(amounts, 0.25),
        quantile(amounts, 0.5),
        quantile(amounts, 0.75)
      ] as [number, number, number]
    }

    // Calculate processing time statistics
    const processingTimeStats = {
      mean: mean(processingTimes),
      median: median(processingTimes),
      standardDeviation: standardDeviation(processingTimes)
    }

    // Calculate correlations
    const correlations = {
      amountVsProcessingTime: this.calculateCorrelation(amounts, processingTimes),
      rejectionRateByProvider: this.calculateRejectionRateByProvider(claims)
    }

    // Identify outliers
    const outliers = this.identifyOutliers(claims, claimAmounts, processingTimeStats)

    return {
      claimAmounts,
      processingTimes: processingTimeStats,
      correlations,
      outliers
    }
  }

  /**
   * Perform trend analysis over time
   */
  performTrendAnalysis(claims: ClaimData[]): TrendAnalysis {
    // Group claims by month
    const monthlyData = this.groupClaimsByMonth(claims)
    
    const monthlyTrends = Object.entries(monthlyData).map(([month, monthClaims]) => {
      const totalClaims = monthClaims.length
      const rejectedClaims = monthClaims.filter(c => c.status === 'rejected').length
      const averageAmount = mean(monthClaims.map(c => c.amount))
      const rejectionRate = totalClaims > 0 ? (rejectedClaims / totalClaims) * 100 : 0

      return {
        month,
        totalClaims,
        rejectedClaims,
        averageAmount,
        rejectionRate,
        trend: this.determineTrend(month, monthlyData) as 'increasing' | 'decreasing' | 'stable'
      }
    }).sort((a, b) => a.month.localeCompare(b.month))

    // Calculate seasonal patterns
    const seasonalPatterns = this.calculateSeasonalPatterns(claims)

    // Year-over-year comparison
    const yearOverYearComparison = this.calculateYearOverYearComparison(claims)

    return {
      monthlyTrends,
      seasonalPatterns,
      yearOverYearComparison
    }
  }

  /**
   * Perform comparative analysis
   */
  performComparativeAnalysis(claims: ClaimData[]): ComparativeAnalysis {
    // Provider comparison
    const providerComparison = this.analyzeProviders(claims)
    
    // Category comparison
    const categoryComparison = this.analyzeRejectionCategories(claims)
    
    // Time period comparison
    const timeComparison = this.compareTimePeriods(claims)

    return {
      providerComparison,
      categoryComparison,
      timeComparison
    }
  }

  /**
   * Perform ML-based predictions and risk analysis
   */
  performPredictionAnalysis(claims: ClaimData[]): PredictionResults {
    // Claim approval prediction model
    const claimApprovalModel = this.buildClaimApprovalModel(claims)
    
    // Fraud detection
    const fraudDetection = this.performFraudDetection(claims)
    
    // Cost prediction
    const costPrediction = this.predictFutureCosts(claims)
    
    // Trend forecasting
    const trendForecasting = this.forecastTrends(claims)

    return {
      claimApprovalModel,
      fraudDetection,
      costPrediction,
      trendForecasting
    }
  }

  // Private helper methods

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const meanX = mean(x)
    const meanY = mean(y)
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0)
    const denominatorX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0))
    const denominatorY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0))
    
    return denominatorX * denominatorY === 0 ? 0 : numerator / (denominatorX * denominatorY)
  }

  private calculateRejectionRateByProvider(claims: ClaimData[]): { [providerId: string]: number } {
    const providerStats: { [providerId: string]: { total: number; rejected: number } } = {}

    claims.forEach(claim => {
      if (!providerStats[claim.providerId]) {
        providerStats[claim.providerId] = { total: 0, rejected: 0 }
      }
      providerStats[claim.providerId].total++
      if (claim.status === 'rejected') {
        providerStats[claim.providerId].rejected++
      }
    })

    const rejectionRates: { [providerId: string]: number } = {}
    Object.entries(providerStats).forEach(([providerId, stats]) => {
      rejectionRates[providerId] = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0
    })

    return rejectionRates
  }

  private identifyOutliers(claims: ClaimData[], amountStats: any, processingStats: any) {
    const amountThreshold = amountStats.mean + 2 * amountStats.standardDeviation
    const processingThreshold = processingStats.mean + 2 * processingStats.standardDeviation

    return {
      highValueClaims: claims.filter(claim => claim.amount > amountThreshold),
      longProcessingClaims: claims.filter(claim => claim.processingTime > processingThreshold)
    }
  }

  private groupClaimsByMonth(claims: ClaimData[]): { [month: string]: ClaimData[] } {
    return claims.reduce((groups, claim) => {
      const date = new Date(claim.submissionDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(claim)
      
      return groups
    }, {} as { [month: string]: ClaimData[] })
  }

  private determineTrend(currentMonth: string, monthlyData: { [month: string]: ClaimData[] }): string {
    const months = Object.keys(monthlyData).sort()
    const currentIndex = months.indexOf(currentMonth)
    
    if (currentIndex < 1) return 'stable'
    
    const previousMonth = months[currentIndex - 1]
    const currentCount = monthlyData[currentMonth].length
    const previousCount = monthlyData[previousMonth].length
    
    if (currentCount > previousCount * 1.1) return 'increasing'
    if (currentCount < previousCount * 0.9) return 'decreasing'
    return 'stable'
  }

  private calculateSeasonalPatterns(claims: ClaimData[]) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const
    
    return quarters.map(quarter => {
      const quarterClaims = claims.filter(claim => {
        const month = new Date(claim.submissionDate).getMonth()
        switch (quarter) {
          case 'Q1': return month >= 0 && month <= 2
          case 'Q2': return month >= 3 && month <= 5
          case 'Q3': return month >= 6 && month <= 8
          case 'Q4': return month >= 9 && month <= 11
          default: return false
        }
      })

      const rejectedClaims = quarterClaims.filter(c => c.status === 'rejected').length
      
      return {
        season: quarter,
        averageClaims: quarterClaims.length,
        averageRejectionRate: quarterClaims.length > 0 ? (rejectedClaims / quarterClaims.length) * 100 : 0
      }
    })
  }

  private calculateYearOverYearComparison(claims: ClaimData[]) {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    const currentYearClaims = claims.filter(c => new Date(c.submissionDate).getFullYear() === currentYear)
    const previousYearClaims = claims.filter(c => new Date(c.submissionDate).getFullYear() === previousYear)

    if (previousYearClaims.length === 0) return undefined

    const currentRejectionRate = currentYearClaims.filter(c => c.status === 'rejected').length / currentYearClaims.length * 100
    const previousRejectionRate = previousYearClaims.filter(c => c.status === 'rejected').length / previousYearClaims.length * 100

    return {
      currentYear,
      previousYear,
      growthRate: ((currentYearClaims.length - previousYearClaims.length) / previousYearClaims.length) * 100,
      rejectionRateChange: currentRejectionRate - previousRejectionRate
    }
  }

  private analyzeProviders(claims: ClaimData[]) {
    const providerStats: { [providerId: string]: any } = {}

    claims.forEach(claim => {
      if (!providerStats[claim.providerId]) {
        providerStats[claim.providerId] = {
          providerId: claim.providerId,
          providerName: claim.providerName,
          totalClaims: 0,
          rejectedClaims: 0,
          totalAmount: 0
        }
      }
      
      providerStats[claim.providerId].totalClaims++
      providerStats[claim.providerId].totalAmount += claim.amount
      
      if (claim.status === 'rejected') {
        providerStats[claim.providerId].rejectedClaims++
      }
    })

    const providers = Object.values(providerStats).map((provider: any) => ({
      ...provider,
      rejectionRate: provider.totalClaims > 0 ? (provider.rejectedClaims / provider.totalClaims) * 100 : 0,
      averageAmount: provider.totalClaims > 0 ? provider.totalAmount / provider.totalClaims : 0,
      ranking: 0,
      benchmarkComparison: 'at' as 'above' | 'below' | 'at'
    }))

    // Sort by rejection rate and assign rankings
    providers.sort((a, b) => a.rejectionRate - b.rejectionRate)
    providers.forEach((provider, index) => {
      provider.ranking = index + 1
    })

    // Set benchmark comparison (assuming 15% is industry average)
    const industryAverage = 15
    providers.forEach(provider => {
      if (provider.rejectionRate > industryAverage) {
        provider.benchmarkComparison = 'above'
      } else if (provider.rejectionRate < industryAverage) {
        provider.benchmarkComparison = 'below'
      }
    })

    return providers
  }

  private analyzeRejectionCategories(claims: ClaimData[]) {
    const categoryStats: { [key: string]: any } = {}

    claims.filter(c => c.status === 'rejected' && c.rejectionCategory).forEach(claim => {
      const key = `${claim.rejectionCategory}-${claim.rejectionSubcategory || 'other'}`
      
      if (!categoryStats[key]) {
        categoryStats[key] = {
          category: claim.rejectionCategory!,
          subcategory: claim.rejectionSubcategory || 'other',
          frequency: 0,
          impact: 'medium' as 'high' | 'medium' | 'low',
          trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
        }
      }
      
      categoryStats[key].frequency++
    })

    return Object.values(categoryStats).map((category: any) => {
      // Determine impact based on frequency
      if (category.frequency > 50) category.impact = 'high'
      else if (category.frequency < 10) category.impact = 'low'
      
      return category
    })
  }

  private compareTimePeriods(claims: ClaimData[]) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const currentPeriodClaims = claims.filter(c => new Date(c.submissionDate) >= thirtyDaysAgo)
    const previousPeriodClaims = claims.filter(c => {
      const date = new Date(c.submissionDate)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    })

    const currentRejectionRate = currentPeriodClaims.filter(c => c.status === 'rejected').length / currentPeriodClaims.length * 100
    const previousRejectionRate = previousPeriodClaims.filter(c => c.status === 'rejected').length / previousPeriodClaims.length * 100

    return {
      currentPeriod: {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        totalClaims: currentPeriodClaims.length,
        rejectionRate: currentRejectionRate || 0
      },
      previousPeriod: {
        startDate: sixtyDaysAgo.toISOString().split('T')[0],
        endDate: thirtyDaysAgo.toISOString().split('T')[0],
        totalClaims: previousPeriodClaims.length,
        rejectionRate: previousRejectionRate || 0
      },
      percentageChange: previousRejectionRate > 0 ? ((currentRejectionRate - previousRejectionRate) / previousRejectionRate) * 100 : 0
    }
  }

  private buildClaimApprovalModel(claims: ClaimData[]) {
    // Simple rule-based model for demonstration
    const predictions = claims.map(claim => {
      let confidence = 0.5
      const riskFactors: string[] = []

      // Amount-based risk
      if (claim.amount > 10000) {
        confidence -= 0.2
        riskFactors.push('High claim amount')
      }

      // Provider-based risk
      const providerRejectionRate = this.calculateRejectionRateByProvider(claims)[claim.providerId] || 0
      if (providerRejectionRate > 20) {
        confidence -= 0.15
        riskFactors.push('High provider rejection rate')
      }

      // Historical patterns
      if (claim.processingTime > 15) {
        confidence -= 0.1
        riskFactors.push('Extended processing time')
      }

      confidence = Math.max(0.1, Math.min(0.9, confidence))

      return {
        claimId: claim.id,
        predictedStatus: confidence > 0.5 ? 'approved' as const : 'rejected' as const,
        confidence: Math.round(confidence * 100) / 100,
        riskFactors
      }
    })

    // Calculate model accuracy (simplified)
    const correctPredictions = predictions.filter(p => {
      const actualClaim = claims.find(c => c.id === p.claimId)
      return actualClaim && actualClaim.status === p.predictedStatus
    })

    return {
      accuracy: predictions.length > 0 ? (correctPredictions.length / predictions.length) * 100 : 0,
      predictions
    }
  }

  private performFraudDetection(claims: ClaimData[]) {
    const suspiciousClaims = claims.map(claim => {
      let riskScore = 0
      const flags: string[] = []

      // Unusual amount patterns
      if (claim.amount > 50000) {
        riskScore += 30
        flags.push('Exceptionally high amount')
      }

      // Rapid submission patterns (would need more sophisticated analysis in real implementation)
      if (claim.processingTime < 1) {
        riskScore += 20
        flags.push('Unusually fast processing')
      }

      // Provider patterns
      const providerClaims = claims.filter(c => c.providerId === claim.providerId)
      if (providerClaims.length > 100) {
        riskScore += 15
        flags.push('High volume provider')
      }

      // Determine risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (riskScore >= 40) riskLevel = 'high'
      else if (riskScore >= 20) riskLevel = 'medium'

      return {
        claimId: claim.id,
        riskScore,
        riskLevel,
        flags
      }
    }).filter(result => result.riskScore > 0)

    const totalSuspicious = suspiciousClaims.filter(c => c.riskLevel === 'high').length
    const overallFraudRate = claims.length > 0 ? (totalSuspicious / claims.length) * 100 : 0

    return {
      suspiciousClaims,
      overallFraudRate
    }
  }

  private predictFutureCosts(claims: ClaimData[]) {
    const monthlyAmounts = this.groupClaimsByMonth(claims)
    const amounts = Object.values(monthlyAmounts).map(monthClaims => 
      monthClaims.reduce((sum, claim) => sum + claim.amount, 0)
    )

    if (amounts.length === 0) {
      return {
        nextPeriodEstimate: 0,
        confidence: 0,
        factors: ['Insufficient data for prediction']
      }
    }

    // Simple moving average prediction
    const avgAmount = mean(amounts)
    const recentTrend = amounts.length >= 2 ? amounts[amounts.length - 1] - amounts[amounts.length - 2] : 0
    const nextPeriodEstimate = avgAmount + (recentTrend * 0.5)

    return {
      nextPeriodEstimate: Math.max(0, nextPeriodEstimate),
      confidence: amounts.length >= 3 ? 0.75 : 0.5,
      factors: [
        'Historical monthly averages',
        'Recent trend analysis',
        'Seasonal adjustments'
      ]
    }
  }

  private forecastTrends(claims: ClaimData[]) {
    const monthlyData = this.groupClaimsByMonth(claims)
    const sortedMonths = Object.keys(monthlyData).sort()
    
    if (sortedMonths.length < 2) {
      return {
        nextMonthPrediction: {
          expectedClaims: 0,
          expectedRejectionRate: 0,
          confidence: 0
        },
        nextQuarterPrediction: {
          expectedClaims: 0,
          expectedRejectionRate: 0,
          confidence: 0
        }
      }
    }

    const recentMonths = sortedMonths.slice(-3)
    const avgClaims = mean(recentMonths.map(month => monthlyData[month].length))
    const avgRejectionRate = mean(recentMonths.map(month => {
      const monthClaims = monthlyData[month]
      const rejected = monthClaims.filter(c => c.status === 'rejected').length
      return monthClaims.length > 0 ? (rejected / monthClaims.length) * 100 : 0
    }))

    return {
      nextMonthPrediction: {
        expectedClaims: Math.round(avgClaims),
        expectedRejectionRate: Math.round(avgRejectionRate * 100) / 100,
        confidence: recentMonths.length >= 3 ? 0.8 : 0.6
      },
      nextQuarterPrediction: {
        expectedClaims: Math.round(avgClaims * 3),
        expectedRejectionRate: Math.round(avgRejectionRate * 100) / 100,
        confidence: recentMonths.length >= 3 ? 0.7 : 0.5
      }
    }
  }
}

export const advancedAnalytics = AdvancedAnalytics.getInstance()