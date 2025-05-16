import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Pause, Clock, User, Tag, Share2, BookmarkPlus, Download, Volume2, VolumeX, SkipBack, SkipForward, Edit, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import type { Podcast } from '../lib/types';

const PodcastPage: React.FC = () => {
  const { podcastId } = useParams();
  const { user } = useAuth();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPodcasts, setRelatedPodcasts] = useState<Podcast[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        // First try to fetch from the media table
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select(`
            *,
            creator:profiles(*)
          `)
          .eq('id', podcastId)
          .eq('type', 'podcast')
          .single();

        if (!mediaError && mediaData) {
          setPodcast({
            ...mediaData,
            audio_url: mediaData.file_url,
            host: mediaData.creator,
            host_id: mediaData.creator_id,
            show_notes: mediaData.show_notes,
            transcript: mediaData.transcript
          });
          setIsCreator(user?.id === mediaData.creator?.user_id);
          
          // Fetch related podcasts
          const { data: relatedData } = await supabase
            .from('media')
            .select(`
              *,
              creator:profiles(*)
            `)
            .eq('type', 'podcast')
            .eq('status', 'approved')
            .neq('id', podcastId)
            .eq('specialty', mediaData.specialty)
            .limit(4);

          if (relatedData) {
            setRelatedPodcasts(relatedData.map(item => ({
              ...item,
              audio_url: item.file_url,
              host: item.creator,
              host_id: item.creator_id,
              show_notes: item.show_notes,
              transcript: item.transcript
            })));
          }
          
          setLoading(false);
          return;
        }

        // If not found in media table, try podcasts table
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            *,
            host:profiles(*)
          `)
          .eq('id', podcastId)
          .single();

        if (podcastError) throw podcastError;

        setPodcast(podcastData);
        setIsCreator(user?.id === podcastData.host?.user_id);

        // Fetch related podcasts
        const { data: relatedData } = await supabase
          .from('podcasts')
          .select(`
            *,
            host:profiles(*)
          `)
          .eq('specialty', podcastData.specialty)
          .neq('id', podcastId)
          .limit(4);

        setRelatedPodcasts(relatedData || []);
      } catch (error) {
        console.error('Error fetching podcast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [podcastId, user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const setAudioEnded = () => {
      setIsPlaying(false);
    };

    // Events
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', setAudioEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', setAudioEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 15;
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 15;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Episode not found</h1>
            <Link to="/zonecast" className="mt-4 text-primary-500 hover:underline">
              Return to ZoneCast
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if podcast is pending review
  const isPending = podcast.status === 'pending';

  return (
    <>
      <Helmet>
        <title>{podcast.title} | ZoneCast - Dr.Zone</title>
        <meta name="description" content={podcast.description} />
        <meta property="og:title" content={`${podcast.title} | ZoneCast - Dr.Zone`} />
        <meta property="og:description" content={podcast.description} />
        {podcast.thumbnail_url && <meta property="og:image" content={podcast.thumbnail_url} />}
        <meta property="og:type" content="music.song" />
        <meta property="og:audio" content={podcast.audio_url} />
        <meta name="keywords" content={`medical podcast, ${podcast.specialty}, medical education, dr zone, ${podcast.host?.specialty}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {isPending && isCreator && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Review Pending</h3>
                  <div className="mt-2 text-sm">
                    <p>
                      This podcast is currently under review. It will be visible to others once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Audio Player */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  <img
                    src={podcast.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                    alt={podcast.title}
                    className="w-full md:w-48 h-48 object-cover rounded-lg mb-4 md:mb-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{podcast.title}</h1>
                      {isCreator && (
                        <Link 
                          to={`/edit-media/${podcast.id}`}
                          className="btn-outline btn-sm flex items-center space-x-1"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <User size={16} className="mr-1" />
                      <span className="mr-3">{podcast.host?.full_name}</span>
                      {podcast.specialty && (
                        <>
                          <Tag size={16} className="mr-1" />
                          <span>{podcast.specialty}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{podcast.description}</p>
                  </div>
                </div>

                <audio ref={audioRef} src={podcast.audio_url} preload="metadata" className="hidden" />

                <div className="mt-6">
                  {/* Progress bar */}
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleTimeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />

                  {/* Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleMute}
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
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
                        className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={skipBackward}
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <SkipBack size={24} />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="rounded-full bg-primary-500 p-3 text-white hover:bg-primary-600"
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                      <button
                        onClick={skipForward}
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <SkipForward size={24} />
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <Share2 size={20} />
                      </button>
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <BookmarkPlus size={20} />
                      </button>
                      <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Episode Info */}
              <div className="mt-6 space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h2 className="text-lg font-semibold mb-4">About This Episode</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{podcast.description}</p>
                </div>

                {podcast.show_notes && (
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Show Notes</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{podcast.show_notes}</p>
                    </div>
                  </div>
                )}

                {podcast.transcript && (
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Transcript</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{podcast.transcript}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Episodes */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Related Episodes</h2>
              <div className="space-y-4">
                {relatedPodcasts.map((relatedPodcast) => (
                  <Link
                    key={relatedPodcast.id}
                    to={`/zonecast/episodes/${relatedPodcast.id}`}
                    className="block group"
                  >
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={relatedPodcast.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                          alt={relatedPodcast.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <Play size={24} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {relatedPodcast.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {relatedPodcast.host?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {relatedPodcast.duration}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-primary-50 p-6">
                <h3 className="font-semibold text-primary-900 mb-2">Subscribe to ZoneCast</h3>
                <p className="text-primary-700 text-sm mb-4">
                  Never miss an episode. Subscribe to get notified about new medical podcasts.
                </p>
                <Link
                  to="/auth"
                  className="block w-full rounded-md bg-primary-500 px-4 py-2 text-center text-white hover:bg-primary-600"
                >
                  Join Dr.Zone
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PodcastPage;