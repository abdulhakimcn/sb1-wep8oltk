import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { SoulTestQuestion } from '../lib/types';

// Import questions from the JSON file
const questions: SoulTestQuestion[] = [
  // First 7 questions from the JSON for initial implementation
  {
    "question": "إذا دخل عليك مريض مرتبك لا يستطيع شرح حالته جيدًا، كيف تتصرف؟",
    "options": [
      {
        "text": "أطمئنه بكلمات ناعمة حتى يهدأ",
        "value": "cardio"
      },
      {
        "text": "أطلب منه رسم ما يشعر به",
        "value": "neuro"
      },
      {
        "text": "أبدأ في التحليل المباشر للأعراض",
        "value": "patho"
      },
      {
        "text": "أركز على نبرة صوته وحركاته",
        "value": "pulmo"
      }
    ]
  },
  {
    "question": "أكثر ما يشدّك في الطب هو:",
    "options": [
      {
        "text": "تأثير الكلمة والإنصات",
        "value": "pulmo"
      },
      {
        "text": "دقة التشخيص",
        "value": "neuro"
      },
      {
        "text": "فهم آليات المرض",
        "value": "patho"
      },
      {
        "text": "بناء علاقة ثقة مع المريض",
        "value": "cardio"
      }
    ]
  },
  {
    "question": "أي بيئة عمل تفضل؟",
    "options": [
      {
        "text": "هادئة وذات ضوء ناعم",
        "value": "cardio"
      },
      {
        "text": "مختبرية وعلمية",
        "value": "patho"
      },
      {
        "text": "غرف طوارئ وتحديات سريعة",
        "value": "emergency"
      },
      {
        "text": "مكتب مع مرضى أطفال وضحكهم",
        "value": "pediatrics"
      }
    ]
  },
  {
    "question": "عندما تحزن أو تنزعج، تميل إلى:",
    "options": [
      {
        "text": "الكتابة أو التعبير اللفظي",
        "value": "pulmo"
      },
      {
        "text": "تحليل السبب بدقة",
        "value": "neuro"
      },
      {
        "text": "الانعزال والتفكر",
        "value": "patho"
      },
      {
        "text": "التحدث إلى شخص ترتاح له",
        "value": "cardio"
      }
    ]
  },
  {
    "question": "لو لم تكن طبيبًا، من تتخيل نفسك؟",
    "options": [
      {
        "text": "شاعر أو كاتب",
        "value": "pulmo"
      },
      {
        "text": "عالم أبحاث",
        "value": "patho"
      },
      {
        "text": "مصلح اجتماعي",
        "value": "cardio"
      },
      {
        "text": "مفكر فلسفي",
        "value": "neuro"
      }
    ]
  },
  {
    "question": "كيف تتعامل مع مرضى يعانون من ألم مزمن ولا حل جذري لحالتهم؟",
    "options": [
      {
        "text": "أرافقهم نفسيًا وأبقى صوتًا مطمئنًا لهم",
        "value": "cardio"
      },
      {
        "text": "أشرح لهم علميًا ما يحدث بدقة",
        "value": "neuro"
      },
      {
        "text": "أبحث عن كل الأبحاث الجديدة الممكنة لحالتهم",
        "value": "patho"
      },
      {
        "text": "أستمع لأدق وصف لمشاعرهم وأدونها",
        "value": "pulmo"
      }
    ]
  },
  {
    "question": "متى تشعر بأنك طبيب عظيم؟",
    "options": [
      {
        "text": "حين أشعر بأن المريض ارتاح بوجودي",
        "value": "cardio"
      },
      {
        "text": "عندما أكتشف حالة معقدة لا يلاحظها الآخرون",
        "value": "neuro"
      },
      {
        "text": "حين أجد تفسيرًا جديدًا لحالة مرضية نادرة",
        "value": "patho"
      },
      {
        "text": "عندما أساعد طفلًا على الابتسام رغم ألمه",
        "value": "pediatrics"
      }
    ]
  }
];

const PersonalityTestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate dominant personality type
      const typeCount = newAnswers.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantType = Object.entries(typeCount).reduce((a, b) => 
        (a[1] > b[1] ? a : b)
      )[0];

      setLoading(true);
      try {
        // Save test result
        const { error } = await supabase
          .from('match_tests')
          .insert([{
            user_id: user?.id,
            result_type: dominantType,
            answers: newAnswers
          }]);

        if (error) throw error;

        // Navigate to results page
        navigate(`/zonematch/results/${dominantType}`);
      } catch (error) {
        console.error('Error saving test result:', error);
        alert('Error saving test result. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Brain size={32} className="text-purple-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">اختبار الشخصية الطبية</h2>
            <p className="text-gray-600">اكتشف نمط شخصيتك الطبية وتواصل مع من يشبهونك</p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="mb-2 flex justify-between text-sm">
                <span>السؤال {currentQuestion + 1} من {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-8"
              >
                <h3 className="mb-6 text-xl font-semibold" dir="rtl">
                  {questions[currentQuestion].question}
                </h3>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full rounded-lg border border-gray-200 p-4 text-right transition-all hover:border-purple-500 hover:bg-purple-50"
                      dir="rtl"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowLeft size={20} />
                <span>السابق</span>
              </button>
              <div className="flex space-x-1">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentQuestion
                        ? 'bg-purple-500'
                        : index < currentQuestion
                        ? 'bg-purple-200'
                        : 'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestPage;