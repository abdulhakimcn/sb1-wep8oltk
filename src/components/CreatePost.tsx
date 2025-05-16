import React, { useState, useEffect } from 'react';
import { ImagePlus, Paperclip, MapPin, Send, X, Globe, Users, Lock, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MediaUpload from './MediaUpload';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(() => {
    // Load draft from localStorage on component mount
    const savedDraft = localStorage.getItem('postDraft');
    return savedDraft || '';
  });
  const [imageUrl, setImageUrl] = useState(() => {
    // Load image URL from localStorage
    const savedImageUrl = localStorage.getItem('postImageUrl');
    return savedImageUrl || '';
  });
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState(() => {
    // Load specialty from localStorage
    const savedSpecialty = localStorage.getItem('postSpecialty');
    return savedSpecialty || '';
  });
  const [language, setLanguage] = useState(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('postLanguage') || i18n.language;
    return savedLanguage || 'en';
  });
  const [privacy, setPrivacy] = useState<'public' | 'users' | 'connections'>(() => {
    // Load privacy setting from localStorage
    const savedPrivacy = localStorage.getItem('postPrivacy');
    return (savedPrivacy as 'public' | 'users' | 'connections') || 'users';
  });
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const privacyOptions = [
    { value: 'public', label: t('post.privacy.public'), icon: Globe, description: t('post.privacy.publicDesc') },
    { value: 'users', label: t('post.privacy.users'), icon: Users, description: t('post.privacy.usersDesc') },
    { value: 'connections', label: t('post.privacy.connections'), icon: Lock, description: t('post.privacy.connectionsDesc') }
  ] as const;

  // Save draft to localStorage whenever content changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('postDraft', content);
      localStorage.setItem('postImageUrl', imageUrl);
      localStorage.setItem('postSpecialty', specialty);
      localStorage.setItem('postLanguage', language);
      localStorage.setItem('postPrivacy', privacy);
    }, 500); // Debounce save to avoid too frequent writes

    return () => clearTimeout(saveTimeout);
  }, [content, imageUrl, specialty, language, privacy]);

  const clearDraft = () => {
    localStorage.removeItem('postDraft');
    localStorage.removeItem('postImageUrl');
    localStorage.removeItem('postSpecialty');
    localStorage.removeItem('postLanguage');
    localStorage.removeItem('postPrivacy');
    setContent('');
    setImageUrl('');
    setSpecialty('');
    setLanguage(i18n.language);
    setPrivacy('users');
    setShowMediaUpload(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    
    setLoading(true);
    try {
      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            profile_id: profile.id,
            content: content.trim(),
            image_url: imageUrl.trim() || null,
            specialty: specialty || null,
            language,
            privacy
          }
        ]);

      if (error) throw error;

      clearDraft();
      onPostCreated();
      setExpanded(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUploadComplete = (url: string, type: 'image' | 'video' | 'file') => {
    if (type === 'image') {
      setImageUrl(url);
    }
    setShowMediaUpload(false);
  };

  const isArabic = i18n.language === 'ar';
  const placeholder = isArabic 
    ? "ما الذي يدور في ذهنك، دكتور؟"
    : "What's on your mind, Doctor?";

  return (
    <div className="rounded-xl bg-white p-6 shadow-md mb-6 transition-all hover:shadow-lg">
      <div className="flex space-x-3">
        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-600">
            {user?.email?.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          {!expanded ? (
            <div 
              onClick={() => setExpanded(true)}
              className="w-full rounded-xl border-2 border-primary-100 px-5 py-3.5 text-base text-gray-500 cursor-pointer hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
            >
              <span className="font-medium">{placeholder}</span>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  className="w-full rounded-lg border-2 border-primary-200 px-4 py-3 text-base placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder={t('myZone.sharePrompt')}
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                
                <div className="mt-3 flex flex-wrap gap-3">
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">{t('post.selectSpecialty')}</option>
                    <option value="cardiology">{t('post.specialties.cardiology')}</option>
                    <option value="neurology">{t('post.specialties.neurology')}</option>
                    <option value="pediatrics">{t('post.specialties.pediatrics')}</option>
                    <option value="oncology">{t('post.specialties.oncology')}</option>
                    <option value="surgery">{t('post.specialties.surgery')}</option>
                  </select>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                  </select>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                      className="flex items-center space-x-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {React.createElement(
                        privacyOptions.find(opt => opt.value === privacy)?.icon || Users,
                        { size: 16, className: "mr-1" }
                      )}
                      <span>{privacyOptions.find(opt => opt.value === privacy)?.label}</span>
                      <ChevronDown size={14} className={`transition-transform ${showPrivacyDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showPrivacyDropdown && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {privacyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setPrivacy(option.value);
                              setShowPrivacyDropdown(false);
                            }}
                            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            <option.icon size={16} className="mr-2" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {imageUrl && (
                  <div className="mt-3 relative">
                    <div className="rounded-lg border border-gray-200 p-2">
                      <div className="relative">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="rounded-lg max-h-40 w-auto"
                          onError={() => setImageUrl('')}
                        />
                        <button 
                          onClick={() => setImageUrl('')}
                          className="absolute top-1 right-1 rounded-full bg-gray-800/70 p-1 text-white hover:bg-gray-900/70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showMediaUpload && (
                  <div className="mt-3">
                    <MediaUpload 
                      onUploadComplete={handleMediaUploadComplete}
                      allowedTypes={['image']}
                    />
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowMediaUpload(!showMediaUpload)}
                      className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      title="Add Photo"
                    >
                      <ImagePlus size={20} className="text-blue-500" />
                    </button>
                    <button 
                      className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      title="Add Attachment"
                    >
                      <Paperclip size={20} className="text-green-500" />
                    </button>
                    <button 
                      className="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      title="Add Location"
                    >
                      <MapPin size={20} className="text-red-500" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpanded(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!content.trim() || loading}
                      className="flex items-center space-x-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      <Send size={16} />
                      <span>{loading ? t('common.posting') : t('common.post')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;