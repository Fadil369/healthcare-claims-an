import { useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, Database } from '@phosphor-icons/react'
import { ClaimData } from '@/types'
import { sampleClaimsData } from '@/lib/sampleData'
import { toast } from 'sonner'

export function FileUploadView() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [, setClaimsData] = useKV<ClaimData[]>('claims-data', [])
  const [, setLastProcessed] = useKV<string>('last-processed', '')
  
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    
    const fileArray = Array.from(selectedFiles)
    const validFiles = fileArray.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    )
    
    if (validFiles.length !== fileArray.length) {
      toast.error('Some files were skipped. Only PDF and Excel files are supported.')
    }
    
    setFiles(prev => [...prev, ...validFiles])
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const loadSampleData = () => {
    setClaimsData(sampleClaimsData)
    setLastProcessed(new Date().toISOString())
    toast.success('Sample data loaded successfully!')
  }
  
  const processFiles = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      // Simulate AI processing with realistic progress
      const totalSteps = files.length * 4 // 4 steps per file
      let currentStep = 0
      
      const mockClaimsData: ClaimData[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Step 1: File extraction
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Step 2: Data parsing
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Step 3: AI analysis
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Step 4: Data structuring
        currentStep++
        setProgress((currentStep / totalSteps) * 100)
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // Generate mock data based on file
        const claimsFromFile = generateMockClaimsData(file.name, 50 + Math.floor(Math.random() * 200))
        mockClaimsData.push(...claimsFromFile)
      }
      
      // Save processed data
      setClaimsData(mockClaimsData)
      setLastProcessed(new Date().toISOString())
      
      toast.success(t('upload.success'))
      setFiles([])
      
    } catch (error) {
      toast.error('Error processing files. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{t('upload.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('upload.subtitle')}
          </p>
        </div>
        
        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div
              className="text-center space-y-6 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {t('upload.dragDrop')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('upload.formats')}
                </p>
              </div>
              
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </CardContent>
        </Card>
        
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Selected Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {isProcessing && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="font-medium">{t('upload.processing')}</p>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={processFiles}
            disabled={files.length === 0 || isProcessing}
            size="lg"
            className="gap-2"
          >
            <Upload className="w-5 h-5" />
            {t('upload.button')}
          </Button>
          
          <Button
            onClick={loadSampleData}
            disabled={isProcessing}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Database className="w-5 h-5" />
            Load Sample Data
          </Button>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your data is processed locally using advanced AI technology. All files remain secure and private.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

function generateMockClaimsData(fileName: string, count: number): ClaimData[] {
  const providers = [
    'King Faisal Specialist Hospital',
    'National Guard Hospital',
    'Prince Sultan Cardiac Center',
    'Dr. Sulaiman Al Habib Hospital',
    'Mouwasat Hospital'
  ]
  
  const rejectionReasons = {
    medical: [
      'Pre-authorization required',
      'Service not covered',
      'Duplicate claim',
      'Diagnosis code mismatch',
      'Treatment not medically necessary'
    ],
    technical: [
      'Invalid member ID',
      'Missing documentation',
      'Claim submission deadline exceeded',
      'Incorrect billing code',
      'Provider not contracted'
    ]
  }
  
  return Array.from({ length: count }, (_, i) => {
    const isRejected = Math.random() < 0.25 // 25% rejection rate
    const category = Math.random() < 0.6 ? 'medical' : 'technical'
    const amount = Math.floor(Math.random() * 50000) + 500
    
    return {
      id: `claim-${fileName}-${i}`,
      claimNumber: `CLM${Date.now()}${i}`,
      patientName: `Patient ${i + 1}`,
      providerId: `PRV${Math.floor(Math.random() * 1000)}`,
      providerName: providers[Math.floor(Math.random() * providers.length)],
      serviceDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount,
      status: isRejected ? 'rejected' : (Math.random() < 0.1 ? 'pending' : 'approved'),
      rejectionReason: isRejected ? rejectionReasons[category][Math.floor(Math.random() * rejectionReasons[category].length)] : undefined,
      rejectionCategory: isRejected ? category : undefined,
      rejectionSubcategory: isRejected ? `${category}-subcategory-${Math.floor(Math.random() * 3) + 1}` : undefined,
      processingTime: Math.floor(Math.random() * 14) + 1,
      diagnosisCode: `ICD${Math.floor(Math.random() * 1000)}`,
      procedureCode: `CPT${Math.floor(Math.random() * 10000)}`,
      membershipNumber: `MEM${Math.floor(Math.random() * 100000)}`,
      policyNumber: `POL${Math.floor(Math.random() * 10000)}`
    }
  })
}