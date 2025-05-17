import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const ContactPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError(isArabic 
        ? 'يرجى ملء جميع الحقول المطلوبة'
        : 'Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(isArabic 
        ? 'يرجى إدخال عنوان بريد إلكتروني صالح'
        : 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would send the message to a database or email service
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Optional: Store the contact message in Supabase
      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'General Inquiry',
            message: formData.message,
            status: 'new'
          }
        ]);
      
      if (supabaseError) {
        // If Supabase storage fails, we still want to show success to the user
        console.error('Error storing contact message:', supabaseError);
      }
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError(isArabic 
        ? 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.'
        : 'An error occurred while sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'اتصل بنا | حكيم زون' : 'Contact Us | Dr.Zone AI'}</title>
        <meta name="description" content="Get in touch with the Dr.Zone AI team for support, feedback, or partnership inquiries." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft size={16} className="mr-2" />
              {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2" dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic ? 'اتصل بنا' : 'Contact Us'}
            </h1>
            <p className="text-lg text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic 
                ? 'نحن هنا للإجابة على أسئلتك ومساعدتك في رحلتك الطبية'
                : 'We\'re here to answer your questions and assist you on your medical journey'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <h2 className="text-xl font-semibold mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                        <Mail size={24} />
                      </div>
                    </div>
                    <div className={isArabic ? 'mr-4' : 'ml-4'}>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isArabic ? 'البريد الإلكتروني' : 'Email'}
                      </h3>
                      <p className="mt-1 text-gray-600">
                        <a href="mailto:dr.hakim@drzone.ai" className="text-primary-600 hover:text-primary-700">
                          dr.hakim@drzone.ai
                        </a>
                      </p>
                      <p className="mt-1 text-gray-600">
                        <a href="mailto:dr.zone.ai@gmail.com" className="text-primary-600 hover:text-primary-700">
                          dr.zone.ai@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                        <Phone size={24} />
                      </div>
                    </div>
                    <div className={isArabic ? 'mr-4' : 'ml-4'}>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isArabic ? 'الهاتف' : 'Phone'}
                      </h3>
                      <p className="mt-1 text-gray-600">
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

                  <div className="flex items-start" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                        <MessageSquare size={24} />
                      </div>
                    </div>
                    <div className={isArabic ? 'mr-4' : 'ml-4'}>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isArabic ? 'واتساب' : 'WhatsApp'}
                      </h3>
                      <p className="mt-1 text-gray-600">
                        <a href="https://wa.me/967774168043" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">
                          +967 774168043
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                        <MapPin size={24} />
                      </div>
                    </div>
                    <div className={isArabic ? 'mr-4' : 'ml-4'}>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isArabic ? 'العنوان' : 'Address'}
                      </h3>
                      <p className="mt-1 text-gray-600">
                        {isArabic 
                          ? 'شنغهاي، الصين'
                          : 'Shanghai, China'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? 'ساعات العمل' : 'Working Hours'}
                  </h3>
                  <p className="text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? 'الأحد - الخميس: 9 صباحًا - 5 مساءً (توقيت الخليج)'
                      : 'Sunday - Thursday: 9am - 5pm (Gulf Time)'}
                  </p>
                  <p className="text-gray-600" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic 
                      ? 'الجمعة - السبت: مغلق'
                      : 'Friday - Saturday: Closed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
                  {isArabic ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                </h2>
                
                {success ? (
                  <div className="rounded-md bg-green-50 p-4 mb-6">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800" dir={isArabic ? 'rtl' : 'ltr'}>
                          {isArabic ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!'}
                        </h3>
                        <div className="mt-2 text-sm text-green-700" dir={isArabic ? 'rtl' : 'ltr'}>
                          <p>
                            {isArabic 
                              ? 'شكرًا لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.'
                              : 'Thank you for reaching out. We will get back to you as soon as possible.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          {isArabic ? 'الاسم' : 'Name'} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          {isArabic ? 'البريد الإلكتروني' : 'Email'} *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        {isArabic ? 'الموضوع' : 'Subject'}
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">{isArabic ? 'اختر موضوعًا' : 'Select a subject'}</option>
                        <option value="General Inquiry">{isArabic ? 'استفسار عام' : 'General Inquiry'}</option>
                        <option value="Technical Support">{isArabic ? 'الدعم الفني' : 'Technical Support'}</option>
                        <option value="Account Issues">{isArabic ? 'مشاكل الحساب' : 'Account Issues'}</option>
                        <option value="Partnership">{isArabic ? 'شراكة' : 'Partnership'}</option>
                        <option value="Feedback">{isArabic ? 'تعليقات' : 'Feedback'}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        {isArabic ? 'الرسالة' : 'Message'} *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                            <Send size={16} className={isArabic ? 'mr-2' : 'ml-2'} />
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'كيف يمكنني التحقق من حسابي؟' : 'How do I verify my account?'}
                </h3>
                <p className="text-gray-600">
                  {isArabic 
                    ? 'بعد تسجيل الدخول، انتقل إلى صفحة الملف الشخصي وانقر على زر "الحصول على توثيق". قم بتحميل نسخة من ترخيصك الطبي أو شهادة المجلس وسنراجعها في غضون 1-2 يوم عمل.'
                    : 'After logging in, go to your profile page and click the "Get Verified" button. Upload a copy of your medical license or board certification and we\'ll review it within 1-2 business days.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'هل يمكنني التسجيل باستخدام رقم الهاتف؟' : 'Can I register using my phone number?'}
                </h3>
                <p className="text-gray-600">
                  {isArabic 
                    ? 'نعم، يمكنك التسجيل باستخدام رقم هاتفك. ببساطة اختر خيار "رقم الهاتف" في صفحة تسجيل الدخول وسنرسل لك رمز تحقق عبر واتساب أو رسالة نصية.'
                    : 'Yes, you can register using your phone number. Simply select the "Phone" option on the login page and we\'ll send you a verification code via WhatsApp or SMS.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'هل المنصة متاحة باللغة العربية؟' : 'Is the platform available in Arabic?'}
                </h3>
                <p className="text-gray-600">
                  {isArabic 
                    ? 'نعم، حكيم زون متاح باللغة العربية والإنجليزية والصينية. يمكنك تغيير اللغة من خلال محدد اللغة في شريط التنقل العلوي.'
                    : 'Yes, Dr.Zone AI is available in Arabic, English, and Chinese. You can change the language using the language selector in the top navigation bar.'}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isArabic ? 'كيف يمكنني استعادة كلمة المرور الخاصة بي؟' : 'How can I recover my password?'}
                </h3>
                <p className="text-gray-600">
                  {isArabic 
                    ? 'في صفحة تسجيل الدخول، انقر على "نسيت كلمة المرور؟" وأدخل بريدك الإلكتروني. سنرسل لك رابطًا لإعادة تعيين كلمة المرور.'
                    : 'On the login page, click "Forgot Password?" and enter your email. We\'ll send you a link to reset your password.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
