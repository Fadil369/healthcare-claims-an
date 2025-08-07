import { useState } from 'react'
import { useKV } from '@/hooks/useKV'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Pencil, Trash2, Gear, Building, Warning, CheckCircle, Clock, Download, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { defaultSaudiRejectionRules } from '@/lib/defaultRejectionRules'
import type { RejectionRule, InsuranceProvider } from '@/types'

const defaultSaudiProviders: InsuranceProvider[] = [
  {
    id: 'bupa-saudi',
    name: 'Bupa Arabia',
    nameAr: 'بوبا العربية',
    code: 'BUPA',
    country: 'Saudi Arabia',
    specificRules: [],
    customCategories: {
      medical: ['Prior Authorization', 'Medical Necessity', 'Diagnosis Mismatch'],
      technical: ['Data Entry Error', 'Missing Documentation', 'Billing Code Error']
    },
    customCategoriesAr: {
      medical: ['الموافقة المسبقة', 'الضرورة الطبية', 'عدم تطابق التشخيص'],
      technical: ['خطأ في إدخال البيانات', 'وثائق مفقودة', 'خطأ في رمز الفوترة']
    },
    contactInfo: {
      phone: '+966-11-xxx-xxxx',
      email: 'providers@bupa.com.sa',
      website: 'https://bupa.com.sa'
    },
    isActive: true
  },
  {
    id: 'tawuniya',
    name: 'The Company for Cooperative Insurance (Tawuniya)',
    nameAr: 'الشركة التعاونية للتأمين (التعاونية)',
    code: 'TAWUNIYA',
    country: 'Saudi Arabia',
    specificRules: [],
    customCategories: {
      medical: ['Treatment Protocol', 'Specialist Referral', 'Emergency Validation'],
      technical: ['System Integration', 'Authorization Timeout', 'Provider Registration']
    },
    customCategoriesAr: {
      medical: ['بروتوكول العلاج', 'إحالة أخصائي', 'التحقق من الطوارئ'],
      technical: ['تكامل النظام', 'انتهاء وقت التفويض', 'تسجيل مقدم الخدمة']
    },
    contactInfo: {
      phone: '+966-11-xxx-xxxx',
      email: 'providers@tawuniya.com.sa',
      website: 'https://tawuniya.com.sa'
    },
    isActive: true
  }
]

export function RejectionRulesView() {
  const { language, t } = useLanguage()
  const [providers, setProviders] = useKV<InsuranceProvider[]>('insurance-providers', defaultSaudiProviders)
  const [globalRules, setGlobalRules] = useKV<RejectionRule[]>('global-rejection-rules', [])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false)
  const [isCreateProviderOpen, setIsCreateProviderOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<RejectionRule | null>(null)

  const [newRule, setNewRule] = useState<Partial<RejectionRule>>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: 'technical',
    subcategory: '',
    subcategoryAr: '',
    keywords: [],
    keywordsAr: [],
    codes: [],
    severity: 'medium',
    autoFix: false,
    fixSuggestion: '',
    fixSuggestionAr: '',
    providerSpecific: false,
    isActive: true
  })

  const [newProvider, setNewProvider] = useState<Partial<InsuranceProvider>>({
    name: '',
    nameAr: '',
    code: '',
    country: 'Saudi Arabia',
    customCategories: { medical: [], technical: [] },
    customCategoriesAr: { medical: [], technical: [] },
    contactInfo: { phone: '', email: '', website: '' },
    isActive: true
  })

  const loadDefaultRules = () => {
    setGlobalRules(current => {
      // Avoid duplicates by checking existing rule IDs
      const existingIds = current.map(rule => rule.id)
      const newRules = defaultSaudiRejectionRules.filter(rule => !existingIds.includes(rule.id))
      
      if (newRules.length > 0) {
        toast.success(`${newRules.length} default Saudi rules imported successfully`)
        return [...current, ...newRules]
      } else {
        toast.info('Default rules already imported')
        return current
      }
    })
  }

  const exportRules = () => {
    const allRules = [...globalRules]
    providers.forEach(provider => {
      allRules.push(...provider.specificRules)
    })
    
    const exportData = {
      globalRules,
      providers,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rejection-rules-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Rules exported successfully')
  }

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.description) {
      toast.error(t('Please fill in all required fields'))
      return
    }

    const rule: RejectionRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name!,
      nameAr: newRule.nameAr || newRule.name!,
      description: newRule.description!,
      descriptionAr: newRule.descriptionAr || newRule.description!,
      category: newRule.category!,
      subcategory: newRule.subcategory!,
      subcategoryAr: newRule.subcategoryAr || newRule.subcategory!,
      keywords: newRule.keywords || [],
      keywordsAr: newRule.keywordsAr || [],
      codes: newRule.codes || [],
      severity: newRule.severity!,
      autoFix: newRule.autoFix!,
      fixSuggestion: newRule.fixSuggestion!,
      fixSuggestionAr: newRule.fixSuggestionAr || newRule.fixSuggestion!,
      providerId: newRule.providerSpecific ? selectedProvider : undefined,
      providerSpecific: newRule.providerSpecific!,
      isActive: newRule.isActive!,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    if (rule.providerSpecific && selectedProvider) {
      setProviders(current => 
        current.map(provider => 
          provider.id === selectedProvider 
            ? { ...provider, specificRules: [...provider.specificRules, rule] }
            : provider
        )
      )
    } else {
      setGlobalRules(current => [...current, rule])
    }

    setNewRule({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      category: 'technical',
      subcategory: '',
      subcategoryAr: '',
      keywords: [],
      keywordsAr: [],
      codes: [],
      severity: 'medium',
      autoFix: false,
      fixSuggestion: '',
      fixSuggestionAr: '',
      providerSpecific: false,
      isActive: true
    })
    setIsCreateRuleOpen(false)
    toast.success(t('Rejection rule created successfully'))
  }

  const handleCreateProvider = () => {
    if (!newProvider.name || !newProvider.code) {
      toast.error(t('Please fill in provider name and code'))
      return
    }

    const provider: InsuranceProvider = {
      id: `provider-${Date.now()}`,
      name: newProvider.name!,
      nameAr: newProvider.nameAr || newProvider.name!,
      code: newProvider.code!,
      country: newProvider.country!,
      specificRules: [],
      customCategories: newProvider.customCategories!,
      customCategoriesAr: newProvider.customCategoriesAr!,
      contactInfo: newProvider.contactInfo!,
      isActive: newProvider.isActive!
    }

    setProviders(current => [...current, provider])
    setNewProvider({
      name: '',
      nameAr: '',
      code: '',
      country: 'Saudi Arabia',
      customCategories: { medical: [], technical: [] },
      customCategoriesAr: { medical: [], technical: [] },
      contactInfo: { phone: '', email: '', website: '' },
      isActive: true
    })
    setIsCreateProviderOpen(false)
    toast.success(t('Insurance provider added successfully'))
  }

  const handleToggleRule = (ruleId: string, isGlobal: boolean) => {
    if (isGlobal) {
      setGlobalRules(current =>
        current.map(rule =>
          rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
        )
      )
    } else if (selectedProvider) {
      setProviders(current =>
        current.map(provider =>
          provider.id === selectedProvider
            ? {
                ...provider,
                specificRules: provider.specificRules.map(rule =>
                  rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
                )
              }
            : provider
        )
      )
    }
  }

  const currentProvider = providers.find(p => p.id === selectedProvider)
  const providerRules = currentProvider?.specificRules || []

  const getSeverityColor = (severity: RejectionRule['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: RejectionRule['severity']) => {
    switch (severity) {
      case 'critical': return <Warning className="h-4 w-4" />
      case 'high': return <Warning className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'قواعد تصنيف الرفض' : 'Rejection Categorization Rules'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'إدارة قواعد تصنيف الرفض المخصصة لشركات التأمين المختلفة'
              : 'Manage custom rejection categorization rules for different insurance providers'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDefaultRules}>
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تحميل القواعد الافتراضية' : 'Load Default Rules'}
          </Button>
          <Button variant="outline" onClick={exportRules}>
            <Upload className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير القواعد' : 'Export Rules'}
          </Button>
          <Dialog open={isCreateProviderOpen} onOpenChange={setIsCreateProviderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إضافة شركة تأمين' : 'Add Provider'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إضافة شركة تأمين جديدة' : 'Add New Insurance Provider'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'ar' 
                    ? 'أدخل تفاصيل شركة التأمين الجديدة'
                    : 'Enter the details of the new insurance provider'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider-name">
                      {language === 'ar' ? 'اسم الشركة' : 'Provider Name'}
                    </Label>
                    <Input
                      id="provider-name"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'ar' ? 'مثال: بوبا العربية' : 'e.g., Bupa Arabia'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-name-ar">
                      {language === 'ar' ? 'الاسم باللغة العربية' : 'Arabic Name'}
                    </Label>
                    <Input
                      id="provider-name-ar"
                      value={newProvider.nameAr}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder={language === 'ar' ? 'بوبا العربية' : 'Arabic name'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider-code">
                      {language === 'ar' ? 'رمز الشركة' : 'Provider Code'}
                    </Label>
                    <Input
                      id="provider-code"
                      value={newProvider.code}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="BUPA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-country">
                      {language === 'ar' ? 'البلد' : 'Country'}
                    </Label>
                    <Select value={newProvider.country} onValueChange={(value) => setNewProvider(prev => ({ ...prev, country: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Saudi Arabia">
                          {language === 'ar' ? 'السعودية' : 'Saudi Arabia'}
                        </SelectItem>
                        <SelectItem value="UAE">
                          {language === 'ar' ? 'الإمارات' : 'UAE'}
                        </SelectItem>
                        <SelectItem value="Kuwait">
                          {language === 'ar' ? 'الكويت' : 'Kuwait'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="provider-phone">
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      id="provider-phone"
                      value={newProvider.contactInfo?.phone}
                      onChange={(e) => setNewProvider(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo!, phone: e.target.value }
                      }))}
                      placeholder="+966-11-xxx-xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-email">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <Input
                      id="provider-email"
                      type="email"
                      value={newProvider.contactInfo?.email}
                      onChange={(e) => setNewProvider(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo!, email: e.target.value }
                      }))}
                      placeholder="providers@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider-website">
                      {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                    </Label>
                    <Input
                      id="provider-website"
                      value={newProvider.contactInfo?.website}
                      onChange={(e) => setNewProvider(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo!, website: e.target.value }
                      }))}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateProvider}>
                  {language === 'ar' ? 'إضافة الشركة' : 'Add Provider'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إضافة قاعدة' : 'Add Rule'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إنشاء قاعدة تصنيف جديدة' : 'Create New Categorization Rule'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'ar' 
                    ? 'أنشئ قاعدة مخصصة لتصنيف رفض المطالبات تلقائياً'
                    : 'Create a custom rule to automatically categorize claim rejections'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.providerSpecific}
                    onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, providerSpecific: checked }))}
                  />
                  <Label>
                    {language === 'ar' ? 'خاص بشركة تأمين محددة' : 'Provider-specific rule'}
                  </Label>
                </div>

                {newRule.providerSpecific && (
                  <div>
                    <Label>
                      {language === 'ar' ? 'شركة التأمين' : 'Insurance Provider'}
                    </Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر شركة التأمين' : 'Select provider'} />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {language === 'ar' ? provider.nameAr : provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">
                      {language === 'ar' ? 'اسم القاعدة' : 'Rule Name'}
                    </Label>
                    <Input
                      id="rule-name"
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'ar' ? 'مثال: خطأ في رمز التشخيص' : 'e.g., Invalid Diagnosis Code'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-name-ar">
                      {language === 'ar' ? 'الاسم باللغة العربية' : 'Arabic Name'}
                    </Label>
                    <Input
                      id="rule-name-ar"
                      value={newRule.nameAr}
                      onChange={(e) => setNewRule(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder={language === 'ar' ? 'خطأ في رمز التشخيص' : 'Arabic name'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>
                      {language === 'ar' ? 'الفئة الرئيسية' : 'Main Category'}
                    </Label>
                    <Select value={newRule.category} onValueChange={(value: 'medical' | 'technical') => setNewRule(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">
                          {language === 'ar' ? 'طبية' : 'Medical'}
                        </SelectItem>
                        <SelectItem value="technical">
                          {language === 'ar' ? 'تقنية' : 'Technical'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">
                      {language === 'ar' ? 'الفئة الفرعية' : 'Subcategory'}
                    </Label>
                    <Input
                      id="subcategory"
                      value={newRule.subcategory}
                      onChange={(e) => setNewRule(prev => ({ ...prev, subcategory: e.target.value }))}
                      placeholder={language === 'ar' ? 'خطأ في البيانات' : 'Data Error'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory-ar">
                      {language === 'ar' ? 'الفئة الفرعية بالعربية' : 'Arabic Subcategory'}
                    </Label>
                    <Input
                      id="subcategory-ar"
                      value={newRule.subcategoryAr}
                      onChange={(e) => setNewRule(prev => ({ ...prev, subcategoryAr: e.target.value }))}
                      placeholder={language === 'ar' ? 'خطأ في البيانات' : 'Arabic subcategory'}
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    {language === 'ar' ? 'مستوى الخطورة' : 'Severity Level'}
                  </Label>
                  <Select value={newRule.severity} onValueChange={(value: any) => setNewRule(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">
                        {language === 'ar' ? 'حرجة' : 'Critical'}
                      </SelectItem>
                      <SelectItem value="high">
                        {language === 'ar' ? 'عالية' : 'High'}
                      </SelectItem>
                      <SelectItem value="medium">
                        {language === 'ar' ? 'متوسطة' : 'Medium'}
                      </SelectItem>
                      <SelectItem value="low">
                        {language === 'ar' ? 'منخفضة' : 'Low'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keywords">
                      {language === 'ar' ? 'الكلمات المفتاحية (مفصولة بفواصل)' : 'Keywords (comma-separated)'}
                    </Label>
                    <Textarea
                      id="keywords"
                      value={newRule.keywords?.join(', ')}
                      onChange={(e) => setNewRule(prev => ({ 
                        ...prev, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }))}
                      placeholder={language === 'ar' ? 'رمز خاطئ, بيانات مفقودة, خطأ في النظام' : 'invalid code, missing data, system error'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords-ar">
                      {language === 'ar' ? 'الكلمات المفتاحية بالعربية' : 'Arabic Keywords'}
                    </Label>
                    <Textarea
                      id="keywords-ar"
                      value={newRule.keywordsAr?.join(', ')}
                      onChange={(e) => setNewRule(prev => ({ 
                        ...prev, 
                        keywordsAr: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }))}
                      placeholder={language === 'ar' ? 'رمز خاطئ, بيانات مفقودة, خطأ في النظام' : 'Arabic keywords'}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="codes">
                    {language === 'ar' ? 'رموز الأخطاء (مفصولة بفواصل)' : 'Error Codes (comma-separated)'}
                  </Label>
                  <Input
                    id="codes"
                    value={newRule.codes?.join(', ')}
                    onChange={(e) => setNewRule(prev => ({ 
                      ...prev, 
                      codes: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    }))}
                    placeholder="E001, E002, REJ_DIAG"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">
                      {language === 'ar' ? 'الوصف' : 'Description'}
                    </Label>
                    <Textarea
                      id="description"
                      value={newRule.description}
                      onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={language === 'ar' ? 'وصف مفصل للقاعدة...' : 'Detailed description of the rule...'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-ar">
                      {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    </Label>
                    <Textarea
                      id="description-ar"
                      value={newRule.descriptionAr}
                      onChange={(e) => setNewRule(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      placeholder={language === 'ar' ? 'وصف مفصل للقاعدة...' : 'Arabic description'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fix-suggestion">
                      {language === 'ar' ? 'اقتراح الحل' : 'Fix Suggestion'}
                    </Label>
                    <Textarea
                      id="fix-suggestion"
                      value={newRule.fixSuggestion}
                      onChange={(e) => setNewRule(prev => ({ ...prev, fixSuggestion: e.target.value }))}
                      placeholder={language === 'ar' ? 'اقتراح لحل المشكلة...' : 'Suggestion to fix the issue...'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fix-suggestion-ar">
                      {language === 'ar' ? 'اقتراح الحل بالعربية' : 'Arabic Fix Suggestion'}
                    </Label>
                    <Textarea
                      id="fix-suggestion-ar"
                      value={newRule.fixSuggestionAr}
                      onChange={(e) => setNewRule(prev => ({ ...prev, fixSuggestionAr: e.target.value }))}
                      placeholder={language === 'ar' ? 'اقتراح لحل المشكلة...' : 'Arabic fix suggestion'}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.autoFix}
                    onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, autoFix: checked }))}
                  />
                  <Label>
                    {language === 'ar' ? 'إصلاح تلقائي (إن أمكن)' : 'Auto-fix (if possible)'}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRule}>
                  {language === 'ar' ? 'إنشاء القاعدة' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">
            {language === 'ar' ? 'شركات التأمين' : 'Insurance Providers'}
          </TabsTrigger>
          <TabsTrigger value="provider-rules">
            {language === 'ar' ? 'قواعد مخصصة' : 'Provider Rules'}
          </TabsTrigger>
          <TabsTrigger value="global-rules">
            {language === 'ar' ? 'قواعد عامة' : 'Global Rules'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(provider => (
              <Card key={provider.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {language === 'ar' ? provider.nameAr : provider.name}
                    </CardTitle>
                    <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                      {provider.code}
                    </Badge>
                  </div>
                  <CardDescription>
                    {provider.country} • {provider.specificRules.length} {language === 'ar' ? 'قاعدة مخصصة' : 'custom rules'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {provider.contactInfo.email && (
                      <div>
                        <span className="text-muted-foreground">
                          {language === 'ar' ? 'البريد:' : 'Email:'}
                        </span> {provider.contactInfo.email}
                      </div>
                    )}
                    {provider.contactInfo.phone && (
                      <div>
                        <span className="text-muted-foreground">
                          {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                        </span> {provider.contactInfo.phone}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <Gear className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'إدارة القواعد' : 'Manage Rules'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="provider-rules" className="space-y-4">
          {!selectedProvider ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">
                    {language === 'ar' ? 'اختر شركة تأمين' : 'Select Insurance Provider'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' 
                      ? 'اختر شركة تأمين من القائمة أعلاه لإدارة قواعدها المخصصة'
                      : 'Select an insurance provider from the list above to manage its custom rules'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ar' ? currentProvider?.nameAr : currentProvider?.name}
                  </CardTitle>
                  <CardDescription>
                    {providerRules.length} {language === 'ar' ? 'قاعدة مخصصة' : 'custom rules'}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4">
                {providerRules.map(rule => (
                  <Card key={rule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {language === 'ar' ? rule.nameAr : rule.name}
                            </h3>
                            <Badge variant={getSeverityColor(rule.severity)}>
                              {getSeverityIcon(rule.severity)}
                              <span className="ml-1">
                                {language === 'ar' 
                                  ? { critical: 'حرجة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }[rule.severity]
                                  : rule.severity
                                }
                              </span>
                            </Badge>
                            <Badge variant="outline">
                              {language === 'ar' 
                                ? { medical: 'طبية', technical: 'تقنية' }[rule.category]
                                : rule.category
                              }
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {language === 'ar' ? rule.descriptionAr : rule.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'الفئة الفرعية:' : 'Subcategory:'} {language === 'ar' ? rule.subcategoryAr : rule.subcategory}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleRule(rule.id, false)}
                          />
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="global-rules" className="space-y-4">
          <div className="grid gap-4">
            {globalRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {language === 'ar' ? rule.nameAr : rule.name}
                        </h3>
                        <Badge variant={getSeverityColor(rule.severity)}>
                          {getSeverityIcon(rule.severity)}
                          <span className="ml-1">
                            {language === 'ar' 
                              ? { critical: 'حرجة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }[rule.severity]
                              : rule.severity
                            }
                          </span>
                        </Badge>
                        <Badge variant="outline">
                          {language === 'ar' 
                            ? { medical: 'طبية', technical: 'تقنية' }[rule.category]
                            : rule.category
                          }
                        </Badge>
                        <Badge variant="secondary">
                          {language === 'ar' ? 'عامة' : 'Global'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === 'ar' ? rule.descriptionAr : rule.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'الفئة الفرعية:' : 'Subcategory:'} {language === 'ar' ? rule.subcategoryAr : rule.subcategory}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleRule(rule.id, true)}
                      />
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}