import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Filter, Search, Settings, Edit, MapPin, Building, GraduationCap, Award, FileText, Clock, BadgeCheck } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Post as PostType } from '../lib/types';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import VerificationBadge from '../components/VerificationBadge';
import VerificationModal from '../components/VerificationModal';

const MyZonePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setIsVerified(data?.is_verified || false);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (selectedSpecialty) {
        query = query.eq('specialty', selectedSpecialty);
      }

      if (selectedLanguage) {
        query = query.eq('language', selectedLanguage);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (user && postsData) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likesData?.map(like => like.post_id));

        const postsWithLikes = postsData.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }));

        setPosts(postsWithLikes);
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [user, selectedSpecialty, selectedLanguage]);

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setIsVerified(true);
  };

  const filteredPosts = posts.filter(post => 
    searchTerm === '' || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        {/* Profile Header */}
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:space-x-5">
              <div className="relative -mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
                <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-500">
                  {user?.email?.substring(0, 2).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-1 shadow-md hover:bg-gray-100">
                  <Edit size={16} className="text-gray-600" />
                </button>
              </div>
              <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
                <div className="flex flex-col items-center justify-between sm:flex-row">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Medical Professional'}</h1>
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
                <p className="text-gray-600">{profile?.specialty || 'Medical Professional'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Sidebar */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold">About</h3>
                <p className="mb-4 text-gray-700">
                  {profile?.bio || 'No bio provided yet.'}
                </p>
                <div className="space-y-3">
                  {profile?.location && (
                    <div className="flex items-center text-sm">
                      <MapPin size={18} className="mr-2 text-gray-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.education?.[0] && (
                    <div className="flex items-center text-sm">
                      <GraduationCap size={18} className="mr-2 text-gray-500" />
                      <span>{profile.education[0]}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card">
                <h3 className="mb-4 font-semibold">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialty</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">All Specialties</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="oncology">Oncology</option>
                      <option value="surgery">Surgery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">All Languages</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <CreatePost onPostCreated={fetchPosts} />
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Post key={post.id} post={post} onUpdate={fetchPosts} />
                ))}
              </div>
            ) : (
              <div className="card text-center">
                <p className="text-gray-600">No posts yet. Be the first to share something!</p>
              </div>
            )}
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

export default MyZonePage;