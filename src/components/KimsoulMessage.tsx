import React, { useState } from 'react';
import { Brain, Clipboard, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import KimsoulLogo from './KimsoulLogo';

interface KimsoulMessageProps {
  content: string;
  isLoading?: boolean;
}

const KimsoulMessage: React.FC<KimsoulMessageProps> = ({ content, isLoading = false }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="max-w-3xl rounded-lg bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center mb-3">
        <motion.div
          animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <KimsoulLogo size={32} />
        </motion.div>
        <div className="ml-2">
          <span className="font-semibold text-indigo-700">Kimsoul</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500">Dr.Zone AI Assistant</span>
            {isLoading && (
              <div className="ml-2 flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <div className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="mt-3 flex justify-between items-center border-t border-gray-100 pt-2">
        <div className="flex space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
            <ThumbsUp size={12} className="mr-1" />
            Helpful
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
            <ThumbsDown size={12} className="mr-1" />
            Not helpful
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
            <Share2 size={12} className="mr-1" />
            Share
          </button>
          <button 
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
          >
            <Clipboard size={12} className="mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="mt-1 text-right">
        <span className="text-[10px] text-gray-400">Powered by Dr.Zone AI – HakeemZone™</span>
      </div>
    </div>
  );
};

export default KimsoulMessage;