import Constants from 'expo-constants';

const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'magnum',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'engineer',
  folder: process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER || 'uploads'  
};

console.log('Cloudinary config loaded:', cloudinaryConfig);

export default cloudinaryConfig; 