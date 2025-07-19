import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ProfileImageUpload = ({ currentImage, onImageUpload, loading }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setIsCompressing(true);

    try {
      // Compression options
      const options = {
        maxSizeMB: 0.005, // 5KB or less
        maxWidthOrHeight: 300, // Max dimension 300px
        useWebWorker: true,
        fileType: 'image/jpeg', // Convert to JPEG for better compression
        quality: 0.7, // 70% quality
      };

      console.log('Original file size:', (file.size / 1024).toFixed(2), 'KB');
      
      // Compress the image
      const compressedFile = await imageCompression(file, options);
      
      console.log('Compressed file size:', (compressedFile.size / 1024).toFixed(2), 'KB');

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreviewImage(previewUrl);

      // Call the upload function with compressed file
      await onImageUpload(compressedFile);

    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  const displayImage = previewImage || currentImage || "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150";

  return (
    <div className="relative inline-block">
      {/* Profile Image */}
      <img
        src={displayImage}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover mx-auto"
      />
      
      {/* Upload Button */}
      <button
        onClick={handleUploadClick}
        disabled={loading || isCompressing}
        className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Change profile picture"
      >
        {isCompressing || loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>

      {/* Preview Controls */}
      {previewImage && (
        <button
          onClick={clearPreview}
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          title="Remove preview"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Status Text */}
      {isCompressing && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Compressing image...
        </p>
      )}
      {loading && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Uploading...
        </p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
