import type { RejectionRule } from '@/types'

export const defaultSaudiRejectionRules: RejectionRule[] = [
  // Medical Category Rules
  {
    id: 'rule-prior-auth-001',
    name: 'Prior Authorization Required',
    nameAr: 'موافقة مسبقة مطلوبة',
    description: 'Claims rejected due to missing or invalid prior authorization for procedures requiring pre-approval',
    descriptionAr: 'مطالبات مرفوضة بسبب عدم وجود أو عدم صحة الموافقة المسبقة للإجراءات التي تتطلب موافقة مسبقة',
    category: 'medical',
    subcategory: 'Prior Authorization',
    subcategoryAr: 'الموافقة المسبقة',
    keywords: [
      'prior authorization', 'pre-approval', 'authorization required', 'approval needed',
      'unauthorized procedure', 'pre-auth', 'approval missing'
    ],
    keywordsAr: [
      'موافقة مسبقة', 'تصريح مسبق', 'موافقة مطلوبة', 'عدم وجود موافقة',
      'إجراء غير مصرح', 'تفويض مسبق'
    ],
    codes: ['AUTH001', 'PA001', 'PREAUTH', 'AUTH_REQ'],
    severity: 'high',
    autoFix: true,
    fixSuggestion: 'Ensure all procedures requiring prior authorization are approved before treatment. Implement automated prior authorization checking in your system.',
    fixSuggestionAr: 'تأكد من الحصول على موافقة مسبقة لجميع الإجراءات التي تتطلب ذلك قبل العلاج. قم بتنفيذ نظام فحص تلقائي للموافقة المسبقة.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-medical-necessity-001',
    name: 'Medical Necessity Not Met',
    nameAr: 'عدم استيفاء الضرورة الطبية',
    description: 'Claims rejected because the treatment or procedure is not deemed medically necessary',
    descriptionAr: 'مطالبات مرفوضة لأن العلاج أو الإجراء غير مطلوب طبياً',
    category: 'medical',
    subcategory: 'Medical Necessity',
    subcategoryAr: 'الضرورة الطبية',
    keywords: [
      'medical necessity', 'not medically necessary', 'unnecessary treatment',
      'inappropriate procedure', 'clinical criteria not met', 'not indicated'
    ],
    keywordsAr: [
      'الضرورة الطبية', 'غير ضروري طبياً', 'علاج غير مبرر',
      'إجراء غير مناسب', 'معايير سريرية غير مستوفاة'
    ],
    codes: ['MED001', 'NECESSITY', 'NOT_MED_NEC', 'CLINICAL_CRITERIA'],
    severity: 'medium',
    autoFix: false,
    fixSuggestion: 'Review clinical documentation and ensure treatments align with established medical guidelines. Provide additional clinical justification when submitting claims.',
    fixSuggestionAr: 'راجع الوثائق السريرية وتأكد من أن العلاجات تتماشى مع الإرشادات الطبية المعتمدة. قدم مبررات سريرية إضافية عند تقديم المطالبات.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-diagnosis-mismatch-001',
    name: 'Diagnosis Code Mismatch',
    nameAr: 'عدم تطابق رمز التشخيص',
    description: 'Claims rejected due to inconsistency between diagnosis codes and procedures performed',
    descriptionAr: 'مطالبات مرفوضة بسبب عدم التطابق بين رموز التشخيص والإجراءات المنفذة',
    category: 'medical',
    subcategory: 'Diagnosis Coding',
    subcategoryAr: 'ترميز التشخيص',
    keywords: [
      'diagnosis mismatch', 'inconsistent diagnosis', 'wrong diagnosis code',
      'diagnosis procedure mismatch', 'ICD code error', 'coding error'
    ],
    keywordsAr: [
      'عدم تطابق التشخيص', 'تشخيص غير متسق', 'رمز تشخيص خاطئ',
      'عدم تطابق التشخيص والإجراء', 'خطأ في رمز التصنيف الدولي'
    ],
    codes: ['ICD001', 'DIAG_MISMATCH', 'DX_ERROR', 'CODING_ERROR'],
    severity: 'medium',
    autoFix: true,
    fixSuggestion: 'Verify diagnosis codes match the documented conditions and procedures. Train coding staff on proper ICD-10 usage and implement coding validation tools.',
    fixSuggestionAr: 'تحقق من أن رموز التشخيص تتطابق مع الحالات والإجراءات الموثقة. درب موظفي الترميز على الاستخدام الصحيح للتصنيف الدولي العاشر.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },

  // Technical Category Rules
  {
    id: 'rule-missing-docs-001',
    name: 'Missing Required Documentation',
    nameAr: 'وثائق مطلوبة مفقودة',
    description: 'Claims rejected due to missing required supporting documentation or attachments',
    descriptionAr: 'مطالبات مرفوضة بسبب عدم وجود وثائق أو مرفقات داعمة مطلوبة',
    category: 'technical',
    subcategory: 'Documentation',
    subcategoryAr: 'التوثيق',
    keywords: [
      'missing documentation', 'incomplete documentation', 'required documents missing',
      'attachments missing', 'supporting documents', 'documentation incomplete'
    ],
    keywordsAr: [
      'وثائق مفقودة', 'توثيق غير مكتمل', 'مستندات مطلوبة مفقودة',
      'مرفقات مفقودة', 'مستندات داعمة', 'توثيق ناقص'
    ],
    codes: ['DOC001', 'MISSING_DOCS', 'INCOMPLETE_DOC', 'ATTACH_MISSING'],
    severity: 'high',
    autoFix: true,
    fixSuggestion: 'Implement a documentation checklist and ensure all required documents are attached before claim submission. Use electronic document management systems.',
    fixSuggestionAr: 'نفذ قائمة مراجعة للوثائق وتأكد من إرفاق جميع المستندات المطلوبة قبل تقديم المطالبة. استخدم أنظمة إدارة المستندات الإلكترونية.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-billing-code-error-001',
    name: 'Invalid Billing Code',
    nameAr: 'رمز فوترة غير صحيح',
    description: 'Claims rejected due to incorrect, invalid, or outdated billing procedure codes',
    descriptionAr: 'مطالبات مرفوضة بسبب رموز إجراءات فوترة غير صحيحة أو غير صالحة أو قديمة',
    category: 'technical',
    subcategory: 'Billing Codes',
    subcategoryAr: 'رموز الفوترة',
    keywords: [
      'invalid code', 'wrong billing code', 'incorrect procedure code',
      'code not found', 'obsolete code', 'billing error', 'procedure code error'
    ],
    keywordsAr: [
      'رمز غير صحيح', 'رمز فوترة خاطئ', 'رمز إجراء غير صحيح',
      'الرمز غير موجود', 'رمز قديم', 'خطأ في الفوترة'
    ],
    codes: ['BILL001', 'INVALID_CODE', 'PROC_CODE_ERROR', 'CODE_NOT_FOUND'],
    severity: 'medium',
    autoFix: true,
    fixSuggestion: 'Update billing code databases regularly and implement real-time code validation. Train billing staff on current procedure codes and coding guidelines.',
    fixSuggestionAr: 'حدث قواعد بيانات رموز الفوترة بانتظام ونفذ التحقق من صحة الرموز في الوقت الفعلي. درب موظفي الفوترة على رموز الإجراءات الحالية.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-data-entry-error-001',
    name: 'Data Entry Error',
    nameAr: 'خطأ في إدخال البيانات',
    description: 'Claims rejected due to errors in patient information, dates, or other data fields',
    descriptionAr: 'مطالبات مرفوضة بسبب أخطاء في معلومات المريض أو التواريخ أو حقول البيانات الأخرى',
    category: 'technical',
    subcategory: 'Data Entry',
    subcategoryAr: 'إدخال البيانات',
    keywords: [
      'data entry error', 'incorrect information', 'wrong patient details',
      'date error', 'typing error', 'information mismatch', 'field error'
    ],
    keywordsAr: [
      'خطأ في إدخال البيانات', 'معلومات غير صحيحة', 'تفاصيل مريض خاطئة',
      'خطأ في التاريخ', 'خطأ في الطباعة', 'عدم تطابق المعلومات'
    ],
    codes: ['DATA001', 'ENTRY_ERROR', 'INFO_ERROR', 'FIELD_ERROR'],
    severity: 'low',
    autoFix: true,
    fixSuggestion: 'Implement data validation controls and double-entry verification. Train staff on accurate data entry and use automated data capture where possible.',
    fixSuggestionAr: 'نفذ ضوابط التحقق من صحة البيانات والتحقق المزدوج من الإدخال. درب الموظفين على الإدخال الدقيق للبيانات واستخدم التقاط البيانات التلقائي حيثما أمكن.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-system-timeout-001',
    name: 'System Timeout/Integration Error',
    nameAr: 'خطأ في انتهاء وقت النظام/التكامل',
    description: 'Claims rejected due to system timeouts, integration failures, or technical connectivity issues',
    descriptionAr: 'مطالبات مرفوضة بسبب انتهاء وقت النظام أو فشل التكامل أو مشاكل الاتصال التقنية',
    category: 'technical',
    subcategory: 'System Integration',
    subcategoryAr: 'تكامل النظام',
    keywords: [
      'system timeout', 'integration error', 'connectivity issue',
      'technical failure', 'system error', 'connection timeout', 'network error'
    ],
    keywordsAr: [
      'انتهاء وقت النظام', 'خطأ في التكامل', 'مشكلة في الاتصال',
      'فشل تقني', 'خطأ في النظام', 'انتهاء وقت الاتصال'
    ],
    codes: ['SYS001', 'TIMEOUT', 'INTEGRATION_ERROR', 'CONN_ERROR'],
    severity: 'critical',
    autoFix: false,
    fixSuggestion: 'Work with IT team to improve system reliability and implement retry mechanisms. Monitor system performance and upgrade infrastructure as needed.',
    fixSuggestionAr: 'تعاون مع فريق تقنية المعلومات لتحسين موثوقية النظام وتنفيذ آليات إعادة المحاولة. راقب أداء النظام وحدث البنية التحتية حسب الحاجة.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },

  // Saudi-specific rules
  {
    id: 'rule-cchi-compliance-001',
    name: 'CCHI Compliance Violation',
    nameAr: 'مخالفة امتثال مجلس الضمان الصحي',
    description: 'Claims rejected for non-compliance with Council of Cooperative Health Insurance (CCHI) regulations',
    descriptionAr: 'مطالبات مرفوضة لعدم الامتثال للوائح مجلس الضمان الصحي التعاوني',
    category: 'medical',
    subcategory: 'Regulatory Compliance',
    subcategoryAr: 'الامتثال التنظيمي',
    keywords: [
      'CCHI', 'regulatory compliance', 'council regulation', 'compliance violation',
      'health insurance council', 'saudi regulation', 'MOH guidelines'
    ],
    keywordsAr: [
      'مجلس الضمان الصحي', 'الامتثال التنظيمي', 'لوائح المجلس', 'مخالفة الامتثال',
      'مجلس التأمين الصحي', 'اللوائح السعودية', 'إرشادات وزارة الصحة'
    ],
    codes: ['CCHI001', 'REG_COMPLIANCE', 'MOH001', 'SAUDI_REG'],
    severity: 'critical',
    autoFix: false,
    fixSuggestion: 'Review and update procedures to ensure full compliance with CCHI regulations. Regularly train staff on Saudi healthcare insurance requirements.',
    fixSuggestionAr: 'راجع وحدث الإجراءات لضمان الامتثال الكامل للوائح مجلس الضمان الصحي. درب الموظفين بانتظام على متطلبات التأمين الصحي السعودي.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  {
    id: 'rule-essential-benefits-001',
    name: 'Essential Benefits Package Violation',
    nameAr: 'مخالفة حزمة المنافع الأساسية',
    description: 'Claims rejected because the service is not covered under the Essential Benefits Package (EBP)',
    descriptionAr: 'مطالبات مرفوضة لأن الخدمة غير مشمولة في حزمة المنافع الأساسية',
    category: 'medical',
    subcategory: 'Coverage Limitation',
    subcategoryAr: 'قيود التغطية',
    keywords: [
      'essential benefits', 'EBP', 'not covered', 'coverage limitation',
      'benefit package', 'excluded service', 'benefit restriction'
    ],
    keywordsAr: [
      'المنافع الأساسية', 'حزمة المنافع', 'غير مشمول', 'قيود التغطية',
      'خدمة مستثناة', 'قيود المنفعة', 'تحديد التغطية'
    ],
    codes: ['EBP001', 'NOT_COVERED', 'BENEFIT_LIMIT', 'EXCLUDED'],
    severity: 'medium',
    autoFix: false,
    fixSuggestion: 'Verify service coverage against the current Essential Benefits Package before providing treatment. Inform patients of any potential out-of-pocket costs.',
    fixSuggestionAr: 'تحقق من تغطية الخدمة مقابل حزمة المنافع الأساسية الحالية قبل تقديم العلاج. أبلغ المرضى بأي تكاليف محتملة خارج الجيب.',
    providerSpecific: false,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
]