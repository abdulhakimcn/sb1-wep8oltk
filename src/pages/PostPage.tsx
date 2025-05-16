import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MessageCircle, Heart, Share2, Bookmark, User, Edit, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import type { Post as PostType } from '../lib/types';
import SharePostModal from '../components/SharePostModal';
import EditPostModal from '../components/EditPostModal';
import { format } from 'date-fns';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_profile_id_fkey(*)
          `)
          .eq('id', postId)
          .single();

        if (error) throw error;
        
        // Check if post is public or user has access
        if (data.privacy === 'public' || 
            (user && (data.privacy === 'users' || 
                     (data.privacy === 'connections' && data.user_id === user.id)))) {
          setPost(data);
          setLikesCount(data.likes_count || 0);
          
          // Check if user has liked this post
          if (user) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .single();
              
            setIsLiked(!!likeData);
          }
          
          // Fetch comments
          const { data: commentsData } = await supabase
            .from('post_comments')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false });
            
          setComments(commentsData || []);
        } else {
          setError('You do not have permission to view this post');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Post not found or you do not have permission to view it');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert([{ post_id: post.id, user_id: user.id }]);
          
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!user || !post || !commentText.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: post.id,
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

  const handleUpdate = async () => {
    if (!postId) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_profile_id_fkey(*)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  // Format the updated time
  const getUpdatedTime = () => {
    if (!post?.updated_at || post.updated_at === post.created_at) return null;
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Post not found'}</h1>
            <Link to="/myzone" className="btn-primary">
              Return to MyZone
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const updatedTimeText = getUpdatedTime();
  const canEdit = user?.id === post.user_id;

  return (
    <>
      <Helmet>
        <title>{post.profiles?.full_name || 'Doctor'}'s Post | Dr.Zone AI</title>
        <meta name="description" content={post.content.substring(0, 160)} />
        <meta property="og:title" content={`${post.profiles?.full_name || 'Doctor'}'s Post | Dr.Zone AI`} />
        <meta property="og:description" content={post.content.substring(0, 160)} />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/post/${post.id}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link to="/myzone" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" />
                <span>Back to Feed</span>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {post.profiles?.username?.substring(0, 2).toUpperCase() || 'DR'}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">{post.profiles?.full_name || 'Doctor'}</h1>
                      <p className="text-sm text-gray-500">
                        {post.profiles?.specialty} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-gray-800 whitespace-pre-wrap text-lg">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="mt-4 rounded-lg w-full object-cover"
                    />
                  )}
                  
                  {updatedTimeText && (
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>{updatedTimeText}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex space-x-6">
                    <button 
                      onClick={handleLike}
                      className={`flex items-center space-x-2 text-gray-600 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{likesCount} Likes</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-500">
                      <MessageCircle size={20} />
                      <span>{post.comments_count} Comments</span>
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => post.privacy === 'public' && setShowShareModal(true)}
                      className={`flex items-center space-x-2 ${
                        post.privacy === 'public' 
                          ? 'text-gray-600 hover:text-primary-500' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      title={post.privacy === 'public' ? 'Share' : 'Only public posts can be shared'}
                    >
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                    <button 
                      onClick={() => setIsSaved(!isSaved)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-500"
                    >
                      <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-50 p-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
                
                {user && (
                  <div className="mb-6 flex space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600">
                        {user.email?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={handleComment}
                          disabled={!commentText.trim()}
                          className="btn-primary"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="font-medium text-sm">{comment.profile?.full_name || 'User'}</p>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex space-x-4 mt-1 text-xs text-gray-500">
                            <span>{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                            <button className="hover:text-gray-700">Like</button>
                            <button className="hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && post && (
        <SharePostModal post={post} onClose={() => setShowShareModal(false)} />
      )}

      {showEditModal && post && (
        <EditPostModal 
          post={post} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default PostPage;