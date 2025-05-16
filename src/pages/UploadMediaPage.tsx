import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Video, Mic, Upload, X, Clock, Tag, FileImage, Globe, Loader, DollarSign } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { uploadFile, uploadMedia } from '../lib/media';

const UploadMediaPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'podcast'>('video');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    mediaUrl: '',
    duration: '',
    category: '',
    specialty: '',
    language: i18n.language || 'en',
    isPremium: false,
    price: 0,
    showNotes: '',
    transcript: '',
    tags: [] as string[]
  });

  // File references
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  
  // Selected files
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Preview URLs
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.mediaUrl && !mediaFile) {
      alert(`Please provide a ${mediaType} file or URL`);
      return;
    }
    
    setLoading(true);
    try {
      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Upload files if selected
      let mediaUrl = formData.mediaUrl;
      let thumbnailUrl = formData.thumbnailUrl;

      if (mediaFile) {
        setUploading(true);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 5;
          });
        }, 300);
        
        const bucket = mediaType === 'video' ? 'videos' : 'podcasts';
        const uploadedUrl = await uploadFile(mediaFile, bucket);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (uploadedUrl) {
          mediaUrl = uploadedUrl;
        }
        setUploading(false);
      }

      if (thumbnailFile) {
        setUploading(true);
        const uploadedUrl = await uploadFile(thumbnailFile, 'thumbnails');
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        }
        setUploading(false);
      }

      // Create media record
      const result = await uploadMedia(profile.id, {
        title: formData.title,
        description: formData.description,
        type: mediaType,
        fileUrl: mediaUrl,
        thumbnailUrl: thumbnailUrl,
        duration: formData.duration,
        category: mediaType === 'video' ? formData.category : undefined,
        specialty: mediaType === 'podcast' ? formData.specialty : undefined,
        language: formData.language,
        isPremium: mediaType === 'video' ? formData.isPremium : false,
        price: mediaType === 'video' && formData.isPremium ? formData.price : undefined,
        tags: formData.tags,
        transcript: mediaType === 'podcast' ? formData.transcript : undefined,
        showNotes: mediaType === 'podcast' ? formData.showNotes : undefined
      });

      if (!result.success) throw result.error;
      
      // Navigate to appropriate page
      navigate(mediaType === 'video' ? '/zonetube' : '/zonecast');
    } catch (error) {
      console.error(`Error uploading ${mediaType}:`, error);
      alert(`Error uploading ${mediaType}. Please try again.`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag]
        });
        input.value = '';
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setMediaPreviewUrl(url);
      
      // If it's a video, try to get duration
      if (mediaType === 'video' && file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = video.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          setFormData({
            ...formData,
            duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          });
        };
        video.src = url;
      }
      
      // If it's an audio file, try to get duration
      if (mediaType === 'podcast' && file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          setFormData({
            ...formData,
            duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          });
        };
        audio.src = url;
      }
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setThumbnailPreviewUrl(url);
    }
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [mediaPreviewUrl, thumbnailPreviewUrl]);

  return (
    <>
      <Helmet>
        <title>Upload Media | Dr.Zone</title>
        <meta name="description" content="Upload videos or podcasts to share with the medical community." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Upload Media</h1>
              <p className="mt-2 text-gray-600">Share your knowledge with the medical community</p>
            </div>

            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium ${
                    mediaType === 'video'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Video size={18} className="mr-2" />
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('podcast')}
                  className={`relative -ml-px inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium ${
                    mediaType === 'podcast'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Mic size={18} className="mr-2" />
                  Podcast
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder={`Enter ${mediaType} title`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                  placeholder={`Describe your ${mediaType}`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {mediaType === 'video' ? 'Video File' : 'Audio File'}
                  </label>
                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label
                          htmlFor="media-file"
                          className="flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          <Upload size={18} className="mr-2 text-gray-500" />
                          <span>Choose {mediaType === 'video' ? 'Video' : 'Audio'}</span>
                        </label>
                        <input
                          id="media-file"
                          type="file"
                          ref={mediaFileRef}
                          onChange={handleMediaFileChange}
                          accept={mediaType === 'video' ? 'video/*' : 'audio/*'}
                          className="hidden"
                        />
                      </div>
                      {mediaFile && (
                        <span className="ml-2 text-sm text-gray-500 truncate max-w-[150px]">
                          {mediaFile.name}
                        </span>
                      )}
                    </div>
                    
                    {mediaPreviewUrl && mediaType === 'video' && (
                      <div className="mt-2 relative rounded-md overflow-hidden h-32">
                        <video 
                          src={mediaPreviewUrl} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      </div>
                    )}
                    
                    {mediaPreviewUrl && mediaType === 'podcast' && (
                      <div className="mt-2 relative rounded-md overflow-hidden">
                        <audio 
                          src={mediaPreviewUrl} 
                          className="w-full"
                          controls
                        />
                      </div>
                    )}
                    
                    <p className="mt-1 text-xs text-gray-500">Or provide a URL:</p>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                      placeholder={`Enter ${mediaType} URL`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
                  <div className="mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label
                          htmlFor="thumbnail-file"
                          className="flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          <FileImage size={18} className="mr-2 text-gray-500" />
                          <span>Choose Image</span>
                        </label>
                        <input
                          id="thumbnail-file"
                          type="file"
                          ref={thumbnailFileRef}
                          onChange={handleThumbnailFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      {thumbnailFile && (
                        <span className="ml-2 text-sm text-gray-500 truncate max-w-[150px]">
                          {thumbnailFile.name}
                        </span>
                      )}
                    </div>
                    
                    {thumbnailPreviewUrl && (
                      <div className="mt-2 relative rounded-md overflow-hidden h-32">
                        <img 
                          src={thumbnailPreviewUrl} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="mt-1 text-xs text-gray-500">Or provide a URL:</p>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                      placeholder="Enter thumbnail URL"
                    />
                  </div>
                </div>
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
                    {mediaType === 'video' ? 'Category' : 'Specialty'}
                  </label>
                  <div className="mt-1 flex items-center">
                    <Tag size={20} className="mr-2 text-gray-400" />
                    <select
                      value={mediaType === 'video' ? formData.category : formData.specialty}
                      onChange={(e) => 
                        mediaType === 'video' 
                          ? setFormData({ ...formData, category: e.target.value })
                          : setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select {mediaType === 'video' ? 'Category' : 'Specialty'}</option>
                      {mediaType === 'video' ? (
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
              {mediaType === 'video' && (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Premium Video</label>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={formData.isPremium}
                          onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary-300"></div>
                      </label>
                    </div>
                    {formData.isPremium && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <div className="mt-1 relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required={formData.isPremium}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            className="block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <input
                      type="text"
                      placeholder="Add tags (press Enter or comma to add)"
                      onKeyDown={handleTagInput}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none"
                    />
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
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Podcast-specific fields */}
              {mediaType === 'podcast' && (
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

              {uploading && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex items-center">
                    <Loader size={20} className="mr-2 animate-spin text-primary-500" />
                    <p className="text-sm text-primary-700">Uploading files... {uploadProgress}%</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-primary-500" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(mediaType === 'video' ? '/zonetube' : '/zonecast')}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading || (!formData.mediaUrl && !mediaFile)}
                  className="rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : `Upload ${mediaType === 'video' ? 'Video' : 'Podcast'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadMediaPage;