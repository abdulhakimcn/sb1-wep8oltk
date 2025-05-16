import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Clock, Award, MessageCircle, Send, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface CaseOfTheDay {
  id: string;
  title: string;
  patient_info: string;
  clinical_findings: string;
  lab_results: string;
  imaging: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  references: string[];
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserStats {
  cases_completed: number;
  correct_answers: number;
  current_streak: number;
  last_completed_date: string;
}

const CaseOfTheDayPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayCase, setTodayCase] = useState<CaseOfTheDay | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    cases_completed: 0,
    correct_answers: 0,
    current_streak: 0,
    last_completed_date: ''
  });
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [timeUntilNextCase, setTimeUntilNextCase] = useState<string>('');

  // Mock data for demonstration
  const mockCase: CaseOfTheDay = {
    id: '1',
    title: 'Unusual Chest Pain in a 45-Year-Old Male',
    patient_info: 'A 45-year-old male presents to the emergency department with sudden onset of severe chest pain that started 2 hours ago. The pain is described as sharp, radiating to the back, and worsens with deep breathing. He has a history of hypertension and smokes 1 pack of cigarettes daily for the past 20 years. No previous cardiac events.',
    clinical_findings: 'Vital signs: HR 110 bpm, BP 160/95 mmHg, RR 22/min, Temp 37.2°C, SpO2 94% on room air. Physical examination reveals an anxious-appearing male in moderate distress. Lungs are clear to auscultation bilaterally. Heart sounds are regular with no murmurs, rubs, or gallops. No peripheral edema.',
    lab_results: 'CBC: WBC 12,000/μL, Hgb 14.5 g/dL, Plt 250,000/μL\nChemistry: Na 138 mEq/L, K 4.0 mEq/L, Cl 102 mEq/L, HCO3 24 mEq/L, BUN 18 mg/dL, Cr 1.0 mg/dL, Glucose 110 mg/dL\nCardiac enzymes: Troponin I 0.02 ng/mL (normal < 0.04 ng/mL), CK-MB 3.2 ng/mL (normal < 5.0 ng/mL)\nD-dimer: 1,500 ng/mL (normal < 500 ng/mL)',
    imaging: 'Chest X-ray: No acute cardiopulmonary process. No widened mediastinum.\nECG: Sinus tachycardia, no ST-segment elevation or depression, no T-wave inversions.',
    options: [
      'Acute Myocardial Infarction',
      'Pulmonary Embolism',
      'Aortic Dissection',
      'Pneumothorax',
      'Pericarditis'
    ],
    correct_answer: 'Pulmonary Embolism',
    explanation: 'This case presents classic features of Pulmonary Embolism (PE). The patient has several risk factors including smoking history. The presentation of sudden-onset sharp chest pain that worsens with breathing, tachycardia, tachypnea, and mild hypoxemia are consistent with PE. The significantly elevated D-dimer further supports this diagnosis. While the other options are in the differential diagnosis, the normal cardiac enzymes make acute MI less likely, and the absence of mediastinal widening on chest X-ray makes aortic dissection less likely. The clear lung fields on examination and X-ray argue against pneumothorax, and there are no ECG changes suggestive of pericarditis.',
    references: [
      'Konstantinides SV, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2020;41(4):543-603.',
      'Tapson VF. Acute Pulmonary Embolism. N Engl J Med. 2008;358:1037-1052.',
      'Torbicki A, et al. Guidelines on the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2008;29:2276-2315.'
    ],
    date: new Date().toISOString().split('T')[0],
    difficulty: 'medium'
  };

  const mockComments = [
    {
      id: '1',
      user_id: 'user1',
      content: 'The elevated D-dimer was the key finding here. Always consider PE in patients with risk factors and unexplained chest pain.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profile: {
        full_name: 'Dr. Sarah Johnson',
        specialty: 'Pulmonology'
      }
    },
    {
      id: '2',
      user_id: 'user2',
      content: 'I would have ordered a CT pulmonary angiogram immediately with these findings. The combination of clinical presentation and elevated D-dimer has a high predictive value.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profile: {
        full_name: 'Dr. Michael Chen',
        specialty: 'Emergency Medicine'
      }
    }
  ];

  useEffect(() => {
    // In a real implementation, fetch today's case from the database
    setTodayCase(mockCase);
    setComments(mockComments);
    
    // Check if user has already completed today's case
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, fetch from the database
        // For now, we'll use localStorage to simulate
        const savedStats = localStorage.getItem('caseOfTheDay_stats');
        const savedSubmission = localStorage.getItem('caseOfTheDay_submission');
        
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        }
        
        if (savedSubmission) {
          const submission = JSON.parse(savedSubmission);
          if (submission.date === new Date().toISOString().split('T')[0]) {
            setSelectedOption(submission.answer);
            setSubmitted(true);
          }
        }
      } catch (error) {
        console.error('Error checking completion:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkCompletion();
    
    // Calculate time until next case
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNextCase(`${diffHrs}h ${diffMins}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = () => {
    if (!selectedOption || !todayCase || !user) return;
    
    setSubmitting(true);
    
    // In a real implementation, save to the database
    setTimeout(() => {
      const isCorrect = selectedOption === todayCase.correct_answer;
      const today = new Date().toISOString().split('T')[0];
      
      // Update user stats
      const newStats = {
        cases_completed: userStats.cases_completed + 1,
        correct_answers: isCorrect ? userStats.correct_answers + 1 : userStats.correct_answers,
        current_streak: isCorrect ? userStats.current_streak + 1 : 0,
        last_completed_date: today
      };
      
      setUserStats(newStats);
      localStorage.setItem('caseOfTheDay_stats', JSON.stringify(newStats));
      
      // Save submission
      const submission = {
        date: today,
        answer: selectedOption,
        correct: isCorrect
      };
      localStorage.setItem('caseOfTheDay_submission', JSON.stringify(submission));
      
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  const handleComment = () => {
    if (!commentText.trim() || !user) return;
    
    // In a real implementation, save to the database
    const newComment = {
      id: Date.now().toString(),
      user_id: user.id,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
      profile: {
        full_name: 'Current User',
        specialty: 'Medical Professional'
      }
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Case of the Day | ZoneMatch - Dr.Zone</title>
        <meta name="description" content="Test your diagnostic skills with a new medical case every day." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('zonematch.caseOfTheDay.title')}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date().toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      todayCase?.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      todayCase?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {todayCase?.difficulty?.charAt(0).toUpperCase() + todayCase?.difficulty?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{t('zonematch.doctorOrMyth.nextStatement')}: {timeUntilNextCase}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Case Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">{todayCase?.title}</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                      <Users size={20} className="mr-2" />
                      {t('zonematch.caseOfTheDay.patientInfo')}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{todayCase?.patient_info}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                      <Stethoscope size={20} className="mr-2" />
                      {t('zonematch.caseOfTheDay.clinicalFindings')}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{todayCase?.clinical_findings}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                      <FileText size={20} className="mr-2" />
                      {t('zonematch.caseOfTheDay.labResults')}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md">{todayCase?.lab_results}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                      <Image size={20} className="mr-2" />
                      {t('zonematch.caseOfTheDay.imaging')}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{todayCase?.imaging}</p>
                  </div>
                </div>
                
                {!submitted ? (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">{t('zonematch.caseOfTheDay.whatIsYourDiagnosis')}</h3>
                    <div className="space-y-3">
                      {todayCase?.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedOption(option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            selectedOption === option
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSubmit}
                        disabled={!selectedOption || submitting}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? t('common.submitting') : t('zonematch.caseOfTheDay.submitAnswer')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    <div className={`p-4 rounded-lg ${
                      selectedOption === todayCase?.correct_answer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center mb-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          selectedOption === todayCase?.correct_answer
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {selectedOption === todayCase?.correct_answer ? (
                            <CheckIcon className="h-5 w-5" />
                          ) : (
                            <XIcon className="h-5 w-5" />
                          )}
                        </div>
                        <h3 className="ml-2 font-semibold">
                          {selectedOption === todayCase?.correct_answer
                            ? 'Correct!'
                            : `Incorrect. You selected: ${selectedOption}`}
                        </h3>
                      </div>
                      <div>
                        <p className="font-medium">{t('zonematch.caseOfTheDay.correctAnswer')}: {todayCase?.correct_answer}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('zonematch.caseOfTheDay.explanation')}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{todayCase?.explanation}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('zonematch.caseOfTheDay.references')}</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {todayCase?.references.map((reference, index) => (
                          <li key={index}>{reference}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Discussion Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MessageCircle size={20} className="mr-2" />
                  {t('zonematch.caseOfTheDay.discussion')}
                </h3>
                
                {user && (
                  <div className="mb-6">
                    <div className="flex space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={t('zonematch.caseOfTheDay.writeComment')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleComment}
                            disabled={!commentText.trim()}
                            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            <Send size={16} className="mr-2 inline" />
                            {t('common.submit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            {comment.profile?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{comment.profile?.full_name || 'Doctor'}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700">{comment.content}</p>
                          <div className="mt-2 flex space-x-4 text-sm">
                            <button className="text-gray-500 hover:text-gray-700">Like</button>
                            <button className="text-gray-500 hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award size={20} className="mr-2" />
                  {t('zonematch.caseOfTheDay.yourStats')}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats.cases_completed}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.casesCompleted')}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {userStats.cases_completed > 0 
                        ? Math.round((userStats.correct_answers / userStats.cases_completed) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.accuracy')}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats.correct_answers}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.correctAnswers')}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats.current_streak}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.streak')}</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextCase}
                  </p>
                  <Link
                    to="/zonematch"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span>{t('common.back')}</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Previous Cases */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Previous Cases</h3>
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <p className="font-medium">Acute Abdominal Pain in a 30-Year-Old Female</p>
                    <div className="flex justify-between items-center mt-1 text-sm">
                      <span className="text-gray-500">May 12, 2025</span>
                      <span className="text-green-600 font-medium">Correct</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <p className="font-medium">Recurrent Headaches in an Adolescent</p>
                    <div className="flex justify-between items-center mt-1 text-sm">
                      <span className="text-gray-500">May 11, 2025</span>
                      <span className="text-red-600 font-medium">Incorrect</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Fever and Rash in a Returning Traveler</p>
                    <div className="flex justify-between items-center mt-1 text-sm">
                      <span className="text-gray-500">May 10, 2025</span>
                      <span className="text-green-600 font-medium">Correct</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Cases
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper icon components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Image = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export default CaseOfTheDayPage;