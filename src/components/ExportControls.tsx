import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  FileX, 
  Calendar as CalendarIcon,
  Filter,
  Settings,
  CheckCircle
} from '@phosphor-icons/react'
import { ClaimData, RejectionAnalysis, InsightData, AnalysisResult } from '@/types'
import { dataExporter, ExportOptions, ExportResult } from '@/lib/exportUtils'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ExportControlsProps {
  data: ClaimData[]
  analysisResult?: AnalysisResult
  insights?: InsightData[]
  rejectionAnalysis?: RejectionAnalysis[]
  className?: string
}

export function ExportControls({ 
  data, 
  analysisResult, 
  insights, 
  rejectionAnalysis,
  className 
}: ExportControlsProps) {
  const { language, t } = useLanguage()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf' | 'json'>('xlsx')
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['approved', 'rejected', 'pending'])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['medical', 'technical'])
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Get unique providers from data
  const uniqueProviders = Array.from(new Set(data.map(claim => claim.providerId)))

  const handleExport = async (type: 'claims' | 'analysis' | 'insights') => {
    if (data.length === 0 && type === 'claims') {
      toast.error('No data available to export')
      return
    }

    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        format: exportFormat,
        language,
        includeAnalysis,
        includeInsights,
        includeFilters: {
          dateRange: dateRange.start && dateRange.end ? {
            start: format(dateRange.start, 'yyyy-MM-dd'),
            end: format(dateRange.end, 'yyyy-MM-dd')
          } : undefined,
          status: selectedStatuses as ('approved' | 'rejected' | 'pending')[],
          providers: selectedProviders.length > 0 ? selectedProviders : undefined,
          rejectionCategories: selectedCategories as ('medical' | 'technical')[],
          amountRange: amountRange.min || amountRange.max ? {
            min: amountRange.min ? parseInt(amountRange.min) : 0,
            max: amountRange.max ? parseInt(amountRange.max) : Infinity
          } : undefined
        }
      }

      let result: ExportResult

      switch (type) {
        case 'claims':
          result = await dataExporter.exportClaims(data, options)
          break
        case 'analysis':
          if (!analysisResult) {
            toast.error('No analysis data available')
            return
          }
          result = await dataExporter.exportAnalysis(analysisResult, options)
          break
        case 'insights':
          if (!insights) {
            toast.error('No insights data available')
            return
          }
          result = await dataExporter.exportInsights(insights, options)
          break
        default:
          throw new Error('Invalid export type')
      }

      if (result.success && result.blob && result.filename) {
        dataExporter.downloadBlob(result.blob, result.filename)
        toast.success(
          `Successfully exported ${result.recordCount?.toLocaleString() || 'data'} record(s) to ${exportFormat.toUpperCase()}`
        )
      } else {
        toast.error(result.error || 'Export failed')
      }

    } catch (error) {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatuses(prev => 
      checked 
        ? [...prev, status]
        : prev.filter(s => s !== status)
    )
  }

  const handleProviderChange = (providerId: string, checked: boolean) => {
    setSelectedProviders(prev =>
      checked
        ? [...prev, providerId]
        : prev.filter(p => p !== providerId)
    )
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked
        ? [...prev, category]
        : prev.filter(c => c !== category)
    )
  }

  const resetFilters = () => {
    setDateRange({})
    setSelectedStatuses(['approved', 'rejected', 'pending'])
    setSelectedProviders([])
    setSelectedCategories(['medical', 'technical'])
    setAmountRange({ min: '', max: '' })
  }

  const getFilteredCount = () => {
    return data.filter(claim => {
      // Date filter
      if (dateRange.start && dateRange.end) {
        const claimDate = new Date(claim.submissionDate)
        if (claimDate < dateRange.start || claimDate > dateRange.end) return false
      }
      
      // Status filter
      if (!selectedStatuses.includes(claim.status)) return false
      
      // Provider filter
      if (selectedProviders.length > 0 && !selectedProviders.includes(claim.providerId)) return false
      
      // Category filter
      if (claim.rejectionCategory && !selectedCategories.includes(claim.rejectionCategory)) return false
      
      // Amount filter
      if (amountRange.min && claim.amount < parseInt(amountRange.min)) return false
      if (amountRange.max && claim.amount > parseInt(amountRange.max)) return false
      
      return true
    }).length
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          {language === 'ar' ? 'تصدير البيانات' : 'Export Data'}
        </CardTitle>
        <CardDescription>
          {language === 'ar' 
            ? 'تصدير البيانات والتحليلات بتنسيقات مختلفة'
            : 'Export data and analysis in various formats'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {language === 'ar' ? 'تنسيق التصدير' : 'Export Format'}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'xlsx', icon: FileSpreadsheet, label: 'Excel', color: 'text-green-600' },
              { value: 'csv', icon: Table, label: 'CSV', color: 'text-blue-600' },
              { value: 'pdf', icon: FileText, label: 'PDF', color: 'text-red-600' },
              { value: 'json', icon: FileX, label: 'JSON', color: 'text-purple-600' }
            ].map(({ value, icon: Icon, label, color }) => (
              <Button
                key={value}
                variant={exportFormat === value ? 'default' : 'outline'}
                className="h-16 flex-col gap-1"
                onClick={() => setExportFormat(value as any)}
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            {language === 'ar' ? 'خيارات متقدمة' : 'Advanced Options'}
          </Label>
          <Switch
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            {/* Include Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'تضمين في التصدير' : 'Include in Export'}
              </Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-analysis"
                    checked={includeAnalysis}
                    onCheckedChange={setIncludeAnalysis}
                  />
                  <Label htmlFor="include-analysis" className="text-sm">
                    {language === 'ar' ? 'التحليل' : 'Analysis'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-insights"
                    checked={includeInsights}
                    onCheckedChange={setIncludeInsights}
                  />
                  <Label htmlFor="include-insights" className="text-sm">
                    {language === 'ar' ? 'الرؤى' : 'Insights'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'نطاق التاريخ' : 'Date Range'}
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? format(dateRange.start, 'PPP') : 'Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? format(dateRange.end, 'PPP') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'حالة المطالبة' : 'Claim Status'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'approved', label: language === 'ar' ? 'مقبول' : 'Approved' },
                  { value: 'rejected', label: language === 'ar' ? 'مرفوض' : 'Rejected' },
                  { value: 'pending', label: language === 'ar' ? 'معلق' : 'Pending' }
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${value}`}
                      checked={selectedStatuses.includes(value)}
                      onCheckedChange={(checked) => handleStatusChange(value, !!checked)}
                    />
                    <Label htmlFor={`status-${value}`} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'نطاق المبلغ (ريال)' : 'Amount Range (SAR)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={language === 'ar' ? 'الحد الأدنى' : 'Min Amount'}
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder={language === 'ar' ? 'الحد الأقصى' : 'Max Amount'}
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {getFilteredCount().toLocaleString()} / {data.length.toLocaleString()} records
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {language === 'ar' ? 'إعادة تعيين' : 'Reset Filters'}
              </Button>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleExport('claims')}
              disabled={isExporting || data.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {language === 'ar' ? 'تصدير المطالبات' : 'Export Claims'}
            </Button>
            
            {analysisResult && (
              <Button
                onClick={() => handleExport('analysis')}
                disabled={isExporting}
                variant="outline"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                {language === 'ar' ? 'تصدير التحليل' : 'Export Analysis'}
              </Button>
            )}
            
            {insights && insights.length > 0 && (
              <Button
                onClick={() => handleExport('insights')}
                disabled={isExporting}
                variant="outline"
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {language === 'ar' ? 'تصدير الرؤى' : 'Export Insights'}
              </Button>
            )}
          </div>
          
          {isExporting && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              {language === 'ar' ? 'جاري التصدير...' : 'Exporting...'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}