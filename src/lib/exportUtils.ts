import { ClaimData, RejectionAnalysis, InsightData, AnalysisResult } from '@/types'

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'json'
  includeFilters?: {
    dateRange?: { start: string; end: string }
    status?: ('approved' | 'rejected' | 'pending')[]
    providers?: string[]
    rejectionCategories?: ('medical' | 'technical')[]
    amountRange?: { min: number; max: number }
  }
  includeAnalysis?: boolean
  includeInsights?: boolean
  language?: 'en' | 'ar'
  customFields?: string[]
}

export interface ExportResult {
  success: boolean
  blob?: Blob
  filename?: string
  error?: string
  recordCount?: number
}

export class DataExporter {
  private static instance: DataExporter

  static getInstance(): DataExporter {
    if (!DataExporter.instance) {
      DataExporter.instance = new DataExporter()
    }
    return DataExporter.instance
  }

  async exportClaims(data: ClaimData[], options: ExportOptions): Promise<ExportResult> {
    try {
      const filteredData = this.applyFilters(data, options.includeFilters)
      
      switch (options.format) {
        case 'xlsx':
          return await this.exportToExcel(filteredData, options)
        case 'csv':
          return await this.exportToCSV(filteredData, options)
        case 'pdf':
          return await this.exportToPDF(filteredData, options)
        case 'json':
          return await this.exportToJSON(filteredData, options)
        default:
          throw new Error('Unsupported export format')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  async exportAnalysis(analysisResult: AnalysisResult, options: ExportOptions): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'xlsx':
          return await this.exportAnalysisToExcel(analysisResult, options)
        case 'pdf':
          return await this.exportAnalysisToPDF(analysisResult, options)
        case 'json':
          return await this.exportAnalysisToJSON(analysisResult, options)
        default:
          throw new Error('Unsupported format for analysis export')
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis export failed'
      }
    }
  }

  private applyFilters(data: ClaimData[], filters?: ExportOptions['includeFilters']): ClaimData[] {
    if (!filters) return data

    return data.filter(claim => {
      // Date range filter
      if (filters.dateRange) {
        const claimDate = new Date(claim.submissionDate)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        if (claimDate < startDate || claimDate > endDate) return false
      }

      // Status filter
      if (filters.status && !filters.status.includes(claim.status)) {
        return false
      }

      // Provider filter
      if (filters.providers && !filters.providers.includes(claim.providerId)) {
        return false
      }

      // Rejection category filter
      if (filters.rejectionCategories && claim.rejectionCategory && 
          !filters.rejectionCategories.includes(claim.rejectionCategory)) {
        return false
      }

      // Amount range filter
      if (filters.amountRange) {
        if (claim.amount < filters.amountRange.min || claim.amount > filters.amountRange.max) {
          return false
        }
      }

      return true
    })
  }

  private async exportToExcel(data: ClaimData[], options: ExportOptions): Promise<ExportResult> {
    // Simulate Excel export using CSV format (would use a library like xlsx in real implementation)
    const csvContent = this.generateCSVContent(data, options)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    return {
      success: true,
      blob,
      filename: `claims_export_${new Date().toISOString().split('T')[0]}.csv`,
      recordCount: data.length
    }
  }

  private async exportToCSV(data: ClaimData[], options: ExportOptions): Promise<ExportResult> {
    const csvContent = this.generateCSVContent(data, options)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    return {
      success: true,
      blob,
      filename: `claims_export_${new Date().toISOString().split('T')[0]}.csv`,
      recordCount: data.length
    }
  }

