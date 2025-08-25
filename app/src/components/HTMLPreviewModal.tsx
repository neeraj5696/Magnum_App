import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { createComplaintReportTemplate } from '../utils/complaintReportTemplate';

interface HTMLPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  formData: any;
}

const { width, height } = Dimensions.get('window');

export default function HTMLPreviewModal({ visible, onClose, formData }: HTMLPreviewModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && formData) {
      generateHTML();
    }
  }, [visible, formData]);

  const generateHTML = async () => {
    setIsLoading(true);
    try {
      // Create HTML template
      const html = createComplaintReportTemplate(formData);
      
      // Create a complete HTML document with proper styling
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: #f5f5f5;
              line-height: 1.6;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1976D2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1976D2;
              margin: 0;
              font-size: 24px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h2 {
              color: #333;
              border-left: 4px solid #1976D2;
              padding-left: 15px;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #555;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              padding: 8px 12px;
              background-color: #f8f9fa;
              border-radius: 4px;
              border-left: 3px solid #1976D2;
            }
            .signature-section {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .signature-box {
              border: 2px dashed #ccc;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .preview-note {
              background-color: #e3f2fd;
              border: 1px solid #2196f3;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 20px;
              text-align: center;
              color: #1976d2;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="preview-note">
            📄 This is a preview of the document that will be generated. The actual PDF may look slightly different.
          </div>
          <div class="container">
            ${html}
          </div>
        </body>
        </html>
      `;
      
      setHtmlContent(fullHTML);
    } catch (err) {
      console.error('Error creating HTML template:', err);
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
          <Text style={styles.headerTitle}>Document Preview</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Generating Preview...</Text>
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
