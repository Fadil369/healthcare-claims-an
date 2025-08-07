import type { ClaimData, RejectionRule, RejectionAnalysis, InsuranceProvider } from '@/types'

export class RejectionRulesEngine {
  private rules: RejectionRule[] = []
  private providers: InsuranceProvider[] = []

  constructor(globalRules: RejectionRule[] = [], providers: InsuranceProvider[] = []) {
    this.rules = globalRules
    this.providers = providers
  }

  /**
   * Update the rules and providers used by the engine
   */
  updateRules(globalRules: RejectionRule[], providers: InsuranceProvider[]) {
    this.rules = globalRules
    this.providers = providers
  }

  /**
   * Analyze claims against rejection rules and return categorized results
   */
  analyzeClaims(claims: ClaimData[]): RejectionAnalysis[] {
    const analyses: RejectionAnalysis[] = []
    const rejectedClaims = claims.filter(claim => claim.status === 'rejected')

    // Get all active rules (global + provider-specific)
    const activeRules = this.getActiveRules()

    for (const rule of activeRules) {
      const matches = this.findMatchingClaims(rejectedClaims, rule)
      
      if (matches.length > 0) {
        const confidence = this.calculateConfidence(matches, rule)
        const estimatedSavings = this.calculateEstimatedSavings(matches, rule)
        
        analyses.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matches,
          confidence,
          suggestedAction: rule.fixSuggestion,
          estimatedSavings
        })
      }
    }

    // Sort by potential impact (estimated savings and number of matches)
    return analyses.sort((a, b) => {
      const impactA = a.estimatedSavings * a.matches.length
      const impactB = b.estimatedSavings * b.matches.length
      return impactB - impactA
    })
  }

  /**
   * Categorize a single rejection reason using the rules
   */
  categorizeRejection(
    rejectionReason: string, 
    providerId?: string,
    codes: string[] = []
  ): {
    category: 'medical' | 'technical' | 'unknown'
    subcategory: string
    confidence: number
    appliedRule?: RejectionRule
  } {
    const activeRules = this.getActiveRules(providerId)
    
    for (const rule of activeRules) {
      const confidence = this.calculateReasonMatch(rejectionReason, codes, rule)
      
      if (confidence > 0.7) {
        return {
          category: rule.category,
          subcategory: rule.subcategory,
          confidence,
          appliedRule: rule
        }
      }
    }

    // Fallback to basic keyword matching if no rule matches
    const basicCategory = this.basicCategorization(rejectionReason)
    return {
      category: basicCategory.category,
      subcategory: basicCategory.subcategory,
      confidence: 0.5
    }
  }

  /**
   * Get training suggestions for providers based on rejection patterns
   */
  generateTrainingSuggestions(
    analyses: RejectionAnalysis[],
    providerId?: string
  ): {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actionItems: string[]
    estimatedImpact: string
  }[] {
    const suggestions = []
    
    // High-priority suggestions based on critical/high severity rules
    const criticalAnalyses = analyses.filter(a => {
      const rule = this.findRuleById(a.ruleId)
      return rule && ['critical', 'high'].includes(rule.severity)
    })

    for (const analysis of criticalAnalyses) {
      const rule = this.findRuleById(analysis.ruleId)
      if (!rule) continue

      suggestions.push({
        priority: rule.severity === 'critical' ? 'high' : 'medium' as 'high' | 'medium',
        title: `Address ${rule.name} Issues`,
        description: `${analysis.matches.length} claims affected by ${rule.description}`,
        actionItems: [
          rule.fixSuggestion,
          'Review and update staff training materials',
          'Implement additional quality checks',
          'Monitor progress weekly'
        ],
        estimatedImpact: `Potential savings: ${this.formatCurrency(analysis.estimatedSavings)}`
      })
    }

    // Pattern-based suggestions
    const patterns = this.identifyPatterns(analyses)
    for (const pattern of patterns) {
      suggestions.push({
        priority: 'medium',
        title: `Improve ${pattern.category} Processes`,
        description: pattern.description,
        actionItems: pattern.actionItems,
        estimatedImpact: pattern.estimatedImpact
      })
    }

    return suggestions.slice(0, 10) // Limit to top 10 suggestions
  }

  /**
   * Export rejection rules in different formats
   */
  exportRules(format: 'json' | 'csv' | 'excel' = 'json'): string | any {
    const allRules = this.getActiveRules()
    
    switch (format) {
      case 'json':
        return JSON.stringify(allRules, null, 2)
      case 'csv':
        return this.rulesToCSV(allRules)
      default:
        return allRules
    }
  }

  // Private helper methods

  private getActiveRules(providerId?: string): RejectionRule[] {
    const globalRules = this.rules.filter(rule => rule.isActive && !rule.providerSpecific)
    
    if (providerId) {
      const provider = this.providers.find(p => p.id === providerId)
      const providerRules = provider?.specificRules.filter(rule => rule.isActive) || []
      return [...globalRules, ...providerRules]
    }
    
    return globalRules
  }

  private findMatchingClaims(claims: ClaimData[], rule: RejectionRule): ClaimData[] {
    return claims.filter(claim => {
      if (rule.providerSpecific && claim.providerId !== rule.providerId) {
        return false
      }

      const reasonMatch = this.calculateReasonMatch(
        claim.rejectionReason || '', 
        [claim.diagnosisCode, claim.procedureCode].filter(Boolean), 
        rule
      )

      return reasonMatch > 0.6 // 60% confidence threshold
    })
  }

  private calculateReasonMatch(reason: string, codes: string[], rule: RejectionRule): number {
    let score = 0
    const reasonLower = reason.toLowerCase()
    
    // Check keywords
    const allKeywords = [...rule.keywords, ...rule.keywordsAr]
    const keywordMatches = allKeywords.filter(keyword => 
      reasonLower.includes(keyword.toLowerCase())
    ).length
    
    if (keywordMatches > 0) {
      score += (keywordMatches / allKeywords.length) * 0.7
    }

    // Check error codes
    const codeMatches = rule.codes.filter(code => 
      codes.some(claimCode => claimCode.includes(code))
    ).length
    
    if (codeMatches > 0) {
      score += (codeMatches / rule.codes.length) * 0.3
    }

    return Math.min(score, 1.0)
  }

  private calculateConfidence(matches: ClaimData[], rule: RejectionRule): number {
    if (matches.length === 0) return 0
    
    let totalConfidence = 0
    for (const claim of matches) {
      const confidence = this.calculateReasonMatch(
        claim.rejectionReason || '',
        [claim.diagnosisCode, claim.procedureCode].filter(Boolean),
        rule
      )
      totalConfidence += confidence
    }
    
    return totalConfidence / matches.length
  }

  private calculateEstimatedSavings(matches: ClaimData[], rule: RejectionRule): number {
    if (!rule.autoFix) return 0
    
    const totalAmount = matches.reduce((sum, claim) => sum + claim.amount, 0)
    
    // Estimate potential recovery based on rule severity
    const recoveryRate = {
      critical: 0.8,
      high: 0.6,
      medium: 0.4,
      low: 0.2
    }[rule.severity]
    
    return totalAmount * recoveryRate
  }

  private basicCategorization(reason: string): { category: 'medical' | 'technical' | 'unknown', subcategory: string } {
    const reasonLower = reason.toLowerCase()
    
    // Medical indicators
    const medicalKeywords = [
      'medical necessity', 'diagnosis', 'treatment', 'procedure', 'clinical',
      'prior authorization', 'medical review', 'inappropriate', 'experimental'
    ]
    
    // Technical indicators  
    const technicalKeywords = [
      'data', 'code', 'billing', 'format', 'system', 'entry', 'documentation',
      'missing', 'invalid', 'incomplete', 'timeout', 'error'
    ]
    
    for (const keyword of medicalKeywords) {
      if (reasonLower.includes(keyword)) {
        return { category: 'medical', subcategory: 'Medical Review Required' }
      }
    }
    
    for (const keyword of technicalKeywords) {
      if (reasonLower.includes(keyword)) {
        return { category: 'technical', subcategory: 'Data/System Issue' }
      }
    }
    
    return { category: 'unknown', subcategory: 'Unclassified' }
  }

  private findRuleById(ruleId: string): RejectionRule | undefined {
    // Search in global rules
    const globalRule = this.rules.find(rule => rule.id === ruleId)
    if (globalRule) return globalRule
    
    // Search in provider-specific rules
    for (const provider of this.providers) {
      const providerRule = provider.specificRules.find(rule => rule.id === ruleId)
      if (providerRule) return providerRule
    }
    
    return undefined
  }

  private identifyPatterns(analyses: RejectionAnalysis[]): Array<{
    category: string
    description: string
    actionItems: string[]
    estimatedImpact: string
  }> {
    const patterns = []
    
    // Group by category
    const medicalCount = analyses.filter(a => {
      const rule = this.findRuleById(a.ruleId)
      return rule?.category === 'medical'
    }).length
    
    const technicalCount = analyses.filter(a => {
      const rule = this.findRuleById(a.ruleId)
      return rule?.category === 'technical'
    }).length
    
    if (technicalCount > medicalCount) {
      patterns.push({
        category: 'Technical Process Improvement',
        description: 'High number of technical rejections indicates system or process issues',
        actionItems: [
          'Review data entry procedures',
          'Implement additional validation checks',
          'Train staff on proper coding practices',
          'Upgrade system integrations'
        ],
        estimatedImpact: 'High - Technical issues are often easily preventable'
      })
    }
    
    if (medicalCount > 5) {
      patterns.push({
        category: 'Clinical Documentation',
        description: 'Significant medical rejections suggest documentation or authorization issues',
        actionItems: [
          'Enhance prior authorization processes',
          'Improve clinical documentation training',
          'Implement clinical decision support tools',
          'Review medical necessity criteria'
        ],
        estimatedImpact: 'Medium - Requires clinical workflow changes'
      })
    }
    
    return patterns
  }

  private rulesToCSV(rules: RejectionRule[]): string {
    const headers = [
      'ID', 'Name', 'Category', 'Subcategory', 'Severity', 'Keywords', 
      'Codes', 'Description', 'Fix Suggestion', 'Auto Fix', 'Provider Specific'
    ]
    
    const rows = rules.map(rule => [
      rule.id,
      rule.name,
      rule.category,
      rule.subcategory,
      rule.severity,
      rule.keywords.join(';'),
      rule.codes.join(';'),
      rule.description,
      rule.fixSuggestion,
      rule.autoFix.toString(),
      rule.providerSpecific.toString()
    ])
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
}

// Export a singleton instance
export const rejectionRulesEngine = new RejectionRulesEngine()