  private generateCSVContent(data: ClaimData[], options: ExportOptions): string {
    const headers = this.getExportHeaders(options)
    const rows = data.map(claim => this.formatClaimForExport(claim, options))
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  private getExportHeaders(options: ExportOptions): string[] {
    const isArabic = options.language === 'ar'
    
    const baseHeaders = isArabic ? [
      'رقم المطالبة',
      'اسم المريض', 
      'مقدم الخدمة',
      'تاريخ الخدمة',
      'تاريخ التقديم',
      'المبلغ',
      'الحالة',
      'سبب الرفض',
      'فئة الرفض',
      'وقت المعالجة',
      'رمز التشخيص',
      'رمز الإجراء',
      'رقم العضوية',
      'رقم البوليصة'
    ] : [
      'Claim Number',
      'Patient Name',
      'Provider Name', 
      'Service Date',
      'Submission Date',
      'Amount',
      'Status',
      'Rejection Reason',
      'Rejection Category',
      'Processing Time',
      'Diagnosis Code',
      'Procedure Code',
      'Membership Number',
      'Policy Number'
    ]

    if (options.customFields) {
      baseHeaders.push(...options.customFields)
    }

    return baseHeaders
  }

  private formatClaimForExport(claim: ClaimData, options: ExportOptions): string[] {
    const isArabic = options.language === 'ar'
    
    const statusMap = isArabic ? {
      approved: 'موافق عليه',
      rejected: 'مرفوض', 
      pending: 'معلق'
    } : {
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending'
    }

    const categoryMap = isArabic ? {
      medical: 'طبي',
      technical: 'تقني'
    } : {
      medical: 'Medical',
      technical: 'Technical'
    }

    return [
      claim.claimNumber,
      claim.patientName,
      claim.providerName,
      claim.serviceDate,
      claim.submissionDate,
      claim.amount.toLocaleString(),
      statusMap[claim.status],
      claim.rejectionReason || '',
      claim.rejectionCategory ? categoryMap[claim.rejectionCategory] : '',
      `${claim.processingTime} ${isArabic ? 'يوم' : 'days'}`,
      claim.diagnosisCode,
      claim.procedureCode,
      claim.membershipNumber,
      claim.policyNumber
    ]
  }

  private async exportToPDF(data: ClaimData[], options: ExportOptions): Promise<ExportResult> {
    // Simulate PDF export (would use a library like jsPDF in real implementation)
    const pdfContent = this.generatePDFContent(data, options)
    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    
    return {
      success: true,
      blob,
      filename: `claims_report_${new Date().toISOString().split('T')[0]}.pdf`,
      recordCount: data.length
    }
  }

  private generatePDFContent(data: ClaimData[], options: ExportOptions): string {
    const isArabic = options.language === 'ar'
    const title = isArabic ? 'تقرير المطالبات الطبية' : 'Healthcare Claims Report'
    const summary = this.generateSummary(data, isArabic)
    
    return `
${title}
Generated: ${new Date().toLocaleDateString()}
Total Records: ${data.length}

${summary}

${isArabic ? 'تفاصيل المطالبات:' : 'Claims Details:'}
${this.generateCSVContent(data, options)}
    `.trim()
  }

  private generateSummary(data: ClaimData[], isArabic: boolean): string {
    const totalAmount = data.reduce((sum, claim) => sum + claim.amount, 0)
    const rejectedClaims = data.filter(claim => claim.status === 'rejected')
    const rejectedAmount = rejectedClaims.reduce((sum, claim) => sum + claim.amount, 0)
    const rejectionRate = (rejectedClaims.length / data.length) * 100

    if (isArabic) {
      return `
الملخص:
- إجمالي المطالبات: ${data.length.toLocaleString()}
- إجمالي المبلغ: ${totalAmount.toLocaleString()} ريال
- المطالبات المرفوضة: ${rejectedClaims.length.toLocaleString()}
- مبلغ الرفوضات: ${rejectedAmount.toLocaleString()} ريال  
- معدل الرفض: ${rejectionRate.toFixed(1)}%
      `.trim()
    }

    return `
Summary:
- Total Claims: ${data.length.toLocaleString()}
- Total Amount: ${totalAmount.toLocaleString()} SAR
- Rejected Claims: ${rejectedClaims.length.toLocaleString()}
- Rejected Amount: ${rejectedAmount.toLocaleString()} SAR
- Rejection Rate: ${rejectionRate.toFixed(1)}%
    `.trim()
  }

  private async exportToJSON(data: ClaimData[], options: ExportOptions): Promise<ExportResult> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        recordCount: data.length,
        format: 'json',
        language: options.language || 'en',
        filters: options.includeFilters || null
      },
      summary: this.generateJSONSummary(data),
      claims: data
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    return {
      success: true,
      blob,
      filename: `claims_data_${new Date().toISOString().split('T')[0]}.json`,
      recordCount: data.length
    }
  }

  private generateJSONSummary(data: ClaimData[]) {
    const statusCounts = data.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryCounts = data.reduce((acc, claim) => {
      if (claim.rejectionCategory) {
        acc[claim.rejectionCategory] = (acc[claim.rejectionCategory] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const totalAmount = data.reduce((sum, claim) => sum + claim.amount, 0)
    const avgAmount = totalAmount / data.length
    const avgProcessingTime = data.reduce((sum, claim) => sum + claim.processingTime, 0) / data.length

    return {
      totalClaims: data.length,
      totalAmount,
      averageAmount: avgAmount,
      averageProcessingTime: avgProcessingTime,
      statusDistribution: statusCounts,
      rejectionCategoryDistribution: categoryCounts,
      dateRange: {
        earliest: Math.min(...data.map(c => new Date(c.serviceDate).getTime())),
        latest: Math.max(...data.map(c => new Date(c.serviceDate).getTime()))
      }
    }
  }

  private async exportAnalysisToExcel(analysisResult: AnalysisResult, options: ExportOptions): Promise<ExportResult> {
    // Would create multiple sheets in real implementation
    const content = this.generateAnalysisContent(analysisResult, options)
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    
    return {
      success: true,
      blob,
      filename: `analysis_report_${new Date().toISOString().split('T')[0]}.csv`,
      recordCount: analysisResult.patterns.length
    }
  }

  private async exportAnalysisToPDF(analysisResult: AnalysisResult, options: ExportOptions): Promise<ExportResult> {
    const content = this.generateAnalysisContent(analysisResult, options)
    const blob = new Blob([content], { type: 'application/pdf' })
    
    return {
      success: true,
      blob,
      filename: `analysis_report_${new Date().toISOString().split('T')[0]}.pdf`,
      recordCount: analysisResult.patterns.length
    }
  }

  private async exportAnalysisToJSON(analysisResult: AnalysisResult, options: ExportOptions): Promise<ExportResult> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'json',
        language: options.language || 'en'
      },
      analysis: analysisResult
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    return {
      success: true,
      blob,
      filename: `analysis_${new Date().toISOString().split('T')[0]}.json`
    }
  }

  private generateAnalysisContent(analysisResult: AnalysisResult, options: ExportOptions): string {
    const isArabic = options.language === 'ar'
    
    const sections = [
      isArabic ? 'تقرير تحليل الرفوضات' : 'Rejection Analysis Report',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      isArabic ? 'الملخص العام:' : 'Summary:',
      `${isArabic ? 'إجمالي المطالبات' : 'Total Claims'}: ${analysisResult.totalClaims.toLocaleString()}`,
      `${isArabic ? 'المطالبات المرفوضة' : 'Rejected Claims'}: ${analysisResult.rejectedClaims.toLocaleString()}`,
      `${isArabic ? 'معدل الرفض' : 'Rejection Rate'}: ${analysisResult.rejectionRate.toFixed(1)}%`,
      `${isArabic ? 'إجمالي المبلغ' : 'Total Amount'}: ${analysisResult.totalAmount.toLocaleString()} ${isArabic ? 'ريال' : 'SAR'}`,
      '',
      isArabic ? 'أنماط الرفض:' : 'Rejection Patterns:',
      analysisResult.patterns.map(pattern => 
        `${pattern.category} - ${pattern.subcategory}: ${pattern.count} (${pattern.percentage.toFixed(1)}%)`
      ).join('\n'),
      ''
    ]

    return sections.join('\n')
  }

  // Advanced export features
  async exportCustomReport(data: ClaimData[], template: any, options: ExportOptions): Promise<ExportResult> {
    // Would implement custom template-based reporting
    throw new Error('Custom report templates not yet implemented')
  }

  async exportInsights(insights: InsightData[], options: ExportOptions): Promise<ExportResult> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        insightCount: insights.length,
        language: options.language || 'en'
      },
      insights: insights.map(insight => ({
        ...insight,
        priority: insight.priority,
        category: insight.category
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    return {
      success: true,
      blob,
      filename: `insights_${new Date().toISOString().split('T')[0]}.json`,
      recordCount: insights.length
    }
  }

  // Utility method to download blob
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const dataExporter = DataExporter.getInstance()