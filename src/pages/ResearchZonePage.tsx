import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, BookOpen, Filter, Clock, Star, Share2, Download, Volume2, Globe, Brain, Bell, BookmarkPlus, ArrowRight, Bookmark, Sparkles, Beaker, FileText, Microscope, Newspaper, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ResearchCard from '../components/ResearchCard';

interface Research {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  publication_date: string;
  doi: string;
  specialty: string;
  is_saved?: boolean;
  ai_summary?: string;
}

const ResearchZonePage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState<Research[]>([]);
  const [personalizedResearch, setPersonalizedResearch] = useState<Research[]>([]);
  const [trendingResearch, setTrendingResearch] = useState<Research[]>([]);
  const [showAiSummary, setShowAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'personalized' | 'trending' | 'saved'>('all');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState('daily');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [publicationDateRange, setPublicationDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [savedResearch, setSavedResearch] = useState<Research[]>([]);

  // Sample dummy data for research papers
  const dummyResearch: Research[] = [
    {
      id: 'dummy-research-1',
      title: 'Novel Approaches to Heart Failure Management in the Era of Precision Medicine',
      authors: ['Johnson, S.', 'Chen, M.', 'Rodriguez, E.'],
      abstract: 'Heart failure remains a leading cause of morbidity and mortality worldwide. This review explores emerging therapeutic strategies that leverage precision medicine approaches to tailor treatment to individual patient characteristics. We discuss novel biomarkers, genetic factors, and technological innovations that are reshaping the management of heart failure.',
      journal: 'Journal of Cardiology',
      publication_date: '2025-03-15',
      doi: '10.1234/jcard.2025.123456',
      specialty: 'cardiology',
      is_saved: false
    },
    {
      id: 'dummy-research-2',
      title: 'Neuroplasticity Following Traumatic Brain Injury: Mechanisms and Therapeutic Implications',
      authors: ['Smith, R.', 'Williams, J.', 'Garcia, M.'],
      abstract: 'This comprehensive review examines the current understanding of neuroplasticity mechanisms following traumatic brain injury (TBI). We explore cellular and molecular pathways involved in neural repair and regeneration, and discuss emerging therapeutic approaches aimed at enhancing neuroplasticity to improve functional recovery after TBI.',
      journal: 'Neuroscience Reviews',
      publication_date: '2025-02-28',
      doi: '10.1234/neurosci.2025.789012',
      specialty: 'neurology',
      is_saved: false
    },
    {
      id: 'dummy-research-3',
      title: 'Artificial Intelligence in Oncology: Current Applications and Future Directions',
      authors: ['Wilson, R.', 'Brown, T.', 'Lee, J.'],
      abstract: 'This paper reviews the current state of artificial intelligence applications in oncology, from diagnosis and treatment planning to prognosis prediction and drug discovery. We discuss the challenges of implementing AI in clinical practice and outline promising future directions that could transform cancer care.',
      journal: 'Cancer Research',
      publication_date: '2025-04-10',
      doi: '10.1234/cancerres.2025.345678',
      specialty: 'oncology',
      is_saved: false
    },
    {
      id: 'dummy-research-4',
      title: 'Microbiome Modulation as a Therapeutic Strategy in Inflammatory Bowel Disease',
      authors: ['Davis, A.', 'Miller, S.', 'Thompson, K.'],
      abstract: 'The gut microbiome plays a crucial role in the pathogenesis of inflammatory bowel disease (IBD). This review examines current approaches to microbiome modulation in IBD, including dietary interventions, probiotics, prebiotics, and fecal microbiota transplantation. We discuss the evidence supporting these strategies and their potential to improve clinical outcomes.',
      journal: 'Gastroenterology',
      publication_date: '2025-01-20',
      doi: '10.1234/gastro.2025.901234',
      specialty: 'gastroenterology',
      is_saved: false
    },
    {
      id: 'dummy-research-5',
      title: 'Advances in Minimally Invasive Surgical Techniques for Orthopedic Procedures',
      authors: ['Anderson, P.', 'White, L.', 'Martinez, R.'],
      abstract: 'This review highlights recent advances in minimally invasive surgical techniques for common orthopedic procedures. We discuss technological innovations, surgical approaches, and clinical outcomes, with a focus on reduced patient morbidity, faster recovery times, and improved functional results compared to traditional open procedures.',
      journal: 'Journal of Orthopedic Surgery',
      publication_date: '2025-05-05',
      doi: '10.1234/orthosurg.2025.567890',
      specialty: 'orthopedics',
      is_saved: false
    },
    {
      id: 'dummy-research-6',
      title: 'التطورات الحديثة في علاج أمراض القلب الوعائية',
      authors: ['الخالدي، أ.', 'العمري، م.', 'الزهراني، س.'],
      abstract: 'تستعرض هذه الدراسة أحدث التطورات في علاج أمراض القلب الوعائية، مع التركيز على التقنيات الجديدة والعلاجات الدوائية المبتكرة. نناقش الأدلة السريرية الحديثة ونقدم توصيات للممارسة السريرية.',
      journal: 'المجلة العربية لأمراض القلب',
      publication_date: '2025-03-01',
      doi: '10.1234/arabjcard.2025.123456',
      specialty: 'cardiology',
      is_saved: false
    },
    {
      id: 'dummy-research-7',
      title: '儿科急诊中常见疾病的诊断与治疗进展',
      authors: ['李明', '王华', '张伟'],
      abstract: '本文综述了儿科急诊中常见疾病的最新诊断和治疗进展。我们讨论了新的临床指南、诊断技术和治疗方案，为临床医生提供实用的参考。',
      journal: '中华儿科杂志',
      publication_date: '2025-04-15',
      doi: '10.1234/chinped.2025.789012',
      specialty: 'pediatrics',
      is_saved: false
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    fetchResearch();
    fetchTrendingResearch();
  }, [user, selectedSpecialty]);

  useEffect(() => {
    if (user && userProfile?.specialty) {
      fetchPersonalizedResearch(userProfile.specialty);
      fetchSavedResearch();
      checkSubscriptionStatus();
    }
  }, [user, userProfile]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      // If user has a specialty, set it as the default filter
      if (data?.specialty && !selectedSpecialty) {
        setSelectedSpecialty(data.specialty);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchResearch = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      let realResearch: Research[] = [];
      
      try {
        let query = supabase
          .from('research_papers')
          .select('*')
          .order('publication_date', { ascending: false });

        if (selectedSpecialty) {
          query = query.eq('specialty', selectedSpecialty);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          realResearch = data;
        }
      } catch (error) {
        console.error('Error fetching from Supabase, using dummy data:', error);
      }
      
      // If no real data, use dummy data
      if (realResearch.length === 0) {
        // Filter dummy research based on specialty
        let filteredDummyResearch = [...dummyResearch];
        
        if (selectedSpecialty) {
          filteredDummyResearch = filteredDummyResearch.filter(r => r.specialty === selectedSpecialty);
        }
        
        setResearch(filteredDummyResearch);
      } else {
        setResearch(realResearch);
      }
    } catch (error) {
      console.error('Error fetching research:', error);
      // Fallback to dummy data
      setResearch(dummyResearch);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedResearch = async (specialty: string) => {
    try {
      // Try to fetch from Supabase
      let realPersonalizedResearch: Research[] = [];
      
      try {
        const { data, error } = await supabase
          .from('research_papers')
          .select('*')
          .eq('specialty', specialty)
          .order('publication_date', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          realPersonalizedResearch = data;
        }
      } catch (error) {
        console.error('Error fetching personalized research from Supabase:', error);
      }
      
      // If no real data, use filtered dummy data
      if (realPersonalizedResearch.length === 0) {
        const filteredDummyResearch = dummyResearch.filter(r => r.specialty === specialty);
        setPersonalizedResearch(filteredDummyResearch);
      } else {
        setPersonalizedResearch(realPersonalizedResearch);
      }
    } catch (error) {
      console.error('Error fetching personalized research:', error);
      // Fallback to filtered dummy data
      const filteredDummyResearch = dummyResearch.filter(r => r.specialty === specialty);
      setPersonalizedResearch(filteredDummyResearch);
    }
  };

  const fetchTrendingResearch = async () => {
    try {
      // Try to fetch from Supabase
      let realTrendingResearch: Research[] = [];
      
      try {
        // In a real app, this would be based on view counts, saves, etc.
        const { data, error } = await supabase
          .from('research_papers')
          .select('*')
          .order('publication_date', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          realTrendingResearch = data;
        }
      } catch (error) {
        console.error('Error fetching trending research from Supabase:', error);
      }
      
      // If no real data, use dummy data
      if (realTrendingResearch.length === 0) {
        setTrendingResearch(dummyResearch);
      } else {
        setTrendingResearch(realTrendingResearch);
      }
    } catch (error) {
      console.error('Error fetching trending research:', error);
      // Fallback to dummy data
      setTrendingResearch(dummyResearch);
    }
  };

  const fetchSavedResearch = async () => {
    try {
      // In a real implementation, this would fetch from the database
      // For now, we'll use a subset of dummy data
      setSavedResearch(dummyResearch.slice(0, 3).map(r => ({ ...r, is_saved: true })));
    } catch (error) {
      console.error('Error fetching saved research:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      // In a real implementation, this would check the database
      // For now, we'll just set a random value
      setIsSubscribed(Math.random() > 0.5);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleSave = async (researchId: string) => {
    if (!user) return;

    try {
      // Update local state
      setResearch(research.map(r => 
        r.id === researchId ? { ...r, is_saved: true } : r
      ));
      
      setPersonalizedResearch(personalizedResearch.map(r => 
        r.id === researchId ? { ...r, is_saved: true } : r
      ));
      
      setTrendingResearch(trendingResearch.map(r => 
        r.id === researchId ? { ...r, is_saved: true } : r
      ));
      
      // Add to saved research
      const paperToSave = research.find(r => r.id === researchId) || 
                         personalizedResearch.find(r => r.id === researchId) || 
                         trendingResearch.find(r => r.id === researchId);
                         
      if (paperToSave) {
        setSavedResearch([...savedResearch, { ...paperToSave, is_saved: true }]);
      }
      
      // In a real implementation, this would save to the database
    } catch (error) {
      console.error('Error saving research:', error);
    }
  };

  const handleUnsave = async (researchId: string) => {
    if (!user) return;

    try {
      // Update local state
      setResearch(research.map(r => 
        r.id === researchId ? { ...r, is_saved: false } : r
      ));
      
      setPersonalizedResearch(personalizedResearch.map(r => 
        r.id === researchId ? { ...r, is_saved: false } : r
      ));
      
      setTrendingResearch(trendingResearch.map(r => 
        r.id === researchId ? { ...r, is_saved: false } : r
      ));
      
      // Remove from saved research
      setSavedResearch(savedResearch.filter(r => r.id !== researchId));
      
      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error unsaving research:', error);
    }
  };

  const handleAiSummary = async (researchId: string) => {
    setSummarizing(true);
    setShowAiSummary(researchId);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simple summary
      const paper = research.find(r => r.id === researchId) || 
                   personalizedResearch.find(r => r.id === researchId) || 
                   trendingResearch.find(r => r.id === researchId) ||
                   savedResearch.find(r => r.id === researchId);
                   
      if (paper) {
        const summary = `This paper discusses ${paper.title.toLowerCase()}. The authors present important findings related to ${paper.specialty} that could impact clinical practice. Key points include new approaches to diagnosis and treatment.`;
        
        // Update research with summary
        setResearch(research.map(r => 
          r.id === researchId ? { ...r, ai_summary: summary } : r
        ));
        
        setPersonalizedResearch(personalizedResearch.map(r => 
          r.id === researchId ? { ...r, ai_summary: summary } : r
        ));
        
        setTrendingResearch(trendingResearch.map(r => 
          r.id === researchId ? { ...r, ai_summary: summary } : r
        ));
        
        setSavedResearch(savedResearch.map(r => 
          r.id === researchId ? { ...r, ai_summary: summary } : r
        ));
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      // In a real implementation, this would save to the database
      setIsSubscribed(true);
      setShowSubscribeModal(false);
    } catch (error) {
      console.error('Error subscribing to research updates:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    try {
      // In a real implementation, this would update the database
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from research updates:', error);
    }
  };

  const getDisplayResearch = () => {
    switch (activeTab) {
      case 'personalized':
        return personalizedResearch;
      case 'trending':
        return trendingResearch;
      case 'saved':
        return savedResearch;
      default:
        return research;
    }
  };

  const filteredResearch = getDisplayResearch().filter(r => {
    const matchesSearch = searchTerm === '' || 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply publication date filter
    if (publicationDateRange !== 'all') {
      const pubDate = new Date(r.publication_date);
      const now = new Date();
      
      switch (publicationDateRange) {
        case 'last-week':
          const lastWeek = new Date(now);
          lastWeek.setDate(lastWeek.getDate() - 7);
          if (pubDate < lastWeek) return false;
          break;
        case 'last-month':
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          if (pubDate < lastMonth) return false;
          break;
        case 'last-year':
          const lastYear = new Date(now);
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          if (pubDate < lastYear) return false;
          break;
      }
    }
    
    return matchesSearch;
  });

  // Sort the filtered research
  const sortedResearch = [...filteredResearch].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime();
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
        return b.title.localeCompare(a.title);
      case 'journal':
        return a.journal.localeCompare(b.journal);
      default: // newest
        return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
    }
  });

  return (
    <>
      <Helmet>
        <title>ResearchZone - Medical Research | Dr.Zone</title>
        <meta name="description" content="Stay updated with the latest medical research papers and studies. Find, read, and save research relevant to your specialty." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">ResearchZone</h1>
              <p className="text-xl text-blue-100 mb-6">
                Discover the latest medical research tailored to your specialty
              </p>
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for research papers, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border-0 bg-white pl-12 pr-4 py-3 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Subscription Alert */}
          {user && userProfile && !isSubscribed && (
            <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <Bell className="h-6 w-6 text-blue-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Stay updated with your specialty</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Get the latest {userProfile.specialty} research delivered to your inbox daily or weekly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubscribeModal(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Research
              </button>
              {user && userProfile?.specialty && (
                <button
                  onClick={() => setActiveTab('personalized')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'personalized'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <Sparkles size={16} className="mr-2" />
                    My Specialty
                  </span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('trending')}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'trending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <Zap size={16} className="mr-2" />
                  Trending
                </span>
              </button>
              {user && (
                <button
                  onClick={() => {
                    setActiveTab('saved');
                    fetchSavedResearch();
                  }}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'saved'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <Bookmark size={16} className="mr-2" />
                    Saved
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Specialties</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="surgery">Surgery</option>
                  <option value="internal-medicine">Internal Medicine</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="dermatology">Dermatology</option>
                </select>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="zh">中文</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  <Filter size={18} />
                  <span>Advanced Filters</span>
                  <ChevronDown size={16} className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                  <option value="journal">Journal</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                    <select
                      value={publicationDateRange}
                      onChange={(e) => setPublicationDateRange(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All Time</option>
                      <option value="last-week">Last Week</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Journal Type</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All Journals</option>
                      <option value="peer-reviewed">Peer-Reviewed Only</option>
                      <option value="open-access">Open Access Only</option>
                      <option value="high-impact">High Impact Journals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Study Type</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="rct">Randomized Controlled Trials</option>
                      <option value="meta-analysis">Meta-Analyses</option>
                      <option value="systematic-review">Systematic Reviews</option>
                      <option value="cohort">Cohort Studies</option>
                      <option value="case-control">Case-Control Studies</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Research - Only show on All tab */}
          {activeTab === 'all' && trendingResearch.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-500" size={24} />
                Featured Research
              </h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Microscope size={64} className="mx-auto text-white mb-4" />
                      <h3 className="text-xl font-bold text-white">Latest Breakthrough</h3>
                      <p className="text-blue-100 mt-2">Cutting-edge research with significant impact</p>
                    </div>
                  </div>
                  <div className="p-8 md:w-2/3">
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                      {trendingResearch[0].journal} • {format(new Date(trendingResearch[0].publication_date), 'MMM d, yyyy')}
                    </div>
                    <h3 className="mt-1 text-2xl font-semibold leading-tight">
                      {trendingResearch[0].title}
                    </h3>
                    <p className="mt-2 text-gray-600 line-clamp-3">
                      {trendingResearch[0].abstract}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {trendingResearch[0].authors.slice(0, 3).map((author, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {author}
                        </span>
                      ))}
                      {trendingResearch[0].authors.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          +{trendingResearch[0].authors.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => trendingResearch[0].is_saved 
                            ? handleUnsave(trendingResearch[0].id) 
                            : handleSave(trendingResearch[0].id)
                          }
                          className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm ${
                            trendingResearch[0].is_saved
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Star size={16} fill={trendingResearch[0].is_saved ? 'currentColor' : 'none'} />
                          <span>{trendingResearch[0].is_saved ? 'Saved' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => handleAiSummary(trendingResearch[0].id)}
                          className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                        >
                          <Brain size={16} />
                          <span>{summarizing && showAiSummary === trendingResearch[0].id ? 'Summarizing...' : 'AI Summary'}</span>
                        </button>
                      </div>
                      <a
                        href={`https://doi.org/${trendingResearch[0].doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                      >
                        <Download size={16} />
                        <span>Read Full Paper</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Digest - Only show for logged in users with specialty */}
          {user && userProfile?.specialty && activeTab === 'personalized' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <Newspaper className="mr-2 text-blue-500" size={24} />
                  Your {userProfile.specialty} Daily Digest
                </h2>
                {isSubscribed ? (
                  <button
                    onClick={handleUnsubscribe}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Bell size={16} />
                    <span>Unsubscribe from updates</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubscribeModal(true)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Bell size={16} />
                    <span>Subscribe to daily updates</span>
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                The latest research papers in {userProfile.specialty}, updated daily just for you.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar size={16} className="mr-1" />
                  <span>Today's Top Papers • {new Date().toLocaleDateString()}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {personalizedResearch.slice(0, 3).map((paper) => (
                    <div key={paper.id} className="py-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{paper.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {paper.authors.slice(0, 3).join(', ')}
                        {paper.authors.length > 3 ? ` and ${paper.authors.length - 3} more` : ''}
                        • {paper.journal}
                      </p>
                      <p className="text-gray-600 line-clamp-2 mb-2">{paper.abstract}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => paper.is_saved 
                              ? handleUnsave(paper.id) 
                              : handleSave(paper.id)
                            }
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            <Star size={16} fill={paper.is_saved ? 'currentColor' : 'none'} className={paper.is_saved ? 'text-blue-500' : ''} />
                          </button>
                          <button
                            onClick={() => handleAiSummary(paper.id)}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            <Brain size={16} />
                          </button>
                        </div>
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Read Paper
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setActiveTab('all')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All {userProfile.specialty} Papers
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Research List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {activeTab === 'all' && 'All Research Papers'}
              {activeTab === 'personalized' && `${userProfile?.specialty || 'Your Specialty'} Research`}
              {activeTab === 'trending' && 'Trending Research'}
              {activeTab === 'saved' && 'Saved Papers'}
            </h2>
            
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : sortedResearch.length > 0 ? (
              <div className="space-y-6">
                {sortedResearch.map((paper) => (
                  <ResearchCard
                    key={paper.id}
                    paper={paper}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    onSummary={handleAiSummary}
                    isSummarizing={summarizing}
                    summaryId={showAiSummary}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-md">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold">No research found</h3>
                <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
              </div>
            )}
          </div>

          {/* Submit Research CTA */}
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
            <div className="md:flex md:items-center md:justify-between">
              <div className="mb-6 md:mb-0 md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">Have research to share?</h2>
                <p className="text-blue-100">
                  Submit your own research papers, studies, or findings to share with the medical community.
                </p>
              </div>
              <div>
                <Link
                  to="/research/submit"
                  className="inline-block rounded-lg bg-white px-6 py-3 text-center font-medium text-blue-600 shadow hover:bg-blue-50"
                >
                  Submit Research
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Research Updates</h2>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-gray-600">
              Subscribe to receive the latest research papers in {userProfile?.specialty || 'your specialty'} directly to your email.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Frequency</label>
              <select
                value={emailFrequency}
                onChange={(e) => setEmailFrequency(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="monthly">Monthly Digest</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Calendar icon component
const Calendar = ({ size, className }: { size: number, className?: string }) => (
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
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

// X icon component
const X = ({ size, className }: { size: number, className?: string }) => (
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
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default ResearchZonePage;