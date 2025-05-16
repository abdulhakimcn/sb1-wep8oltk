import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon, Video, Mic, Users, BookOpen, Briefcase, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'podcasts' | 'doctors' | 'research' | 'jobs'>('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      let data: any[] = [];
      
      // Search based on active tab
      if (activeTab === 'all' || activeTab === 'videos') {
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select(`
            *,
            creator:profiles(*)
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(activeTab === 'all' ? 3 : 10);
        
        if (!videosError && videos) {
          data = [...data, ...videos.map(v => ({ ...v, type: 'video' }))];
        }
      }
      
      if (activeTab === 'all' || activeTab === 'podcasts') {
        const { data: podcasts, error: podcastsError } = await supabase
          .from('podcasts')
          .select(`
            *,
            host:profiles(*)
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(activeTab === 'all' ? 3 : 10);
        
        if (!podcastsError && podcasts) {
          data = [...data, ...podcasts.map(p => ({ ...p, type: 'podcast' }))];
        }
      }
      
      if (activeTab === 'all' || activeTab === 'doctors') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${query}%,specialty.ilike.%${query}%,bio.ilike.%${query}%`)
          .eq('type', 'doctor')
          .limit(activeTab === 'all' ? 3 : 10);
        
        if (!profilesError && profiles) {
          data = [...data, ...profiles.map(p => ({ ...p, type: 'doctor' }))];
        }
      }
      
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
    }
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold">No results found</h3>
          <p className="mt-2 text-gray-600">Try different keywords or filters</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.map((result) => {
          if (result.type === 'video') {
            return (
              <Link 
                key={`video-${result.id}`} 
                to={`/zonetube/videos/${result.id}`}
                className="block rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex space-x-4">
                  <div className="relative h-24 w-40 flex-shrink-0">
                    <img 
                      src={result.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'} 
                      alt={result.title}
                      className="h-full w-full object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-primary-500 p-1">
                      <Video size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{result.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className="mr-2">{result.creator?.full_name}</span>
                      <span>{result.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          } else if (result.type === 'podcast') {
            return (
              <Link 
                key={`podcast-${result.id}`} 
                to={`/zonecast/episodes/${result.id}`}
                className="block rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex space-x-4">
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <img 
                      src={result.thumbnail_url || 'https://images.pexels.com/photos/4021521/pexels-photo-4021521.jpeg'} 
                      alt={result.title}
                      className="h-full w-full object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-primary-500 p-1">
                      <Mic size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{result.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className="mr-2">{result.host?.full_name}</span>
                      <span>{result.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          } else if (result.type === 'doctor') {
            return (
              <Link 
                key={`doctor-${result.id}`} 
                to={`/profile/${result.username}`}
                className="block rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex space-x-4">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-primary-600">
                      {result.full_name?.substring(0, 2).toUpperCase() || 'DR'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.full_name}</h3>
                    <p className="text-sm text-primary-600">{result.specialty}</p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{result.bio}</p>
                  </div>
                </div>
              </Link>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Search | Dr.Zone</title>
        <meta name="description" content="Search for medical videos, podcasts, doctors, and more on Dr.Zone." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Search</h1>
            <p className="mt-2 text-gray-600">Find videos, podcasts, doctors, and more</p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for videos, podcasts, doctors..."
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 focus:border-primary-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary-500 px-4 py-1 text-white hover:bg-primary-600"
              >
                {t('common.search')}
              </button>
            </div>
          </form>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'videos'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Video size={16} className={activeTab === 'videos' ? 'text-white' : 'text-gray-500'} />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('podcasts')}
              className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'podcasts'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Mic size={16} className={activeTab === 'podcasts' ? 'text-white' : 'text-gray-500'} />
              <span>Podcasts</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'doctors'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={16} className={activeTab === 'doctors' ? 'text-white' : 'text-gray-500'} />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'research'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={16} className={activeTab === 'research' ? 'text-white' : 'text-gray-500'} />
              <span>Research</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === 'jobs'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Briefcase size={16} className={activeTab === 'jobs' ? 'text-white' : 'text-gray-500'} />
              <span>Jobs</span>
            </button>
            <button className="flex items-center space-x-1 rounded-full px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-100">
              <Filter size={16} className="text-gray-500" />
              <span>Filters</span>
            </button>
          </div>

          {initialQuery ? (
            <>
              <h2 className="mb-4 text-xl font-semibold">
                Search results for "{initialQuery}"
              </h2>
              {renderResults()}
            </>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <SearchIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold">Search for content</h3>
              <p className="mt-2 text-gray-600">Enter keywords to find videos, podcasts, doctors, and more</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;