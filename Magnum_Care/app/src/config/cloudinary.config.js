import Constants from 'expo-constants';

const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dtcwwgcsp',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'magnum_crm_preset',
  folder: process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER || 'hma'  
};

console.log('Cloudinary config loaded:', cloudinaryConfig);

export default cloudinaryConfig; 