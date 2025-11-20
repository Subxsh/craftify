/**
 * Utility function to get the full URL for product images
 * @param {string|object} imagePath - The relative path, filename, or image object of the image
 * @returns {string} - The full URL to the image
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's an image object, get the URL from it
  if (typeof imagePath === 'object' && imagePath.url) {
    return imagePath.url;
  }

  // If it's already a full URL, return as is
  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // For local uploads, prepend the backend URL
  // Use relative uploads path by default so proxy / same-origin serves images correctly
  const base = (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')) || '';
  const prefix = base ? `${base}/uploads` : '/uploads';
  return `${prefix}/${imagePath}`;
};

export default getImageUrl;