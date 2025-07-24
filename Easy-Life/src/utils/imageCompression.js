import imageCompression from 'browser-image-compression';

/**
 * Compress an image file to under the specified size
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum size in KB (default: 700KB)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, maxSizeKB = 700) => {
  const options = {
    maxSizeMB: maxSizeKB / 1024, // Convert KB to MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  };
  
  try {
    console.log('Original file size:', (file.size / 1024).toFixed(2), 'KB');
    const compressedFile = await imageCompression(file, options);
    console.log('Compressed file size:', (compressedFile.size / 1024).toFixed(2), 'KB');
    
    // If still too large, try with lower quality
    if (compressedFile.size > maxSizeKB * 1024) {
      const secondOptions = {
        ...options,
        initialQuality: 0.6,
        maxSizeMB: (maxSizeKB * 0.8) / 1024, // Target 80% of max size
      };
      
      const secondCompression = await imageCompression(file, secondOptions);
      console.log('Second compression size:', (secondCompression.size / 1024).toFixed(2), 'KB');
      return secondCompression;
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try a different image.');
  }
};

/**
 * Compress multiple image files
 * @param {FileList|File[]} files - Array of image files to compress
 * @param {number} maxSizeKB - Maximum size in KB per file
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export const compressImages = async (files, maxSizeKB = 700) => {
  const fileArray = Array.from(files);
  const compressedFiles = [];
  
  for (const file of fileArray) {
    try {
      const compressedFile = await compressImage(file, maxSizeKB);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // You might want to show a user-friendly error message here
      throw new Error(`Failed to compress ${file.name}. Please try a different image.`);
    }
  }
  
  return compressedFiles;
};

/**
 * Validate image file type and size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum original size in MB (default: 10MB)
 * @returns {boolean} - Whether the file is valid
 */
export const validateImageFile = (file, maxSizeMB = 10) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, or WebP).');
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Image size should be less than ${maxSizeMB}MB.`);
  }
  
  return true;
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Object URL for preview
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke a preview URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeImagePreview = (url) => {
  URL.revokeObjectURL(url);
};