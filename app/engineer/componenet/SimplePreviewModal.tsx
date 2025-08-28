import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { createComplaintReportTemplate } from '../../src/utils/complaintReportTemplate';
import { getHeaderImageDataUri } from '../../src/utils/getHeaderImageDataUri';

interface SimplePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  formData: any;
}

export default function SimplePreviewModal({ visible, onClose, formData }: SimplePreviewModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && formData) {
      generatePDFPreview();
    }
  }, [visible, formData]);

  const generatePDFPreview = async () => {
    setIsLoading(true);
    try {
      const headerImageDataUri = await getHeaderImageDataUri();
      const html = createComplaintReportTemplate({ ...formData, headerImageDataUri });
      setHtmlContent(html);
    } catch (err) {
      console.error('Error creating PDF preview:', err);
      setHtmlContent('<p>Error generating preview</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setHtmlContent('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PDF Preview</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Generating PDF Preview...</Text>
            </View>
          )}

          {htmlContent && !isLoading && (
            <WebView
              source={{ html: htmlContent }}
              style={styles.webview}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="small" color="#1976D2" />
                  <Text style={styles.webviewLoadingText}>Loading Preview...</Text>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeButtonLarge} onPress={handleClose}>
            <Text style={styles.closeButtonLargeText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  webviewLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  closeButtonLarge: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
