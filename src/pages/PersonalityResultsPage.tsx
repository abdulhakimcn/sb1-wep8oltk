import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, SoulTestResult } from '../lib/types';

const personalityTypes: Record<string, SoulTestResult> = {
  cardio: {
    type: 'طبيب القلب الحاني',
    title: 'أنت طبيب يتميز بالتعاطف والرعاية',
    description: 'تتميز بقدرة فائقة على التواصل مع المرضى وفهم احتياجاتهم العاطفية والجسدية.',
    strengths: [
      'التعاطف العميق مع المرضى',
      'مهارات تواصل ممتازة',
      'القدرة على بناء الثقة',
      'الصبر والتفهم'
    ],
    challenges: [
      'قد تتأثر عاطفياً بحالات المرضى',
      'تحتاج للموازنة بين العاطفة والموضوعية',
      'قد تجد صعوبة في رفض طلبات المرضى'
    ],
    idealSpecialties: [
      'طب القلب',
      'طب الأسرة',
      'طب الأطفال',
      'الطب النفسي'
    ]
  },
  neuro: {
    type: 'المحلل العصبي',
    title: 'أنت طبيب يتميز بالتحليل العميق',
    description: 'تمتلك قدرة فريدة على فهم التعقيدات العصبية وربط الأعراض بأسبابها.',
    strengths: [
      'التفكير التحليلي المتقدم',
      'فهم عميق للعلاقات العصبية',
      'دقة الملاحظة',
      'القدرة على حل المشكلات المعقدة'
    ],
    challenges: [
      'قد تميل للتركيز على التفاصيل التقنية',
      'تحتاج لتطوير مهارات التواصل البسيط',
      'قد تستغرق وقتاً طويلاً في التحليل'
    ],
    idealSpecialties: [
      'طب الأعصاب',
      'الطب النفسي',
      'جراحة المخ والأعصاب',
      'طب الألم'
    ]
  },
  patho: {
    type: 'الباحث المتعمق',
    title: 'أنت طبيب يتميز بالبحث والاكتشاف',
    description: 'لديك شغف كبير للبحث العلمي وفهم الأسباب الجذرية للأمراض.',
    strengths: [
      'القدرة على البحث العميق',
      'فهم الآليات المرضية',
      'الدقة في التشخيص',
      'الاهتمام بالتفاصيل'
    ],
    challenges: [
      'قد تميل للانغماس في البحث النظري',
      'تحتاج لتطوير مهارات التواصل العملي',
      'قد تجد صعوبة في التعامل مع الحالات البسيطة'
    ],
    idealSpecialties: [
      'علم الأمراض',
      'الطب المخبري',
      'البحث الطبي',
      'الوراثة الطبية'
    ]
  },
  pulmo: {
    type: 'المستمع العميق',
    title: 'أنت طبيب يتميز بالإصغاء والفهم',
    description: 'تمتلك قدرة خاصة على الاستماع العميق وفهم ما وراء الكلمات.',
    strengths: [
      'مهارات استماع متميزة',
      'فهم عميق للمشاعر',
      'القدرة على التهدئة',
      'الحساسية للتفاصيل غير المنطوقة'
    ],
    challenges: [
      'قد تتأثر بشدة بقصص المرضى',
      'تحتاج للموازنة بين الاستماع والعلاج',
      'قد تستغرق وقتاً طويلاً مع كل مريض'
    ],
    idealSpecialties: [
      'طب الصدر',
      'طب النوم',
      'الرعاية التلطيفية',
      'طب الشيخوخة'
    ]
  }
};

const PersonalityResultsPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [similarDoctors, setSimilarDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('match_tests')
          .select(`
            profiles:profiles(*)
          `)
          .eq('result_type', type)
          .limit(4);

        if (error) throw error;

        setSimilarDoctors(data?.map(d => d.profiles) || []);
      } catch (error) {
        console.error('Error fetching similar doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarDoctors();
  }, [type]);

  if (!type || !personalityTypes[type]) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-xl font-bold">نوع الشخصية غير موجود</h2>
            <Link to="/zonematch" className="mt-4 inline-block text-primary-500 hover:underline">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const personalityData = personalityTypes[type];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
          {/* Result Header */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-center text-white">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20">
              <Brain size={40} className="text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{personalityData.title}</h1>
            <p className="text-purple-100">{personalityData.description}</p>
          </div>

          {/* Personality Details */}
          <div className="space-y-6">
            {/* Strengths */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">نقاط القوة</h2>
              <ul className="space-y-2">
                {personalityData.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center space-x-2 text-right" dir="rtl">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">التحديات</h2>
              <ul className="space-y-2">
                {personalityData.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-center space-x-2 text-right" dir="rtl">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal Specialties */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">التخصصات المثالية</h2>
              <div className="flex flex-wrap gap-2">
                {personalityData.idealSpecialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-purple-100 px-4 py-2 text-sm text-purple-700"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar Doctors */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">أطباء يشبهونك</h2>
                <Link
                  to="/zonematch/discover"
                  className="flex items-center text-sm text-purple-500 hover:underline"
                >
                  <span>عرض المزيد</span>
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : similarDoctors.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {similarDoctors.map((doctor) => (
                    <div key={doctor.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {doctor.full_name?.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{doctor.full_name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1 rounded-md bg-purple-100 px-3 py-1 text-sm text-purple-700">
                          <Users size={14} />
                          <span>تواصل</span>
                        </button>
                        <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          <MessageCircle size={14} />
                          <span>رسالة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  لم نجد أطباء مشابهين حتى الآن
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityResultsPage;