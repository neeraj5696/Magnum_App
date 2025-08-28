import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

let cachedHeaderImageDataUri: string | undefined;

export const getHeaderImageDataUri = async (): Promise<string | undefined> => {
  if (cachedHeaderImageDataUri) return cachedHeaderImageDataUri;
  try {
    const asset = Asset.fromModule(require('../../../assets/images/magnum_header.png'));
    if (!asset.localUri) {
      await asset.downloadAsync();
    }
    if (asset.localUri) {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      cachedHeaderImageDataUri = `data:image/png;base64,${base64}`;
      return cachedHeaderImageDataUri;
    }
  } catch (e) {
    console.warn('getHeaderImageDataUri: failed to load header image', e);
  }
  return undefined;
};

export default getHeaderImageDataUri;


