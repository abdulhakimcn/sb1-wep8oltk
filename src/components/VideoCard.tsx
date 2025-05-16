import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Lock, Heart, MessageSquare, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Video } from '../lib/types';

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
  featured?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, featured = false }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/zonetube/videos/${video.id}`} className="block h-full">
        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg h-full flex flex-col">
          <div className="relative">
            <img 
              src={video.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'} 
              alt={video.title}
              className={`w-full object-cover ${featured ? 'h-64' : 'h-48'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <div className="w-full">
                {featured && (
                  <div className="mb-2 inline-flex rounded-full bg-primary-500 px-2 py-1 text-xs font-medium text-white">
                    Featured
                  </div>
                )}
                <h4 className={`line-clamp-2 font-semibold text-white ${featured ? 'text-xl mb-2' : 'text-sm'}`}>
                  {video.title}
                </h4>
                {featured && (
                  <p className="text-white/80 line-clamp-2 text-sm mb-2">{video.description}</p>
                )}
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex space-x-1">
              {video.is_premium && (
                <span className="inline-flex items-center rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                  <Lock size={10} className="mr-1" />
                  Premium
                </span>
              )}
              {video.category && (
                <span className="inline-flex items-center rounded-full bg-primary-500/80 px-2 py-1 text-xs font-medium text-white">
                  {video.category}
                </span>
              )}
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                onPlay();
              }}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="rounded-full bg-white/90 p-4 shadow-lg transform transition-transform hover:scale-110">
                <Play size={24} className="text-primary-500 ml-1" fill="#0073b6" />
              </div>
            </button>
            
            <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
              {video.duration}
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              {!featured && (
                <h4 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900">{video.title}</h4>
              )}
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600">
                    {video.creator?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{video.creator?.full_name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Eye size={14} className="mr-1" />
                  {video.views_count || 0}
                </span>
                <span className="flex items-center">
                  <Heart size={14} className="mr-1" />
                  {video.likes_count || 0}
                </span>
                <span className="flex items-center">
                  <MessageSquare size={14} className="mr-1" />
                  {video.comments_count || 0}
                </span>
              </div>
              <span>{new Date(video.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VideoCard;