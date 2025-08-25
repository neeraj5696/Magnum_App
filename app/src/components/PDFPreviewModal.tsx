import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { generatePdfFromHtml } from '../utils/documentGenerator';
import { createComplaintReportTemplate } from '../utils/complaintReportTemplate';

interface PDFPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  formData: any;
}

const { width, height } = Dimensions.get('window');

export default function PDFPreviewModal({ visible, onClose, formData }: PDFPreviewModalProps) {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && formData) {
      generatePDF();
    }
  }, [visible, formData]);

  const generatePDF = async () => {
    if (!formData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create HTML template
      const htmlContent = createComplaintReportTemplate(formData);
      const fileName = `preview_${formData.complaintNo || 'report'}`;
      
      // Generate PDF
      const result = await generatePdfFromHtml(htmlContent, fileName);
      
      if (result.success && result.localUri) {
        setPdfUri(result.localUri);
      } else {
        setError('Failed to generate PDF preview');
      }
    } catch (err) {
      console.error('Error generating PDF preview:', err);
      setError('Error generating PDF preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPdfUri(null);
    setError(null);
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

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#E53935" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={generatePDF}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {pdfUri && !isLoading && !error && (
            <View style={styles.pdfContainer}>
              <WebView
                source={{ uri: pdfUri }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webviewLoading}>
                    <ActivityIndicator size="small" color="#1976D2" />
                    <Text style={styles.webviewLoadingText}>Loading PDF...</Text>
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                  setError('Failed to load PDF preview');
                }}
              />
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pdfContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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
