import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

export type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    'app.title': 'Healthcare Insurance Claims Analyzer',
    'header.language': 'Language',
    'header.upload': 'Upload Files',
    'header.dashboard': 'Dashboard',
    'header.analysis': 'Analysis',
    'header.insights': 'Insights',
    'header.rules': 'Rules',
    'header.categories': 'Categories',
    
    // Navigation
    'navigation': 'Navigation',
    'settings': 'Settings',
    
    // Upload
    'upload.title': 'Upload Insurance Files',
    'upload.subtitle': 'Upload PDF and Excel files to analyze claims, rejections, and billing data',
    'upload.dragDrop': 'Drag and drop files here, or click to browse',
    'upload.formats': 'Supports PDF and Excel files (unlimited size)',
    'upload.processing': 'Processing files...',
    'upload.success': 'Files uploaded successfully',
    'upload.button': 'Upload Files',
    
    // Dashboard
    'dashboard.title': 'Claims Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.totalClaims': 'Total Claims',
    'dashboard.totalAmount': 'Total Amount',
    'dashboard.rejectedClaims': 'Rejected Claims',
    'dashboard.rejectionRate': 'Rejection Rate',
    'dashboard.avgProcessingTime': 'Avg Processing Time',
    'dashboard.pendingClaims': 'Pending Claims',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.topRejectionReasons': 'Top Rejection Reasons',
    
    // Analysis
    'analysis.title': 'Detailed Analysis',
    'analysis.patterns': 'Rejection Patterns',
    'analysis.medical': 'Medical Rejections',
    'analysis.technical': 'Technical Rejections',
    'analysis.trends': 'Trends Analysis',
    'analysis.byProvider': 'By Provider',
    'analysis.byCategory': 'By Category',
    'analysis.timeRange': 'Time Range',
    
    // Insights
    'insights.title': 'Insights & Recommendations',
    'insights.actionPlan': 'Action Plan',
    'insights.training': 'Training Materials',
    'insights.predictions': 'Predictions',
    'insights.recommendations': 'Recommendations',
    'insights.generateTraining': 'Generate Training Material',
    'insights.downloadReport': 'Download Report',
    
    // Saudi Market
    'saudi.compliance': 'CCHI Compliance',
    'saudi.regulations': 'Saudi Regulations',
    'saudi.market': 'Market Analysis',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.days': 'days',
    'common.sar': 'SAR',
  },
  ar: {
    // Header
    'app.title': 'محلل مطالبات التأمين الصحي',
    'header.language': 'اللغة',
    'header.upload': 'رفع الملفات',
    'header.dashboard': 'لوحة القيادة',
    'header.analysis': 'التحليل',
    'header.insights': 'الرؤى',
    'header.rules': 'القواعد',
    'header.categories': 'الفئات',
    
    // Navigation
    'navigation': 'التنقل',
    'settings': 'الإعدادات',
    
    // Upload
    'upload.title': 'رفع ملفات التأمين',
    'upload.subtitle': 'ارفع ملفات PDF و Excel لتحليل المطالبات والرفوضات وبيانات الفواتير',
    'upload.dragDrop': 'اسحب الملفات هنا، أو انقر للتصفح',
    'upload.formats': 'يدعم ملفات PDF و Excel (بلا حدود للحجم)',
    'upload.processing': 'جاري معالجة الملفات...',
    'upload.success': 'تم رفع الملفات بنجاح',
    'upload.button': 'رفع الملفات',
    
    // Dashboard
    'dashboard.title': 'لوحة قيادة المطالبات',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.totalClaims': 'إجمالي المطالبات',
    'dashboard.totalAmount': 'إجمالي المبلغ',
    'dashboard.rejectedClaims': 'المطالبات المرفوضة',
    'dashboard.rejectionRate': 'معدل الرفض',
    'dashboard.avgProcessingTime': 'متوسط وقت المعالجة',
    'dashboard.pendingClaims': 'المطالبات المعلقة',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.topRejectionReasons': 'أهم أسباب الرفض',
    
    // Analysis
    'analysis.title': 'التحليل التفصيلي',
    'analysis.patterns': 'أنماط الرفض',
    'analysis.medical': 'الرفوضات الطبية',
    'analysis.technical': 'الرفوضات التقنية',
    'analysis.trends': 'تحليل الاتجاهات',
    'analysis.byProvider': 'حسب مقدم الخدمة',
    'analysis.byCategory': 'حسب الفئة',
    'analysis.timeRange': 'الفترة الزمنية',
    
    // Insights
    'insights.title': 'الرؤى والتوصيات',
    'insights.actionPlan': 'خطة العمل',
    'insights.training': 'المواد التدريبية',
    'insights.predictions': 'التنبؤات',
    'insights.recommendations': 'التوصيات',
    'insights.generateTraining': 'إنشاء مواد تدريبية',
    'insights.downloadReport': 'تحميل التقرير',
    
    // Saudi Market
    'saudi.compliance': 'امتثال مجلس الضمان الصحي',
    'saudi.regulations': 'الأنظمة السعودية',
    'saudi.market': 'تحليل السوق',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.close': 'إغلاق',
    'common.view': 'عرض',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.days': 'أيام',
    'common.sar': 'ريال',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useKV<Language>('app-language', 'en')
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}