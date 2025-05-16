import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Mic, Clock } from 'lucide-react';
import type { Podcast } from '../lib/types';

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  return (
    <Link to={`/zonecast/episodes/${podcast.id}`} className="block group">
      <div className="rounded-lg bg-white shadow transition-shadow hover:shadow-md overflow-hidden">
        <div className="relative">
          <img
            src={podcast.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'}
            alt={podcast.title}
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={32} className="text-white" />
          </div>
          <div className="absolute top-2 left-2 rounded-full bg-primary-500 p-2">
            <Mic size={20} className="text-white" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold line-clamp-2">{podcast.title}</h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-2">{podcast.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{podcast.host?.full_name}</span>
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{podcast.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;