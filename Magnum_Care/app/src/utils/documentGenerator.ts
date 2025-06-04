import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { format } from 'date-fns';

/**
 * Generate PDF from HTML content and store it locally
 * @param {string} htmlContent HTML string for PDF content
 * @param {string} fileName Name of the file to save (without extension)
 * @returns {Promise<{success: boolean, localUri?: string}>} Result of the operation with local file URI
 */
export const generatePdfFromHtml = async (htmlContent: string, fileName: string) => {
  try {
    // Add base64 image handling options to ensure images render correctly
    const options = {
      html: htmlContent,
      base64: false,
      // This helps with image rendering
      width: 612, // Standard US Letter width in points (8.5 x 72)
      height: 792, // Standard US Letter height in points (11 x 72)
    };

    console.log('Generating PDF...');
    
    // Generate PDF using expo-print
    const { uri } = await Print.printToFileAsync(options);
    console.log('PDF generated at temporary location:', uri);
    
    // Store the PDF locally
    const localUri = Platform.OS === 'web' 
      ? uri // For web, the uri is already a blob URL
      : `${FileSystem.documentDirectory}${fileName}.pdf`; // For mobile, save to app's document directory
    
    if (Platform.OS !== 'web') {
      // For mobile platforms, copy the file to app's document directory
      console.log('Copying PDF from temp to document directory...');
      await FileSystem.copyAsync({
        from: uri,
        to: localUri
      });
      
      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      console.log('File info after copy:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('Failed to save PDF to document directory');
      }
    }

    console.log('PDF stored locally at:', localUri);
    
    // Handle file sharing/download based on platform
    if (Platform.OS === 'web') {
      await saveWebFile(uri, `${fileName}.pdf`);
    } else {
      await shareMobileFile(uri, `${fileName}.pdf`);
    }
    
    return {
      success: true,
      localUri: localUri
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF document. Please try again.');
    return {
      success: false
    };
  }
};

// Helper functions

const saveWebFile = async (uri: string, fileName: string) => {
  try {
    // For web, we need to download the file
    // Fetch the file and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    Alert.alert('Success', `File downloaded as ${fileName}`);
  } catch (error) {
    console.error('Error saving file on web:', error);
    Alert.alert('Error', 'Failed to download file');
  }
};

const shareMobileFile = async (uri: string, filename: string) => {
  try {
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      Alert.alert('Error', 'Sharing is not available on this device');
      return;
    }

    // Share the file
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save or Share Document',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    Alert.alert('Error', 'Failed to share file');
  }
};

const documentGenerator = {
  generatePdfFromHtml,
  saveWebFile,
  shareMobileFile
};

export default documentGenerator; 