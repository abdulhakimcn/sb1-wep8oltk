import React, { useState, useEffect } from 'react';
import { Play, Clock, Bookmark, ThumbsUp, MessageCircle, Share2, Filter, Search, Plus, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Video } from '../lib/types';
import VideoCard from '../components/VideoCard';
import UploadVideoModal from '../components/UploadVideoModal';

const ZoneTubePage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [user]);

  const fetchVideos = async () => {
    try {
      let query = supabase
        .from('videos')
        .select(`
          *,
          creator:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (user) {
        // Get user's purchased videos
        const { data: purchases } = await supabase
          .from('video_purchases')
          .select('video_id')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const purchasedVideoIds = new Set(purchases?.map(p => p.video_id));

        // Add has_purchased flag to videos
        const videosWithPurchaseStatus = data?.map(video => ({
          ...video,
          has_purchased: purchasedVideoIds.has(video.id)
        }));

        setVideos(videosWithPurchaseStatus || []);
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
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

    // For now, just create a purchase record
    // In production, integrate with Stripe/payment provider
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
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ZoneTube</h1>
            <p className="text-gray-600">Medical videos and learning resources</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
          >
            <Plus size={20} />
            <span>Upload Video</span>
          </button>
        </div>
        
        {/* Search and Categories */}
        <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="flex overflow-x-auto space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('surgery')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'surgery'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Surgery
            </button>
            <button
              onClick={() => setSelectedCategory('cardiology')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'cardiology'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cardiology
            </button>
            <button
              onClick={() => setSelectedCategory('neurology')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'neurology'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Neurology
            </button>
            <button
              onClick={() => setSelectedCategory('pediatrics')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'pediatrics'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pediatrics
            </button>
            <button
              onClick={() => setSelectedCategory('internal')}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'internal'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Internal Medicine
            </button>
          </div>
        </div>
        
        {/* Video Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => {
                  if (video.is_premium && !video.has_purchased) {
                    handlePurchase(video.id);
                  } else {
                    window.location.href = `/zonetube/watch/${video.id}`;
                  }
                }}
              />
            ))}
          </div>
        )}

        {showUploadModal && (
          <UploadVideoModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              fetchVideos();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ZoneTubePage;