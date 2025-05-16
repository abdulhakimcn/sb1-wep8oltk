import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Filter, Search, Video, Mic, AlertTriangle, Eye, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'podcast';
  file_url: string;
  thumbnail_url?: string;
  duration: string;
  creator_id: string;
  creator?: {
    full_name: string;
    user_id: string;
  };
  created_at: string;
}

const AdminReviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'podcast'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    // In a real app, we would check if the user is an admin
    // For now, we'll just check if they're authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPendingMedia();
  }, [user, selectedType, currentPage]);

  const fetchPendingMedia = async () => {
    try {
      setLoading(true);
      
      // Count total pending items
      let countQuery = supabase
        .from('media')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');
        
      if (selectedType !== 'all') {
        countQuery = countQuery.eq('type', selectedType);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalCount(count || 0);
      
      // Fetch pending items with pagination
      let query = supabase
        .from('media')
        .select(`
          *,
          creator:profiles(full_name, user_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
        
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setPendingMedia(data || []);
    } catch (error) {
      console.error('Error fetching pending media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_reviews')
        .insert({
          media_id: id,
          reviewer_id: user?.id,
          status: 'approved',
          comment: 'Content approved'
        });

      if (error) throw error;
      
      // Remove from list
      setPendingMedia(pendingMedia.filter(item => item.id !== id));
      
      // Update total count
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error approving media:', error);
      alert('Error approving media. Please try again.');
    }
  };

  const handleReject = async (id: string, reason: string = 'Content rejected') => {
    try {
      const { error } = await supabase
        .from('media_reviews')
        .insert({
          media_id: id,
          reviewer_id: user?.id,
          status: 'rejected',
          comment: reason
        });

      if (error) throw error;
      
      // Remove from list
      setPendingMedia(pendingMedia.filter(item => item.id !== id));
      
      // Update total count
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error rejecting media:', error);
      alert('Error rejecting media. Please try again.');
    }
  };

  const filteredMedia = pendingMedia.filter(item => 
    searchTerm === '' || 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.creator?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Helmet>
        <title>Content Review | Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Content Review</h1>
            <p className="mt-2 text-gray-600">Review and approve user-submitted content</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pending content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'video' | 'podcast')}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="podcast">Podcasts</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="space-y-4">
              {filteredMedia.map((item) => (
                <div key={item.id} className="rounded-lg bg-white p-6 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                    <div className="relative w-full md:w-48 h-32 md:h-32 flex-shrink-0 mb-4 md:mb-0">
                      <img
                        src={item.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 rounded-full bg-primary-500 p-1">
                        {item.type === 'video' ? (
                          <Video size={16} className="text-white" />
                        ) : (
                          <Mic size={16} className="text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">{item.title}</h2>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Pending
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <User size={16} className="mr-1" />
                          <span>{item.creator?.full_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          <span>{item.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={item.type === 'video' ? `/zonetube/videos/${item.id}` : `/zonecast/episodes/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          <Eye size={16} className="mr-1" />
                          Preview
                        </a>
                        
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleReject(item.id)}
                          className="inline-flex items-center rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          <XCircle size={16} className="mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold">No pending content</h3>
              <p className="mt-2 text-gray-600">All content has been reviewed</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReviewPage;