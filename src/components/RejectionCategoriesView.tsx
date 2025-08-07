import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
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
import { Plus, Edit, Trash2, Settings, Building2, AlertTriangle, CheckCircle, Clock, Download, Upload, Copy, Search, Filter } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { RejectionRule, InsuranceProvider } from '@/types'

// Enhanced Saudi healthcare-specific rejection categories with Arabic translations
const saudiRejectionCategories = {
  medical: {
    'موافقة_مسبقة': {
      en: 'Prior Authorization',
      ar: 'الموافقة المسبقة',
      subcategories: {
        'موافقة_مسبقة_مطلوبة': { en: 'Prior Authorization Required', ar: 'موافقة مسبقة مطلوبة' },
        'موافقة_مسبقة_منتهية': { en: 'Prior Authorization Expired', ar: 'موافقة مسبقة منتهية الصلاحية' },
        'موافقة_مسبقة_ناقصة': { en: 'Incomplete Prior Authorization', ar: 'موافقة مسبقة ناقصة' }
      }
    },
    'ضرورة_طبية': {
      en: 'Medical Necessity',
      ar: 'الضرورة الطبية',
      subcategories: {
        'غير_ضروري_طبيا': { en: 'Not Medically Necessary', ar: 'غير ضروري طبياً' },
        'علاج_تجريبي': { en: 'Experimental Treatment', ar: 'علاج تجريبي' },
        'علاج_تجميلي': { en: 'Cosmetic Treatment', ar: 'علاج تجميلي' }
      }
    },
    'تشخيص_خاطئ': {
      en: 'Diagnosis Issues',
      ar: 'مشاكل التشخيص',
      subcategories: {
        'رمز_تشخيص_خاطئ': { en: 'Invalid Diagnosis Code', ar: 'رمز تشخيص خاطئ' },
        'تشخيص_غير_مطابق': { en: 'Diagnosis Mismatch', ar: 'تشخيص غير مطابق' },
        'تشخيص_مفقود': { en: 'Missing Diagnosis', ar: 'تشخيص مفقود' }
      }
    },
    'إجراء_طبي': {
      en: 'Medical Procedure',
      ar: 'الإجراء الطبي',
      subcategories: {
        'إجراء_غير_مغطى': { en: 'Procedure Not Covered', ar: 'إجراء غير مغطى' },
        'إجراء_مكرر': { en: 'Duplicate Procedure', ar: 'إجراء مكرر' },
        'تكرار_مبكر': { en: 'Too Soon for Repeat', ar: 'تكرار مبكر للإجراء' }
      }
    },
    'وصفة_طبية': {
      en: 'Prescription Issues',
      ar: 'مشاكل الوصفة الطبية',
      subcategories: {
        'دواء_غير_مغطى': { en: 'Drug Not Covered', ar: 'دواء غير مغطى' },
        'جرعة_خاطئة': { en: 'Incorrect Dosage', ar: 'جرعة خاطئة' },
        'تفاعل_دوائي': { en: 'Drug Interaction', ar: 'تفاعل دوائي' }
      }
    }
  },
  technical: {
    'أخطاء_البيانات': {
      en: 'Data Entry Errors',
      ar: 'أخطاء إدخال البيانات',
      subcategories: {
        'بيانات_مريض_خاطئة': { en: 'Incorrect Patient Data', ar: 'بيانات مريض خاطئة' },
        'رقم_سياسة_خاطئ': { en: 'Invalid Policy Number', ar: 'رقم سياسة خاطئ' },
        'تاريخ_خدمة_خاطئ': { en: 'Incorrect Service Date', ar: 'تاريخ خدمة خاطئ' }
      }
    },
    'مستندات_مفقودة': {
      en: 'Missing Documentation',
      ar: 'مستندات مفقودة',
      subcategories: {
        'تقرير_طبي_مفقود': { en: 'Missing Medical Report', ar: 'تقرير طبي مفقود' },
        'فاتورة_مفقودة': { en: 'Missing Invoice', ar: 'فاتورة مفقودة' },
        'موافقة_مريض_مفقودة': { en: 'Missing Patient Consent', ar: 'موافقة مريض مفقودة' }
      }
    },
    'أخطاء_الفوترة': {
      en: 'Billing Code Errors',
      ar: 'أخطاء رموز الفوترة',
      subcategories: {
        'رمز_CPT_خاطئ': { en: 'Invalid CPT Code', ar: 'رمز CPT خاطئ' },
        'رمز_ICD_خاطئ': { en: 'Invalid ICD Code', ar: 'رمز ICD خاطئ' },
        'سعر_خاطئ': { en: 'Incorrect Pricing', ar: 'سعر خاطئ' }
      }
    },
    'مشاكل_النظام': {
      en: 'System Issues',
      ar: 'مشاكل النظام',
      subcategories: {
        'انقطاع_الاتصال': { en: 'Connection Timeout', ar: 'انقطاع الاتصال' },
        'خطأ_في_النظام': { en: 'System Error', ar: 'خطأ في النظام' },
        'خطأ_في_التكامل': { en: 'Integration Error', ar: 'خطأ في التكامل' }
      }
    },
    'مشاكل_التفويض': {
      en: 'Authorization Issues',
      ar: 'مشاكل التفويض',
      subcategories: {
        'انتهاء_صلاحية_التفويض': { en: 'Authorization Expired', ar: 'انتهاء صلاحية التفويض' },
        'تفويض_مفقود': { en: 'Missing Authorization', ar: 'تفويض مفقود' },
        'تفويض_مرفوض': { en: 'Authorization Denied', ar: 'تفويض مرفوض' }
      }
    }
  }
}

