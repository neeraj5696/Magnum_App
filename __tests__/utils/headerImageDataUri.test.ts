jest.mock('expo-file-system', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockRejectedValue(new Error('download failed')),
      localUri: null,
    })),
  },
}));

jest.mock('react-native', () => ({
  Image: {
    resolveAssetSource: jest.fn(() => ({
      uri: 'file:///android_asset/assets/images/magnum_header.png',
    })),
  },
}));

const fs = require('fs');
const path = require('path');

describe('getHeaderImageDataUri', () => {
  it('converts the resolved asset source to a renderable data URI for release builds', async () => {
    const { getHeaderImageDataUri } = require('../../app/src/utils/getHeaderImageDataUri');
    const { readAsStringAsync } = require('expo-file-system');

    readAsStringAsync.mockResolvedValue('mockbase64data');

    const result = await getHeaderImageDataUri();

    expect(result).toBe('data:image/png;base64,mockbase64data');
  });

  it('uses a dedicated RMA logo fallback instead of the generic complaint header', () => {
    const fallbackPath = path.join(__dirname, '../../scripts/rmaHeaderImageDataUri.js');
    const fileContents = fs.readFileSync(fallbackPath, 'utf8');

    expect(fileContents).toContain('module.exports =');
    expect(fileContents).toContain('data:image/png;base64,');
    expect(fileContents).not.toContain('require(\'fs\')');
    expect(fileContents).not.toContain('magnum_header.png');
  });
});
