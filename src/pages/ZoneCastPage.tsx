import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Mic, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import type { Podcast } from '../lib/types';
import PodcastCard from '../components/PodcastCard';
import UploadPodcastModal from '../components/UploadPodcastModal';
import MediaFilters from '../components/MediaFilters';

const ZoneCastPage: React.FC = () => {
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Sample dummy data for podcasts
  const dummyPodcasts: Podcast[] = [
    {
      id: 'dummy-pod-1',
      title: 'Latest Advances in Cardiology',
      description: 'In this episode, we discuss the most recent developments in cardiology with leading experts in the field.',
      audio_url: 'https://example.com/podcast1.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg',
      duration: '45:22',
      specialty: 'cardiology',
      transcript: 'Full transcript of the podcast...',
      show_notes: 'Links and references mentioned in the episode...',
      host_id: 'host-1',
      host: {
        id: 'host-1',
        user_id: 'user-1',
        username: 'drsarah',
        full_name: 'Dr. Sarah Johnson',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 89,
      plays_count: 1245,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dummy-pod-2',
      title: 'Neurological Case Studies',
      description: 'Exploring fascinating neurological cases and their diagnostic challenges with Dr. Michael Chen.',
      audio_url: 'https://example.com/podcast2.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
      duration: '38:15',
      specialty: 'neurology',
      transcript: 'Full transcript of the podcast...',
      show_notes: 'Links and references mentioned in the episode...',
      host_id: 'host-2',
      host: {
        id: 'host-2',
        user_id: 'user-2',
        username: 'drmichael',
        full_name: 'Dr. Michael Chen',
        type: 'doctor',
        specialty: 'Neurology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 76,
      plays_count: 987,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dummy-pod-3',
      title: 'Pediatric Emergency Protocols',
      description: 'Essential protocols every doctor should know when dealing with pediatric emergencies.',
      audio_url: 'https://example.com/podcast3.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg',
      duration: '32:45',
      specialty: 'pediatrics',
      transcript: 'Full transcript of the podcast...',
      show_notes: 'Links and references mentioned in the episode...',
      host_id: 'host-3',
      host: {
        id: 'host-3',
        user_id: 'user-3',
        username: 'dremily',
        full_name: 'Dr. Emily Rodriguez',
        type: 'doctor',
        specialty: 'Pediatrics',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 62,
      plays_count: 756,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dummy-pod-4',
      title: 'المستجدات في طب القلب',
      description: 'في هذه الحلقة، نناقش أحدث التطورات في طب القلب مع خبراء رائدين في هذا المجال.',
      audio_url: 'https://example.com/podcast4.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
      duration: '42:30',
      specialty: 'cardiology',
      transcript: 'النص الكامل للبودكاست...',
      show_notes: 'الروابط والمراجع المذكورة في الحلقة...',
      host_id: 'host-4',
      host: {
        id: 'host-4',
        user_id: 'user-4',
        username: 'drahmed',
        full_name: 'د. أحمد الخالدي',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 48,
      plays_count: 543,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dummy-pod-5',
      title: 'Surgical Techniques Discussion',
      description: 'A roundtable discussion on advanced surgical techniques with leading surgeons.',
      audio_url: 'https://example.com/podcast5.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/305566/pexels-photo-305566.jpeg',
      duration: '52:18',
      specialty: 'surgery',
      transcript: 'Full transcript of the podcast...',
      show_notes: 'Links and references mentioned in the episode...',
      host_id: 'host-5',
      host: {
        id: 'host-5',
        user_id: 'user-5',
        username: 'drjames',
        full_name: 'Dr. James Wilson',
        type: 'doctor',
        specialty: 'Surgery',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 142,
      plays_count: 1876,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dummy-pod-6',
      title: '心脏病学研究进展',
      description: '与领先专家讨论心脏病学领域的最新研究进展',
      audio_url: 'https://example.com/podcast6.mp3',
      thumbnail_url: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg',
      duration: '38:42',
      specialty: 'cardiology',
      transcript: '播客的完整文字记录...',
      show_notes: '节目中提到的链接和参考资料...',
      host_id: 'host-6',
      host: {
        id: 'host-6',
        user_id: 'user-6',
        username: 'drli',
        full_name: '李医生',
        type: 'doctor',
        specialty: 'Cardiology',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      likes_count: 53,
      plays_count: 687,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchPodcasts();
  }, [selectedCategory, selectedLanguage]);

  const fetchPodcasts = async () => {
    try {
      // Try to fetch from Supabase
      let realPodcasts: Podcast[] = [];
      
      try {
        let query = supabase
          .from('podcasts')
          .select(`
            *,
            host:profiles(*)
          `)
          .order('created_at', { ascending: false });

        if (selectedCategory !== 'all') {
          query = query.eq('specialty', selectedCategory);
        }

        if (selectedLanguage !== 'all') {
          query = query.eq('language', selectedLanguage);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          realPodcasts = data;
        }
      } catch (error) {
        console.error('Error fetching from Supabase, using dummy data:', error);
      }
      
      // If no real data, use dummy data
      if (realPodcasts.length === 0) {
        // Filter dummy podcasts based on filters
        let filteredDummyPodcasts = [...dummyPodcasts];
        
        if (selectedCategory !== 'all') {
          filteredDummyPodcasts = filteredDummyPodcasts.filter(p => p.specialty === selectedCategory);
        }
        
        setPodcasts(filteredDummyPodcasts);
      } else {
        setPodcasts(realPodcasts);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      // Fallback to dummy data
      setPodcasts(dummyPodcasts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter(podcast => 
    searchTerm === '' || 
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.host?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>ZoneCast - Medical Podcasts | Dr.Zone</title>
        <meta name="description" content="Listen to medical podcasts from expert doctors and healthcare professionals. Free educational content for the medical community." />
        <meta name="keywords" content="medical podcasts, doctor podcasts, healthcare education, medical education, dr zone" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZoneCast</h1>
              <p className="text-gray-600">Medical podcasts from expert doctors</p>
            </div>
            {user && (
              <div className="flex space-x-2">
                <Link
                  to="/upload-media"
                  className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                >
                  <Plus size={20} />
                  <span>Upload Media</span>
                </Link>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Plus size={20} />
                  <span>Quick Upload</span>
                </button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <MediaFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            mediaType="podcast"
          />

          {/* Featured Podcast */}
          {!loading && filteredPodcasts.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Featured Episode</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={filteredPodcasts[0].thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                    alt={filteredPodcasts[0].title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <div className="rounded-full bg-primary-500 w-fit px-3 py-1 text-xs text-white mb-2">
                      Featured
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{filteredPodcasts[0].title}</h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <span className="mr-3">{filteredPodcasts[0].host?.full_name}</span>
                      <span>{filteredPodcasts[0].duration}</span>
                    </div>
                  </div>
                  <Link
                    to={`/zonecast/episodes/${filteredPodcasts[0].id}`}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="rounded-full bg-white/90 p-4 shadow-lg transform transition-transform hover:scale-110">
                      <Play size={24} className="text-primary-500 ml-1" fill="#0073b6" />
                    </div>
                  </Link>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{filteredPodcasts[0].title}</h3>
                    <p className="text-gray-600 mb-4">{filteredPodcasts[0].description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Mic size={16} className="mr-1" />
                      <span className="mr-3">{filteredPodcasts[0].host?.full_name}</span>
                      <span>{filteredPodcasts[0].duration}</span>
                    </div>
                  </div>
                  <Link
                    to={`/zonecast/episodes/${filteredPodcasts[0].id}`}
                    className="btn-primary inline-flex items-center justify-center"
                  >
                    <Play size={18} className="mr-2" />
                    Listen Now
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Podcast Grid */}
          <h2 className="mb-4 text-xl font-semibold">All Episodes</h2>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredPodcasts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPodcasts.map((podcast) => (
                <PodcastCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <Mic size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold">No podcasts found</h3>
              <p className="mt-2 text-gray-600">Be the first to share valuable medical audio content with your colleagues.</p>
              {user && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 inline-flex items-center rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Upload First Podcast
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="mt-8 rounded-lg bg-primary-50 p-6 text-center">
              <h2 className="text-xl font-semibold text-primary-900">Join Dr.Zone</h2>
              <p className="mt-2 text-primary-700">
                Sign up to access more content and share your medical knowledge with the community.
              </p>
              <Link
                to="/auth"
                className="mt-4 inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadPodcastModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchPodcasts();
          }}
        />
      )}
    </>
  );
};

export default ZoneCastPage;