import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Volume2, Clock, Award, Send, ChevronRight, FileText, User, Stethoscope, Play, Pause } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PatientCase {
  id: string;
  patient_message: string;
  audio_url?: string;
  patient_history?: string;
  correct_diagnosis: string;
  explanation: string;
  clinical_pearls: string[];
  differential_diagnosis: string[];
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserStats {
  cases_completed: number;
  correct_answers: number;
  current_streak: number;
  last_completed_date: string;
}

const PatientSpeaksPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayCase, setTodayCase] = useState<PatientCase | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    cases_completed: 0,
    correct_answers: 0,
    current_streak: 0,
    last_completed_date: ''
  });
  const [timeUntilNextCase, setTimeUntilNextCase] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Mock data for demonstration
  const mockCase: PatientCase = {
    id: '1',
    patient_message: "Doctor, I've been having this terrible headache for the past week. It's mostly on one side of my head, around my right eye. The pain is really intense, like nothing I've felt before. It comes on suddenly and lasts for about an hour, then goes away completely. During these episodes, my right eye gets red and watery, and I feel restless - I can't sit still. The attacks seem to happen at the same time each day, usually in the evening. Over-the-counter pain medications don't help at all. I've never had migraines before, and I'm really worried because the pain is so severe.",
    audio_url: 'https://example.com/patient-audio.mp3',
    patient_history: "45-year-old male, previously healthy. No significant medical history. No regular medications. Social history: Occasional alcohol use, non-smoker. No known allergies. No recent travel or trauma. No family history of neurological disorders.",
    correct_diagnosis: "Cluster Headache",
    explanation: "This case presents classic features of cluster headache: severe unilateral pain around the eye, associated autonomic symptoms (red, watery eye), restlessness during attacks, regular timing of attacks, and short duration (about an hour). The lack of response to over-the-counter medications is also typical. Cluster headaches are one of the most painful conditions known and are often described as 'suicide headaches' due to their intensity.",
    clinical_pearls: [
      "Cluster headaches typically affect men more than women (unlike migraines).",
      "Attacks often occur at the same time each day and may wake patients from sleep.",
      "Alcohol can trigger attacks during a cluster period and should be avoided.",
      "First-line acute treatments include high-flow oxygen and sumatriptan injections.",
      "Preventive treatments include verapamil, lithium, and short courses of steroids."
    ],
    differential_diagnosis: [
      "Migraine",
      "Trigeminal Neuralgia",
      "Temporal Arteritis",
      "Acute Angle-Closure Glaucoma",
      "Paroxysmal Hemicrania"
    ],
    date: new Date().toISOString().split('T')[0],
    difficulty: 'medium'
  };

  useEffect(() => {
    // In a real implementation, fetch today's case from the database
    setTodayCase(mockCase);
    
    // Check if user has already completed today's case
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, fetch from the database
        // For now, we'll use localStorage to simulate
        const savedStats = localStorage.getItem('patientSpeaks_stats');
        const savedSubmission = localStorage.getItem('patientSpeaks_submission');
        
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        }
        
        if (savedSubmission) {
          const submission = JSON.parse(savedSubmission);
          if (submission.date === new Date().toISOString().split('T')[0]) {
            setDiagnosis(submission.diagnosis);
            setIsCorrect(submission.correct);
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

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = () => {
    if (!diagnosis.trim() || !todayCase || !user) return;
    
    setSubmitting(true);
    
    // In a real implementation, save to the database
    setTimeout(() => {
      // Simple string comparison - in a real app, you might use more sophisticated matching
      const isAnswerCorrect = diagnosis.toLowerCase().includes(todayCase.correct_diagnosis.toLowerCase());
      const today = new Date().toISOString().split('T')[0];
      
      // Update user stats
      const newStats = {
        cases_completed: userStats.cases_completed + 1,
        correct_answers: isAnswerCorrect ? userStats.correct_answers + 1 : userStats.correct_answers,
        current_streak: isAnswerCorrect ? userStats.current_streak + 1 : 0,
        last_completed_date: today
      };
      
      setUserStats(newStats);
      localStorage.setItem('patientSpeaks_stats', JSON.stringify(newStats));
      
      // Save submission
      const submission = {
        date: today,
        diagnosis: diagnosis,
        correct: isAnswerCorrect
      };
      localStorage.setItem('patientSpeaks_submission', JSON.stringify(submission));
      
      setIsCorrect(isAnswerCorrect);
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Patient Speaks | ZoneMatch - Dr.Zone</title>
        <meta name="description" content="Listen to patient complaints and diagnose them based on their description." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <MessageCircle size={24} className="text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('zonematch.patientSpeaks.title')}</h1>
                  <p className="text-gray-600 mt-1">{t('zonematch.doctorOrMyth.dailyChallenge')}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextCase}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Message */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-4 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{t('zonematch.patientSpeaks.patientMessage')}</h2>
                  {todayCase?.audio_url && (
                    <button
                      onClick={toggleAudio}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  {todayCase?.audio_url && (
                    <audio 
                      ref={audioRef}
                      src={todayCase.audio_url} 
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}
                  
                  <div className="mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 relative">
                        <p className="text-gray-700">{todayCase?.patient_message}</p>
                        <div className="absolute w-4 h-4 bg-gray-100 transform rotate-45 left-[-8px] top-4"></div>
                      </div>
                    </div>
                    
                    {todayCase?.audio_url && (
                      <div className="flex items-center justify-center mt-4">
                        <button
                          onClick={toggleAudio}
                          className="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full hover:bg-yellow-200 transition-colors"
                        >
                          {isPlaying ? (
                            <>
                              <Pause size={18} />
                              <span>Pause Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={18} />
                              <span>{t('zonematch.patientSpeaks.listenToAudio')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <FileText size={18} />
                      <span>{t('zonematch.patientSpeaks.patientHistory')}</span>
                      <ChevronRight size={16} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {showHistory && todayCase?.patient_history && (
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700">{todayCase.patient_history}</p>
                      </div>
                    )}
                  </div>
                  
                  {!submitted ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('zonematch.patientSpeaks.whatIsYourDiagnosis')}</h3>
                      <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder={t('zonematch.patientSpeaks.typeYourDiagnosis')}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                        rows={3}
                      />
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleSubmit}
                          disabled={!diagnosis.trim() || submitting}
                          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                        >
                          {submitting ? t('common.submitting') : t('zonematch.patientSpeaks.submitDiagnosis')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg ${
                        isCorrect
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            isCorrect
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {isCorrect ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <XIcon className="h-5 w-5" />
                            )}
                          </div>
                          <h3 className="ml-2 font-semibold">
                            {isCorrect
                              ? 'Correct Diagnosis!'
                              : 'Incorrect Diagnosis'}
                          </h3>
                        </div>
                        <div>
                          <p className="font-medium">{t('zonematch.patientSpeaks.correctDiagnosis')}: {todayCase?.correct_diagnosis}</p>
                          <p className="text-sm mt-1 text-gray-600">Your answer: {diagnosis}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('zonematch.patientSpeaks.explanation')}</h3>
                        <p className="text-gray-700">{todayCase?.explanation}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('zonematch.patientSpeaks.differentialDiagnosis')}</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {todayCase?.differential_diagnosis.map((diagnosis, index) => (
                            <li key={index}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('zonematch.patientSpeaks.clinicalPearls')}</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {todayCase?.clinical_pearls.map((pearl, index) => (
                            <li key={index}>{pearl}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* User Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award size={20} className="mr-2" />
                  {t('zonematch.caseOfTheDay.yourStats')}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{userStats.cases_completed}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.casesCompleted')}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {userStats.cases_completed > 0 
                        ? Math.round((userStats.correct_answers / userStats.cases_completed) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.accuracy')}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{userStats.correct_answers}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.correctAnswers')}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{userStats.current_streak}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.streak')}</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextCase}
                  </p>
                  <Link
                    to="/zonematch"
                    className="inline-flex items-center text-yellow-600 hover:text-yellow-800"
                  >
                    <span>{t('common.back')}</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Diagnostic Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-yellow-700">1</span>
                    </div>
                    <p className="text-gray-700">Listen carefully to the patient's description of symptoms, including onset, duration, and character.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-yellow-700">2</span>
                    </div>
                    <p className="text-gray-700">Pay attention to associated symptoms that may provide diagnostic clues.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-yellow-700">3</span>
                    </div>
                    <p className="text-gray-700">Consider the patient's demographics, risk factors, and medical history.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-yellow-700">4</span>
                    </div>
                    <p className="text-gray-700">Develop a systematic approach to creating differential diagnoses.</p>
                  </li>
                </ul>
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

export default PatientSpeaksPage;