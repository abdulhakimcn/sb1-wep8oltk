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

  // Sample dummy data for conferences
  const dummyConferences: Conference[] = [
    {
      id: 'dummy-conf-1',
      title: 'International Cardiology Summit 2025',
      description: 'Join leading cardiologists from around the world to discuss the latest advances in cardiovascular medicine and research.',
      specialty: 'Cardiology',
      city: 'Dubai',
      country: 'United Arab Emirates',
      date: '2025-06-15',
      time: '09:00',
      organizer_email: 'cardiology@example.com',
      image_url: 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
      link: 'https://example.com/cardiology-summit'
    },
    {
      id: 'dummy-conf-2',
      title: 'Neurology Updates & Case Studies',
      description: 'A comprehensive review of the latest developments in neurology with interactive case discussions.',
      specialty: 'Neurology',
      city: 'Virtual',
      country: 'Online',
      date: '2025-07-01',
      time: '10:00',
      organizer_email: 'neurology@example.com',
      image_url: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
      link: 'https://example.com/neurology-updates'
    },
    {
      id: 'dummy-conf-3',
      title: 'Pediatric Emergency Medicine Conference',
      description: 'Essential updates and hands-on workshops for managing pediatric emergencies.',
      specialty: 'Pediatrics',
      city: 'Boston',
      country: 'United States',
      date: '2025-08-10',
      time: '08:30',
      organizer_email: 'pediatrics@example.com',
      image_url: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg',
      link: 'https://example.com/pediatric-emergency'
    },
    {
      id: 'dummy-conf-4',
      title: 'المؤتمر العربي لطب القلب',
      description: 'مؤتمر شامل يجمع أطباء القلب من جميع أنحاء العالم العربي لمناقشة أحدث التطورات.',
      specialty: 'Cardiology',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      date: '2025-09-05',
      time: '09:00',
      organizer_email: 'arabcardiology@example.com',
      image_url: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
      link: 'https://example.com/arab-cardiology'
    },
    {
      id: 'dummy-conf-5',
      title: 'Future of Medical AI Symposium',
      description: 'Exploring the intersection of artificial intelligence and healthcare with demonstrations of cutting-edge technologies.',
      specialty: 'Medical Technology',
      city: 'San Francisco',
      country: 'United States',
      date: '2025-10-20',
      time: '09:30',
      organizer_email: 'medicalai@example.com',
      image_url: 'https://images.pexels.com/photos/8438923/pexels-photo-8438923.jpeg',
      link: 'https://example.com/medical-ai-symposium'
    },
    {
      id: 'dummy-conf-6',
      title: '国际外科学术会议',
      description: '汇集世界各地的外科专家，讨论最新的手术技术和研究成果。',
      specialty: 'Surgery',
      city: '上海',
      country: '中国',
      date: '2025-11-15',
      time: '08:00',
      organizer_email: 'surgery@example.com',
      image_url: 'https://images.pexels.com/photos/305566/pexels-photo-305566.jpeg',
      link: 'https://example.com/surgery-conference'
    }
  ];

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
      
      if (data && data.length > 0) {
        setConferences(data);
      } else {
        // Use dummy data if no real data exists
        setConferences(dummyConferences);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
      // Fallback to dummy data
      setConferences(dummyConferences);
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