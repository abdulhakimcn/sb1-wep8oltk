import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowRight, ArrowLeft, Brain, Heart, Microscope, Syringe, Baby, Bone, Eye, Scale as Scalpel, Pill, Dna, Settings as Lungs, Brush as Virus, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Define the question interface
interface Question {
  id: number;
  text: string;
  textAr: string;
  options: {
    id: string;
    text: string;
    textAr: string;
    specialties: Record<string, number>;
  }[];
}

// Define the specialty interface
interface Specialty {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  traits: string[];
  traitsAr: string[];
  challenges: string[];
  challengesAr: string[];
}

const FindYourSpecialtyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Specialty | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define specialties with their descriptions and traits
  const specialties: Record<string, Specialty> = {
    cardiology: {
      id: 'cardiology',
      name: 'Cardiology',
      nameAr: 'طب القلب',
      description: 'You have the heart of a cardiologist! Your methodical approach, attention to detail, and ability to make quick decisions under pressure make you well-suited for this specialty. You enjoy solving complex problems and have a natural ability to connect with patients while maintaining professional boundaries.',
      descriptionAr: 'لديك قلب طبيب قلب! نهجك المنهجي، واهتمامك بالتفاصيل، وقدرتك على اتخاذ قرارات سريعة تحت الضغط تجعلك مناسبًا لهذا التخصص. تستمتع بحل المشكلات المعقدة ولديك قدرة طبيعية على التواصل مع المرضى مع الحفاظ على الحدود المهنية.',
      icon: <Heart size={48} className="text-red-500" />,
      traits: [
        'Methodical and detail-oriented',
        'Calm under pressure',
        'Excellent diagnostic skills',
        'Strong technical abilities',
        'Good with long-term patient relationships'
      ],
      traitsAr: [
        'منهجي ومهتم بالتفاصيل',
        'هادئ تحت الضغط',
        'مهارات تشخيصية ممتازة',
        'قدرات تقنية قوية',
        'جيد في علاقات المرضى طويلة الأمد'
      ],
      challenges: [
        'High-stress emergency situations',
        'Keeping up with rapidly evolving technology',
        'Balancing technical skills with patient communication'
      ],
      challengesAr: [
        'مواقف الطوارئ عالية الضغط',
        'مواكبة التكنولوجيا المتطورة بسرعة',
        'الموازنة بين المهارات التقنية والتواصل مع المرضى'
      ]
    },
    neurology: {
      id: 'neurology',
      name: 'Neurology',
      nameAr: 'طب الأعصاب',
      description: 'Your analytical mind and fascination with complex systems make you an ideal neurologist. You enjoy intellectual challenges and have the patience to solve difficult diagnostic puzzles. Your thoughtful approach and ability to synthesize information from multiple sources serve you well in this specialty.',
      descriptionAr: 'عقلك التحليلي وافتتانك بالأنظمة المعقدة يجعلانك طبيب أعصاب مثاليًا. تستمتع بالتحديات الفكرية ولديك الصبر لحل الألغاز التشخيصية الصعبة. نهجك المدروس وقدرتك على تجميع المعلومات من مصادر متعددة يخدمانك جيدًا في هذا التخصص.',
      icon: <Brain size={48} className="text-purple-500" />,
      traits: [
        'Highly analytical and detail-oriented',
        'Patient with complex cases',
        'Excellent pattern recognition',
        'Strong scientific curiosity',
        'Comfortable with ambiguity'
      ],
      traitsAr: [
        'تحليلي للغاية ومهتم بالتفاصيل',
        'صبور مع الحالات المعقدة',
        'ممتاز في التعرف على الأنماط',
        'فضول علمي قوي',
        'مرتاح مع الغموض'
      ],
      challenges: [
        'Managing chronic, sometimes incurable conditions',
        'Complex diagnostic processes',
        'Emotional weight of degenerative conditions'
      ],
      challengesAr: [
        'إدارة الحالات المزمنة، وأحيانًا غير القابلة للشفاء',
        'عمليات تشخيصية معقدة',
        'العبء العاطفي للحالات التنكسية'
      ]
    },
    pediatrics: {
      id: 'pediatrics',
      name: 'Pediatrics',
      nameAr: 'طب الأطفال',
      description: 'Your warm personality, patience, and ability to connect with children and their families make you a natural pediatrician. You have a playful spirit combined with keen observation skills that help you diagnose patients who may not be able to clearly articulate their symptoms.',
      descriptionAr: 'شخصيتك الدافئة وصبرك وقدرتك على التواصل مع الأطفال وعائلاتهم تجعلك طبيب أطفال طبيعيًا. لديك روح مرحة مع مهارات ملاحظة حادة تساعدك على تشخيص المرضى الذين قد لا يتمكنون من التعبير بوضوح عن أعراضهم.',
      icon: <Baby size={48} className="text-pink-500" />,
      traits: [
        'Patient and empathetic',
        'Good at building trust quickly',
        'Excellent communication with children and parents',
        'Adaptable and creative',
        'Positive and reassuring demeanor'
      ],
      traitsAr: [
        'صبور ومتعاطف',
        'جيد في بناء الثقة بسرعة',
        'تواصل ممتاز مع الأطفال والوالدين',
        'قابل للتكيف ومبدع',
        'سلوك إيجابي ومطمئن'
      ],
      challenges: [
        'Working with anxious parents',
        'Diagnosing patients with limited communication',
        'Emotional attachment to young patients'
      ],
      challengesAr: [
        'العمل مع الآباء القلقين',
        'تشخيص المرضى ذوي التواصل المحدود',
        'الارتباط العاطفي بالمرضى الصغار'
      ]
    },
    surgery: {
      id: 'surgery',
      name: 'Surgery',
      nameAr: 'الجراحة',
      description: 'Your decisive nature, steady hands, and ability to perform under pressure make you an excellent surgeon. You enjoy tangible results and have the confidence to make critical decisions quickly. Your technical skills and spatial awareness are exceptional.',
      descriptionAr: 'طبيعتك الحاسمة، ويداك الثابتتان، وقدرتك على الأداء تحت الضغط تجعلك جراحًا ممتازًا. تستمتع بالنتائج الملموسة ولديك الثقة لاتخاذ القرارات الحاسمة بسرعة. مهاراتك التقنية ووعيك المكاني استثنائيان.',
      icon: <Scalpel size={48} className="text-gray-700" />,
      traits: [
        'Decisive and confident',
        'Excellent hand-eye coordination',
        'Calm under extreme pressure',
        'Detail-oriented with technical precision',
        'Able to lead a team effectively'
      ],
      traitsAr: [
        'حاسم وواثق',
        'تنسيق ممتاز بين اليد والعين',
        'هادئ تحت الضغط الشديد',
        'مهتم بالتفاصيل مع دقة تقنية',
        'قادر على قيادة فريق بفعالية'
      ],
      challenges: [
        'High-stress environment',
        'Long, physically demanding procedures',
        'Dealing with complications and unexpected outcomes'
      ],
      challengesAr: [
        'بيئة عالية الضغط',
        'إجراءات طويلة ومرهقة جسديًا',
        'التعامل مع المضاعفات والنتائج غير المتوقعة'
      ]
    },
    psychiatry: {
      id: 'psychiatry',
      name: 'Psychiatry',
      nameAr: 'الطب النفسي',
      description: 'Your empathetic nature, excellent listening skills, and interest in the human mind make you well-suited for psychiatry. You have the patience to build long-term therapeutic relationships and the emotional intelligence to understand complex psychological issues.',
      descriptionAr: 'طبيعتك المتعاطفة، ومهارات الاستماع الممتازة، واهتمامك بالعقل البشري تجعلك مناسبًا للطب النفسي. لديك الصبر لبناء علاقات علاجية طويلة الأمد والذكاء العاطفي لفهم القضايا النفسية المعقدة.',
      icon: <Brain size={48} className="text-blue-500" />,
      traits: [
        'Highly empathetic and patient',
        'Excellent listener',
        'Non-judgmental approach',
        'Comfortable with emotional complexity',
        'Strong boundaries and self-care'
      ],
      traitsAr: [
        'متعاطف للغاية وصبور',
        'مستمع ممتاز',
        'نهج غير حكمي',
        'مرتاح مع التعقيد العاطفي',
        'حدود قوية ورعاية ذاتية'
      ],
      challenges: [
        'Emotional toll of working with mental illness',
        'Stigma around mental health',
        'Managing patient boundaries'
      ],
      challengesAr: [
        'التكلفة العاطفية للعمل مع المرض النفسي',
        'وصمة العار حول الصحة النفسية',
        'إدارة حدود المريض'
      ]
    },
    familyMedicine: {
      id: 'familyMedicine',
      name: 'Family Medicine',
      nameAr: 'طب الأسرة',
      description: 'Your broad interests, excellent communication skills, and desire to build long-term relationships make you an ideal family physician. You enjoy variety in your practice and have the versatility to address a wide range of medical issues across all age groups.',
      descriptionAr: 'اهتماماتك الواسعة، ومهارات التواصل الممتازة، ورغبتك في بناء علاقات طويلة الأمد تجعلك طبيب أسرة مثاليًا. تستمتع بالتنوع في ممارستك ولديك المرونة لمعالجة مجموعة واسعة من المشاكل الطبية عبر جميع الفئات العمرية.',
      icon: <Thermometer size={48} className="text-green-500" />,
      traits: [
        'Versatile and adaptable',
        'Strong interpersonal skills',
        'Enjoys variety and breadth',
        'Community-oriented',
        'Good at preventive care'
      ],
      traitsAr: [
        'متعدد الاستخدامات وقابل للتكيف',
        'مهارات شخصية قوية',
        'يستمتع بالتنوع والاتساع',
        'موجه للمجتمع',
        'جيد في الرعاية الوقائية'
      ],
      challenges: [
        'Breadth of knowledge required',
        'Time constraints with patients',
        'Administrative burdens'
      ],
      challengesAr: [
        'اتساع المعرفة المطلوبة',
        'قيود الوقت مع المرضى',
        'الأعباء الإدارية'
      ]
    },
    pathology: {
      id: 'pathology',
      name: 'Pathology',
      nameAr: 'علم الأمراض',
      description: 'Your meticulous attention to detail, analytical mind, and preference for working behind the scenes make pathology an excellent fit. You enjoy solving medical mysteries through laboratory investigation and have a deep appreciation for the scientific foundations of medicine.',
      descriptionAr: 'اهتمامك الدقيق بالتفاصيل، وعقلك التحليلي، وتفضيلك للعمل خلف الكواليس يجعل علم الأمراض مناسبًا تمامًا. تستمتع بحل الألغاز الطبية من خلال التحقيق المختبري ولديك تقدير عميق للأسس العلمية للطب.',
      icon: <Microscope size={48} className="text-indigo-500" />,
      traits: [
        'Highly detail-oriented',
        'Analytical and methodical',
        'Enjoys laboratory work',
        'Strong visual pattern recognition',
        'Prefers working independently'
      ],
      traitsAr: [
        'مهتم بالتفاصيل بشكل كبير',
        'تحليلي ومنهجي',
        'يستمتع بالعمل المختبري',
        'تعرف قوي على الأنماط البصرية',
        'يفضل العمل بشكل مستقل'
      ],
      challenges: [
        'Limited patient contact',
        'Pressure for accurate diagnoses',
        'Keeping up with technological advances'
      ],
      challengesAr: [
        'اتصال محدود بالمرضى',
        'ضغط للتشخيصات الدقيقة',
        'مواكبة التقدم التكنولوجي'
      ]
    },
    emergencyMedicine: {
      id: 'emergencyMedicine',
      name: 'Emergency Medicine',
      nameAr: 'طب الطوارئ',
      description: 'Your quick thinking, ability to multitask, and comfort with uncertainty make you well-suited for emergency medicine. You thrive in fast-paced environments and enjoy the variety and unpredictability of cases that come through the emergency department.',
      descriptionAr: 'تفكيرك السريع، وقدرتك على تعدد المهام، وراحتك مع عدم اليقين تجعلك مناسبًا لطب الطوارئ. تزدهر في البيئات سريعة الوتيرة وتستمتع بتنوع وعدم قابلية التنبؤ بالحالات التي تأتي عبر قسم الطوارئ.',
      icon: <Syringe size={48} className="text-red-600" />,
      traits: [
        'Quick decision-maker',
        'Excellent at multitasking',
        'Thrives under pressure',
        'Adaptable to changing situations',
        'Broad knowledge base'
      ],
      traitsAr: [
        'متخذ قرار سريع',
        'ممتاز في تعدد المهام',
        'يزدهر تحت الضغط',
        'قابل للتكيف مع المواقف المتغيرة',
        'قاعدة معرفية واسعة'
      ],
      challenges: [
        'High-stress environment',
        'Irregular hours and shift work',
        'Limited follow-up with patients'
      ],
      challengesAr: [
        'بيئة عالية الضغط',
        'ساعات غير منتظمة والعمل بنظام المناوبات',
        'متابعة محدودة مع المرضى'
      ]
    },
    dermatology: {
      id: 'dermatology',
      name: 'Dermatology',
      nameAr: 'الأمراض الجلدية',
      description: 'Your visual acuity, pattern recognition skills, and interest in both medical and procedural aspects of care make dermatology a great match. You appreciate the visual nature of diagnosis and enjoy the mix of medical management and procedures.',
      descriptionAr: 'حدة بصرك، ومهارات التعرف على الأنماط، واهتمامك بالجوانب الطبية والإجرائية للرعاية تجعل الأمراض الجلدية مناسبة تمامًا. أنت تقدر الطبيعة البصرية للتشخيص وتستمتع بمزيج من الإدارة الطبية والإجراءات.',
      icon: <Eye size={48} className="text-amber-500" />,
      traits: [
        'Strong visual diagnostic skills',
        'Detail-oriented',
        'Good with procedures',
        'Aesthetic sensibility',
        'Enjoys both diagnosis and treatment'
      ],
      traitsAr: [
        'مهارات تشخيصية بصرية قوية',
        'مهتم بالتفاصيل',
        'جيد في الإجراءات',
        'حس جمالي',
        'يستمتع بكل من التشخيص والعلاج'
      ],
      challenges: [
        'High patient expectations',
        'Balancing medical and cosmetic aspects',
        'Competitive specialty to enter'
      ],
      challengesAr: [
        'توقعات عالية للمرضى',
        'الموازنة بين الجوانب الطبية والتجميلية',
        'تخصص تنافسي للدخول'
      ]
    },
    orthopedics: {
      id: 'orthopedics',
      name: 'Orthopedics',
      nameAr: 'جراحة العظام',
      description: 'Your mechanical aptitude, spatial reasoning, and interest in restoring function make orthopedics an excellent choice. You enjoy working with your hands and appreciate the concrete outcomes and improvements in patients\' quality of life.',
      descriptionAr: 'قدرتك الميكانيكية، والتفكير المكاني، واهتمامك باستعادة الوظيفة تجعل جراحة العظام خيارًا ممتازًا. تستمتع بالعمل بيديك وتقدر النتائج الملموسة والتحسينات في جودة حياة المرضى.',
      icon: <Bone size={48} className="text-gray-600" />,
      traits: [
        'Mechanically inclined',
        'Good spatial reasoning',
        'Enjoys working with hands',
        'Physically strong and dexterous',
        'Appreciates tangible outcomes'
      ],
      traitsAr: [
        'ميل ميكانيكي',
        'تفكير مكاني جيد',
        'يستمتع بالعمل باليدين',
        'قوي جسديًا وماهر',
        'يقدر النتائج الملموسة'
      ],
      challenges: [
        'Physically demanding specialty',
        'Long, complex surgeries',
        'Managing patient expectations for recovery'
      ],
      challengesAr: [
        'تخصص متطلب جسديًا',
        'جراحات طويلة ومعقدة',
        'إدارة توقعات المرضى للتعافي'
      ]
    },
    internalMedicine: {
      id: 'internalMedicine',
      name: 'Internal Medicine',
      nameAr: 'الطب الباطني',
      description: 'Your intellectual curiosity, systematic approach to problem-solving, and interest in complex medical conditions make internal medicine a great fit. You enjoy the diagnostic process and managing chronic conditions with a holistic approach.',
      descriptionAr: 'فضولك الفكري، ونهجك المنهجي في حل المشكلات، واهتمامك بالحالات الطبية المعقدة تجعل الطب الباطني مناسبًا تمامًا. تستمتع بعملية التشخيص وإدارة الحالات المزمنة بنهج شامل.',
      icon: <Lungs size={48} className="text-blue-400" />,
      traits: [
        'Analytical and thorough',
        'Enjoys complex problem-solving',
        'Patient with chronic conditions',
        'Strong medical knowledge base',
        'Holistic approach to patient care'
      ],
      traitsAr: [
        'تحليلي وشامل',
        'يستمتع بحل المشكلات المعقدة',
        'صبور مع الحالات المزمنة',
        'قاعدة معرفية طبية قوية',
        'نهج شامل لرعاية المرضى'
      ],
      challenges: [
        'Managing multiple complex conditions',
        'Coordinating care across specialties',
        'Balancing breadth and depth of knowledge'
      ],
      challengesAr: [
        'إدارة حالات متعددة معقدة',
        'تنسيق الرعاية عبر التخصصات',
        'الموازنة بين اتساع وعمق المعرفة'
      ]
    },
    obgyn: {
      id: 'obgyn',
      name: 'Obstetrics & Gynecology',
      nameAr: 'التوليد وأمراض النساء',
      description: 'Your interest in women\'s health, ability to build trusting relationships, and comfort with both medical and surgical approaches make OB/GYN an excellent match. You appreciate the opportunity to care for patients across their lifespan and enjoy the mix of primary care, surgery, and specialized medicine.',
      descriptionAr: 'اهتمامك بصحة المرأة، وقدرتك على بناء علاقات ثقة، وراحتك مع كل من النهج الطبي والجراحي تجعل التوليد وأمراض النساء مناسبًا تمامًا. أنت تقدر فرصة رعاية المرضى طوال حياتهم وتستمتع بمزيج من الرعاية الأولية والجراحة والطب المتخصص.',
      icon: <Baby size={48} className="text-pink-400" />,
      traits: [
        'Comfortable with both medicine and surgery',
        'Strong interpersonal skills',
        'Calm in high-pressure situations',
        'Advocacy for women\'s health',
        'Enjoys continuity of care'
      ],
      traitsAr: [
        'مرتاح مع كل من الطب والجراحة',
        'مهارات شخصية قوية',
        'هادئ في المواقف عالية الضغط',
        'دعم لصحة المرأة',
        'يستمتع باستمرارية الرعاية'
      ],
      challenges: [
        'Unpredictable schedule with deliveries',
        'High-stakes situations',
        'Balancing surgical and medical aspects'
      ],
      challengesAr: [
        'جدول غير متوقع مع الولادات',
        'مواقف عالية المخاطر',
        'الموازنة بين الجوانب الجراحية والطبية'
      ]
    },
    radiology: {
      id: 'radiology',
      name: 'Radiology',
      nameAr: 'الأشعة',
      description: 'Your visual acuity, spatial reasoning, and interest in technology make radiology a perfect fit. You enjoy the detective work of diagnosis through imaging and appreciate the balance of independent work and collaboration with other specialties.',
      descriptionAr: 'حدة بصرك، والتفكير المكاني، واهتمامك بالتكنولوجيا تجعل الأشعة مناسبة تمامًا. تستمتع بعمل المحقق في التشخيص من خلال التصوير وتقدر التوازن بين العمل المستقل والتعاون مع التخصصات الأخرى.',
      icon: <Eye size={48} className="text-blue-500" />,
      traits: [
        'Strong visual-spatial skills',
        'Technology-oriented',
        'Detail-oriented',
        'Enjoys diagnostic puzzles',
        'Values efficiency and precision'
      ],
      traitsAr: [
        'مهارات بصرية-مكانية قوية',
        'موجه نحو التكنولوجيا',
        'مهتم بالتفاصيل',
        'يستمتع بألغاز التشخيص',
        'يقدر الكفاءة والدقة'
      ],
      challenges: [
        'Limited patient contact',
        'Keeping up with technological advances',
        'Sedentary work environment'
      ],
      challengesAr: [
        'اتصال محدود بالمرضى',
        'مواكبة التقدم التكنولوجي',
        'بيئة عمل مستقرة'
      ]
    },
    anesthesiology: {
      id: 'anesthesiology',
      name: 'Anesthesiology',
      nameAr: 'التخدير',
      description: 'Your calm demeanor, attention to detail, and ability to make quick decisions make anesthesiology an excellent match. You appreciate the technical aspects of medicine and enjoy the critical role of keeping patients safe and comfortable during procedures.',
      descriptionAr: 'سلوكك الهادئ، واهتمامك بالتفاصيل، وقدرتك على اتخاذ قرارات سريعة تجعل التخدير مناسبًا تمامًا. أنت تقدر الجوانب التقنية للطب وتستمتع بالدور الحاسم في الحفاظ على سلامة المرضى وراحتهم أثناء الإجراءات.',
      icon: <Syringe size={48} className="text-teal-500" />,
      traits: [
        'Calm under pressure',
        'Meticulous attention to detail',
        'Quick decision-maker',
        'Strong pharmacology knowledge',
        'Excellent in crisis management'
      ],
      traitsAr: [
        'هادئ تحت الضغط',
        'اهتمام دقيق بالتفاصيل',
        'متخذ قرار سريع',
        'معرفة قوية بعلم الأدوية',
        'ممتاز في إدارة الأزمات'
      ],
      challenges: [
        'High-stakes environment',
        'Managing multiple physiological systems',
        'Limited continuity with patients'
      ],
      challengesAr: [
        'بيئة عالية المخاطر',
        'إدارة أنظمة فسيولوجية متعددة',
        'استمرارية محدودة مع المرضى'
      ]
    },
    infectiousDisease: {
      id: 'infectiousDisease',
      name: 'Infectious Disease',
      nameAr: 'الأمراض المعدية',
      description: 'Your investigative mind, interest in global health, and enjoyment of complex diagnostic challenges make infectious disease a great fit. You appreciate the dynamic nature of this field and the opportunity to solve medical mysteries while making a significant impact on individual and public health.',
      descriptionAr: 'عقلك الاستقصائي، واهتمامك بالصحة العالمية، واستمتاعك بتحديات التشخيص المعقدة تجعل الأمراض المعدية مناسبة تمامًا. أنت تقدر الطبيعة الديناميكية لهذا المجال وفرصة حل الألغاز الطبية مع إحداث تأثير كبير على الصحة الفردية والعامة.',
      icon: <Virus size={48} className="text-green-600" />,
      traits: [
        'Strong epidemiological thinking',
        'Global health perspective',
        'Excellent diagnostic reasoning',
        'Interest in microbiology',
        'Enjoys consulting and collaboration'
      ],
      traitsAr: [
        'تفكير وبائي قوي',
        'منظور الصحة العالمية',
        'تفكير تشخيصي ممتاز',
        'اهتمام بعلم الأحياء الدقيقة',
        'يستمتع بالاستشارة والتعاون'
      ],
      challenges: [
        'Rapidly evolving field',
        'Managing emerging threats',
        'Balancing individual and public health concerns'
      ],
      challengesAr: [
        'مجال متطور بسرعة',
        'إدارة التهديدات الناشئة',
        'الموازنة بين مخاوف الصحة الفردية والعامة'
      ]
    },
    oncology: {
      id: 'oncology',
      name: 'Oncology',
      nameAr: 'علم الأورام',
      description: 'Your compassion, resilience, and interest in complex disease management make oncology a meaningful fit. You have the emotional strength to support patients through difficult diagnoses while maintaining the scientific rigor needed to navigate rapidly evolving treatment options.',
      descriptionAr: 'تعاطفك، ومرونتك، واهتمامك بإدارة الأمراض المعقدة تجعل علم الأورام مناسبًا بشكل هادف. لديك القوة العاطفية لدعم المرضى خلال التشخيصات الصعبة مع الحفاظ على الصرامة العلمية اللازمة للتنقل بين خيارات العلاج المتطورة بسرعة.',
      icon: <Dna size={48} className="text-purple-600" />,
      traits: [
        'Emotionally resilient',
        'Compassionate with boundaries',
        'Scientifically rigorous',
        'Comfortable with uncertainty',
        'Strong communication skills'
      ],
      traitsAr: [
        'مرونة عاطفية',
        'متعاطف مع الحدود',
        'صارم علميًا',
        'مرتاح مع عدم اليقين',
        'مهارات تواصل قوية'
      ],
      challenges: [
        'Emotional weight of cancer care',
        'Rapidly evolving treatment landscape',
        'Balancing hope with realistic expectations'
      ],
      challengesAr: [
        'العبء العاطفي لرعاية السرطان',
        'مشهد علاجي متطور بسرعة',
        'الموازنة بين الأمل والتوقعات الواقعية'
      ]
    }
  };

  // Define the questions
  const questions: Question[] = [
    {
      id: 1,
      text: "When faced with a complex problem, you prefer to:",
      textAr: "عندما تواجه مشكلة معقدة، تفضل أن:",
      options: [
        {
          id: "a",
          text: "Break it down methodically and analyze each component",
          textAr: "تقسمها بشكل منهجي وتحلل كل مكون",
          specialties: { neurology: 3, pathology: 3, radiology: 2, internalMedicine: 2 }
        },
        {
          id: "b",
          text: "Make quick decisions based on available information",
          textAr: "تتخذ قرارات سريعة بناءً على المعلومات المتاحة",
          specialties: { emergencyMedicine: 3, surgery: 3, anesthesiology: 2 }
        },
        {
          id: "c",
          text: "Consider how it affects people and their emotions",
          textAr: "تفكر في كيفية تأثيرها على الناس وعواطفهم",
          specialties: { psychiatry: 3, pediatrics: 2, familyMedicine: 2 }
        },
        {
          id: "d",
          text: "Look for patterns and connections to similar problems",
          textAr: "تبحث عن أنماط وروابط بمشاكل مماثلة",
          specialties: { infectiousDisease: 3, cardiology: 2, dermatology: 2 }
        }
      ]
    },
    {
      id: 2,
      text: "In your work, you find the most satisfaction in:",
      textAr: "في عملك، تجد أكبر قدر من الرضا في:",
      options: [
        {
          id: "a",
          text: "Seeing immediate, tangible results from your efforts",
          textAr: "رؤية نتائج فورية وملموسة من جهودك",
          specialties: { surgery: 3, emergencyMedicine: 3, anesthesiology: 2, dermatology: 2 }
        },
        {
          id: "b",
          text: "Building long-term relationships with patients",
          textAr: "بناء علاقات طويلة الأمد مع المرضى",
          specialties: { familyMedicine: 3, pediatrics: 3, psychiatry: 2, internalMedicine: 2 }
        },
        {
          id: "c",
          text: "Solving complex diagnostic puzzles",
          textAr: "حل ألغاز تشخيصية معقدة",
          specialties: { neurology: 3, infectiousDisease: 3, radiology: 2, pathology: 2 }
        },
        {
          id: "d",
          text: "Mastering technical skills and procedures",
          textAr: "إتقان المهارات والإجراءات التقنية",
          specialties: { cardiology: 3, orthopedics: 3, obgyn: 2, surgery: 2 }
        }
      ]
    },
    {
      id: 3,
      text: "Your colleagues would describe you as:",
      textAr: "زملاؤك يصفونك بأنك:",
      options: [
        {
          id: "a",
          text: "Meticulous and detail-oriented",
          textAr: "دقيق ومهتم بالتفاصيل",
          specialties: { pathology: 3, radiology: 3, dermatology: 2, anesthesiology: 2 }
        },
        {
          id: "b",
          text: "Compassionate and empathetic",
          textAr: "رحيم ومتعاطف",
          specialties: { psychiatry: 3, pediatrics: 3, familyMedicine: 2, oncology: 3 }
        },
        {
          id: "c",
          text: "Decisive and action-oriented",
          textAr: "حاسم وموجه نحو العمل",
          specialties: { surgery: 3, emergencyMedicine: 3, orthopedics: 2, obgyn: 2 }
        },
        {
          id: "d",
          text: "Analytical and thoughtful",
          textAr: "تحليلي ومتأمل",
          specialties: { neurology: 3, internalMedicine: 3, infectiousDisease: 2, cardiology: 2 }
        }
      ]
    },
    {
      id: 4,
      text: "When learning something new, you prefer:",
      textAr: "عند تعلم شيء جديد، تفضل:",
      options: [
        {
          id: "a",
          text: "Hands-on practice and learning by doing",
          textAr: "الممارسة العملية والتعلم بالممارسة",
          specialties: { surgery: 3, orthopedics: 3, anesthesiology: 2, obgyn: 2 }
        },
        {
          id: "b",
          text: "Reading and researching thoroughly before starting",
          textAr: "القراءة والبحث بشكل شامل قبل البدء",
          specialties: { pathology: 3, neurology: 2, internalMedicine: 2, infectiousDisease: 3 }
        },
        {
          id: "c",
          text: "Discussing with others and learning collaboratively",
          textAr: "المناقشة مع الآخرين والتعلم بشكل تعاوني",
          specialties: { familyMedicine: 3, pediatrics: 2, psychiatry: 3, oncology: 2 }
        },
        {
          id: "d",
          text: "Observing experts and analyzing visual information",
          textAr: "مراقبة الخبراء وتحليل المعلومات المرئية",
          specialties: { radiology: 3, dermatology: 3, cardiology: 2, emergencyMedicine: 2 }
        }
      ]
    },
    {
      id: 5,
      text: "In stressful situations, you typically:",
      textAr: "في المواقف العصيبة، عادة ما:",
      options: [
        {
          id: "a",
          text: "Remain calm and methodically work through the problem",
          textAr: "تبقى هادئًا وتعمل بشكل منهجي من خلال المشكلة",
          specialties: { anesthesiology: 3, surgery: 2, cardiology: 3, emergencyMedicine: 2 }
        },
        {
          id: "b",
          text: "Take charge and make quick decisions",
          textAr: "تتولى المسؤولية وتتخذ قرارات سريعة",
          specialties: { emergencyMedicine: 3, surgery: 3, orthopedics: 2, obgyn: 2 }
        },
        {
          id: "c",
          text: "Seek input from others and collaborate on solutions",
          textAr: "تطلب مدخلات من الآخرين وتتعاون في الحلول",
          specialties: { familyMedicine: 3, pediatrics: 2, oncology: 2, internalMedicine: 2 }
        },
        {
          id: "d",
          text: "Step back to analyze the situation before acting",
          textAr: "تتراجع لتحليل الموقف قبل التصرف",
          specialties: { neurology: 3, pathology: 3, psychiatry: 2, radiology: 2 }
        }
      ]
    },
    {
      id: 6,
      text: "You find it most rewarding to work with:",
      textAr: "تجد أنه من المجزي أكثر العمل مع:",
      options: [
        {
          id: "a",
          text: "Children and their families",
          textAr: "الأطفال وعائلاتهم",
          specialties: { pediatrics: 3, familyMedicine: 2 }
        },
        {
          id: "b",
          text: "Acutely ill patients needing immediate intervention",
          textAr: "المرضى المصابين بأمراض حادة تحتاج إلى تدخل فوري",
          specialties: { emergencyMedicine: 3, cardiology: 2, anesthesiology: 2 }
        },
        {
          id: "c",
          text: "Patients with complex, chronic conditions",
          textAr: "المرضى الذين يعانون من حالات معقدة ومزمنة",
          specialties: { internalMedicine: 3, neurology: 2, oncology: 3, infectiousDisease: 2 }
        },
        {
          id: "d",
          text: "Patients needing surgical or procedural interventions",
          textAr: "المرضى الذين يحتاجون إلى تدخلات جراحية أو إجرائية",
          specialties: { surgery: 3, orthopedics: 3, obgyn: 2, dermatology: 2 }
        }
      ]
    },
    {
      id: 7,
      text: "Your ideal work environment would be:",
      textAr: "بيئة العمل المثالية بالنسبة لك ستكون:",
      options: [
        {
          id: "a",
          text: "Fast-paced with variety and unpredictability",
          textAr: "سريعة الوتيرة مع التنوع وعدم القدرة على التنبؤ",
          specialties: { emergencyMedicine: 3, surgery: 2, obgyn: 2 }
        },
        {
          id: "b",
          text: "Structured with time to analyze and make careful decisions",
          textAr: "منظمة مع وقت للتحليل واتخاذ قرارات دقيقة",
          specialties: { pathology: 3, radiology: 3, dermatology: 2, neurology: 2 }
        },
        {
          id: "c",
          text: "Balanced, with both patient interaction and independent work",
          textAr: "متوازنة، مع تفاعل المرضى والعمل المستقل",
          specialties: { familyMedicine: 3, internalMedicine: 3, cardiology: 2, oncology: 2 }
        },
        {
          id: "d",
          text: "Focused on building relationships and communication",
          textAr: "تركز على بناء العلاقات والتواصل",
          specialties: { psychiatry: 3, pediatrics: 3, familyMedicine: 2 }
        }
      ]
    },
    {
      id: 8,
      text: "Which of these skills do you most pride yourself on?",
      textAr: "أي من هذه المهارات تفخر بها أكثر؟",
      options: [
        {
          id: "a",
          text: "Technical and procedural abilities",
          textAr: "القدرات التقنية والإجرائية",
          specialties: { surgery: 3, orthopedics: 3, cardiology: 2, anesthesiology: 2 }
        },
        {
          id: "b",
          text: "Communication and building rapport",
          textAr: "التواصل وبناء العلاقات",
          specialties: { psychiatry: 3, pediatrics: 2, familyMedicine: 3 }
        },
        {
          id: "c",
          text: "Diagnostic reasoning and problem-solving",
          textAr: "التفكير التشخيصي وحل المشكلات",
          specialties: { neurology: 3, infectiousDisease: 3, internalMedicine: 2, radiology: 2 }
        },
        {
          id: "d",
          text: "Attention to detail and thoroughness",
          textAr: "الاهتمام بالتفاصيل والشمولية",
          specialties: { pathology: 3, dermatology: 3, radiology: 2, oncology: 2 }
        }
      ]
    },
    {
      id: 9,
      text: "In your career, which is most important to you?",
      textAr: "في حياتك المهنية، ما هو الأكثر أهمية بالنسبة لك؟",
      options: [
        {
          id: "a",
          text: "Work-life balance and predictable hours",
          textAr: "التوازن بين العمل والحياة وساعات يمكن التنبؤ بها",
          specialties: { dermatology: 3, pathology: 3, radiology: 2, psychiatry: 2 }
        },
        {
          id: "b",
          text: "Intellectual challenge and continuous learning",
          textAr: "التحدي الفكري والتعلم المستمر",
          specialties: { neurology: 3, internalMedicine: 2, infectiousDisease: 3, oncology: 2 }
        },
        {
          id: "c",
          text: "Making an immediate, tangible difference",
          textAr: "إحداث فرق فوري وملموس",
          specialties: { emergencyMedicine: 3, surgery: 3, obgyn: 2, cardiology: 2 }
        },
        {
          id: "d",
          text: "Building long-term relationships with patients",
          textAr: "بناء علاقات طويلة الأمد مع المرضى",
          specialties: { familyMedicine: 3, pediatrics: 3, oncology: 2, psychiatry: 2 }
        }
      ]
    },
    {
      id: 10,
      text: "Which aspect of medicine do you find most fascinating?",
      textAr: "ما هو الجانب الأكثر إثارة للاهتمام في الطب بالنسبة لك؟",
      options: [
        {
          id: "a",
          text: "The intricate workings of the human body",
          textAr: "العمل المعقد للجسم البشري",
          specialties: { cardiology: 3, neurology: 3, internalMedicine: 2, physiology: 2 }
        },
        {
          id: "b",
          text: "The psychological and emotional aspects of health",
          textAr: "الجوانب النفسية والعاطفية للصحة",
          specialties: { psychiatry: 3, pediatrics: 2, familyMedicine: 2, oncology: 2 }
        },
        {
          id: "c",
          text: "The challenge of diagnosing unusual conditions",
          textAr: "تحدي تشخيص الحالات غير العادية",
          specialties: { infectiousDisease: 3, dermatology: 2, neurology: 2, pathology: 3 }
        },
        {
          id: "d",
          text: "The ability to intervene and fix problems",
          textAr: "القدرة على التدخل وإصلاح المشاكل",
          specialties: { surgery: 3, orthopedics: 3, emergencyMedicine: 2, obgyn: 2 }
        }
      ]
    }
  ];

  // Calculate scores when answers change
  useEffect(() => {
    const newScores: Record<string, number> = {};
    
    // Initialize all specialties with 0
    Object.keys(specialties).forEach(specialty => {
      newScores[specialty] = 0;
    });
    
    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        const option = question.options.find(o => o.id === answerId);
        if (option) {
          Object.entries(option.specialties).forEach(([specialty, points]) => {
            newScores[specialty] = (newScores[specialty] || 0) + points;
          });
        }
      }
    });
    
    setScores(newScores);
  }, [answers]);

  // Determine result when all questions are answered
  useEffect(() => {
    if (Object.keys(answers).length === questions.length && !showResult) {
      setLoading(true);
      
      // Find the specialty with the highest score
      let maxScore = 0;
      let topSpecialty = '';
      
      Object.entries(scores).forEach(([specialty, score]) => {
        if (score > maxScore) {
          maxScore = score;
          topSpecialty = specialty;
        }
      });
      
      // Set the result
      if (topSpecialty && specialties[topSpecialty]) {
        setResult(specialties[topSpecialty]);
        
        // Simulate API call delay
        setTimeout(() => {
          setShowResult(true);
          setLoading(false);
        }, 1500);
      } else {
        // Fallback if no clear winner
        setResult(specialties.familyMedicine);
        setTimeout(() => {
          setShowResult(true);
          setLoading(false);
        }, 1500);
      }
    }
  }, [scores, answers, questions.length, showResult]);

  const handleAnswer = (questionId: number, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setScores({});
    setResult(null);
    setShowResult(false);
    setCurrentQuestion(0);
  };

  return (
    <>
      <Helmet>
        <title>{isArabic ? "اكتشف تخصصك الطبي المثالي | حكيم زون" : "Find Your Medical Specialty | Dr.Zone AI"}</title>
        <meta name="description" content="Take our personality quiz to discover which medical specialty best matches your character and mindset." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <Stethoscope size={32} className="text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? "اكتشف تخصصك الطبي المثالي" : "Find Your Medical Specialty"}
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {isArabic 
                  ? "دع إجاباتك ترشدك إلى المسار المناسب في الطب. اكتشف التخصص الذي يتناسب مع شخصيتك ونقاط قوتك وقيمك."
                  : "Let your answers guide you to the right path in medicine. Discover the specialty that aligns with your personality, strengths, and values."}
              </p>
            </div>

            {/* Main Content */}
            {showResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      {result?.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">
                    {isArabic ? result?.nameAr : result?.name}
                  </h2>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? result?.descriptionAr : result?.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-5">
                      <h3 className="font-semibold text-blue-800 mb-3" dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? "نقاط القوة" : "Your Strengths"}
                      </h3>
                      <ul className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                        {(isArabic ? result?.traitsAr : result?.traits)?.map((trait, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mt-0.5 mr-2">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-5">
                      <h3 className="font-semibold text-amber-800 mb-3" dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? "التحديات المحتملة" : "Potential Challenges"}
                      </h3>
                      <ul className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                        {(isArabic ? result?.challengesAr : result?.challenges)?.map((challenge, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center mt-0.5 mr-2">
                              <div className="h-2 w-2 rounded-full bg-amber-600"></div>
                            </div>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg mb-6">
                    <h3 className="font-semibold mb-3" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic ? "ملاحظة مهمة" : "Important Note"}
                    </h3>
                    <p className="text-gray-700" dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic 
                        ? "هذا التقييم هو دليل استكشافي فقط ولا يحل محل الاستشارة المهنية. يجب أن تستند قرارات التخصص إلى مجموعة من العوامل بما في ذلك الخبرة السريرية والتوجيه والاهتمامات الشخصية."
                        : "This assessment is an exploratory guide only and does not replace career counseling. Specialty decisions should be based on a combination of factors including clinical experience, mentorship, and personal interests."}
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={handleRestart}
                      className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {isArabic ? "إعادة الاختبار" : "Retake Quiz"}
                    </button>
                    
                    <button
                      onClick={() => navigate('/zonematch')}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      {isArabic ? "العودة إلى زون ماتش" : "Back to ZoneMatch"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isArabic ? "تحليل إجاباتك..." : "Analyzing your answers..."}
                    </h3>
                    <p className="text-gray-600">
                      {isArabic 
                        ? "نحن نحدد التخصص الطبي الأنسب لشخصيتك ونقاط قوتك."
                        : "We're determining the medical specialty best suited to your personality and strengths."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Progress Bar */}
                    <div className="bg-gray-100 h-2">
                      <div 
                        className="bg-primary-500 h-2 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>
                          {isArabic 
                            ? `السؤال ${currentQuestion + 1} من ${questions.length}`
                            : `Question ${currentQuestion + 1} of ${questions.length}`}
                        </span>
                        <span>
                          {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                        </span>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestion}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h2 className="text-xl font-semibold mb-6" dir={isArabic ? 'rtl' : 'ltr'}>
                            {isArabic 
                              ? questions[currentQuestion].textAr
                              : questions[currentQuestion].text}
                          </h2>
                          
                          <div className="space-y-4">
                            {questions[currentQuestion].options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleAnswer(questions[currentQuestion].id, option.id)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                  answers[questions[currentQuestion].id] === option.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                                }`}
                                dir={isArabic ? 'rtl' : 'ltr'}
                              >
                                {isArabic ? option.textAr : option.text}
                              </button>
                            ))}
                          </div>
                          
                          <div className="mt-6 flex justify-between">
                            <button
                              onClick={handlePrevious}
                              disabled={currentQuestion === 0}
                              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ArrowLeft size={16} />
                              <span>{isArabic ? "السابق" : "Previous"}</span>
                            </button>
                            
                            {currentQuestion === questions.length - 1 && answers[questions[currentQuestion].id] && (
                              <button
                                onClick={() => setLoading(true)}
                                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                              >
                                <span>{isArabic ? "عرض النتائج" : "See Results"}</span>
                                <ArrowRight size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FindYourSpecialtyPage;