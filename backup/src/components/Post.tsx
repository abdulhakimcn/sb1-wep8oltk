import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, MoreVertical } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Post as PostType } from '../lib/types';

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

const Post: React.FC<PostProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert([{ post_id: post.id, user_id: user.id }]);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-medium text-primary-600">
              {post.profile?.username?.substring(0, 2).toUpperCase() || 'DR'}
            </span>
          </div>
          <div>
            <p className="font-medium">{post.profile?.full_name || 'Doctor'}</p>
            <p className="text-xs text-gray-500">
              {post.profile?.specialty} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>

      <div>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="mb-4 rounded-lg"
          />
        )}
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm ${
                post.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} />
              <span>{post.likes_count}</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
              <MessageCircle size={18} />
              <span>{post.comments_count}</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
          <button className="text-sm text-gray-600 hover:text-primary-500">Save</button>
        </div>
      </div>
    </div>
  );
};

export default Post;