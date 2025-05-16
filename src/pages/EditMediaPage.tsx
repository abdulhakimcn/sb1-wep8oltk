import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Save, ArrowLeft, Clock, Tag, Globe, Loader, Video, Mic, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const EditMediaPage: React.FC = () => {
  const { mediaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    category: '',
    specialty: '',
    language: '',
    tags: [] as string[],
    showNotes: '',
    transcript: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      if (!mediaId || !user) return;
      
      try {
        // First try to fetch from the media table
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select(`
            *,
            creator:profiles(*)
          `)
          .eq('id', mediaId)
          .single();

        if (!mediaError && mediaData) {
          setMedia(mediaData);
          setFormData({
            title: mediaData.title || '',
            description: mediaData.description || '',
            duration: mediaData.duration || '',
            category: mediaData.category || '',
            specialty: mediaData.specialty || '',
            language: mediaData.language || '',
            tags: mediaData.tags || [],
            showNotes: mediaData.show_notes || '',
            transcript: mediaData.transcript || ''
          });
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
          .eq('id', mediaId)
          .single();

        if (!videoError && videoData) {
          setMedia({...videoData, type: 'video'});
          setFormData({
            title: videoData.title || '',
            description: videoData.description || '',
            duration: videoData.duration || '',
            category: videoData.category || '',
            specialty: '',
            language: videoData.language || '',
            tags: videoData.tags || [],
            showNotes: '',
            transcript: ''
          });
          setLoading(false);
          return;
        }

        // If not found in videos table, try podcasts table
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            *,
            host:profiles(*)
          `)
          .eq('id', mediaId)
          .single();

        if (!podcastError && podcastData) {
          setMedia({...podcastData, type: 'podcast', creator: podcastData.host});
          setFormData({
            title: podcastData.title || '',
            description: podcastData.description || '',
            duration: podcastData.duration || '',
            category: '',
            specialty: podcastData.specialty || '',
            language: podcastData.language || '',
            tags: [],
            showNotes: podcastData.show_notes || '',
            transcript: podcastData.transcript || ''
          });
          setLoading(false);
          return;
        }

        // If not found in any table
        setError('Media not found');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media:', error);
        setError('Error fetching media');
        setLoading(false);
      }
    };

    fetchMedia();
  }, [mediaId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !media) return;
    
    setSaving(true);
    try {
      // Check if user has permission to edit
      const isCreator = media.creator?.user_id === user.id;
      if (!isCreator) {
        throw new Error('You do not have permission to edit this media');
      }

      // Update the appropriate table based on media type
      if (media.type === 'video') {
        // Try to update in the media table first
        if ('creator_id' in media) {
          const { error } = await supabase
            .from('media')
            .update({
              title: formData.title,
              description: formData.description,
              duration: formData.duration,
              category: formData.category,
              language: formData.language,
              tags: formData.tags,
              status: 'pending' // Set to pending for review
            })
            .eq('id', mediaId);

          if (error) throw error;
        } else {
          // Update in the videos table
          const { error } = await supabase
            .from('videos')
            .update({
              title: formData.title,
              description: formData.description,
              duration: formData.duration,
              category: formData.category,
              language: formData.language,
              tags: formData.tags
            })
            .eq('id', mediaId);

          if (error) throw error;
        }
        
        navigate(`/zonetube/videos/${mediaId}`);
      } else if (media.type === 'podcast') {
        // Try to update in the media table first
        if ('creator_id' in media) {
          const { error } = await supabase
            .from('media')
            .update({
              title: formData.title,
              description: formData.description,
              duration: formData.duration,
              specialty: formData.specialty,
              language: formData.language,
              transcript: formData.transcript,
              show_notes: formData.showNotes,
              status: 'pending' // Set to pending for review
            })
            .eq('id', mediaId);

          if (error) throw error;
        } else {
          // Update in the podcasts table
          const { error } = await supabase
            .from('podcasts')
            .update({
              title: formData.title,
              description: formData.description,
              duration: formData.duration,
              specialty: formData.specialty,
              language: formData.language,
              transcript: formData.transcript,
              show_notes: formData.showNotes
            })
            .eq('id', mediaId);

          if (error) throw error;
        }
        
        navigate(`/zonecast/episodes/${mediaId}`);
      }
    } catch (error) {
      console.error('Error updating media:', error);
      setError('Error updating media');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Media not found'}</h1>
            <button
              onClick={() => navigate(-1)}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to edit
  const isCreator = media.creator?.user_id === user?.id;
  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Permission Denied</h1>
            <p className="text-gray-600 mb-6">You do not have permission to edit this media.</p>
            <button
              onClick={() => navigate(-1)}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit {media.type === 'video' ? 'Video' : 'Podcast'} | Dr.Zone</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  <span>Back</span>
                </button>
                <h1 className="text-3xl font-bold">
                  Edit {media.type === 'video' ? 'Video' : 'Podcast'}
                </h1>
                <p className="mt-2 text-gray-600">
                  Update your {media.type === 'video' ? 'video' : 'podcast'} information
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {media.type === 'video' ? (
                  <Video size={24} className="text-primary-500" />
                ) : (
                  <Mic size={24} className="text-primary-500" />
                )}
              </div>
            </div>

            {media.status === 'pending' && (
              <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Review Pending</h3>
                    <div className="mt-2 text-sm">
                      <p>
                        This {media.type} is currently under review. It will be visible to others once approved.
                        Editing will reset the review status.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <div className="mt-1 flex items-center">
                    <Clock size={20} className="mr-2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="HH:MM:SS"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {media.type === 'video' ? 'Category' : 'Specialty'}
                  </label>
                  <div className="mt-1 flex items-center">
                    <Tag size={20} className="mr-2 text-gray-400" />
                    <select
                      value={media.type === 'video' ? formData.category : formData.specialty}
                      onChange={(e) => 
                        media.type === 'video' 
                          ? setFormData({ ...formData, category: e.target.value })
                          : setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select {media.type === 'video' ? 'Category' : 'Specialty'}</option>
                      {media.type === 'video' ? (
                        <>
                          <option value="educational">Educational</option>
                          <option value="documentary">Documentary</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="scientific">Scientific</option>
                        </>
                      ) : (
                        <>
                          <option value="cardiology">Cardiology</option>
                          <option value="neurology">Neurology</option>
                          <option value="pediatrics">Pediatrics</option>
                          <option value="surgery">Surgery</option>
                          <option value="internal-medicine">Internal Medicine</option>
                          <option value="general-practice">General Practice</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <div className="mt-1 flex items-center">
                  <Globe size={20} className="mr-2 text-gray-400" />
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>

              {/* Video-specific fields */}
              {media.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add tags (press Enter to add)"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="ml-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center space-x-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Podcast-specific fields */}
              {media.type === 'podcast' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Show Notes</label>
                    <textarea
                      rows={4}
                      value={formData.showNotes}
                      onChange={(e) => setFormData({ ...formData, showNotes: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                      placeholder="Add links, references, and additional information..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transcript</label>
                    <textarea
                      rows={4}
                      value={formData.transcript}
                      onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                      placeholder="Add a transcript of the podcast..."
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMediaPage;