import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, Phone, Globe, ArrowLeft, MessageCircle, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HelpPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <>
      <Helmet>
        <title>{isArabic ? "المساعدة والدعم | حكيم زون" : "Help & Support | Dr.Zone AI"}</title>
        <meta name="description" content="Get help with joining and using the Dr.Zone AI platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft size={16} className="mr-2" />
              {isArabic ? "العودة إلى الصفحة الرئيسية" : "Back to Homepage"}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isArabic ? "مركز المساعدة" : "Help Center"}
            </h1>
            <p className="text-lg text-gray-600">
              {isArabic 
                ? "نحن هنا لمساعدتك في الانضمام إلى منصة حكيم زون والاستفادة من جميع ميزاتها"
                : "We're here to help you join Dr.Zone AI and make the most of all its features"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {isArabic ? "كيفية الانضمام إلى حكيم زون" : "How to Join Dr.Zone AI"}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "إكمال ملفك الشخصي" : "Complete Your Profile"}
                    </h3>
                    <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic
                        ? "أضف معلوماتك الطبية وتخصصك وخبراتك. قم بتحميل صورة شخصية احترافية وأي شهادات أو مؤهلات ذات صلة."
                        : "Add your medical information, specialization, and experience. Upload a professional profile picture and any relevant certifications or qualifications."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;
