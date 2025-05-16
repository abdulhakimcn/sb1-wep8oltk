import React, { useState, useEffect } from 'react';
import { X, Facebook, Download, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Post } from '../lib/types';
import { useTranslation } from 'react-i18next';

interface SharePostModalProps {
  post: Post;
  onClose: () => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ post, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [postUrl, setPostUrl] = useState('');

  useEffect(() => {
    // Generate the post URL
    const url = `${window.location.origin}/post/${post.id}`;
    setPostUrl(url);
  }, [post.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, 
      '_blank', 
      'width=600,height=400,resizable=yes,scrollbars=yes');
  };

  const handleDownloadAsImage = () => {
    // This would be implemented in Phase 2
    alert('Download as image feature coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share Post</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Preview */}
        <div className="mb-6 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {post.profiles?.username?.substring(0, 2).toUpperCase() || 'DR'}
              </span>
            </div>
            <div>
              <p className="font-medium">{post.profiles?.full_name || 'Doctor'}</p>
              <p className="text-xs text-gray-500">{post.profiles?.specialty}</p>
            </div>
          </div>
          <p className="text-gray-700 line-clamp-3">{post.content}</p>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <button
            onClick={handleShareOnFacebook}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            <Facebook size={20} />
            <span>Share on Facebook</span>
          </button>

          <button
            onClick={handleDownloadAsImage}
            className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
          >
            <Download size={20} />
            <span>Download as Image</span>
          </button>

          <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden">
            <div className="flex-1 px-3 py-2 text-sm text-gray-700 truncate">
              {postUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 border-l border-gray-300"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SharePostModal;