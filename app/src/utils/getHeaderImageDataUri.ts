import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

let cachedHeaderImageDataUri: string | undefined;

export const getHeaderImageDataUri = async (): Promise<string | undefined> => {
  if (cachedHeaderImageDataUri) {
    console.log('Using cached header image');
    return cachedHeaderImageDataUri;
  }
  
  try {
    console.log('Loading header image...');
    
    // Method 1: Use pre-generated base64 (most reliable for production)
    try {
      const HEADER_IMAGE_BASE64 = require('../../../scripts/headerImageBase64.txt');
      if (HEADER_IMAGE_BASE64) {
        cachedHeaderImageDataUri = HEADER_IMAGE_BASE64;
        console.log('Header image loaded from pre-generated base64');
        return cachedHeaderImageDataUri;
      }
    } catch (requireError) {
      console.log('Pre-generated base64 not available, trying Asset API');
    }
    
    // Method 2: Try using Asset API as fallback
    try {
      const imageModule = require('../../../assets/images/magnum_header.png');
      const asset = Asset.fromModule(imageModule);
      
      await asset.downloadAsync();
      
      if (asset.localUri) {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (base64) {
          cachedHeaderImageDataUri = `data:image/png;base64,${base64}`;
          console.log('Header image loaded via Asset API');
          return cachedHeaderImageDataUri;
        }
      }
    } catch (assetError) {
      console.log('Asset API method failed:', assetError);
    }
    
  } catch (e) {
    console.error('Error in getHeaderImageDataUri:', e);
  }
  
  console.warn('All methods failed, returning undefined');
  return undefined;
};

export default getHeaderImageDataUri;

// Helper function to convert image to base64 (for manual conversion if needed)
export const convertImageToBase64 = async (imagePath: string): Promise<string | undefined> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return undefined;
  }
};


