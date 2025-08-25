import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimplePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  formData: any;
}

const { width, height } = Dimensions.get('window');

export default function SimplePreviewModal({ visible, onClose, formData }: SimplePreviewModalProps) {
  const handleClose = () => {
    onClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not specified';
    return timeString;
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
          <View style={styles.previewNote}>
            <Ionicons name="information-circle" size={20} color="#1976D2" />
            <Text style={styles.previewNoteText}>
              This is a preview of the document that will be generated. Review all details before submitting.
            </Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Complaint Number</Text>
              <Text style={styles.value}>{formData?.complaintNo || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Client Name</Text>
              <Text style={styles.value}>{formData?.clientName || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>System Name</Text>
              <Text style={styles.value}>{formData?.systemName || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{formData?.location || 'Not specified'}</Text>
            </View>
          </View>

          {/* Work Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Work Status</Text>
              <Text style={styles.value}>{formData?.workStatus || 'Not specified'}</Text>
            </View>
            {formData?.workStatus === 'Pending' && (
              <View style={styles.field}>
                <Text style={styles.label}>Pending Reason</Text>
                <Text style={styles.value}>{formData?.pendingReason || 'Not specified'}</Text>
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Call Attended Date</Text>
              <Text style={styles.value}>{formatDate(formData?.callAttendedDate)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Call Attended Time</Text>
              <Text style={styles.value}>{formatTime(formData?.callAttendedTime)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Call Completed Date</Text>
              <Text style={styles.value}>{formatDate(formData?.callCompletedDate)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Call Completed Time</Text>
              <Text style={styles.value}>{formatTime(formData?.callCompletedTime)}</Text>
            </View>
          </View>

          {/* Technical Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Details</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Diagnosis</Text>
              <Text style={styles.value}>{formData?.diagnosis || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Cause of Problem</Text>
              <Text style={styles.value}>{formData?.causeProblem || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Part Replaced</Text>
              <Text style={styles.value}>{formData?.partReplaced || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Material Taken Out</Text>
              <Text style={styles.value}>{formData?.materialTakenOut || 'Not specified'}</Text>
            </View>
          </View>

          {/* Comments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Customer Comment</Text>
              <Text style={styles.value}>{formData?.customerComment || 'Not specified'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Engineer Comment</Text>
              <Text style={styles.value}>{formData?.engineerComment || 'Not specified'}</Text>
            </View>
          </View>

          {/* Material Information */}
          {formData?.material && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Material Information</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Required Material</Text>
                <Text style={styles.value}>{formData.material}</Text>
              </View>
            </View>
          )}

          {/* Signature Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signature Status</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Customer Signature</Text>
              <Text style={styles.value}>
                {formData?.customerSignature ? '✓ Signature Captured' : '✗ No Signature'}
              </Text>
            </View>
          </View>
        </ScrollView>

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
    padding: 16,
  },
  previewNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 6,
    padding: 15,
    marginBottom: 20,
  },
  previewNoteText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
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
