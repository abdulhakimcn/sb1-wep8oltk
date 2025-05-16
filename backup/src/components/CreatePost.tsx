import React, { useState, useEffect } from 'react';
import { ImagePlus, SmilePlus, MapPin, Send, X, Globe, Users, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
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
    const savedLanguage = localStorage.getItem('postLanguage');
    return savedLanguage || 'en';
  });
  const [privacy, setPrivacy] = useState<'public' | 'users' | 'connections'>(() => {
    // Load privacy setting from localStorage
    const savedPrivacy = localStorage.getItem('postPrivacy');
    return (savedPrivacy as 'public' | 'users' | 'connections') || 'users';
  });
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
    { value: 'users', label: 'Dr.Zone Users', icon: Users, description: 'Only Dr.Zone users can see this post' },
    { value: 'connections', label: 'Connections', icon: Lock, description: 'Only your connections can see this post' }
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
    setLanguage('en');
    setPrivacy('users');
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
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
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-xs font-medium text-primary-600">
            {user?.email?.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none"
            placeholder="Share something with the medical community..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">Select Specialty</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="oncology">Oncology</option>
              <option value="surgery">Surgery</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
              >
                {React.createElement(
                  privacyOptions.find(opt => opt.value === privacy)?.icon || Users,
                  { size: 16, className: "mr-1" }
                )}
                <span>{privacyOptions.find(opt => opt.value === privacy)?.label}</span>
              </button>
              
              {showPrivacyDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
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
            <div className="mt-2 relative">
              <input
                type="url"
                placeholder="Image URL"
                className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm pr-8"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button 
                onClick={() => setImageUrl('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setImageUrl(imageUrl ? '' : 'https://')}
                className="flex items-center rounded-md p-2 text-gray-600 hover:bg-gray-100"
              >
                <ImagePlus size={18} />
              </button>
              <button className="flex items-center rounded-md p-2 text-gray-600 hover:bg-gray-100">
                <SmilePlus size={18} />
              </button>
              <button className="flex items-center rounded-md p-2 text-gray-600 hover:bg-gray-100">
                <MapPin size={18} />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Send size={16} />
              <span>{loading ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;