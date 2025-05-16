import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, X, Users, Video, MessageCircle, BrainCircuit, BookOpenText, Heart, Mic, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TourPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const isArabic = i18n.language === 'ar';

  // Tour steps data with enhanced content
  const tourSteps = [
    {
      title: isArabic ? "مرحباً بك في حكيم زون!" : "Welcome to Dr.Zone AI!",
      description: isArabic 
        ? "منصة طبية متكاملة مصممة خصيصاً للأطباء، تجمع بين الذكاء الاصطناعي والتواصل المهني في مكان واحد."
        : "A comprehensive medical platform designed exclusively for doctors, combining AI and professional networking in one place. Let AI elevate your medical journey — faster insights, better outcomes.",
      icon: <img src="/drzone-icon.svg" alt="Dr.Zone AI Logo" className="h-16 w-16" />,
      image: "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg"
    },
    {
      title: isArabic ? "المنطقة الشخصية (ماي زون)" : "MyZone",
      description: isArabic
        ? "منطقتك الشخصية للتواصل مع الزملاء ومشاركة الأفكار والخبرات الطبية في بيئة آمنة ومهنية."
        : "Your personal space to connect with colleagues and share medical insights in a secure, professional environment. Post updates, track your learning, and showcase your medical journey — all in one secure hub.",
      icon: <Users size={32} className="text-primary-500" />,
      image: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg"
    },
    {
      title: isArabic ? "زون تيوب" : "ZoneTube",
      description: isArabic
        ? "مكتبة فيديوهات طبية تعليمية من أطباء خبراء في مختلف التخصصات. شاهد، تعلم، وشارك معرفتك."
        : "A library of educational medical videos from expert doctors across specialties. Watch, learn, and share your knowledge. Explore curated videos or upload your own — empower others with your knowledge.",
      icon: <Video size={32} className="text-red-500" />,
      image: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg"
    },
    {
      title: isArabic ? "زون كاست" : "ZoneCast",
      description: isArabic
        ? "بودكاست طبي متخصص يمكنك الاستماع إليه أثناء التنقل. استمع لخبرات وآراء زملائك في المجال الطبي."
        : "Specialized medical podcasts you can listen to on the go. Hear experiences and opinions from your medical peers. Perfect for your commute — listen to expert voices, real stories, and evolving discussions.",
      icon: <Mic size={32} className="text-pink-500" />,
      image: "https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg"
    },
    {
      title: isArabic ? "منطقة الدردشة" : "ChatZone",
      description: isArabic
        ? "تواصل بشكل آمن ومشفر مع زملائك الأطباء لمناقشة الحالات والاستشارات الطبية."
        : "Securely communicate with fellow doctors to discuss cases and medical consultations with end-to-end encryption. Your private line to fellow physicians — safe, encrypted, and real-time.",
      icon: <MessageCircle size={32} className="text-green-500" />,
      image: "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg"
    },
    {
      title: isArabic ? "كيمسول - المساعد الذكي" : "Kimsoul AI Assistant",
      description: isArabic
        ? "مساعدك الطبي الذكي المدعوم بالذكاء الاصطناعي. اسأل، ابحث، واحصل على إجابات طبية دقيقة."
        : "Your AI-powered medical assistant. Ask questions, research, and get accurate medical answers. Get personalized answers, summarized papers, and AI-curated recommendations — instantly.",
      icon: <BrainCircuit size={32} className="text-purple-500" />,
      image: "https://images.pexels.com/photos/8438923/pexels-photo-8438923.jpeg"
    },
    {
      title: isArabic ? "منطقة المؤتمرات" : "Conference Zone",
      description: isArabic
        ? "اكتشف وشارك في المؤتمرات والفعاليات الطبية العالمية. تواصل مع الخبراء وتعلم أحدث التقنيات."
        : "Discover and participate in medical conferences and events worldwide. Connect with experts and learn the latest techniques. Build your global presence — attend, speak, and stay at the forefront of medicine.",
      icon: <Calendar size={32} className="text-orange-500" />,
      image: "https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg"
    },
    {
      title: isArabic ? "منطقة البحث" : "Research Zone",
      description: isArabic
        ? "اطلع على أحدث الأبحاث والدراسات الطبية. ابق على اطلاع بآخر التطورات في مجالك."
        : "Access the latest medical research and studies. Stay updated with the newest developments in your field. Smartly filtered papers, instant translations, and AI-powered highlights.",
      icon: <BookOpenText size={32} className="text-yellow-600" />,
      image: "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg"
    },
    {
      title: isArabic ? "زون ماتش" : "ZoneMatch",
      description: isArabic
        ? "تواصل مع أطباء يشاركونك نفس الاهتمامات والتخصصات. وسع شبكة علاقاتك المهنية."
        : "Connect with doctors who share your interests and specialties. Expand your professional network. Medical minds meet here — for collaboration, friendship, or a spark of destiny.",
      icon: <Heart size={32} className="text-pink-500" />,
      image: "https://images.pexels.com/photos/6129049/pexels-photo-6129049.jpeg"
    },
    {
      title: isArabic ? "ابدأ رحلتك الآن!" : "Start Your Journey Now!",
      description: isArabic
        ? "انضم إلى مجتمع الأطباء المتنامي في حكيم زون واستفد من جميع الميزات المتاحة."
        : "Join the growing community of doctors on Dr.Zone AI and take advantage of all available features. You're not just joining a platform — you're joining a movement. Welcome to the future of medicine.",
      icon: <img src="/drzone-icon.svg" alt="Dr.Zone AI Logo" className="h-16 w-16" />,
      image: "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg"
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Redirect to home or auth page when tour is complete
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  // Progress percentage
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      <Helmet>
        <title>{isArabic ? "جولة تعريفية | حكيم زون" : "Platform Tour | Dr.Zone AI"}</title>
        <meta name="description" content="Take a tour of the Dr.Zone AI platform and discover its features" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col">
        {/* Header with close button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={handleSkip}
            className="rounded-full p-2 bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Close tour"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="md:flex">
                  {/* Image section */}
                  <div className="md:w-1/2 relative h-64 md:h-auto">
                    <img
                      src={tourSteps[currentStep].image}
                      alt={tourSteps[currentStep].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-2">
                        <div className="bg-white/20 p-2 rounded-full">
                          {tourSteps[currentStep].icon}
                        </div>
                        <span className="text-lg font-bold">{isArabic ? "حكيم زون" : "Dr.Zone AI"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="md:w-1/2 p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-4" dir={isArabic ? 'rtl' : 'ltr'}>
                      {tourSteps[currentStep].title}
                    </h2>
                    <p className="text-gray-600 mb-8" dir={isArabic ? 'rtl' : 'ltr'}>
                      {tourSteps[currentStep].description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="h-2 w-full bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 flex justify-between">
                        <span>{currentStep + 1} / {tourSteps.length}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <ArrowLeft size={16} className="mr-2" />
                        {isArabic ? "السابق" : "Previous"}
                      </button>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSkip}
                          className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900"
                        >
                          {isArabic ? "تخطي" : "Skip"}
                        </button>
                        <button
                          onClick={handleNext}
                          className="px-6 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 flex items-center"
                        >
                          {currentStep === tourSteps.length - 1 
                            ? (isArabic ? "إنهاء" : "Finish") 
                            : (isArabic ? "التالي" : "Next")}
                          <ArrowRight size={16} className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourPage;