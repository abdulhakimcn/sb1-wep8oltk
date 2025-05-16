import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus, Search, Filter, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Conference {
  id: string;
  title: string;
  description: string;
  specialty: string;
  city: string;
  country: string;
  date: string;
  time: string;
  organizer_email: string;
  image_url?: string;
  link?: string;
}

const ConferenceZonePage: React.FC = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setConferences(data || []);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conference Zone</h1>
            <p className="mt-2 text-gray-600">Discover and join medical conferences worldwide</p>
          </div>
          <Link
            to="/conference/create"
            className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
          >
            <Plus size={20} />
            <span>Create Conference</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conferences..."
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* Conferences Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {conferences.map((conference) => (
              <div key={conference.id} className="rounded-lg bg-white p-6 shadow-md">
                {conference.image_url && (
                  <img
                    src={conference.image_url}
                    alt={conference.title}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="mb-2 text-xl font-semibold">{conference.title}</h3>
                <p className="mb-4 text-gray-600 line-clamp-2">{conference.description}</p>
                
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-2" />
                    <span>{new Date(conference.date).toLocaleDateString()} at {conference.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-2" />
                    <span>{conference.city}, {conference.country}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Tag size={18} className="mr-2" />
                    <span>{conference.specialty}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    Learn More
                  </button>
                  <a
                    href={conference.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    Join Conference
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConferenceZonePage;