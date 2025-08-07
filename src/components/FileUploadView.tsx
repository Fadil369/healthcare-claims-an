import { useState, useCallback, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, FileText, CheckCircle, AlertCircle, Database, X, Eye, Trash } from '@phosphor-icons/react'
import { ClaimData } from '@/types'
import { sampleClaimsData } from '@/lib/sampleData'
import { fileProcessor, FileProcessingResult, ProcessingProgress } from '@/lib/fileProcessing'
import { toast } from 'sonner'

export function FileUploadView() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress[]>([])
  const [processedResults, setProcessedResults] = useState<FileProcessingResult[]>([])
  const [, setClaimsData] = useKV<ClaimData[]>('claims-data', [])
  const [, setLastProcessed] = useKV<string>('last-processed', '')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    
    const fileArray = Array.from(selectedFiles)
    
    // Validate files before adding
    const validation = fileProcessor.validateFiles(fileArray)
    
    if (validation.invalid.length > 0) {
      validation.invalid.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`)
      })
    }
    
    if (validation.valid.length > 0) {
      setFiles(prev => [...prev, ...validation.valid])
      toast.success(`Added ${validation.valid.length} valid file(s)`)
    }
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const clearAllFiles = () => {
    setFiles([])
    setProcessedResults([])
    setProcessingProgress([])
  }

  const loadSampleData = () => {
    setClaimsData(sampleClaimsData)
    setLastProcessed(new Date().toISOString())
    toast.success('Sample data loaded successfully!')
  }
  
  const processFiles = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    setProcessingProgress([])
    setProcessedResults([])
    
    try {
      // Set up progress tracking
      fileProcessor.setProgressCallback((progress: ProcessingProgress) => {
        setProcessingProgress(prev => {
          const updated = [...prev]
          const existingIndex = updated.findIndex(p => p.fileName === progress.fileName)
          
          if (existingIndex >= 0) {
            updated[existingIndex] = progress
          } else {
            updated.push(progress)
          }
          
          return updated
        })
      })
      
      // Process files with enhanced handling
      const results = await fileProcessor.processBatch(files, 3) // Process 3 files at a time
      
      // Collect all successful results
      const allClaimsData: ClaimData[] = []
      const successfulResults = results.filter(result => result.success)
      
      successfulResults.forEach(result => {
        if (result.data) {
          allClaimsData.push(...result.data)
        }
      })
      
      // Update stored data
      if (allClaimsData.length > 0) {
        setClaimsData(allClaimsData)
        setLastProcessed(new Date().toISOString())
      }
      
      setProcessedResults(results)
      
      // Show results summary
      const successCount = successfulResults.length
      const totalRecords = allClaimsData.length
      const failedCount = results.length - successCount
      
      if (successCount > 0) {
        toast.success(
          `Successfully processed ${successCount} file(s) with ${totalRecords.toLocaleString()} claims` +
          (failedCount > 0 ? ` (${failedCount} file(s) failed)` : '')
        )
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} file(s) failed to process`)
      }
      
    } catch (error) {
      toast.error('Error processing files. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const retryFailedFiles = async () => {
    const failedResults = processedResults.filter(result => !result.success)
    if (failedResults.length === 0) return
    
    const failedFiles = files.filter(file => 
      failedResults.some(result => result.fileName === file.name)
    )
    
    // Reset and retry
    setProcessingProgress([])
    setIsProcessing(true)
    
    try {
      const retryResults = await fileProcessor.processFiles(failedFiles)
      
      // Update results
      setProcessedResults(prev => {
        const updated = [...prev]
        retryResults.forEach(retryResult => {
          const index = updated.findIndex(r => r.fileName === retryResult.fileName)
          if (index >= 0) {
            updated[index] = retryResult
          }
        })
        return updated
      })
      
      toast.success(`Retried ${failedFiles.length} failed file(s)`)
      
    } catch (error) {
      toast.error('Retry failed. Please check the files and try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('upload.title')}</h1>
        <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
          {t('upload.subtitle')}
        </p>
      </div>
      
      {/* Enhanced Upload Area */}
      <Card className={`border-dashed border-2 transition-all duration-200 ${
        dragActive 
          ? 'border-primary bg-primary/5 scale-[1.01] sm:scale-[1.02]' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div
            className="text-center space-y-4 sm:space-y-6 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors ${
              dragActive ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <Upload className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
                dragActive ? 'text-primary' : 'text-primary'
              }`} />
            </div>
            
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-medium text-foreground">
                {dragActive ? 'Drop files here' : t('upload.dragDrop')}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
                {t('upload.formats')} • Max 100MB per file
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Selected Files ({files.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                disabled={isProcessing}
                className="gap-2 self-start sm:self-auto"
              >
                <Trash className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Ready to process {files.length} file(s). Total size: {
                (files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)
              } MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 sm:h-64">
              <div className="space-y-2 sm:space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{file.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{file.type.split('/')[1].toUpperCase()}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                        Ready
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Processing Progress */}
      {isProcessing && processingProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
              Processing Files
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Advanced AI processing with extraction, parsing, and analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {processingProgress.map((progress, index) => (
              <div key={index} className="space-y-2 p-2 sm:p-3 border rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-xs sm:text-sm truncate flex-1">{progress.fileName}</span>
                  <Badge variant={
                    progress.stage === 'complete' ? 'default' :
                    progress.stage === 'error' ? 'destructive' : 'secondary'
                  } className="text-xs flex-shrink-0">
                    {progress.stage === 'extracting' ? 'Extracting' :
                     progress.stage === 'parsing' ? 'Parsing' :
                     progress.stage === 'analyzing' ? 'AI Analysis' :
                     progress.stage === 'structuring' ? 'Structuring' :
                     progress.stage === 'complete' ? 'Complete' :
                     progress.stage === 'error' ? 'Error' : 'Processing'}
                  </Badge>
                </div>
                <Progress value={progress.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progress.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Processing Results */}
      {processedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              Processing Results
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Summary of file processing results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {processedResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between gap-3 p-2 sm:p-3 border rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">{result.fileName}</p>
                    {result.success ? (
                      <p className="text-xs text-muted-foreground">
                        {result.recordCount?.toLocaleString()} records • 
                        {(result.processingTime / 1000).toFixed(1)}s
                      </p>
                    ) : (
                      <p className="text-xs text-destructive truncate">{result.error}</p>
                    )}
                  </div>
                </div>
                <Badge variant={result.success ? 'default' : 'destructive'} className="text-xs flex-shrink-0">
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
            
            {processedResults.some(r => !r.success) && (
              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailedFiles}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Retry Failed Files
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <Button
          onClick={processFiles}
          disabled={files.length === 0 || isProcessing}
          size="lg"
          className="gap-2 h-12"
        >
          <Upload className="w-5 h-5" />
          {isProcessing ? 'Processing...' : t('upload.button')}
        </Button>
        
        <Button
          onClick={loadSampleData}
          disabled={isProcessing}
          variant="outline"
          size="lg"
          className="gap-2 h-12"
        >
          <Database className="w-5 h-5" />
          Load Sample Data
        </Button>
      </div>
      
      {/* Enhanced Security Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong>Enhanced Security & Processing:</strong> Your data is processed locally using advanced AI technology 
          with multi-stage validation. All files remain secure and private. Supports unlimited file sizes and 
          batch processing for optimal performance.
        </AlertDescription>
      </Alert>
      
      {/* File Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Supported File Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 border rounded-lg">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-500" />
              <p className="font-medium text-xs sm:text-sm">PDF Files</p>
              <p className="text-xs text-muted-foreground">Claims reports</p>
            </div>
            <div className="text-center p-2 sm:p-3 border rounded-lg">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium text-xs sm:text-sm">Excel Files</p>
              <p className="text-xs text-muted-foreground">.xlsx, .xls</p>
            </div>
            <div className="text-center p-2 sm:p-3 border rounded-lg">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-500" />
              <p className="font-medium text-xs sm:text-sm">CSV Files</p>
              <p className="text-xs text-muted-foreground">Data exports</p>
            </div>
            <div className="text-center p-2 sm:p-3 border rounded-lg">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-500" />
              <p className="font-medium text-xs sm:text-sm">Batch Upload</p>
              <p className="text-xs text-muted-foreground">Multiple files</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}