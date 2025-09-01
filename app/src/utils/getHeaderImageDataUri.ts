import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

let cachedHeaderImageDataUri: string | undefined;

export const getHeaderImageDataUri = async (): Promise<string | undefined> => {
  if (cachedHeaderImageDataUri) {
    console.log('Using cached header image');
    return cachedHeaderImageDataUri;
  }
  
  try {
    console.log('Loading header image...');
    
    // In production, we need to use the asset's module ID
    const imageModule = require('../../../assets/images/magnum_header.png');
    const asset = Asset.fromModule(imageModule);
    
    console.log('Asset loaded, checking local URI...');
    
    // In production, we need to explicitly download the asset
    if (!asset.localUri) {
      console.log('Downloading asset...');
      await asset.downloadAsync();
    }
    
    if (asset.localUri) {
      console.log('Converting image to base64...');
      
      // For production, we can try both methods
      let base64;
      
      // First try reading the file directly
      try {
        base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (fileError) {
        console.log('FileSystem read failed, trying alternative method...', fileError);
        // Fallback: Use fetch to get the asset
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Remove data URL prefix
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (fetchError) {
          console.error('Failed to load image via fetch:', fetchError);
          return undefined;
        }
      }
      
      if (!base64) {
        console.error('Failed to read image file as base64');
        return undefined;
      }
      
      // Ensure we have the data URL prefix
      const base64String = String(base64);
      cachedHeaderImageDataUri = base64String.startsWith('data:') 
        ? base64String 
        : `data:image/png;base64,${base64String}`;
        
      console.log('Header image loaded successfully');
      return cachedHeaderImageDataUri;
    } else {
      console.error('Failed to get local URI for header image');
    }
  } catch (e) {
    console.error('Error in getHeaderImageDataUri:', e);
  }
  
  console.warn('Returning undefined for header image');
  return undefined;
};

export default getHeaderImageDataUri;


