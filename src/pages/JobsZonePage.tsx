import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Building, DollarSign, Search, Filter, Plus, ExternalLink, BookmarkPlus, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

// FileText icon component
const FileText = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

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

  // Sample dummy data for jobs
  const dummyJobs: Job[] = [
    {
      id: 'dummy-job-1',
      title: 'Cardiologist - Full Time',
      description: 'We are seeking a board-certified cardiologist to join our growing practice. The ideal candidate will have experience in interventional cardiology and be comfortable with a diverse patient population.',
      location: 'New York, NY',
      specialty: 'cardiology',
      salary: {
        min: 250000,
        max: 350000,
        currency: 'USD'
      },
      type: 'full-time',
      contact_email: 'careers@nychealth.com',
      posted_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'NYC Health',
        organization: {
          name: 'NYC Health',
          type: 'hospital'
        }
      }
    },
    {
      id: 'dummy-job-2',
      title: 'Pediatric Neurologist',
      description: 'Join our pediatric neurology team at Children\'s Medical Center. We are looking for a compassionate physician with experience in treating complex neurological conditions in children.',
      location: 'Boston, MA',
      specialty: 'neurology',
      salary: {
        min: 220000,
        max: 300000,
        currency: 'USD'
      },
      type: 'full-time',
      contact_email: 'hr@childrensmedical.org',
      posted_by: 'user-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'Children\'s Medical Center',
        organization: {
          name: 'Children\'s Medical Center',
          type: 'hospital'
        }
      }
    },
    {
      id: 'dummy-job-3',
      title: 'General Surgeon - Part Time',
      description: 'Part-time general surgeon needed for our outpatient surgical center. Flexible hours and competitive compensation.',
      location: 'Remote',
      specialty: 'surgery',
      salary: {
        min: 150000,
        max: 200000,
        currency: 'USD'
      },
      type: 'part-time',
      contact_email: 'jobs@surgicalcenter.com',
      posted_by: 'user-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'Advanced Surgical Center',
        organization: {
          name: 'Advanced Surgical Center',
          type: 'clinic'
        }
      }
    },
    {
      id: 'dummy-job-4',
      title: 'Oncology Fellowship',
      description: 'Two-year fellowship position in medical oncology with focus on clinical research and patient care.',
      location: 'Houston, TX',
      specialty: 'oncology',
      salary: {
        min: 80000,
        max: 100000,
        currency: 'USD'
      },
      type: 'fellowship',
      contact_email: 'education@cancercenter.org',
      posted_by: 'user-4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'Southwest Cancer Center',
        organization: {
          name: 'Southwest Cancer Center',
          type: 'hospital'
        }
      }
    },
    {
      id: 'dummy-job-5',
      title: 'Volunteer Physician - Medical Mission',
      description: 'Seeking volunteer physicians for a two-week medical mission to provide healthcare services in underserved communities.',
      location: 'International',
      specialty: 'general-practice',
      salary: {
        min: 0,
        max: 0,
        currency: 'USD'
      },
      type: 'volunteer',
      contact_email: 'missions@doctorswithoutborders.org',
      posted_by: 'user-5',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'Doctors Without Borders',
        organization: {
          name: 'Doctors Without Borders',
          type: 'organization'
        }
      }
    },
    {
      id: 'dummy-job-6',
      title: 'Internal Medicine Physician',
      description: 'Join our growing practice as an internal medicine physician. We offer a supportive work environment and competitive benefits.',
      location: 'Chicago, IL',
      specialty: 'internal-medicine',
      salary: {
        min: 200000,
        max: 280000,
        currency: 'USD'
      },
      type: 'full-time',
      contact_email: 'careers@chicagomedical.com',
      posted_by: 'user-6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        full_name: 'Chicago Medical Group',
        organization: {
          name: 'Chicago Medical Group',
          type: 'clinic'
        }
      }
    }
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Try to fetch from Supabase
      let realJobs: Job[] = [];
      
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
        
        if (data && data.length > 0) {
          realJobs = data;
        }
      } catch (error) {
        console.error('Error fetching from Supabase, using dummy data:', error);
      }
      
      // If no real data, use dummy data
      if (realJobs.length === 0) {
        setJobs(dummyJobs);
      } else {
        setJobs(realJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to dummy data
      setJobs(dummyJobs);
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