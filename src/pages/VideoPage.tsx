import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Clock, User, Tag, Share2, BookmarkPlus, Download, Edit, AlertTriangle, Heart, MessageSquare, Eye, ChevronRight, ChevronLeft, Settings, SkipForward, SkipBack } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import type { Video } from '../lib/types';
import { motion } from 'framer-motion';

const VideoPage: React.FC = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // First try to fetch from the media table
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select(`
            *,
            creator:profiles(*)
          `)
          .eq('id', videoId)
          .eq('type', 'video')
          .single();

        if (!mediaError && mediaData) {
          setVideo(mediaData);
          setIsCreator(user?.id === mediaData.creator?.user_id);
          setLikesCount(mediaData.likes_count || 0);
          
          // Check if user has liked this video
          if (user) {
            const { data: likeData } = await supabase
              .from('media_likes')
              .select('id')
              .eq('media_id', videoId)
              .eq('user_id', user.id)
              .single();
              
            setIsLiked(!!likeData);
          }
          
          // Fetch related videos
          const { data: relatedData } = await supabase
            .from('media')
            .select(`
              *,
              creator:profiles(*)
            `)
            .eq('type', 'video')
            .eq('status', 'approved')
            .neq('id', videoId)
            .eq('category', mediaData.category)
            .limit(4);

          setRelatedVideos(relatedData || []);
          
          // Fetch comments
          const { data: commentsData } = await supabase
            .from('media_comments')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('media_id', videoId)
            .order('created_at', { ascending: false });
            
          setComments(commentsData || []);
          
          // Increment view count
          await supabase.rpc('increment_media_views_rpc', { id: videoId });
          
          setLoading(false);
          return;
        }

        // If not found in media table, try videos table
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `)
          .eq('id', videoId)
          .single();

        if (videoError) throw videoError;

        if (user && videoData.is_premium) {
          // Check if user has purchased the video
          const { data: purchaseData } = await supabase
            .from('video_purchases')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .single();

          videoData.has_purchased = !!purchaseData;
        }

        setVideo(videoData);
        setIsCreator(user?.id === videoData.creator?.user_id);
        setLikesCount(videoData.likes_count || 0);

        // Check if user has liked this video
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')  // Using post_likes for older videos
            .select('id')
            .eq('post_id', videoId)
            .eq('user_id', user.id)
            .single();
            
          setIsLiked(!!likeData);
        }

        // Fetch related videos
        const { data: relatedData } = await supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `)
          .eq('category', videoData.category)
          .neq('id', videoId)
          .eq('is_premium', false)
          .limit(4);

        setRelatedVideos(relatedData || []);
        
        // Increment view count (for older videos)
        await supabase
          .from('videos')
          .update({ views_count: (videoData.views_count || 0) + 1 })
          .eq('id', videoId);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, user]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime -= 10;
  };

  const handleLike = async () => {
    if (!user || !video) return;
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('media_likes')
          .delete()
          .eq('media_id', video.id)
          .eq('user_id', user.id);
          
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('media_likes')
          .insert([{ media_id: video.id, user_id: user.id }]);
          
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !video || !commentText.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('media_comments')
        .insert([{
          media_id: video.id,
          user_id: user.id,
          content: commentText.trim()
        }])
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();
        
      if (error) throw error;
      
      setComments([data, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Video not found</h1>
            <Link to="/zonetube" className="mt-4 text-primary-500 hover:underline">
              Return to ZoneTube
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (video.is_premium && !video.has_purchased && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <img
              src={video.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
              alt={video.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h1>
            <p className="text-gray-600 mb-6">
              This premium video requires purchase to view. Get access to this exclusive content created by {video.creator?.full_name}.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary-600">
                      {video.creator?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{video.creator?.full_name}</p>
                    <p className="text-sm text-gray-500">{video.creator?.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">${video.price}</p>
                  <p className="text-sm text-gray-500">One-time purchase</p>
                </div>
              </div>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-gray-700">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Lifetime access to this video</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>High-quality streaming</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Download for offline viewing</span>
                </li>
              </ul>
              <button 
                onClick={() => handlePurchase(video.id)}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (video.is_premium && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <img
              src={video.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
              alt={video.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h1>
            <p className="text-gray-600 mb-6">
              This premium video requires a Dr.Zone account. Sign in or create an account to access exclusive content.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4">Already have an account?</h3>
                <Link to="/auth" className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors block text-center">
                  Sign In
                </Link>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4">New to Dr.Zone?</h3>
                <Link to="/auth?signup=true" className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors block text-center">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if video is pending review
  const isPending = video.status === 'pending';

  return (
    <>
      <Helmet>
        <title>{video.title} | ZoneTube - Dr.Zone</title>
        <meta name="description" content={video.description} />
        <meta property="og:title" content={`${video.title} | ZoneTube - Dr.Zone`} />
        <meta property="og:description" content={video.description} />
        {video.thumbnail_url && <meta property="og:image" content={video.thumbnail_url} />}
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={video.video_url || video.file_url} />
        <meta name="keywords" content={`medical videos, ${video.category}, medical education, dr zone, ${video.creator?.specialty}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {isPending && isCreator && (
          <div className="bg-yellow-50 p-4 border-b border-yellow-200">
            <div className="container-custom">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Review Pending</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>
                      This video is currently under review. It will be visible to others once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Section */}
        <div className="bg-gray-900">
          <div className="container-custom py-6">
            <div 
              ref={videoContainerRef}
              className="relative aspect-video bg-black rounded-xl overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
            >
              <video
                ref={videoRef}
                src={video.video_url || video.file_url}
                poster={video.thumbnail_url}
                className="w-full h-full"
                onClick={togglePlay}
              />
              
              {/* Video Controls */}
              {showControls && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleTimeChange}
                      className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #0073b6 ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / duration) * 100}%)`
                      }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-primary-300 transition-colors"
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      
                      <button
                        onClick={skipBackward}
                        className="text-white hover:text-primary-300 transition-colors"
                      >
                        <SkipBack size={20} />
                      </button>
                      
                      <button
                        onClick={skipForward}
                        className="text-white hover:text-primary-300 transition-colors"
                      >
                        <SkipForward size={20} />
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-primary-300 transition-colors"
                        >
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, white ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%)`
                          }}
                        />
                      </div>
                      
                      <div className="text-sm text-white">
                        <span>{formatTime(currentTime)}</span>
                        <span> / </span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button className="text-white hover:text-primary-300 transition-colors">
                        <Settings size={20} />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-primary-300 transition-colors"
                      >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="rounded-full bg-primary-500/90 p-5 transform transition-transform hover:scale-110">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Video Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
                  {isCreator && (
                    <Link 
                      to={`/edit-media/${video.id}`}
                      className="btn-outline btn-sm flex items-center space-x-1"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Link>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span className="text-sm font-medium text-primary-600">
                          {video.creator?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{video.creator?.full_name}</p>
                        <p className="text-sm text-gray-500">{video.creator?.specialty}</p>
                      </div>
                    </div>
                    
                    <button className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-200 transition-colors">
                      Follow
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Eye size={18} />
                      <span>{video.views_count || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock size={18} />
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={18} />
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-medium ${
                      isLiked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                    <BookmarkPlus size={18} />
                    <span>Save</span>
                  </button>
                  
                  {video.is_premium && (
                    <button className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                      <Download size={18} />
                      <span>Download</span>
                    </button>
                  )}
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
                  
                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
                
                {user ? (
                  <div className="mb-6">
                    <div className="flex space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary-600">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleComment}
                            disabled={!commentText.trim()}
                            className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
                    <Link to="/auth" className="text-primary-600 font-medium hover:underline">
                      Sign In
                    </Link>
                  </div>
                )}
                
                {comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary-600">
                            {comment.profile?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{comment.profile?.full_name || 'User'}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700">{comment.content}</p>
                          <div className="mt-2 flex space-x-4 text-sm">
                            <button className="text-gray-500 hover:text-gray-700">Like</button>
                            <button className="text-gray-500 hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Related Videos */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
                <div className="space-y-4">
                  {relatedVideos.map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      to={`/zonetube/videos/${relatedVideo.id}`}
                      className="block group"
                    >
                      <div className="flex space-x-4">
                        <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={relatedVideo.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={24} className="text-white" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 px-1.5 py-0.5 text-xs text-white rounded">
                            {relatedVideo.duration}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {relatedVideo.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {relatedVideo.creator?.full_name}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Eye size={12} className="mr-1" />
                            <span>{relatedVideo.views_count || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/zonetube"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center"
                  >
                    Browse more videos
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>

              {/* Creator Info */}
              {video.creator && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <h2 className="text-lg font-semibold mb-4">About the Creator</h2>
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <span className="text-lg font-medium text-primary-600">
                        {video.creator.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{video.creator.full_name}</p>
                      <p className="text-sm text-gray-500">{video.creator.specialty}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {video.creator.bio || 'Medical professional sharing educational content.'}
                  </p>
                  <div className="flex space-x-3">
                    <button className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors">
                      Follow
                    </button>
                    <Link 
                      to={`/profile/${video.creator.username}`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}

              {/* Premium Promotion */}
              {!user && (
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white shadow-sm">
                  <h3 className="font-semibold text-xl mb-3">Join Dr.Zone Premium</h3>
                  <p className="mb-4 text-blue-50">
                    Get access to exclusive medical videos, courses, and resources.
                  </p>
                  <Link
                    to="/auth"
                    className="block w-full rounded-lg bg-white px-4 py-2 text-center text-primary-600 font-medium hover:bg-blue-50 transition-colors"
                  >
                    Sign Up Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper component for the premium section
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Helper component for the date display
const Calendar = ({ size, className }: { size: number, className?: string }) => (
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
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default VideoPage;