// Enhanced default Saudi providers with more comprehensive data
const enhancedSaudiProviders: InsuranceProvider[] = [
  {
    id: 'bupa-saudi',
    name: 'Bupa Arabia',
    nameAr: 'بوبا العربية',
    code: 'BUPA',
    country: 'Saudi Arabia',
    specificRules: [],
    customCategories: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    customCategoriesAr: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    contactInfo: {
      phone: '+966-11-290-9999',
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
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    customCategoriesAr: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    contactInfo: {
      phone: '+966-11-218-1111',
      email: 'providers@tawuniya.com.sa',
      website: 'https://tawuniya.com.sa'
    },
    isActive: true
  },
  {
    id: 'medgulf',
    name: 'MedGulf',
    nameAr: 'مدجلف',
    code: 'MEDGULF',
    country: 'Saudi Arabia',
    specificRules: [],
    customCategories: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    customCategoriesAr: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    contactInfo: {
      phone: '+966-11-206-8888',
      email: 'providers@medgulf.com.sa',
      website: 'https://medgulf.com.sa'
    },
    isActive: true
  },
  {
    id: 'najm',
    name: 'Najm for Insurance Services',
    nameAr: 'نجم لخدمات التأمين',
    code: 'NAJM',
    country: 'Saudi Arabia',
    specificRules: [],
    customCategories: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    customCategoriesAr: {
      medical: Object.keys(saudiRejectionCategories.medical),
      technical: Object.keys(saudiRejectionCategories.technical)
    },
    contactInfo: {
      phone: '+966-11-205-8200',
      email: 'providers@najm.sa',
      website: 'https://najm.sa'
    },
    isActive: true
  }
]

export function RejectionCategoriesView() {
  const { language, t } = useLanguage()
  const [providers, setProviders] = useKV<InsuranceProvider[]>('insurance-providers-enhanced', enhancedSaudiProviders)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'medical' | 'technical'>('all')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [isCreateProviderOpen, setIsCreateProviderOpen] = useState(false)
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    nameAr: '',
    type: 'technical' as 'medical' | 'technical',
    subcategories: [] as Array<{name: string, nameAr: string}>
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

  // Filter categories based on search and type
  const getFilteredCategories = (type: 'medical' | 'technical') => {
    const categories = saudiRejectionCategories[type]
    return Object.entries(categories).filter(([key, category]) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          category.en.toLowerCase().includes(searchLower) ||
          category.ar.includes(searchTerm) ||
          key.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }

  const handleCreateCategory = () => {
    if (!newCategory.name || !newCategory.nameAr) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields')
      return
    }

    // Add to the static categories structure (in a real app, this would update a database)
    toast.success(language === 'ar' ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully')
    
    setNewCategory({
      name: '',
      nameAr: '',
      type: 'technical',
      subcategories: []
    })
    setIsCreateCategoryOpen(false)
  }

  const handleCreateProvider = () => {
    if (!newProvider.name || !newProvider.code) {
      toast.error(language === 'ar' ? 'يرجى ملء اسم الشركة والرمز' : 'Please fill in provider name and code')
      return
    }

    const provider: InsuranceProvider = {
      id: `provider-${Date.now()}`,
      name: newProvider.name!,
      nameAr: newProvider.nameAr || newProvider.name!,
      code: newProvider.code!,
      country: newProvider.country!,
      specificRules: [],
      customCategories: {
        medical: Object.keys(saudiRejectionCategories.medical),
        technical: Object.keys(saudiRejectionCategories.technical)
      },
      customCategoriesAr: {
        medical: Object.keys(saudiRejectionCategories.medical),
        technical: Object.keys(saudiRejectionCategories.technical)
      },
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
    toast.success(language === 'ar' ? 'تم إضافة شركة التأمين بنجاح' : 'Insurance provider added successfully')
  }

  const exportCategories = () => {
    const exportData = {
      categories: saudiRejectionCategories,
      providers,
      exportDate: new Date().toISOString(),
      version: '2.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saudi-rejection-categories-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(language === 'ar' ? 'تم تصدير الفئات بنجاح' : 'Categories exported successfully')
  }

  const copyCategory = (categoryKey: string, type: 'medical' | 'technical') => {
    const category = saudiRejectionCategories[type][categoryKey]
    const copyText = `${language === 'ar' ? category.ar : category.en}\n${JSON.stringify(category.subcategories, null, 2)}`
    navigator.clipboard.writeText(copyText)
    toast.success(language === 'ar' ? 'تم نسخ الفئة' : 'Category copied')
  }

  return (
    <div className={`container mx-auto px-4 py-4 lg:py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Mobile-first header */}
      <div className="space-y-4 mb-6 lg:mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold">
            {language === 'ar' ? 'فئات الرفض المخصصة' : 'Custom Rejection Categories'}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {language === 'ar' 
              ? 'إدارة فئات الرفض المخصصة للسوق السعودي مع ترجمات عربية شاملة'
              : 'Manage custom rejection categories for Saudi market with comprehensive Arabic translations'
            }
          </p>
        </div>
        
        {/* Mobile-optimized action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportCategories} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'تصدير الفئات' : 'Export Categories'}</span>
            <span className="sm:hidden">{language === 'ar' ? 'تصدير' : 'Export'}</span>
          </Button>
          
          <Dialog open={isCreateProviderOpen} onOpenChange={setIsCreateProviderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{language === 'ar' ? 'إضافة شركة تأمين' : 'Add Provider'}</span>
                <span className="sm:hidden">{language === 'ar' ? 'شركة' : 'Provider'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{language === 'ar' ? 'إضافة فئة' : 'Add Category'}</span>
                <span className="sm:hidden">{language === 'ar' ? 'فئة' : 'Category'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إنشاء فئة رفض جديدة' : 'Create New Rejection Category'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'ar' 
                    ? 'أنشئ فئة مخصصة لتصنيف أسباب الرفض'
                    : 'Create a custom category for classifying rejection reasons'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>
                    {language === 'ar' ? 'نوع الفئة' : 'Category Type'}
                  </Label>
                  <Select value={newCategory.type} onValueChange={(value: 'medical' | 'technical') => setNewCategory(prev => ({ ...prev, type: value }))}>
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
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category-name">
                      {language === 'ar' ? 'اسم الفئة (إنجليزي)' : 'Category Name (English)'}
                    </Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Prior Authorization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-name-ar">
                      {language === 'ar' ? 'اسم الفئة (عربي)' : 'Category Name (Arabic)'}
                    </Label>
                    <Input
                      id="category-name-ar"
                      value={newCategory.nameAr}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="مثال: الموافقة المسبقة"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCategory}>
                  {language === 'ar' ? 'إنشاء الفئة' : 'Create Category'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث في الفئات...' : 'Search categories...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </SelectItem>
                <SelectItem value="medical">
                  {language === 'ar' ? 'طبية' : 'Medical'}
                </SelectItem>
                <SelectItem value="technical">
                  {language === 'ar' ? 'تقنية' : 'Technical'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
          <TabsTrigger value="categories">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </TabsTrigger>
          <TabsTrigger value="providers">
            {language === 'ar' ? 'شركات التأمين' : 'Providers'}
          </TabsTrigger>
          <TabsTrigger value="mapping" className="hidden lg:block">
            {language === 'ar' ? 'ربط الفئات' : 'Category Mapping'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          {/* Medical Categories */}
          {(selectedCategory === 'all' || selectedCategory === 'medical') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-semibold">
                  {language === 'ar' ? 'الفئات الطبية' : 'Medical Categories'}
                </h2>
                <Badge variant="outline">
                  {getFilteredCategories('medical').length}
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {getFilteredCategories('medical').map(([key, category]) => (
                  <Card key={key} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">
                            {language === 'ar' ? category.ar : category.en}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {language === 'ar' ? category.en : category.ar}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="default">
                            {language === 'ar' ? 'طبية' : 'Medical'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCategory(key, 'medical')}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {language === 'ar' ? 'الفئات الفرعية:' : 'Subcategories:'}
                        </h4>
                        <div className="grid gap-2">
                          {Object.entries(category.subcategories).map(([subKey, subCategory]) => (
                            <div key={subKey} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {language === 'ar' ? subCategory.ar : subCategory.en}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {language === 'ar' ? subCategory.en : subCategory.ar}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Technical Categories */}
          {(selectedCategory === 'all' || selectedCategory === 'technical') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-semibold">
                  {language === 'ar' ? 'الفئات التقنية' : 'Technical Categories'}
                </h2>
                <Badge variant="outline">
                  {getFilteredCategories('technical').length}
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {getFilteredCategories('technical').map(([key, category]) => (
                  <Card key={key} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">
                            {language === 'ar' ? category.ar : category.en}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {language === 'ar' ? category.en : category.ar}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary">
                            {language === 'ar' ? 'تقنية' : 'Technical'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCategory(key, 'technical')}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {language === 'ar' ? 'الفئات الفرعية:' : 'Subcategories:'}
                        </h4>
                        <div className="grid gap-2">
                          {Object.entries(category.subcategories).map(([subKey, subCategory]) => (
                            <div key={subKey} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {language === 'ar' ? subCategory.ar : subCategory.en}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {language === 'ar' ? subCategory.en : subCategory.ar}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.map(provider => (
              <Card key={provider.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {language === 'ar' ? provider.nameAr : provider.name}
                    </CardTitle>
                    <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                      {provider.code}
                    </Badge>
                  </div>
                  <CardDescription>
                    {provider.country} • {provider.customCategories.medical.length + provider.customCategories.technical.length} {language === 'ar' ? 'فئة' : 'categories'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm">
                    {provider.contactInfo.email && (
                      <div className="truncate">
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
                  
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {provider.customCategories.medical.length} {language === 'ar' ? 'طبية' : 'Medical'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {provider.customCategories.technical.length} {language === 'ar' ? 'تقنية' : 'Technical'}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'إدارة الفئات' : 'Manage Categories'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'ربط فئات الرفض' : 'Rejection Category Mapping'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'ربط الفئات المخصصة بشركات التأمين المختلفة لتحليل أكثر دقة'
                  : 'Map custom categories to different insurance providers for more accurate analysis'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map(provider => (
                  <div key={provider.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">
                        {language === 'ar' ? provider.nameAr : provider.name}
                      </h3>
                      <Badge>{provider.code}</Badge>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          {language === 'ar' ? 'الفئات الطبية' : 'Medical Categories'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.customCategories.medical.slice(0, 3).map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {language === 'ar' && saudiRejectionCategories.medical[cat] 
                                ? saudiRejectionCategories.medical[cat].ar 
                                : cat
                              }
                            </Badge>
                          ))}
                          {provider.customCategories.medical.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.customCategories.medical.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          {language === 'ar' ? 'الفئات التقنية' : 'Technical Categories'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {provider.customCategories.technical.slice(0, 3).map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {language === 'ar' && saudiRejectionCategories.technical[cat] 
                                ? saudiRejectionCategories.technical[cat].ar 
                                : cat
                              }
                            </Badge>
                          ))}
                          {provider.customCategories.technical.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{provider.customCategories.technical.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}