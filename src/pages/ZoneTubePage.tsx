import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Plus, Flame, TrendingUp, Award, Clock, Filter, Eye } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Video } from '../lib/types';
import VideoCard from '../components/VideoCard';
import UploadVideoModal from '../components/UploadVideoModal';
import MediaFilters from '../components/MediaFilters';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ZoneTubePage: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'new' | 'premium'>('all');

  // Sample dummy data for videos
  const dummyVideos: Video[] = [
    {
      id: 'dummy-1',
      creator_id: 'creator-1',
      title: 'Advanced Cardiac Surgery Techniques',
      description: 'Learn about the latest techniques in cardiac surgery with detailed explanations and case studies.',
      thumbnail_url: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg',
      video_url: 'https://example.com/video1.mp4',
      duration: '45:22',
      price: 0,
      is_premium: false,
      views_count: 1245,
      likes_count: 89,
      comments_count: 23,
      category: 'educational',
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-1',
        user_id: 'user-1',
        username: 'drsarah',
        full_name: 'Dr. Sarah Johnson',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'dummy-2',
      creator_id: 'creator-2',
      title: 'Neurological Examination Masterclass',
      description: 'A comprehensive guide to performing a complete neurological examination with clinical pearls.',
      thumbnail_url: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg',
      video_url: 'https://example.com/video2.mp4',
      duration: '32:15',
      price: 0,
      is_premium: false,
      views_count: 987,
      likes_count: 76,
      comments_count: 18,
      category: 'educational',
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-2',
        user_id: 'user-2',
        username: 'drmichael',
        full_name: 'Dr. Michael Chen',
        type: 'doctor',
        specialty: 'Neurology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'dummy-3',
      creator_id: 'creator-3',
      title: 'Pediatric Emergency Procedures',
      description: 'Essential procedures every doctor should know when dealing with pediatric emergencies.',
      thumbnail_url: 'https://images.pexels.com/photos/6129049/pexels-photo-6129049.jpeg',
      video_url: 'https://example.com/video3.mp4',
      duration: '28:45',
      price: 19.99,
      is_premium: true,
      views_count: 756,
      likes_count: 62,
      comments_count: 14,
      category: 'educational',
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-3',
        user_id: 'user-3',
        username: 'dremily',
        full_name: 'Dr. Emily Rodriguez',
        type: 'doctor',
        specialty: 'Pediatrics',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'dummy-4',
      creator_id: 'creator-4',
      title: 'الفحص السريري للقلب',
      description: 'دليل شامل للفحص السريري للقلب مع نصائح عملية للأطباء',
      thumbnail_url: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg',
      video_url: 'https://example.com/video4.mp4',
      duration: '22:30',
      price: 0,
      is_premium: false,
      views_count: 543,
      likes_count: 48,
      comments_count: 9,
      category: 'educational',
      language: 'ar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-4',
        user_id: 'user-4',
        username: 'drahmed',
        full_name: 'د. أحمد الخالدي',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'dummy-5',
      creator_id: 'creator-5',
      title: 'Surgical Techniques in Orthopedics',
      description: 'Advanced surgical techniques for common orthopedic procedures with step-by-step guidance.',
      thumbnail_url: 'https://images.pexels.com/photos/305566/pexels-photo-305566.jpeg',
      video_url: 'https://example.com/video5.mp4',
      duration: '52:18',
      price: 29.99,
      is_premium: true,
      views_count: 1876,
      likes_count: 142,
      comments_count: 37,
      category: 'educational',
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-5',
        user_id: 'user-5',
        username: 'drjames',
        full_name: 'Dr. James Wilson',
        type: 'doctor',
        specialty: 'Orthopedics',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'dummy-6',
      creator_id: 'creator-6',
      title: '心脏病学最新进展',
      description: '心脏病学领域的最新研究和治疗方法概述',
      thumbnail_url: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg',
      video_url: 'https://example.com/video6.mp4',
      duration: '38:42',
      price: 0,
      is_premium: false,
      views_count: 687,
      likes_count: 53,
      comments_count: 12,
      category: 'educational',
      language: 'zh',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: 'creator-6',
        user_id: 'user-6',
        username: 'drli',
        full_name: '李医生',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ];

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, selectedLanguage, activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      let realVideos: Video[] = [];
      let realTrendingVideos: Video[] = [];
      let realFeaturedVideo: Video | null = null;
      
      try {
        // Fetch featured video first (most viewed)
        const { data: featuredData } = await supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `)
          .order('views_count', { ascending: false })
          .limit(1)
          .single();
        
        if (featuredData) {
          realFeaturedVideo = featuredData;
        }
        
        // Fetch trending videos (most liked in the past week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: trendingData } = await supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('likes_count', { ascending: false })
          .limit(6);
        
        if (trendingData && trendingData.length > 0) {
          realTrendingVideos = trendingData;
        }
        
        // Build query based on active tab and filters
        let query = supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `);
        
        // Apply tab filters
        if (activeTab === 'trending') {
          query = query
            .gte('created_at', oneWeekAgo.toISOString())
            .order('likes_count', { ascending: false });
        } else if (activeTab === 'new') {
          query = query.order('created_at', { ascending: false });
        } else if (activeTab === 'premium') {
          query = query.eq('is_premium', true);
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        // Apply category and language filters
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        
        if (selectedLanguage !== 'all') {
          query = query.eq('language', selectedLanguage);
        }
        
        // For non-authenticated users, only show free videos
        if (!user && activeTab !== 'premium') {
          query = query.eq('is_premium', false);
        }
        
        // Execute query
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          realVideos = data;
        }
      } catch (error) {
        console.error('Error fetching from Supabase, using dummy data:', error);
      }
      
      // If no real data, use dummy data
      if (realVideos.length === 0) {
        // Filter dummy videos based on active tab and filters
        let filteredDummyVideos = [...dummyVideos];
        
        if (activeTab === 'trending') {
          filteredDummyVideos = filteredDummyVideos.sort((a, b) => b.likes_count - a.likes_count);
        } else if (activeTab === 'new') {
          // Already sorted by date
        } else if (activeTab === 'premium') {
          filteredDummyVideos = filteredDummyVideos.filter(v => v.is_premium);
        }
        
        if (selectedCategory !== 'all') {
          filteredDummyVideos = filteredDummyVideos.filter(v => v.category === selectedCategory);
        }
        
        if (selectedLanguage !== 'all') {
          filteredDummyVideos = filteredDummyVideos.filter(v => v.language === selectedLanguage);
        }
        
        setVideos(filteredDummyVideos);
      } else {
        setVideos(realVideos);
      }
      
      // Set trending videos
      if (realTrendingVideos.length === 0) {
        setTrendingVideos(dummyVideos.sort((a, b) => b.likes_count - a.likes_count).slice(0, 6));
      } else {
        setTrendingVideos(realTrendingVideos);
      }
      
      // Set featured video
      if (!realFeaturedVideo) {
        setFeaturedVideo(dummyVideos[0]);
      } else {
        setFeaturedVideo(realFeaturedVideo);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fallback to dummy data
      setVideos(dummyVideos);
      setTrendingVideos(dummyVideos.sort((a, b) => b.likes_count - a.likes_count).slice(0, 6));
      setFeaturedVideo(dummyVideos[0]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (videoId: string) => {
    if (!user) {
      alert('Please sign in to purchase this video');
      return;
    }

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    try {
      const { error } = await supabase
        .from('video_purchases')
        .insert({
          video_id: videoId,
          user_id: user.id,
          amount: video.price,
          status: 'completed'
        });

      if (error) throw error;

      // Refresh videos to update purchase status
      await fetchVideos();
    } catch (error) {
      console.error('Error purchasing video:', error);
      alert('Error purchasing video. Please try again.');
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchTerm === '' || 
                         video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Get hero section text based on language
  const getHeroText = () => {
    if (i18n.language === 'ar') {
      return {
        title: "فيديوهات طبية حصرية من الأطباء للأطباء",
        subtitle: "شارك، تعلم، وارتقِ بتجربتك الطبية من خلال محتوى موثوق واحترافي."
      };
    }
    return {
      title: "Medical Videos for Professionals",
      subtitle: "Discover educational content created by leading medical experts"
    };
  };

  const heroText = getHeroText();

  return (
    <>
      <Helmet>
        <title>ZoneTube - Medical Videos | Dr.Zone</title>
        <meta name="description" content="Watch medical videos from expert doctors and healthcare professionals. Free educational content for the medical community." />
        <meta name="keywords" content="medical videos, doctor videos, healthcare education, medical education, dr zone" />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">{heroText.title}</h1>
                <p className="text-xl text-blue-100 mb-6">
                  {heroText.subtitle}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/zonetube/videos/categories/educational"
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Educational
                  </Link>
                  <Link
                    to="/zonetube/videos/categories/surgery"
                    className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
                  >
                    Surgery
                  </Link>
                  <Link
                    to="/zonetube/videos/categories/cardiology"
                    className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
                  >
                    Cardiology
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="rounded-full overflow-hidden w-3/4 aspect-square shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                    alt="Medical professionals watching video"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 text-gray-50 fill-current">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
            </svg>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ZoneTube</h2>
              <p className="text-gray-600">Medical videos and learning resources</p>
            </div>
            {user && (
              <div className="flex space-x-2">
                <Link
                  to="/upload-media"
                  className="flex items-center space-x-2 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  <span>Upload Media</span>
                </Link>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Play size={20} />
                  <span>Quick Upload</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Category Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto space-x-1 pb-1 hide-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Videos
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'trending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Flame size={16} className="mr-1" />
                Trending
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`flex items-center px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'new'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp size={16} className="mr-1" />
                Newest
              </button>
              <button
                onClick={() => setActiveTab('premium')}
                className={`flex items-center px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'premium'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Award size={16} className="mr-1" />
                Premium
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <MediaFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            mediaType="video"
          />
          
          {/* Featured Video */}
          {!loading && featuredVideo && activeTab === 'all' && !searchTerm && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Award className="mr-2 text-primary-500" size={24} />
                  Featured Video
                </h2>
                <Link to="/zonetube/featured" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all featured
                </Link>
              </div>
              
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary-500/10 to-primary-600/10 p-1">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={featuredVideo.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                    alt={featuredVideo.title}
                    className="w-full h-[28rem] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                    <div className="rounded-full bg-primary-500 w-fit px-3 py-1 text-xs text-white mb-3">
                      Featured
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">{featuredVideo.title}</h3>
                    <p className="text-white/90 mb-6 max-w-2xl line-clamp-2">{featuredVideo.description}</p>
                    <div className="flex items-center text-white/80 mb-6">
                      <div className="flex items-center mr-4">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-2 border-2 border-white">
                          <span className="text-sm font-medium text-primary-600">
                            {featuredVideo.creator?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                          </span>
                        </div>
                        <span>{featuredVideo.creator?.full_name}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Clock size={16} className="mr-1" />
                        <span>{featuredVideo.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1" />
                        <span>{featuredVideo.views_count || 0} views</span>
                      </div>
                    </div>
                    <Link
                      to={`/zonetube/videos/${featuredVideo.id}`}
                      className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg w-fit"
                    >
                      <Play size={20} className="mr-2" />
                      Watch Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Trending Videos Carousel */}
          {!loading && trendingVideos.length > 0 && activeTab === 'all' && !searchTerm && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Flame className="mr-2 text-red-500" size={24} />
                  Trending This Week
                </h2>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all trending
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingVideos.slice(0, 3).map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => {
                      if (video.is_premium && !video.has_purchased && user) {
                        handlePurchase(video.id);
                      } else {
                        window.location.href = `/zonetube/videos/${video.id}`;
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Main Video Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeTab === 'all' && 'All Videos'}
              {activeTab === 'trending' && 'Trending Videos'}
              {activeTab === 'new' && 'Newest Videos'}
              {activeTab === 'premium' && 'Premium Videos'}
            </h2>
            
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
              </div>
            ) : filteredVideos.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={() => {
                      if (video.is_premium && !video.has_purchased && user) {
                        handlePurchase(video.id);
                      } else {
                        window.location.href = `/zonetube/videos/${video.id}`;
                      }
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-xl bg-white p-8 text-center shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Play size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {i18n.language === 'ar' 
                    ? "لا توجد فيديوهات حتى الآن. كن أول من يشارك محتوى طبي قيّم مع زملائك."
                    : "No videos found matching your criteria"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {i18n.language === 'ar' 
                    ? "يمكنك تحميل فيديو جديد أو تعديل معايير البحث."
                    : "Try adjusting your search filters or upload new content."}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLanguage('all');
                    }}
                    className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Filter size={16} className="mr-2" />
                    Clear Filters
                  </button>
                  {user && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Upload Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!user && (
            <div className="mt-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 p-8 text-white shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Join Dr.Zone Today</h2>
                  <p className="mb-6 text-blue-50">
                    Sign up to access premium content, save your favorite videos, and share your medical knowledge with the community.
                  </p>
                  <Link
                    to="/auth"
                    className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-primary-600 font-medium hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Join Now
                  </Link>
                </div>
                <div className="hidden md:block">
                  <img 
                    src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                    alt="Medical professionals collaborating"
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadVideoModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchVideos();
          }}
        />
      )}
    </>
  );
};

export default ZoneTubePage;