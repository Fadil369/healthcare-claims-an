import { ClaimData } from '@/types'

export interface FileProcessingResult {
  success: boolean
  data?: ClaimData[]
  error?: string
  fileName: string
  processingTime: number
  recordCount?: number
}

export interface ProcessingProgress {
  fileName: string
  stage: 'extracting' | 'parsing' | 'analyzing' | 'structuring' | 'complete' | 'error'
  progress: number
  message: string
}

export class FileProcessor {
  private static instance: FileProcessor
  private processingQueue: File[] = []
  private isProcessing = false
  private progressCallback?: (progress: ProcessingProgress) => void

  static getInstance(): FileProcessor {
    if (!FileProcessor.instance) {
      FileProcessor.instance = new FileProcessor()
    }
    return FileProcessor.instance
  }

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback
  }

  private updateProgress(fileName: string, stage: ProcessingProgress['stage'], progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ fileName, stage, progress, message })
    }
  }

  async processFiles(files: File[]): Promise<FileProcessingResult[]> {
    const results: FileProcessingResult[] = []
    
    for (const file of files) {
      const result = await this.processFile(file)
      results.push(result)
    }
    
    return results
  }

  private async processFile(file: File): Promise<FileProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          fileName: file.name,
          processingTime: Date.now() - startTime
        }
      }

      // Stage 1: Extract content
      this.updateProgress(file.name, 'extracting', 20, 'Extracting file content...')
      await this.delay(800)
      const extractedContent = await this.extractFileContent(file)

      // Stage 2: Parse data
      this.updateProgress(file.name, 'parsing', 50, 'Parsing data structures...')
      await this.delay(600)
      const parsedData = await this.parseData(extractedContent, file.type)

      // Stage 3: AI analysis and enhancement
      this.updateProgress(file.name, 'analyzing', 75, 'Analyzing with AI...')
      await this.delay(1000)
      const enhancedData = await this.enhanceWithAI(parsedData)

      // Stage 4: Structure and validate
      this.updateProgress(file.name, 'structuring', 95, 'Structuring final data...')
      await this.delay(400)
      const structuredData = this.structureData(enhancedData, file.name)

      this.updateProgress(file.name, 'complete', 100, 'Processing complete!')

      return {
        success: true,
        data: structuredData,
        fileName: file.name,
        processingTime: Date.now() - startTime,
        recordCount: structuredData.length
      }

    } catch (error) {
      this.updateProgress(file.name, 'error', 0, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error',
        fileName: file.name,
        processingTime: Date.now() - startTime
      }
    }
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Size validation (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 100MB limit' }
    }

    // Type validation
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported file type. Only PDF, Excel, and CSV files are allowed.' }
    }

    return { isValid: true }
  }

  private async extractFileContent(file: File): Promise<any> {
    // Simulate AI-powered content extraction
    if (file.type === 'application/pdf') {
      // PDF extraction simulation
      return {
        type: 'pdf',
        pages: Math.floor(Math.random() * 50) + 1,
        extractedText: 'Simulated PDF content extraction',
        tables: Math.floor(Math.random() * 10) + 1
      }
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
      // Excel extraction simulation
      return {
        type: 'excel',
        sheets: ['Claims', 'Summary', 'Details'],
        rows: Math.floor(Math.random() * 1000) + 100,
        columns: ['Claim Number', 'Patient', 'Provider', 'Amount', 'Status']
      }
    } else if (file.type === 'text/csv') {
      // CSV extraction simulation
      return {
        type: 'csv',
        rows: Math.floor(Math.random() * 5000) + 500,
        delimiter: ',',
        hasHeader: true
      }
    }

    throw new Error('Unsupported file type for extraction')
  }

  private async parseData(extractedContent: any, fileType: string): Promise<any[]> {
    // Simulate intelligent data parsing
    const recordCount = Math.floor(Math.random() * 300) + 50
    const records = []

    for (let i = 0; i < recordCount; i++) {
      records.push({
        rawData: `Record ${i + 1} from ${extractedContent.type}`,
        claimNumber: `CLM${Date.now()}-${i}`,
        extracted: true
      })
    }

    return records
  }

  private async enhanceWithAI(parsedData: any[]): Promise<any[]> {
    // Simulate AI enhancement for better categorization and analysis
    return parsedData.map(record => ({
      ...record,
      aiEnhanced: true,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      suggestedCategory: Math.random() > 0.6 ? 'medical' : 'technical',
      riskScore: Math.random()
    }))
  }

  private structureData(enhancedData: any[], fileName: string): ClaimData[] {
    const providers = [
      'King Faisal Specialist Hospital',
      'National Guard Hospital', 
      'Prince Sultan Cardiac Center',
      'Dr. Sulaiman Al Habib Hospital',
      'Mouwasat Hospital',
      'King Khalid University Hospital',
      'Riyadh Care Hospital',
      'Saudi German Hospital',
      'Al Hammadi Hospital',
      'Dallah Hospital'
    ]
    
    const rejectionReasons = {
      medical: [
        'Pre-authorization required',
        'Service not covered under policy',
        'Duplicate claim submission',
        'Diagnosis code mismatch',
        'Treatment not medically necessary',
        'Experimental procedure',
        'Policy exclusion applies',
        'Coverage period expired'
      ],
      technical: [
        'Invalid member ID format',
        'Missing required documentation',
        'Claim submission deadline exceeded',
        'Incorrect CPT billing code',
        'Provider not contracted',
        'Invalid policy number',
        'Incomplete patient information',
        'Billing address mismatch'
      ]
    }

    return enhancedData.map((record, index) => {
      const isRejected = Math.random() < 0.22 // 22% rejection rate (realistic)
      const category = record.suggestedCategory || (Math.random() < 0.65 ? 'medical' : 'technical')
      const amount = Math.floor(Math.random() * 75000) + 200 // 200-75,200 SAR range
      const serviceDate = new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000)
      const submissionDate = new Date(serviceDate.getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000)

      return {
        id: `${fileName}-claim-${index}-${Date.now()}`,
        claimNumber: `CLM${Date.now()}${String(index).padStart(4, '0')}`,
        patientName: `Patient ${String(index + 1).padStart(3, '0')}`,
        providerId: `PRV${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        providerName: providers[Math.floor(Math.random() * providers.length)],
        serviceDate: serviceDate.toISOString().split('T')[0],
        submissionDate: submissionDate.toISOString().split('T')[0],
        amount,
        status: isRejected ? 'rejected' : (Math.random() < 0.08 ? 'pending' : 'approved'),
        rejectionReason: isRejected 
          ? rejectionReasons[category][Math.floor(Math.random() * rejectionReasons[category].length)]
          : undefined,
        rejectionCategory: isRejected ? category : undefined,
        rejectionSubcategory: isRejected 
          ? `${category}-${Math.floor(Math.random() * 5) + 1}`
          : undefined,
        processingTime: Math.floor(Math.random() * 21) + 1, // 1-21 days
        diagnosisCode: `ICD${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
        procedureCode: `CPT${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`,
        membershipNumber: `MEM${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
        policyNumber: `POL${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`
      }
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Batch processing for large files
  async processBatch(files: File[], batchSize = 5): Promise<FileProcessingResult[]> {
    const results: FileProcessingResult[] = []
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      const batchResults = await this.processFiles(batch)
      results.push(...batchResults)
    }
    
    return results
  }

  // File validation before processing
  validateFiles(files: File[]): { valid: File[]; invalid: { file: File; error: string }[] } {
    const valid: File[] = []
    const invalid: { file: File; error: string }[] = []

    files.forEach(file => {
      const validation = this.validateFile(file)
      if (validation.isValid) {
        valid.push(file)
      } else {
        invalid.push({ file, error: validation.error || 'Unknown validation error' })
      }
    })

    return { valid, invalid }
  }
}

export const fileProcessor = FileProcessor.getInstance()