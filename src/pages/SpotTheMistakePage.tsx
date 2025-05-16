import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Clock, Award, ZoomIn, ZoomOut, HelpCircle, ChevronRight, Target, AlertTriangle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MistakeChallenge {
  id: string;
  title: string;
  image_url: string;
  image_type: 'ECG' | 'X-Ray' | 'CT' | 'MRI' | 'Form';
  mistake_description: string;
  mistake_coordinates: { x: number, y: number };
  hint: string;
  explanation: string;
  clinical_implications: string;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserStats {
  challenges_completed: number;
  correct_answers: number;
  current_streak: number;
  last_completed_date: string;
}

const SpotTheMistakePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<MistakeChallenge | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    challenges_completed: 0,
    correct_answers: 0,
    current_streak: 0,
    last_completed_date: ''
  });
  const [timeUntilNextChallenge, setTimeUntilNextChallenge] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCorrectSpot, setShowCorrectSpot] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockChallenge: MistakeChallenge = {
    id: '1',
    title: 'ECG with Subtle Abnormality',
    image_url: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg',
    image_type: 'ECG',
    mistake_description: 'Prolonged QT interval in leads V2-V4',
    mistake_coordinates: { x: 70, y: 40 }, // Percentage coordinates
    hint: 'Look carefully at the QT intervals across all leads. Compare with normal reference values.',
    explanation: 'This ECG shows a prolonged QT interval (>500ms) in leads V2-V4, which is a significant finding that could indicate Long QT Syndrome. The normal QT interval should be less than 450ms in men and 460ms in women. This prolongation is subtle but clinically important.',
    clinical_implications: 'Prolonged QT interval increases the risk of torsades de pointes, a life-threatening ventricular arrhythmia. This finding requires immediate attention, medication review (many drugs can prolong QT), and possible cardiology consultation. The patient may need continuous cardiac monitoring and electrolyte correction if abnormal.',
    date: new Date().toISOString().split('T')[0],
    difficulty: 'medium'
  };

  useEffect(() => {
    // In a real implementation, fetch today's challenge from the database
    setChallenge(mockChallenge);
    
    // Check if user has already completed today's challenge
    const checkCompletion = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, fetch from the database
        // For now, we'll use localStorage to simulate
        const savedStats = localStorage.getItem('spotTheMistake_stats');
        const savedSubmission = localStorage.getItem('spotTheMistake_submission');
        
        if (savedStats) {
          setUserStats(JSON.parse(savedStats));
        }
        
        if (savedSubmission) {
          const submission = JSON.parse(savedSubmission);
          if (submission.date === new Date().toISOString().split('T')[0]) {
            setSelectedPoint(submission.point);
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
    
    // Calculate time until next challenge
    const updateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNextChallenge(`${diffHrs}h ${diffMins}m`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSelectedPoint({ x, y });
  };

  const handleSubmit = () => {
    if (!selectedPoint || !challenge || !user) return;
    
    // Calculate distance between selected point and correct spot
    const distance = Math.sqrt(
      Math.pow(selectedPoint.x - challenge.mistake_coordinates.x, 2) + 
      Math.pow(selectedPoint.y - challenge.mistake_coordinates.y, 2)
    );
    
    // Consider correct if within 10% of the image dimensions
    const isAnswerCorrect = distance < 10;
    const today = new Date().toISOString().split('T')[0];
    
    // Update user stats
    const newStats = {
      challenges_completed: userStats.challenges_completed + 1,
      correct_answers: isAnswerCorrect ? userStats.correct_answers + 1 : userStats.correct_answers,
      current_streak: isAnswerCorrect ? userStats.current_streak + 1 : 0,
      last_completed_date: today
    };
    
    setUserStats(newStats);
    localStorage.setItem('spotTheMistake_stats', JSON.stringify(newStats));
    
    // Save submission
    const submission = {
      date: today,
      point: selectedPoint,
      correct: isAnswerCorrect
    };
    localStorage.setItem('spotTheMistake_submission', JSON.stringify(submission));
    
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Spot the Mistake | ZoneMatch - Dr.Zone</title>
        <meta name="description" content="Identify errors in medical images and clinical forms." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <Users size={24} className="text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('zonematch.spotTheMistake.title')}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <span className="mr-3">{challenge?.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                      {challenge?.image_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      challenge?.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      challenge?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challenge?.difficulty?.charAt(0).toUpperCase() + challenge?.difficulty?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextChallenge}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Image with Challenge */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{t('zonematch.spotTheMistake.clickOnMistake')}</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={zoomIn}
                      className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                      title={t('zonematch.spotTheMistake.zoomIn')}
                    >
                      <ZoomIn size={18} />
                    </button>
                    <button
                      onClick={zoomOut}
                      className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                      title={t('zonematch.spotTheMistake.zoomOut')}
                    >
                      <ZoomOut size={18} />
                    </button>
                    {!submitted && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                        title={t('zonematch.spotTheMistake.needHint')}
                      >
                        <HelpCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                {showHint && !submitted && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">{t('zonematch.spotTheMistake.hint')}</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>{challenge?.hint}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div 
                  ref={imageContainerRef}
                  className="relative overflow-hidden rounded-lg border border-gray-200 cursor-crosshair"
                  style={{ height: '400px' }}
                  onClick={handleImageClick}
                >
                  <div 
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease',
                      height: '100%',
                      width: '100%',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={challenge?.image_url}
                      alt="Medical image with mistake"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Selected point marker */}
                    {selectedPoint && (
                      <div 
                        className="absolute w-6 h-6 transform -translate-x-3 -translate-y-3 pointer-events-none"
                        style={{ 
                          left: `${selectedPoint.x}%`, 
                          top: `${selectedPoint.y}%`,
                        }}
                      >
                        <div className={`w-full h-full rounded-full border-2 ${
                          submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-blue-500'
                        } flex items-center justify-center`}>
                          <div className={`w-2 h-2 rounded-full ${
                            submitted ? (isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'
                          }`}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Show correct spot after submission */}
                    {submitted && showCorrectSpot && challenge && (
                      <div 
                        className="absolute w-6 h-6 transform -translate-x-3 -translate-y-3 pointer-events-none"
                        style={{ 
                          left: `${challenge.mistake_coordinates.x}%`, 
                          top: `${challenge.mistake_coordinates.y}%`,
                        }}
                      >
                        <div className="w-full h-full rounded-full border-2 border-green-500 flex items-center justify-center animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {!submitted ? (
                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      {selectedPoint && (
                        <span className="text-sm text-gray-600">
                          Point selected at position ({Math.round(selectedPoint.x)}%, {Math.round(selectedPoint.y)}%)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedPoint}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {t('zonematch.spotTheMistake.submitAnswer')}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
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
                            ? 'Correct! You found the mistake.'
                            : 'Not quite right.'}
                        </h3>
                      </div>
                      
                      {!isCorrect && (
                        <div className="mt-2">
                          <button
                            onClick={() => setShowCorrectSpot(!showCorrectSpot)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                          >
                            <Target size={16} className="mr-1" />
                            <span>{showCorrectSpot ? 'Hide correct location' : t('zonematch.spotTheMistake.correctSpot')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('zonematch.spotTheMistake.mistakeExplanation')}</h3>
                        <p className="text-gray-700">{challenge?.mistake_description}</p>
                        <p className="mt-2 text-gray-700">{challenge?.explanation}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t('zonematch.spotTheMistake.clinicalImplications')}</h3>
                        <p className="text-gray-700">{challenge?.clinical_implications}</p>
                      </div>
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
                  {t('zonematch.caseOfTheDay.yourStats')}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats.challenges_completed}</p>
                    <p className="text-sm text-gray-600">Challenges Completed</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {userStats.challenges_completed > 0 
                        ? Math.round((userStats.correct_answers / userStats.challenges_completed) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.accuracy')}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats.correct_answers}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.correctAnswers')}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats.current_streak}</p>
                    <p className="text-sm text-gray-600">{t('zonematch.caseOfTheDay.streak')}</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {t('zonematch.doctorOrMyth.timeRemaining')}: {timeUntilNextChallenge}
                  </p>
                  <Link
                    to="/zonematch"
                    className="inline-flex items-center text-red-600 hover:text-red-800"
                  >
                    <span>{t('common.back')}</span>
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Interpretation Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-red-700">1</span>
                    </div>
                    <p className="text-gray-700">For ECGs, always check rate, rhythm, axis, intervals, and morphology systematically.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-red-700">2</span>
                    </div>
                    <p className="text-gray-700">When reviewing X-rays, use the "ABCDE" approach: Airway, Breathing, Circulation, Disability, Everything else.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-red-700">3</span>
                    </div>
                    <p className="text-gray-700">For clinical forms, check patient identifiers, medication dosages, and critical values.</p>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-xs font-bold text-red-700">4</span>
                    </div>
                    <p className="text-gray-700">Compare with normal references when available, and look for subtle asymmetries.</p>
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

export default SpotTheMistakePage;