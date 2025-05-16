import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Building, DollarSign, Search, Filter, Plus, ExternalLink, BookmarkPlus, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  specialty: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: string;
  contact_email: string;
  posted_by: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    organization?: {
      name: string;
      type: string;
    };
  };
}

const JobsZonePage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profile:profiles(
            full_name,
            organization:organizations(name, type)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || job.type === selectedType;
    const matchesSpecialty = selectedSpecialty === '' || job.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === '' || job.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesSpecialty && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Jobs</h1>
            <p className="mt-2 text-gray-600">Find and post medical career opportunities</p>
          </div>
          <Link
            to="/jobs/post"
            className="flex items-center space-x-2 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
          >
            <Plus size={20} />
            <span>Post Job</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="fellowship">Fellowship</option>
              <option value="volunteer">Volunteer</option>
            </select>
            
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="surgery">Surgery</option>
              <option value="internal-medicine">Internal Medicine</option>
            </select>
            
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="New York">New York</option>
              <option value="London">London</option>
              <option value="Dubai">Dubai</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Building size={16} className="mr-1" />
                        <span>{job.profile?.organization?.name || 'Medical Organization'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-1" />
                        <span className="capitalize">{job.type.replace('-', ' ')}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center">
                          <DollarSign size={16} className="mr-1" />
                          <span>
                            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <BookmarkPlus size={20} />
                    </button>
                    <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <p className="mb-4 text-gray-600 line-clamp-3">{job.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-600">
                      {job.specialty}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="flex items-center space-x-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                      <span>View Details</span>
                    </Link>
                    <button className="rounded-md bg-primary-500 px-6 py-2 text-sm font-medium text-white hover:bg-primary-600">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsZonePage;