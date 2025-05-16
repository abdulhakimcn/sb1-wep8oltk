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
                      {isArabic ? "التسجيل كطبيب" : "Register as a Doctor"}
                    </h3>
                    <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic 
                        ? "انقر على زر \"انضم الآن\" في الصفحة الرئيسية أو زر \"إنشاء حساب\" في صفحة تسجيل الدخول. أدخل بريدك الإلكتروني وكلمة المرور واختر \"طبيب\" كنوع الحساب."
                        : "Click the 'Join Now' button on the homepage or the 'Create Account' button on the login page. Enter your email and password and select 'Doctor' as your account type."}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "التسجيل كمؤسسة" : "Register as an Organization"}
                    </h3>
                    <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic 
                        ? "انقر على زر \"انضم الآن\" واختر \"مؤسسة\" كنوع الحساب. أدخل اسم المؤسسة ونوعها ورقم التسجيل."
                        : "Click the 'Join Now' button and select 'Organization' as your account type. Enter your organization name, type, and registration number."}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "التحقق من الحساب" : "Account Verification"}
                    </h3>
                    <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic 
                        ? "تحقق من بريدك الإلكتروني للحصول على رابط التأكيد. بعد تأكيد بريدك الإلكتروني، أكمل ملفك الشخصي وقم بتحميل وثائق التحقق المهنية للحصول على شارة التحقق."
                        : "Check your email for a confirmation link. After confirming your email, complete your profile and upload professional verification documents to get the verification badge."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isArabic ? "من يمكنه الانضمام إلى حكيم زون؟" : "Who can join Dr.Zone AI?"}
                  </h3>
                  <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? "حكيم زون مخصص للأطباء والمتخصصين في الرعاية الصحية والمؤسسات الطبية. نحن نتحقق من جميع المستخدمين للحفاظ على بيئة آمنة وموثوقة."
                      : "Dr.Zone AI is exclusively for doctors, healthcare professionals, and medical institutions. We verify all users to maintain a safe and trusted environment."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isArabic ? "كيف يمكنني التحقق من حسابي؟" : "How do I verify my account?"}
                  </h3>
                  <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? "بعد تسجيل الدخول، انتقل إلى صفحة الملف الشخصي وانقر على زر \"الحصول على توثيق\". قم بتحميل نسخة من ترخيصك الطبي أو شهادة المجلس وسنراجعها في غضون 1-2 يوم عمل."
                      : "After logging in, go to your profile page and click the 'Get Verified' button. Upload a copy of your medical license or board certification and we'll review it within 1-2 business days."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isArabic ? "هل يمكنني التسجيل باستخدام رقم الهاتف؟" : "Can I register using my phone number?"}
                  </h3>
                  <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? "نعم، يمكنك التسجيل باستخدام رقم هاتفك. ببساطة اختر خيار \"رقم الهاتف\" في صفحة تسجيل الدخول وسنرسل لك رمز تحقق."
                      : "Yes, you can register using your phone number. Simply select the 'Phone' option on the login page and we'll send you a verification code."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isArabic ? "هل المنصة متاحة باللغة العربية؟" : "Is the platform available in Arabic?"}
                  </h3>
                  <p className="mt-2 text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? "نعم، حكيم زون متاح باللغة العربية والإنجليزية والصينية. يمكنك تغيير اللغة من خلال محدد اللغة في شريط التنقل العلوي."
                      : "Yes, Dr.Zone AI is available in Arabic, English, and Chinese. You can change the language using the language selector in the top navigation bar."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-primary-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                {isArabic ? "اتصل بنا" : "Contact Us"}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <Mail size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "البريد الإلكتروني" : "Email"}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      <a href="mailto:dr.zone.ai@hakeemzone.com" className="text-primary-600 hover:text-primary-700">
                        dr.zone.ai@hakeemzone.com
                      </a>
                    </p>
                    <p className="mt-1 text-gray-600">
                      <a href="mailto:dr.zone.ai@gmail.com" className="text-primary-600 hover:text-primary-700">
                        dr.zone.ai@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <Phone size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "الهاتف" : "Phone"}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      <a href="tel:+8613138607996" className="text-primary-600 hover:text-primary-700">
                        +86 13138607996
                      </a>
                    </p>
                    <p className="mt-1 text-gray-600">
                      <a href="tel:+967774168043" className="text-primary-600 hover:text-primary-700">
                        +967 774168043
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <MessageCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "الدعم المباشر" : "Live Support"}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {isArabic 
                        ? "متاح من الأحد إلى الخميس، 9 صباحًا - 5 مساءً (توقيت الخليج)"
                        : "Available Sunday-Thursday, 9am-5pm (Gulf Time)"}
                    </p>
                    <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                      {isArabic ? "بدء الدردشة" : "Start Chat"}
                    </button>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <Globe size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isArabic ? "الموقع الإلكتروني" : "Website"}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      <a href="https://drzone.ai" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        drzone.ai
                      </a>
                    </p>
                    <p className="mt-1 text-gray-600">
                      <a href="https://hakeemzone.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        hakeemzone.com
                      </a>
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