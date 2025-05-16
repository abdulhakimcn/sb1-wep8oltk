import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, MoreVertical, Bookmark, Globe, Users, Lock, Facebook, Edit, Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Post as PostType } from '../lib/types';
import { motion } from 'framer-motion';
import VerificationBadge from './VerificationBadge';
import { useTranslation } from 'react-i18next';
import SharePostModal from './SharePostModal';
import EditPostModal from './EditPostModal';
import { format } from 'date-fns';

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

const Post: React.FC<PostProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

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

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would save to the database
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    // In a real app, this would save the comment to the database
    setCommentText('');
    setShowComments(false);
  };

  const handleShareOnFacebook = () => {
    setShowShareModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowOptions(false);
  };

  // Only show share options for public posts
  const canShare = post.privacy === 'public';
  
  // Only allow editing for the post owner
  const canEdit = user?.id === post.user_id;
  
  // Format the updated time
  const getUpdatedTime = () => {
    if (!post.updated_at || post.updated_at === post.created_at) return null;
    
    const updatedDate = new Date(post.updated_at);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return 'Edited ' + (diffInMinutes < 5 ? 'just now' : `${diffInMinutes} minutes ago`);
    } else if (diffInMinutes < 1440) { // less than a day
      return 'Edited ' + Math.floor(diffInMinutes / 60) + ' hours ago';
    } else {
      return 'Edited on ' + format(updatedDate, 'MMM d, yyyy');
    }
  };
  
  const updatedTimeText = getUpdatedTime();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow mb-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-medium text-primary-600">
              {post.profiles?.username?.substring(0, 2).toUpperCase() || 'DR'}
            </span>
          </div>
          <div>
            <div className="flex items-center">
              <p className="font-medium">{post.profiles?.full_name || 'Doctor'}</p>
              {post.profiles?.is_verified && (
                <VerificationBadge size="sm" className="ml-1" />
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span>{post.profiles?.specialty}</span>
              <span className="mx-1">•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span className="mx-1">•</span>
              {post.privacy === 'public' && (
                <span className="flex items-center">
                  <Globe size={12} className="mr-0.5" />
                  {t('post.privacy.public')}
                </span>
              )}
              {post.privacy === 'users' && (
                <span className="flex items-center">
                  <Users size={12} className="mr-0.5" />
                  {t('post.privacy.users')}
                </span>
              )}
              {post.privacy === 'connections' && (
                <span className="flex items-center">
                  <Lock size={12} className="mr-0.5" />
                  {t('post.privacy.connections')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={() => setShowOptions(!showOptions)}
          >
            <MoreVertical size={20} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit size={16} className="mr-2 text-gray-500" />
                    Edit Post
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSaved(!isSaved);
                    setShowOptions(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Bookmark size={16} className="mr-2 text-gray-500" fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Unsave Post' : 'Save Post'}
                </button>
                {canShare && (
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setShowOptions(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Share2 size={16} className="mr-2 text-gray-500" />
                    Share Post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="mb-4 rounded-lg w-full object-cover"
          />
        )}
        
        {updatedTimeText && (
          <div className="mb-3 flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            <span>{updatedTimeText}</span>
          </div>
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
            <button 
              onClick={handleComment}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-500"
            >
              <MessageCircle size={18} />
              <span>{post.comments_count}</span>
            </button>
            <button 
              onClick={handleShareOnFacebook}
              className={`flex items-center space-x-1 text-sm ${
                canShare 
                  ? 'text-gray-600 hover:text-primary-500' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title={canShare ? 'Share' : 'Only public posts can be shared'}
              disabled={!canShare}
            >
              <Share2 size={18} />
              <span>{t('common.share')}</span>
            </button>
          </div>
          <button 
            onClick={handleSave}
            className="text-sm text-gray-600 hover:text-primary-500"
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {showComments && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {user?.email?.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('common.writeComment')}
                  className="w-full rounded-full border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                className="rounded-full bg-primary-500 p-1.5 text-white hover:bg-primary-600 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <SharePostModal post={post} onClose={() => setShowShareModal(false)} />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal 
          post={post} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={onUpdate} 
        />
      )}
    </motion.div>
  );
};

// Send icon component
const Send = ({ size, className }: { size: number, className?: string }) => (
  <svg 
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
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default Post;