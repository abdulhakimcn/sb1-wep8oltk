import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, FileText, MapPin, Users, X } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';

const NewPostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'connections'>('public');

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
            image_url: imageUrl.trim() || null
          }
        ]);

      if (error) throw error;

      navigate('/myzone');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h1 className="text-xl font-semibold">Create Post</h1>
              <button
                onClick={() => navigate('/myzone')}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600">
                    {user?.email?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{user?.email}</span>
                    <button className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200">
                      <div className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>{privacy === 'public' ? 'Public' : 'Connections'}</span>
                      </div>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">Medical Professional</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <textarea
                placeholder="Share your medical insights, research, or experiences..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] w-full resize-none border-0 text-lg focus:outline-none"
              />

              {imageUrl && (
                <div className="relative mt-4 rounded-lg border border-gray-200 p-4">
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={imageUrl}
                    alt="Post"
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Add to Post */}
            <div className="border-t border-gray-200 p-4">
              <div className="rounded-lg border border-gray-200 p-2">
                <h3 className="mb-2 text-sm font-medium">Add to your post</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setImageUrl(imageUrl ? '' : 'https://')}
                    className="flex items-center space-x-2 rounded-md p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Image size={20} className="text-green-500" />
                    <span>Photo</span>
                  </button>
                  <button className="flex items-center space-x-2 rounded-md p-2 text-gray-600 hover:bg-gray-100">
                    <FileText size={20} className="text-blue-500" />
                    <span>Document</span>
                  </button>
                  <button className="flex items-center space-x-2 rounded-md p-2 text-gray-600 hover:bg-gray-100">
                    <MapPin size={20} className="text-red-500" />
                    <span>Location</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Post Button */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                className="w-full rounded-md bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPostPage;