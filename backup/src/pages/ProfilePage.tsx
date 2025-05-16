import React, { useState } from 'react';
import { Settings, Edit, MapPin, Building, GraduationCap, Award, FileText, Users, Clock, MessageCircle, BadgeCheck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import VerificationBadge from '../components/VerificationBadge';
import VerificationModal from '../components/VerificationModal';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    // In a real app, we would fetch the updated profile data
    // For now, we'll just set it to true for demonstration
    setIsVerified(true);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        {/* Profile Header */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:space-x-5">
              <div className="relative -mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
                <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-500">
                  JS
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-1 shadow-md hover:bg-gray-100">
                  <Edit size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
                <div className="flex flex-col items-center justify-between sm:flex-row">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">Dr. John Smith</h1>
                    {isVerified ? (
                      <VerificationBadge size="lg" />
                    ) : (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
                      >
                        <BadgeCheck size={16} />
                        <span>Get Verified</span>
                      </button>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button className="btn-outline mr-2">
                      <Settings size={16} className="mr-1" />
                      Settings
                    </button>
                    <button className="btn-primary">
                      <Edit size={16} className="mr-1" />
                      Edit Profile
                    </button>
                  </div>
                </div>
                <p className="text-gray-600">Cardiology Specialist</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Information */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold">About</h3>
              <p className="mb-4 text-gray-700">
                Experienced cardiologist with over 15 years of practice specializing in interventional cardiology and heart failure management. Currently serving as the Director of Cardiology at Boston Medical Center.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin size={18} className="mr-2 text-gray-500" />
                  <span>Boston, Massachusetts</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building size={18} className="mr-2 text-gray-500" />
                  <span>Boston Medical Center</span>
                </div>
                <div className="flex items-center text-sm">
                  <GraduationCap size={18} className="mr-2 text-gray-500" />
                  <span>Harvard Medical School</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold">Credentials</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Board Certification - Cardiovascular Disease</p>
                    <p className="text-sm text-gray-600">American Board of Internal Medicine</p>
                    <p className="text-xs text-gray-500">2015 - Present</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Fellowship - Interventional Cardiology</p>
                    <p className="text-sm text-gray-600">Massachusetts General Hospital</p>
                    <p className="text-xs text-gray-500">2010 - 2012</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Residency - Internal Medicine</p>
                    <p className="text-sm text-gray-600">Brigham and Women's Hospital</p>
                    <p className="text-xs text-gray-500">2007 - 2010</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Publications</h3>
                <button className="text-sm text-primary-500 hover:underline">View All</button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <FileText size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Novel Approaches to Heart Failure Management</p>
                    <p className="text-sm text-gray-600">New England Journal of Medicine</p>
                    <p className="text-xs text-gray-500">2024</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Long-term Outcomes of Coronary Stenting</p>
                    <p className="text-sm text-gray-600">Journal of the American College of Cardiology</p>
                    <p className="text-xs text-gray-500">2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle and Right Columns - Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity</h3>
                <div className="flex space-x-2">
                  <button className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">All</button>
                  <button className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">Posts</button>
                  <button className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">Articles</button>
                  <button className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">Comments</button>
                </div>
              </div>
              
              <div className="mt-6 space-y-6">
                {/* Activity Item 1 */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-600">JS</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">Dr. John Smith</p>
                          <span className="text-sm text-gray-500">shared a research paper</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          <Clock size={12} className="mr-1 inline" />
                          Yesterday at 9:42 AM
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">•••</button>
                  </div>
                  <div className="ml-13 pl-10">
                    <p className="mb-3 text-gray-700">
                      Just published our new research on cardiac biomarkers. Would love to hear your thoughts!
                    </p>
                    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="font-medium text-primary-600">Novel Cardiac Biomarkers for Early Detection of Heart Failure</p>
                      <p className="mt-1 text-sm text-gray-600">Journal of Cardiac Research • May 2025</p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                        <Users size={16} />
                        <span>42 likes</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                        <MessageCircle size={16} />
                        <span>12 comments</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Activity Item 2 */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-600">JS</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">Dr. John Smith</p>
                          <span className="text-sm text-gray-500">commented on a discussion</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          <Clock size={12} className="mr-1 inline" />
                          3 days ago
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">•••</button>
                  </div>
                  <div className="ml-13 pl-10">
                    <div className="mb-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                      <p className="italic text-gray-600">
                        "Has anyone tried the new statin combination therapy in patients with diabetes?"
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        - Dr. Maria Rodriguez in Cardiovascular Treatment Discussion
                      </p>
                    </div>
                    <p className="mb-3 text-gray-700">
                      We've been using it at our center for about 6 months now with promising results. The key is monitoring liver function closely during the first 3 weeks. Happy to share our protocol if you're interested.
                    </p>
                    <div className="flex space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                        <Users size={16} />
                        <span>28 likes</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                        <MessageCircle size={16} />
                        <span>6 replies</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Activity Item 3 */}
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-600">JS</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">Dr. John Smith</p>
                          <span className="text-sm text-gray-500">joined a group</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          <Clock size={12} className="mr-1 inline" />
                          1 week ago
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">•••</button>
                  </div>
                  <div className="ml-13 pl-10">
                    <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">AI</span>
                      </div>
                      <div>
                        <p className="font-medium">AI in Cardiology</p>
                        <p className="text-sm text-gray-600">3,245 members • 120 posts/week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showVerificationModal && (
          <VerificationModal
            onClose={() => setShowVerificationModal(false)}
            onSuccess={handleVerificationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;