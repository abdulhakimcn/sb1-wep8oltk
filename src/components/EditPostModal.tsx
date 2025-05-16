import React, { useState } from 'react';
import { X, Save, Image, FileText, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/types';
import { useTranslation } from 'react-i18next';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onUpdate }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold">Edit Post</h3>
          <button
            onClick={onClose}
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
                {post.profiles?.username?.substring(0, 2).toUpperCase() || 'DR'}
              </span>
            </div>
            <div>
              <p className="font-medium">{post.profiles?.full_name || 'Doctor'}</p>
              <p className="text-xs text-gray-500">
                {post.profiles?.specialty} • Editing post
              </p>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:outline-none"
            placeholder="Update your post..."
          />

          {imageUrl && (
            <div className="mt-4 relative rounded-lg border border-gray-200 p-4">
              <button
                onClick={() => setImageUrl('')}
                className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
              >
                <X size={16} />
              </button>
              <img
                src={imageUrl}
                alt="Post"
                className="rounded-lg max-h-40 w-auto"
                onError={() => setImageUrl('')}
              />
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
              placeholder="Enter image URL (optional)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100">
                <Image size={20} className="text-green-500" />
                <span>Photo</span>
              </button>
              <button className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100">
                <FileText size={20} className="text-blue-500" />
                <span>Document</span>
              </button>
              <button className="flex items-center space-x-1 rounded-md p-2 text-gray-600 hover:bg-gray-100">
                <MapPin size={20} className="text-red-500" />
                <span>Location</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditPostModal;