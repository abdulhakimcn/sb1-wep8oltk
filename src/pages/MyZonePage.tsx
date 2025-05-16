import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Filter, Search, Settings, Edit, MapPin, Building, GraduationCap, Award, FileText, Clock, BadgeCheck, Crown, PenSquare, ChevronRight, BarChart2, PieChart, MessageCircle, ArrowUp, Heart, Sparkles as SparklesIcon, MoreHorizontal, Bookmark, Share2, Send } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Post as PostType } from '../lib/types';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import VerificationBadge from '../components/VerificationBadge';
import VerificationModal from '../components/VerificationModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const MyZonePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pinnedPosts, setPinnedPosts] = useState<PostType[]>([]);
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    engagement: 'Low'
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasCreatedPost, setHasCreatedPost] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        .select('*, profiles!posts_profile_id_fkey(*)')
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
        
        // Set pinned posts (first 2 posts for demo)
        if (postsWithLikes.length > 0) {
          setPinnedPosts([postsWithLikes[0]]);
        }
        
        // Set stats
        const userPosts = postsWithLikes.filter(post => post.user_id === user.id);
        setHasCreatedPost(userPosts.length > 0);
        setStats({
          posts: userPosts.length,
          comments: Math.floor(Math.random() * 50), // Mock data
          engagement: postsWithLikes.filter(post => post.is_liked).length > 5 ? 'High' : 'Medium'
        });
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
    post.content.toLowerCase().includes('') ||
    post.profiles?.full_name?.toLowerCase().includes('')
  );

  // Get a random medical background image based on specialty
  const getSpecialtyBackground = () => {
    const specialtyBackgrounds = {
      'cardiology': 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
      'neurology': 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
      'pediatrics': 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg',
      'surgery': 'https://images.pexels.com/photos/305566/pexels-photo-305566.jpeg',
      'default': 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg'
    };
    
    return profile?.specialty && specialtyBackgrounds[profile.specialty.toLowerCase()] 
      ? specialtyBackgrounds[profile.specialty.toLowerCase()]
      : specialtyBackgrounds.default;
  };

  return (
    <div className="bg-[#e6f3ff] min-h-screen">
      {/* Profile Header - Moved higher with reduced padding */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white relative">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url(${getSpecialtyBackground()})` }}
        ></div>
        
        <div className="container-custom py-6 relative z-10">
          <div className="relative">
            <div className="relative flex flex-col md:flex-row md:items-end md:space-x-5">
              {/* Profile Image */}
              <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white bg-white shadow-md">
                <div className="flex h-full w-full items-center justify-center bg-primary-100 rounded-full text-2xl font-bold text-primary-500">
                  {user?.email?.substring(0, 2).toUpperCase()}
                  {isVerified && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                      <BadgeCheck size={14} />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100">
                  <Edit size={16} className="text-gray-600" />
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="mt-4 md:mt-0 flex-1 text-center sm:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || t('profile.medicalProfessional')}</h1>
                    <Crown size={24} className="text-yellow-400" />
                    {isVerified ? (
                      <VerificationBadge size="lg" />
                    ) : (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center space-x-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white hover:bg-white/30"
                      >
                        <BadgeCheck size={16} />
                        <span>{t('profile.getVerified')}</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <div className="relative" ref={profileMenuRef}>
                      <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center space-x-1 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/30"
                      >
                        <Settings size={16} />
                        <span>{t('common.settings')}</span>
                      </button>
                      
                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Account Settings
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Privacy Settings
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Notification Preferences
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button className="flex items-center space-x-1 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary-600 hover:bg-blue-50">
                      <Edit size={16} />
                      <span>{t('profile.editProfile')}</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-blue-100">{profile?.specialty || t('profile.medicalProfessional')}</p>
                
                {/* Stats Row */}
                <div className="mt-4 flex space-x-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{stats.posts}</span>
                    <span className="text-sm text-blue-100">{t('myZone.stats.posts')}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">124</span>
                    <span className="text-sm text-blue-100">{t('common.followers')}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">67</span>
                    <span className="text-sm text-blue-100">{t('common.following')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Welcome Message - Moved up, directly below header */}
      <div className="container-custom pt-4">
        <div className="mb-4 rounded-xl bg-white p-5 shadow-sm border-l-4 border-primary-500">
          <div className="flex items-center">
            <Crown size={24} className="text-yellow-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome! Share your medical insights with the community</h2>
              <p className="mt-2 text-gray-600">Share your daily reflections, clinical stories, and thoughts with the medical world – or even the public if you wish.</p>
              <p className="mt-2 text-gray-600 text-right" dir="rtl">مرحبًا بك! شارك أفكارك الطبية مع المجتمع</p>
              <p className="text-gray-600 text-right" dir="rtl">شارك يومياتك، تجاربك، وأفكارك الطبية والإنسانية مع زملائك في المجتمع الطبي… أو حتى مع الجميع إن أحببت.</p>
            </div>
          </div>
        </div>
        
        {/* Create Post Component - Moved up */}
        <CreatePost onPostCreated={fetchPosts} />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">{t('profile.about')}</h3>
                {profile?.bio ? (
                  <p className="mb-4 text-gray-700">{profile.bio}</p>
                ) : (
                  <div className="mb-4 text-gray-500 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <p className="mb-2 text-center">{t('profile.noBioProvided')}</p>
                    <button className="btn-primary btn-sm flex items-center">
                      <PenSquare size={14} className="mr-1" />
                      Add Bio
                    </button>
                  </div>
                )}
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
              
              {/* Quick Stats Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold flex items-center">
                  <BarChart2 size={18} className="mr-2 text-primary-500" />
                  {t('myZone.stats.title')}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <PenSquare size={16} className="text-primary-600" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary-600">{stats.posts}</p>
                    <p className="text-xs text-gray-600">{t('myZone.stats.posts')}</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <div className="flex justify-center mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <MessageCircle size={16} className="text-primary-600" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary-600">{stats.comments}</p>
                    <p className="text-xs text-gray-600">{t('myZone.stats.comments')}</p>
                  </div>
                </div>
                
                {/* Engagement Chart */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{t('myZone.stats.engagement')}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stats.engagement === 'High' ? 'bg-green-100 text-green-800' :
                      stats.engagement === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stats.engagement}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ 
                        width: stats.engagement === 'High' ? '80%' : 
                               stats.engagement === 'Medium' ? '50%' : '20%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Filters Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('myZone.filters.title')}</h3>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    <Filter size={18} />
                  </button>
                </div>
                
                {showFilters && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('myZone.filters.specialty')}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSpecialty('')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedSpecialty === '' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('myZone.filters.all')}
                        </button>
                        <button
                          onClick={() => setSelectedSpecialty('cardiology')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedSpecialty === 'cardiology' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('post.specialties.cardiology')}
                        </button>
                        <button
                          onClick={() => setSelectedSpecialty('neurology')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedSpecialty === 'neurology' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('post.specialties.neurology')}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('myZone.filters.language')}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedLanguage('')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedLanguage === '' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('myZone.filters.all')}
                        </button>
                        <button
                          onClick={() => setSelectedLanguage('en')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedLanguage === 'en' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => setSelectedLanguage('ar')}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selectedLanguage === 'ar' 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          العربية
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold flex items-center">
                  <SparklesIcon className="mr-2 text-yellow-500" size={20} />
                  {t('myZone.pinnedPosts')}
                </h2>
                <div className="space-y-4">
                  {pinnedPosts.map(post => (
                    <div key={post.id} className="rounded-xl bg-white p-6 shadow-sm border-l-4 border-primary-500">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-600">
                              {post.profiles?.username?.substring(0, 2).toUpperCase() || 'DR'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{post.profiles?.full_name || 'Doctor'}</p>
                            <p className="text-xs text-gray-500">
                              {post.profiles?.specialty} • {new Date(post.created_at).toLocaleDateString()} • Pinned
                            </p>
                          </div>
                        </div>
                        <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      <div>
                        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="mb-4 rounded-lg"
                          />
                        )}
                        
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <div className="flex space-x-4">
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-500">
                              <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} className={post.is_liked ? 'text-red-500' : ''} />
                              <span>{post.likes_count}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                              <MessageCircle size={18} />
                              <span>{post.comments_count}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
                              <Share2 size={18} />
                              <span>{t('common.share')}</span>
                            </button>
                          </div>
                          <button className="text-sm text-gray-600 hover:text-primary-500">
                            <Bookmark size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Posts Feed */}
            <div>
              <h2 className="mb-3 text-lg font-semibold flex items-center">
                <Users className="mr-2 text-primary-500" size={20} />
                {t('myZone.communityPosts')}
              </h2>
              
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Post key={post.id} post={post} onUpdate={fetchPosts} />
                  ))}
                  
                  <div className="text-center mt-6">
                    <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center mx-auto">
                      <span>{t('myZone.loadMore')}</span>
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <Users size={32} className="text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('myZone.welcome.title')}</h3>
                  <p className="text-gray-600 mb-6">{t('myZone.welcome.description')}</p>
                  <motion.button 
                    className="btn-primary flex items-center mx-auto"
                    animate={!hasCreatedPost ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <PenSquare size={18} className="mr-2" />
                    {t('myZone.welcome.createPost')}
                  </motion.button>
                  {!hasCreatedPost && (
                    <div className="mt-3 text-primary-500 flex items-center justify-center">
                      <SparklesIcon size={16} className="mr-1" />
                      <span className="text-sm">ابدأ من هنا!</span>
                    </div>
                  )}
                </div>
              )}
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
      
      {/* Scroll to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
};

export default MyZonePage;