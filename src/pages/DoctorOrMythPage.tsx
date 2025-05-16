import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Stethoscope, Clock, Award, ThumbsUp, ThumbsDown, ChevronRight, Users, BookOpen, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Statement {
  id: string;
  statement: string;
  is_fact: boolean;
  explanation: string;
  source: string;
  source_url?: string;
}

interface UserStats {
  total_answered: number;
  correct_answers: number;
  current_streak: number;
  last_answered_date: string;
}

const DoctorOrMythPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    total_answered: 0,
    correct_answers: 0,
    current_streak: 0,
    last_answered_date: ''
  });
  const [timeUntilNextStatement, setTimeUntilNextStatement] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number, streak: number}[]>([]);

  // Mock data for demonstration
  const mockStatements: Statement[] = [
    {
      id: '1',
      statement: 'Antibiotics are effective against viral infections like the common cold or flu.',
      is_fact: false,
      explanation: 'This is a myth. Antibiotics are only effective against bacterial infections, not viral infections like the common cold or flu. Overuse of antibiotics for viral infections contributes to antibiotic resistance, which is a major public health concern.',
      source: 'Centers for Disease Control and Prevention (CDC)',
      source_url: 'https://www.cdc.gov/antibiotic-use/index.html'
    },
    {
      id: '2',
      statement: 'The human appendix serves no purpose and is purely vestigial.',
      is_fact: false,
      explanation: 'This is a myth. Recent research suggests that the appendix may serve as a reservoir for beneficial gut bacteria, helping to repopulate the digestive system after illnesses like diarrhea. It may also play a role in immune function and lymphatic system.',
      source: 'Journal of Evolutionary Biology, 2009',
      source_url: 'https://pubmed.ncbi.nlm.nih.gov/19453383/'
    },
    {
      id: '3',
      statement: 'Statins can reduce the risk of cardiovascular events even in patients without established cardiovascular disease.',
      is_fact: true,
      explanation: 'This is a fact. Multiple large-scale clinical trials have demonstrated that statins can reduce the risk of cardiovascular events in primary prevention (patients without established cardiovascular disease) when prescribed based on risk factors and lipid levels.',
      source: 'New England Journal of Medicine, JUPITER Trial',
      source_url: 'https://www.nejm.org/doi/full/10.1056/nejmoa0807646'
    }
  ];

  const mockLeaderboard = [
    { name: 'Dr. Sarah Johnson', score: 42, streak: 12 },
    { name: 'Dr. Michael Chen', score: 38, streak: 8 },
    { name: 'Dr. Emily Wilson', score: 35, streak: 5 },
    { name: 'Dr. David Kim', score: 31, streak: 3 },
    { name: 'Dr. Lisa Rodriguez', score: 28, streak: 4 }
  ];

  useEffect(() => {
    // In a real implementation, fetch today's statement from the database
    const randomIndex = Math.floor(Math.random() * mockStatements.length);
    setStatement(mockStatements[randomIndex]);
    setLeaderboard(mockLeaderboard);
    
    // Check if user has already completed today's challenge
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, fetch from the database
        // For now, we'll use localStorage to simulate
        const savedStats = localStorage.getItem('doctorOrMyth_stats');
        const savedSubmission = localStorage.getItem('doctorOrMyth_submission');
        
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        }
        
        if (savedSubmission) {
          const submission = JSON.parse(savedSubmission);
          if (submission.date === new Date().toISOString().split('T')[0]) {
            setSelectedAnswer(submission.answer);
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
    
    // Calculate time until next statement
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNextStatement(`${diffHrs}h ${diffMins}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = (answer: boolean) => {
    if (!statement || !user || submitted) return;
    
    setSelectedAnswer(answer);
    
    // In a real implementation, save to the database
    setTimeout(() => {
      const isAnswerCorrect = answer === statement.is_fact;
      const today = new Date().toISOString().split('T')[0];
      
      // Update user stats
      const newStats = {
        total_answered: userStats.total_answered + 1,
        correct_answers: isAnswerCorrect ? userStats.correct_answers + 1 : userStats.correct_answers,
        current_streak: isAnswerCorrect ? userStats.current_streak + 1 : 0,
        last_answered_date: today
      };
      
      setUserStats(newStats);
      localStorage.setItem('doctorOrMyth_stats', JSON.stringify(newStats));
      
      // Save submission
      const submission = {
        date: today,
        answer: answer,
        correct: isAnswerCorrect
      };
      localStorage.setItem('doctorOrMyth_submission', JSON.stringify(submission));
      
      setIsCorrect(isAnswerCorrect);
      setSubmitted(true);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Doctor or Myth | ZoneMatch - Dr.Zone</title>
        <meta name="description" content="Test your medical knowledge and ability to distinguish facts from myths." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Stethoscope size={24} className="text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('zonematch.doctorOrMyth.title')}</h1>
                  <p className="text-gray-600 mt-1">{t('zonematch.doctorOrMyth.dailyChallenge')}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextStatement}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Statement Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 text-white">
                  <h2 className="text-xl font-semibold mb-2">{t('zonematch.doctorOrMyth.isThisFactOrMyth')}</h2>
                  <p className="text-2xl font-bold">"{statement?.statement}"</p>
                </div>
                
                {!submitted ? (
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSubmit(true)}
                        className="bg-white border-2 border-green-500 text-green-700 rounded-lg p-4 flex flex-col items-center hover:bg-green-50 transition-colors"
                      >
                        <ThumbsUp size={32} className="mb-2" />
                        <span className="text-lg font-semibold">{t('zonematch.doctorOrMyth.fact')}</span>
                      </button>
                      <button
                        onClick={() => handleSubmit(false)}
                        className="bg-white border-2 border-red-500 text-red-700 rounded-lg p-4 flex flex-col items-center hover:bg-red-50 transition-colors"
                      >
                        <ThumbsDown size={32} className="mb-2" />
                        <span className="text-lg font-semibold">{t('zonematch.doctorOrMyth.myth')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className={`p-4 rounded-lg mb-6 ${
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
                            ? 'Correct!'
                            : 'Incorrect!'}
                        </h3>
                      </div>
                      <div>
                        <p className="font-medium">
                          {t('zonematch.doctorOrMyth.correctAnswer')}: {statement?.is_fact ? t('zonematch.doctorOrMyth.fact') : t('zonematch.doctorOrMyth.myth')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{t('zonematch.doctorOrMyth.explanation')}</h3>
                      <p className="text-gray-700">{statement?.explanation}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{t('zonematch.doctorOrMyth.source')}</h3>
                      <div className="flex items-center">
                        <BookOpen size={18} className="mr-2 text-gray-500" />
                        <span className="text-gray-700">{statement?.source}</span>
                      </div>
                      {statement?.source_url && (
                        <a 
                          href={statement.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-green-600 hover:text-green-800"
                        >
                          <LinkIcon size={16} className="mr-1" />
                          <span>View Source</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* User Stats */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award size={20} className="mr-2" />
                  {t('zonematch.doctorOrMyth.yourScore')}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{userStats.correct_answers}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.doctorOrMyth.correct')}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats.total_answered - userStats.correct_answers}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.doctorOrMyth.incorrect')}</p>
                  </div>
                  <div className="col-span-2 bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats.current_streak}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.doctorOrMyth.streak')}</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Link
                    to="/zonematch"
                    className="inline-flex items-center text-green-600 hover:text-green-800"
                  >
                    <span>{t('common.back')}</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Leaderboard */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users size={20} className="mr-2" />
                  {t('zonematch.doctorOrMyth.leaderboard')}
                </h3>
                
                <div className="space-y-4">
                  {leaderboard.map((leader, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 text-sm font-medium text-green-700">
                          {index + 1}
                        </div>
                        <span className="font-medium">{leader.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="font-medium text-green-600">{leader.score}</span>
                          <span className="text-gray-500"> pts</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-blue-600">{leader.streak}</span>
                          <span className="text-gray-500"> streak</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    View Full Leaderboard
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

export default DoctorOrMythPage;