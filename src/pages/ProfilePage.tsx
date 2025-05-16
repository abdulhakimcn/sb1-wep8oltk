import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Edit, MapPin, Building, GraduationCap, Award, FileText, Users, Clock, MessageCircle, BadgeCheck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import VerificationBadge from '../components/VerificationBadge';
import VerificationModal from '../components/VerificationModal';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const { user } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user, username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      let profileQuery;
      
      if (username) {
        // Fetch profile by username
        profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
      } else if (user) {
        // Fetch current user's profile
        profileQuery = supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
      } else {
        throw new Error('No username or logged in user');
      }
      
      const { data, error } = await profileQuery;
      
      if (error) throw error;
      
      setProfile(data);
      setIsVerified(data?.is_verified || false);
      setAvatarUrl(data?.avatar_url || null);
      
      // Check if this is the user's own profile
      setIsOwnProfile(user?.id === data.user_id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    // In a real app, we would fetch the updated profile data
    // For now, we'll just set it to true for demonstration
    setIsVerified(true);
  };

  const handleProfilePictureUpdate = async (url: string) => {
    setAvatarUrl(url);
    
    // In a real app, we would update the profile in the database
    // This is handled in the ProfilePictureUpload component
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
            <p className="mt-2 text-gray-600">The profile you're looking for doesn't exist or is private.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        {/* Profile Header */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:space-x-5">
              <div className="relative -mt-20">
                {isOwnProfile ? (
                  <ProfilePictureUpload 
                    currentImageUrl={avatarUrl || undefined}
                    onUploadComplete={handleProfilePictureUpdate}
                    size="lg"
                  />
                ) : (
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={profile.full_name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-500">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
                <div className="flex flex-col items-center justify-between sm:flex-row">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                    {isVerified ? (
                      <VerificationBadge size="lg" />
                    ) : isOwnProfile && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200"
                      >
                        <BadgeCheck size={16} />
                        <span>Get Verified</span>
                      </button>
                    )}
                  </div>
                  {isOwnProfile && (
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
                  )}
                </div>
                <p className="text-gray-600">{profile.specialty || 'Medical Professional'}</p>
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
                {profile.bio || 'Experienced medical professional with a passion for patient care and advancing medical knowledge.'}
              </p>
              <div className="space-y-3">
                {profile.location && (
                  <div className="flex items-center text-sm">
                    <MapPin size={18} className="mr-2 text-gray-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.organization && (
                  <div className="flex items-center text-sm">
                    <Building size={18} className="mr-2 text-gray-500" />
                    <span>{profile.organization}</span>
                  </div>
                )}
                {profile.education?.[0] && (
                  <div className="flex items-center text-sm">
                    <GraduationCap size={18} className="mr-2 text-gray-500" />
                    <span>{profile.education[0]}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold">Credentials</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Board Certification - {profile.specialty || 'Medical Specialty'}</p>
                    <p className="text-sm text-gray-600">Medical Board</p>
                    <p className="text-xs text-gray-500">2020 - Present</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Fellowship</p>
                    <p className="text-sm text-gray-600">Medical Center</p>
                    <p className="text-xs text-gray-500">2018 - 2020</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award size={18} className="mr-2 text-primary-500" />
                  <div>
                    <p className="font-medium">Residency</p>
                    <p className="text-sm text-gray-600">University Hospital</p>
                    <p className="text-xs text-gray-500">2015 - 2018</p>
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
                    <p className="font-medium">Recent Advances in Medical Research</p>
                    <p className="text-sm text-gray-600">Medical Journal</p>
                    <p className="text-xs text-gray-500">2023</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText size={18} className="mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">Clinical Outcomes Study</p>
                    <p className="text-sm text-gray-600">Clinical Research Journal</p>
                    <p className="text-xs text-gray-500">2022</p>
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
                        <span className="text-xs font-medium text-primary-600">
                          {profile.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">{profile.full_name}</p>
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
                      Just published our new research on medical advancements. Would love to hear your thoughts!
                    </p>
                    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="font-medium text-primary-600">Novel Approaches in Modern Medicine</p>
                      <p className="mt-1 text-sm text-gray-600">Medical Research Journal • May 2025</p>
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
                        <span className="text-xs font-medium text-primary-600">
                          {profile.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">{profile.full_name}</p>
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
                        "Has anyone tried the new treatment protocol for this condition?"
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        - Dr. Maria Rodriguez in Treatment Discussion
                      </p>
                    </div>
                    <p className="mb-3 text-gray-700">
                      We've been using it at our center for about 6 months now with promising results. The key is monitoring patients closely during the first 3 weeks. Happy to share our protocol if you're interested.
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
                        <span className="text-xs font-medium text-primary-600">
                          {profile.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-medium">{profile.full_name}</p>
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
                        <p className="font-medium">AI in Medicine</p>
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