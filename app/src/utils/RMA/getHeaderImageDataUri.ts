import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Image } from 'react-native';

let cachedRmaHeaderImageDataUri: string | undefined;

const toDataUri = async (uri: string): Promise<string | undefined> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return base64 ? `data:image/png;base64,${base64}` : undefined;
    } catch (error) {
        console.log('Could not read RMA logo as base64 from URI:', uri, error);
        return undefined;
    }
};

export const getHeaderImageDataUri = async (): Promise<string | undefined> => {
    if (cachedRmaHeaderImageDataUri) {
        console.log('Using cached RMA logo image');
        return cachedRmaHeaderImageDataUri;
    }

    try {
        console.log('Loading RMA logo image...');

        const imageModule = require('../../../../assets/images/magnum_logo.png');
        const assetSource = Image.resolveAssetSource(imageModule);

        const nativeDataUri = assetSource?.uri ? await toDataUri(assetSource.uri) : undefined;
        if (nativeDataUri) {
            cachedRmaHeaderImageDataUri = nativeDataUri;
            console.log('RMA logo resolved as data URI from native asset source');
            return cachedRmaHeaderImageDataUri;
        }

        const asset = Asset.fromModule(imageModule);
        await asset.downloadAsync();

        if (asset.localUri) {
            const assetDataUri = await toDataUri(asset.localUri);
            if (assetDataUri) {
                cachedRmaHeaderImageDataUri = assetDataUri;
                console.log('RMA logo loaded via Asset API');
                return cachedRmaHeaderImageDataUri;
            }
        }
    } catch (e) {
        console.error('Error in getHeaderImageDataUri (RMA):', e);
    }

    try {
        const bundledImage = require('../../../../scripts/rmaHeaderImageDataUri.js');
        if (bundledImage) {
            cachedRmaHeaderImageDataUri = bundledImage;
            console.log('Using bundled RMA logo data uri fallback');
            return cachedRmaHeaderImageDataUri;
        }
    } catch (bundleError) {
        console.warn('Bundled RMA logo fallback unavailable:', bundleError);
    }

    console.warn('All RMA logo methods failed, returning undefined');
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


