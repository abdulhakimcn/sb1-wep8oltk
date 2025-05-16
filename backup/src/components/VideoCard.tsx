import React from 'react';
import { Play, Clock, Lock } from 'lucide-react';
import type { Video } from '../lib/types';
import { Link } from 'react-router-dom';

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md">
      <div className="relative">
        <img 
          src={video.thumbnail_url} 
          alt={video.title}
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          {video.is_premium && !video.has_purchased ? (
            <div className="flex flex-col items-center">
              <Lock size={24} className="text-white" />
              <span className="mt-2 rounded-full bg-primary-500 px-3 py-1 text-sm font-medium text-white">
                ${video.price}
              </span>
            </div>
          ) : (
            <button 
              onClick={onPlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-80 shadow-lg transition-transform hover:scale-110"
            >
              <Play size={24} className="text-primary-500 ml-1" fill="#0073b6" />
            </button>
          )}
        </div>
        <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white">
          {video.duration}
        </div>
      </div>
      <div className="p-4">
        <h4 className="mb-2 line-clamp-2 text-sm font-semibold">{video.title}</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {video.creator?.full_name?.substring(0, 2).toUpperCase() || 'DR'}
              </span>
            </div>
            <span className="text-xs text-gray-600">{video.creator?.full_name}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
          <span>{video.views_count} views</span>
          <span>•</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;