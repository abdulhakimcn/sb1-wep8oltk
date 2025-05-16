import React, { useState } from 'react';
import { BookOpen, Clock, Star, Brain, Download, Share2, Volume2, Globe, Check, Clipboard } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
  journal_impact_factor?: number;
  citation_count?: number;
  open_access?: boolean;
}

interface ResearchCardProps {
  paper: Research;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onSummary: (id: string) => void;
  isSummarizing: boolean;
  summaryId: string | null;
  compact?: boolean;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ 
  paper, 
  onSave, 
  onUnsave, 
  onSummary, 
  isSummarizing, 
  summaryId,
  compact = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyAbstract = () => {
    navigator.clipboard.writeText(paper.abstract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get journal logo (simulated)
  const getJournalLogo = (journal: string) => {
    const journals: Record<string, string> = {
      'Nature': 'https://media.springernature.com/full/nature-cms/uploads/product/nature/header-86f1263ea01eccd46b530284be10585e.svg',
      'Science': 'https://www.science.org/pb-assets/images/logos/science-logo-1x-1654800464937.png',
      'NEJM': 'https://cdn.nejm.org/img/nejm-logo-social.png',
      'The Lancet': 'https://www.thelancet.com/pb-assets/Lancet/marketing/unicorn/logos/lancet-logo-1x.png',
      'JAMA': 'https://jamanetwork.com/images/logos/jama-logo.svg'
    };
    
    // Default to a generic medical journal icon
    return journals[journal] || 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=100';
  };
  
  // Determine if the paper has an AI summary
  const hasAiSummary = paper.ai_summary || (summaryId === paper.id && isSummarizing);
  
  if (compact) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex items-start space-x-3">
          <img 
            src={getJournalLogo(paper.journal)}
            alt={paper.journal}
            className="w-10 h-10 object-contain rounded-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{paper.title}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <BookOpen size={12} className="mr-1" />
              <span className="truncate">{paper.journal}</span>
              <span className="mx-1">•</span>
              <Clock size={12} className="mr-1" />
              <span>{format(new Date(paper.publication_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center mt-2 space-x-2">
              <button
                onClick={() => paper.is_saved ? onUnsave(paper.id) : onSave(paper.id)}
                className="text-xs text-gray-500 hover:text-blue-600"
              >
                <Star size={14} fill={paper.is_saved ? 'currentColor' : 'none'} className={paper.is_saved ? 'text-yellow-500' : ''} />
              </button>
              <button
                onClick={() => onSummary(paper.id)}
                className={`text-xs ${hasAiSummary ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                <Brain size={14} />
              </button>
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-blue-600"
              >
                <Download size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img 
              src={getJournalLogo(paper.journal)}
              alt={paper.journal}
              className="w-8 h-8 object-contain rounded-md mr-3"
            />
            <h3 className="text-xl font-semibold text-gray-900">{paper.title}</h3>
          </div>
          <button
            onClick={() => paper.is_saved ? onUnsave(paper.id) : onSave(paper.id)}
            className={`rounded-full p-2 ${
              paper.is_saved 
                ? 'text-yellow-500 bg-yellow-50' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={paper.is_saved ? 'Unsave' : 'Save'}
          >
            <Star size={20} fill={paper.is_saved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <BookOpen size={16} className="mr-1" />
            <span>{paper.journal}</span>
            {paper.journal_impact_factor && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                IF: {paper.journal_impact_factor.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{format(new Date(paper.publication_date), 'MMM d, yyyy')}</span>
          </div>
          {paper.open_access && (
            <div className="flex items-center">
              <Globe size={16} className="mr-1" />
              <span className="text-green-600">Open Access</span>
            </div>
          )}
          {paper.citation_count && (
            <div className="flex items-center">
              <BookOpen size={16} className="mr-1" />
              <span>{paper.citation_count} citations</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <p className="text-gray-600 line-clamp-3">{paper.abstract}</p>
        <button 
          onClick={handleCopyAbstract}
          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
          title="Copy abstract"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} />}
        </button>
      </div>

      {/* Authors */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Authors:</h4>
        <div className="flex flex-wrap gap-2">
          {paper.authors.map((author, index) => (
            <span 
              key={index} 
              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
            >
              {author}
            </span>
          ))}
        </div>
      </div>

      {summaryId === paper.id && isSummarizing && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center">
            <Brain size={18} className="mr-2 text-blue-500" />
            <span className="font-medium text-blue-700">Generating AI Summary...</span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-1 bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {summaryId === paper.id && !isSummarizing && paper.ai_summary && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center">
            <Brain size={16} className="mr-2 text-blue-500" />
            <span className="font-medium text-blue-700">AI Summary</span>
          </div>
          <p className="text-sm text-gray-700">{paper.ai_summary}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSummary(paper.id)}
            className={`flex items-center space-x-1 rounded-md ${
              hasAiSummary ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } px-3 py-1.5 text-sm`}
          >
            <Brain size={16} />
            <span>{isSummarizing && summaryId === paper.id ? 'Summarizing...' : 'AI Summary'}</span>
          </button>
          <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
            <Volume2 size={16} />
            <span>Listen</span>
          </button>
          <button className="flex items-center space-x-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
        <a
          href={`https://doi.org/${paper.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          <Download size={16} />
          <span>View Full Paper</span>
        </a>
      </div>
    </motion.div>
  );
};

export default ResearchCard;