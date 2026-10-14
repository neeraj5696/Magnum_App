import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Image } from 'react-native';

let cachedHeaderImageDataUri: string | undefined;

const toDataUri = async (uri: string): Promise<string | undefined> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64 ? `data:image/png;base64,${base64}` : undefined;
  } catch (error) {
    console.log('Could not read image as base64 from URI:', uri, error);
    return undefined;
  }
};

export const getHeaderImageDataUri = async (): Promise<string | undefined> => {
  if (cachedHeaderImageDataUri) {
    console.log('Using cached header image');
    return cachedHeaderImageDataUri;
  }

  try {
    console.log('Loading header image...');

    const imageModule = require('../../../assets/images/magnum_header.png');
    const assetSource = Image.resolveAssetSource(imageModule);

    const nativeDataUri = assetSource?.uri ? await toDataUri(assetSource.uri) : undefined;
    if (nativeDataUri) {
      cachedHeaderImageDataUri = nativeDataUri;
      console.log('Header image resolved as data URI from native asset source');
      return cachedHeaderImageDataUri;
    }

    const asset = Asset.fromModule(imageModule);
    await asset.downloadAsync();

    if (asset.localUri) {
      const assetDataUri = await toDataUri(asset.localUri);
      if (assetDataUri) {
        cachedHeaderImageDataUri = assetDataUri;
        console.log('Header image loaded via Asset API');
        return cachedHeaderImageDataUri;
      }
    }
  } catch (e) {
    console.error('Error in getHeaderImageDataUri:', e);
  }

  try {
    const bundledImage = require('../../../scripts/headerImageDataUri.js');
    if (bundledImage) {
      cachedHeaderImageDataUri = bundledImage;
      console.log('Using bundled header data uri fallback');
      return cachedHeaderImageDataUri;
    }
  } catch (bundleError) {
    console.warn('Bundled header image fallback unavailable:', bundleError);
  }

  console.warn('All methods failed, returning undefined');
  return undefined;
};

export default getHeaderImageDataUri;

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


