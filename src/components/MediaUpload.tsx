import React, { useState, useRef } from 'react';
import { Image, Video, File, X, Upload, Loader, Check } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

interface MediaUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video' | 'file') => void;
  allowedTypes?: ('image' | 'video' | 'file')[];
  maxSize?: number; // in MB
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  onUploadComplete,
  allowedTypes = ['image', 'video', 'file'],
  maxSize = 10 // Default 10MB
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileType, setFileType] = useState<'image' | 'video' | 'file' | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    const typeMap = {
      image: 'image/*',
      video: 'video/*',
      file: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
    };
    
    return allowedTypes.map(type => typeMap[type]).join(',');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Determine file type
    let type: 'image' | 'video' | 'file';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else {
      type = 'file';
    }

    // Check if type is allowed
    if (!allowedTypes.includes(type)) {
      setError(`File type not allowed. Please upload ${allowedTypes.join(', ')}.`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size should be less than ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (type === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    setFileType(type);
    
    // Start upload
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Call the callback with the new URL and type
      onUploadComplete(publicUrl, type);
      setUploadSuccess(true);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setFileType(null);
    setError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'image':
        return <Image size={24} className="text-blue-500" />;
      case 'video':
        return <Video size={24} className="text-red-500" />;
      case 'file':
        return <File size={24} className="text-yellow-500" />;
      default:
        return <Upload size={24} className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getFileTypeIcon()}
          <span className="text-sm font-medium">
            {fileType ? `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Upload` : 'Upload Media'}
          </span>
        </div>
        {(previewUrl || uploading || uploadSuccess) && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {!previewUrl && !uploading && !uploadSuccess ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {allowedTypes.join(', ')} (max {maxSize}MB)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={getAcceptString()}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center">
            {previewUrl && fileType === 'image' ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-md mr-4"
              />
            ) : (
              <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                {getFileTypeIcon()}
              </div>
            )}
            
            <div className="flex-1">
              {uploading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-xs text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : uploadSuccess ? (
                <div className="flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  <span className="text-sm font-medium">Upload complete</span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Ready to upload</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    Change file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptString()}
        className="hidden"
      />
    </div>
  );
};

export default MediaUpload;