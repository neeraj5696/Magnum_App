import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import uploadPDFToCloudinary from '../utils/cloudinaryUpload';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

interface PDFUploadScreenProps {
  route: {
    params: {
      pdfUri: string;
      fileName: string;
    };
  };
  navigation: any;
}

const PDFUploadScreen: React.FC<PDFUploadScreenProps> = ({ route, navigation }) => {
  const { pdfUri, fileName } = route.params;
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      const result = await uploadPDFToCloudinary(pdfUri) as CloudinaryResponse;
      setCloudinaryUrl(result.secure_url);
      Alert.alert(
        'Success',
        'PDF uploaded successfully to Cloudinary!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload PDF to Cloudinary. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PDF Upload</Text>
        <Text style={styles.fileName}>File: {fileName}</Text>

        {/* PDF Preview */}
        <View style={styles.previewContainer}>
          <WebView
            source={{ uri: pdfUri }}
            style={styles.pdfPreview}
            originWhitelist={['*']}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload to Cloudinary</Text>
          )}
        </TouchableOpacity>

        {/* Cloudinary URL Display */}
        {cloudinaryUrl && (
          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>Cloudinary URL:</Text>
            <Text style={styles.urlText} numberOfLines={2}>
              {cloudinaryUrl}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fileName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  previewContainer: {
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pdfPreview: {
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#999',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  urlLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  urlText: {
    fontSize: 14,
    color: '#007AFF',
  },
});

export default PDFUploadScreen; 