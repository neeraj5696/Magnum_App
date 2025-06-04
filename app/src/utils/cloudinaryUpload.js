import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import cloudinaryConfig from '../config/cloudinary.config';

/**
 * Uploads a PDF file to Cloudinary using unsigned upload
 * @param {string} pdfUri - Local URI of the PDF file
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadPDFToCloudinary = async (pdfUri, folder = cloudinaryConfig.folder) => {
  try {
    console.log('Starting PDF upload with URI:', pdfUri);
    console.log('Cloudinary config:', {
      cloudName: cloudinaryConfig.cloudName,
      uploadPreset: cloudinaryConfig.uploadPreset,
      folder: folder
    });

    // For Expo apps, we need special handling of file URIs
    if (Platform.OS !== 'web') {
      // First check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      console.log('File info before upload:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error(`PDF file not found at path: ${pdfUri}`);
      }

      // Create formData with file blob
      const formData = new FormData();
      
      // In Expo, we need to create a file object
      const fileUriParts = pdfUri.split('/');
      const fileName = fileUriParts[fileUriParts.length - 1];
      console.log('Extracted filename:', fileName);
      
      // Create a Blob object from the file
      formData.append('file', {
        uri: pdfUri,
        type: 'application/pdf',
        name: fileName || 'document.pdf',
      });
      
      // Make sure upload preset is set
      if (!cloudinaryConfig.uploadPreset) {
        throw new Error('Cloudinary upload preset is not configured. Please set it in cloudinary.config.js');
      }
      
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', folder);
      formData.append('resource_type', 'raw');

      console.log('Form data created with upload_preset:', cloudinaryConfig.uploadPreset);
      
      // Upload to Cloudinary using unsigned upload
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`;
      
      console.log('Uploading to url:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      console.log('Cloudinary Upload Result:', result);
      
      return result;
    } 
    else {
      // Web platform handling
      const formData = new FormData();
      formData.append('file', pdfUri);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', folder);
      formData.append('format', 'pdf');
      formData.append('resource_type', 'raw');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Cloudinary Upload Result:', result);
      
      return result;
    }
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw error;
  }
};

export default uploadPDFToCloudinary; 