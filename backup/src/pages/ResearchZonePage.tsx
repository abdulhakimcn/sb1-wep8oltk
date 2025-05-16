import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, Clock, Star, Share2, Download, Volume2, Globe, Brain } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

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
}

const ResearchZonePage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState<Research[]>([]);
  const [showAiSummary, setShowAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    fetchResearch();
  }, [selectedSpecialty]);

  const fetchResearch = async () => {
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

      if (user) {
        // Get user's saved research
        const { data: savedResearch } = await supabase
          .from('saved_research')
          .select('research_id')
          .eq('user_id', user.id);

        const savedIds = new Set(savedResearch?.map(r => r.research_id));

        // Add is_saved flag
        const researchWithSaveStatus = data?.map(r => ({
          ...r,
          is_saved: savedIds.has(r.id)
        }));

        setResearch(researchWithSaveStatus || []);
      } else {
        setResearch(data || []);
      }
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (researchId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_research')
        .insert([{
          user_id: user.id,
          research_id: researchId
        }]);

      if (error) throw error;

      // Update local state
      setResearch(research.map(r => 
        r.id === researchId ? { ...r, is_saved: true } : r
      ));
    } catch (error) {
      console.error('Error saving research:', error);
    }
  };

  const handleAiSummary = async (researchId: string) => {
    setSummarizing(true);
    setShowAiSummary(researchId);

    try {
      // Call AI summary endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-research`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ researchId })
      });

      const data = await response.json();
      
      // Update research with summary
      setResearch(research.map(r => 
        r.id === researchId ? { ...r, ai_summary: data.summary } : r
      ));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSummarizing(false);
    }
  };

  const filteredResearch = research.filter(r => {
    const matchesSearch = searchTerm === '' || 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ResearchZone</h1>
          <p className="mt-2 text-gray-600">Stay updated with the latest medical research</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medical research..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="oncology">Oncology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="surgery">Surgery</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>

        {/* Research List */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredResearch.length > 0 ? (
          <div className="space-y-6">
            {filteredResearch.map((paper) => (
              <div key={paper.id} className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{paper.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-1" />
                      <span>{paper.journal}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{format(new Date(paper.publication_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-gray-600 line-clamp-3">{paper.abstract}</p>

                {showAiSummary === paper.id && paper.ai_summary && (
                  <div className="mb-4 rounded-lg bg-primary-50 p-4">
                    <div className="mb-2 flex items-center">
                      <Brain size={16} className="mr-2 text-primary-500" />
                      <span className="font-medium">AI Summary</span>
                    </div>
                    <p className="text-sm text-gray-700">{paper.ai_summary}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSave(paper.id)}
                      className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm ${
                        paper.is_saved
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star size={16} fill={paper.is_saved ? 'currentColor' : 'none'} />
                      <span>{paper.is_saved ? 'Saved' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => handleAiSummary(paper.id)}
                      className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    >
                      <Brain size={16} />
                      <span>{summarizing && showAiSummary === paper.id ? 'Summarizing...' : 'AI Summary'}</span>
                    </button>
                    <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                      <Volume2 size={16} />
                      <span>Listen</span>
                    </button>
                    <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                      <Globe size={16} />
                      <span>Translate</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 rounded-md bg-primary-500 px-3 py-1.5 text-sm text-white hover:bg-primary-600"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default ResearchZonePage;