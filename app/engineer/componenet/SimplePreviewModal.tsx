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
      // Use the EXACT same template that generates the PDF - 100% clone
      const html = createComplaintReportTemplate(formData);
      
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Complaint Report - ${formData?.complaintNo || 'Preview'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            :root {
              --primary-color: #1a73e8;
              --primary-dark: #0d47a1;
              --secondary-color: #2b88d8;
              --text-primary: #202124;
              --text-secondary: #5f6368;
              --border-color: #dadce0;
              --background-light: #f8f9fa;
              --success-color: #0f9d58;
              --warning-color: #f4b400;
              --error-color: #d93025;
              --info-color: #1a73e8;
              --section-bg: #ffffff;
              --header-gradient: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              color: var(--text-primary);
              margin: 0;
              padding: 0;
              background-color: var(--background-light);
              line-height: 1.6;
            }
            
            .container {
              max-width: 800px;
              margin: 10px auto;
              background-color: var(--section-bg);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              overflow: hidden;
            }
            
            .header {
              background: var(--header-gradient);
              color: white;
              padding: 16px 32px;
              text-align: center;
              position: relative;
              margin: 0;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: 700;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            
            .document-title {
              font-size: 18px;
              margin-top: 8px;
              font-weight: 400;
              opacity: 0.9;
            }
            
            .complaint-number {
              background-color: var(--section-bg);
              padding: 12px 32px;
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              color: var(--primary-color);
              border-bottom: 1px solid var(--border-color);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            
            .section {
              padding: 16px 32px;
              border-bottom: 1px solid var(--border-color);
              background-color: var(--section-bg);
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--primary-color);
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              padding-bottom: 6px;
              border-bottom: 2px solid var(--primary-color);
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 12px;
              padding: 0;
            }
            
            .info-item {
              margin-bottom: 12px;
              display: flex;
              flex-direction: column;
            }
            
            .info-label {
              font-weight: 500;
              color: var(--text-secondary);
              font-size: 13px;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-value {
              font-weight: 400;
              font-size: 14px;
              color: var(--text-primary);
              padding: 8px 12px;
              background-color: var(--background-light);
              border-radius: 6px;
              border-left: 3px solid var(--primary-color);
              margin-left: 0;
            }
            
            .remark-section {
              background-color: var(--background-light);
              padding: 12px 24px;
              border-radius: 8px;
              margin: 12px 0 0 0;
              border: 1px solid var(--border-color);
            }
            
            .remark-text {
              font-style: italic;
              color: var(--text-secondary);
              line-height: 1.6;
              padding: 12px;
              background-color: var(--section-bg);
              border-radius: 6px;
              border-left: 3px solid var(--info-color);
            }
            
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              padding: 16px 32px;
              background-color: var(--background-light);
              margin: 0;
            }
            
            .signature-box {
              background-color: var(--section-bg);
              padding: 12px;
              border-radius: 8px;
              text-align: center;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .signature-label {
              font-size: 14px;
              color: var(--text-secondary);
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .signature-image {
              max-width: 100%;
              max-height: 120px;
              border-bottom: 1px solid var(--border-color);
              margin: 12px auto;
              display: block;
            }
            
            .status-tag {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-completed {
              background-color: #e6f4ea;
              color: var(--success-color);
              border: 1px solid #c6e0c6;
            }
            
            .status-pending {
              background-color: #fff4ce;
              color: var(--warning-color);
              border: 1px solid #ffe7a3;
            }
            
            .footer {
              background-color: var(--background-light);
              padding: 12px 32px;
              text-align: center;
              font-size: 12px;
              color: var(--text-secondary);
              border-top: 1px solid var(--border-color);
              margin: 0;
            }
            
            .customer-comment {
              margin-top: 16px;
              padding: 12px;
              background-color: var(--section-bg);
              border-radius: 8px;
              border-left: 3px solid var(--warning-color);
            }
            
            .comment-heading {
              font-weight: 600;
              color: var(--warning-color);
              margin-bottom: 12px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            @media print {
              body {
                background-color: white;
                margin: 0;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                margin: 0;
                max-width: none;
              }
              
              .section {
                break-inside: avoid;
                page-break-inside: avoid;
                padding: 12px 32px;
              }
              
              .header,
              .complaint-number,
              .section,
              .signatures,
              .footer {
                margin: 0;
                padding: 12px 32px;
              }
              
              .info-grid {
                gap: 8px;
              }
              
              .signature-box {
                box-shadow: none;
                border: 1px solid var(--border-color);
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${html}
          </div>
        </body>
        </html>
      `;
      
      setHtmlContent(fullHTML);
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
