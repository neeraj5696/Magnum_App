import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { generatePdfFromHtml } from '../src/utils/documentGenerator';
import { createComplaintReportTemplate } from '../src/utils/complaintReportTemplate';
import uploadPDFToCloudinary from '../src/utils/cloudinaryUpload';
import Svg, { Path, G } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { submitComplaintUpdate } from '../src/utils/submitComplaintUpdate';





interface UploadResult {
  secure_url: string;
  // include other properties as needed
}

export default function EnggComplaintDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Helper to safely get string param
  const getParam = (key: keyof typeof params) => {
    const value = params[key];
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  };

  // Debug log
  // console.log('S_SERVDT value:', getParam('S_SERVDT'));

  // Form field states
  const [remark, setRemark] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callAttendedDate, setCallAttendedDate] = useState('');
  const [callAttendedTime, setCallAttendedTime] = useState('');
  const [callCompletedDate, setCallCompletedDate] = useState('');
  const [callCompletedTime, setCallCompletedTime] = useState('');
  const [partReplaced, setPartReplaced] = useState('');
  const [causeProblem, setCauseProblem] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [materialTakenOut, setMaterialTakenOut] = useState('');
  const [customerComment, setCustomerComment] = useState('');
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [paths, setPaths] = useState<Array<string>>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const signatureRef = useRef<any>(null);
  const currentPathRef = useRef('');
  const [padLayout, setPadLayout] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const signatureBgRef = useRef(null);
  const [pendingReasons, setPendingReasons] = useState<string[]>([]);
  const [pendingReason, setPendingReason] = useState('');
  const [showPendingReason, setShowPendingReason] = useState(false);
  const [showPendingReasonModal, setShowPendingReasonModal] = useState(false);
  const [engineerComment, setEngineerComment] = useState('');

  // Initialize state variables from params on mount
  useEffect(() => {
    if (!callAttendedDate) setCallAttendedDate(getParam('S_assigndate'));
    if (!callAttendedTime) setCallAttendedTime(''); // Set from param if available
    if (!callCompletedDate) setCallCompletedDate(new Date().toISOString().slice(0, 10)); // Or from param
    if (!callCompletedTime) setCallCompletedTime(new Date().toISOString().slice(11, 16)); // Or from param
    if (!causeProblem) setCauseProblem(getParam('S_REMARK1'));
  }, []);

  useEffect(() => {
    currentPathRef.current = currentPath;
  }, [currentPath]);

  // Get dimensions for signature pad
  const screenWidth = Dimensions.get('window').width;
  const padWidth = Math.min(screenWidth - 80, 500);
  const padHeight = 200;

  // PanResponder for signature drawing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Save the previous stroke if it exists
        if (currentPathRef.current) {
          setPaths(prevPaths => [...prevPaths, currentPathRef.current]);
          setCurrentPath('');
        }
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M ${locationX} ${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prevPath => `${prevPath} L ${locationX} ${locationY}`);
      },
      onPanResponderRelease: () => {
        // Save the last stroke
        if (currentPathRef.current) {
          setPaths(prevPaths => [...prevPaths, currentPathRef.current]);
          setCurrentPath('');
        }
      },
    })
  ).current;

  // Clear signature
  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    setCustomerSignature(null);
  };

  // Save signature
  const saveSignature = async () => {
    if (paths.length > 0 || currentPath) {
      try {
        if (signatureRef.current) {
          const options = {
            format: 'jpg',
            quality: 0.9,
            result: 'data-uri'
          };
          const capturedSignature = await signatureRef.current.capture(options);
          //  console.log('Signature captured:', capturedSignature.substring(0, 60));
          setCustomerSignature(capturedSignature);
          setShowSignaturePad(false);
          //  console.log('customerSignature after save:', capturedSignature.substring(0, 60));
        } else {
          Alert.alert('Error', 'Failed to capture signature');
        }
      } catch (error) {
        console.error('Error capturing signature:', error);
        Alert.alert('Error', 'Failed to capture signature');
      }
    } else {
      Alert.alert('Error', 'Please provide a signature');
    }
  };

  // Open signature pad
  const openSignaturePad = () => {
    // Reset paths when opening the signature pad if there's no existing signature
    if (!customerSignature) {
      setPaths([]);
      setCurrentPath('');
    }
    setShowSignaturePad(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setHasSubmitAttempt(true);



    if (!customerSignature) {
      Alert.alert('Error', 'Please provide customer signature');
      return;
    }
    if (!workStatus) {
      Alert.alert('Error', 'Please select a work status');
      return;
    }
    if (workStatus === 'Pending' && !pendingReason) {
      Alert.alert('Error', 'Please select a pending reason');
      return;
    }


    setIsSubmitting(true);
    try {
      await handleFinalSubmit();
    } catch (error) {
      console.error('Error in submission:', error);
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final submission with document generation
  const handleFinalSubmit = async () => {
    console.log('🚩 CHECKPOINT 1: Starting form submission process');

    const formData = {
      // Basic complaint information
      complaintNo: getParam('complaintNo'),
      clientName: getParam('clientName'),
      workStatus,
      remark,
      faultReported: getParam('S_SERVDT'),
      typeOfCall: getParam('S_TASK_TYPE'),
      callAttendedDate,
      callAttendedTime,
      callCompletedDate,
      callCompletedTime,
      partReplaced,
      causeProblem,
      diagnosis,
      materialTakenOut,
      customerComment,
      customerSignature,
      systemName: getParam('SYSTEM_NAME'),
      assignDate: getParam('S_assigndate'),
      location: getParam('location'),
      taskType: getParam('S_TASK_TYPE'),
      status: getParam('status'),
      S_SERVDT: getParam('S_SERVDT'),
      S_assignedengg: getParam('S_assignedengg'),
      pendingReason: workStatus === 'Pending' ? pendingReason : '',
      submittedAt: new Date().toISOString(),
      engineerComment,

      debug: {
        workStatus,
        pendingReason,
        hasSignature: !!customerSignature,
        formFields: {
          callAttended: !!callAttendedDate && !!callAttendedTime,
          callCompleted: !!callCompletedDate && !!callCompletedTime,
          hasPartReplaced: !!partReplaced,
          hasCauseProblem: !!causeProblem,
          hasDiagnosis: !!diagnosis,
          hasMaterialTakenOut: !!materialTakenOut,
          hasCustomerComment: !!customerComment
        }
      }
    };

    console.log('🚩 CHECKPOINT 2: Form data prepared, beginning PDF generation');

    // Generate document from form data with the specialized template
    try {
      const htmlContent = createComplaintReportTemplate(formData);
      const fileName = `complaint_${getParam('complaintNo')}_report`;

      console.log('🚩 CHECKPOINT 3: HTML template created, generating PDF');
      const result = await generatePdfFromHtml(htmlContent, fileName);

      console.log('🚩 CHECKPOINT 4: PDF generation result:', result.success ? 'SUCCESS' : 'FAILED');

      // if (result.success && result.localUri) {
      //   try {
      //     console.log('🚩 CHECKPOINT 5: Starting Cloudinary upload');
      //     const uploadResult = await uploadPDFToCloudinary(result.localUri) as UploadResult;
      //     const secureUrl = uploadResult.secure_url;

      //     console.log('🚩 CHECKPOINT 6: Cloudinary upload successful, secure URL obtained');
      //     console.log('Secure URL:', secureUrl.substring(0, 50) + '...');

      //     // Call the submitComplaintUpdate utility
      //     console.log('🚩 CHECKPOINT 7: Starting server API call with form data');
      //     const responseJson = await submitComplaintUpdate({
      //       enggname: getParam('S_assignedengg'),
      //       remark: customerComment,
      //       report: secureUrl,
      //       status: workStatus === 'Completed' ? '1' : '0',
      //       pendingreason: workStatus === 'Completed' ? 'NULL' : pendingReason,
      //       complaintNo: getParam('complaintNo'),
      //     });

      //     console.log('🚩 CHECKPOINT 8: Server response received:', JSON.stringify(responseJson));

      //     if (responseJson.status === 'success') {
      //       console.log('🚩 CHECKPOINT 9: Server update SUCCESSFUL');
      //       Alert.alert('Success', 'Data sent successfully!', [
      //         {
      //           text: 'OK',
      //           onPress: () => {
      //             console.log('🚩 CHECKPOINT 10: Navigating back to list');
      //             router.push({
      //               pathname: '/engineer/list',
      //               params: {
      //                 username: getParam('username'),
      //                 password: getParam('password')
      //               }
      //             });
      //           }
      //         }
      //       ]);
      //     } else {
      //       console.log('🚩 CHECKPOINT 9: Server update FAILED:', responseJson.reason);
      //       Alert.alert('Error', responseJson.reason || 'Failed to send data. Please try again.');
      //     }
      //   } catch (uploadError) {
      //     console.log('🚩 ERROR: Cloudinary upload or server communication failed', uploadError);
      //     console.error('Error uploading to Cloudinary or posting to server:', uploadError);
      //     Alert.alert('Warning', 'PDF generated but failed to upload to Cloudinary or post to server. Please try again later.');
      //   }
      // } else {
      //   console.log('🚩 ERROR: PDF generation failed');
      //   console.error('Failed to generate PDF');
      //   Alert.alert('Error', 'Failed to generate PDF document. Please try again.');
      // }
    } catch (error) {
      console.log('🚩 ERROR: PDF template generation failed', error);
      console.error('Error in PDF generation:', error);
      Alert.alert('Error', 'Failed to process document. Please try again.');
    }
  };

  // Lock orientation to landscape when signature pad opens, unlock when closes
  useEffect(() => {
    if (showSignaturePad) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.unlockAsync();
    }
    // On unmount, unlock orientation
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [showSignaturePad]);

  // Update pad layout on every layout change
  const updatePadLayout = () => {
    if (signatureBgRef.current) {
      (signatureBgRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
        setPadLayout({ x, y, width, height });
      });
    }
  };

  // When modal opens, and on every layout change, update pad layout
  useEffect(() => {
    if (showSignaturePad) {
      setTimeout(updatePadLayout, 100);
    }
  }, [showSignaturePad]);

  // Fetch pending reasons when workStatus is 'Pending'
  const fetchPendingReasons = async () => {

    const formData = new URLSearchParams();
    formData.append('username', getParam('username'));
    formData.append('password', getParam('password'));

    try {
      const res = await fetch('https://hma.magnum.org.in/appPendingstatus.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      const text = await res.text();

      // Remove prefix before parsing
      const jsonStart = text.indexOf('{');
      if (jsonStart === -1) {
        console.log('No JSON found in response');
        return;
      }
      const jsonString = text.slice(jsonStart);
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (e) {
        console.log('Failed to parse JSON:', e);
        return;
      }
      console.log('data', data);
      if (data.status === 'success' && Array.isArray(data.data)) {
        setPendingReasons(data.data.map((item: { PCOMP_STATUS: string }) => item.PCOMP_STATUS));
        setShowPendingReason(true);
        data.data.forEach((item: { PCOMP_STATUS: string }) => {
          //  console.log('Reason:', item.PCOMP_STATUS);
        });
      } else {
        setShowPendingReason(false);
      }
    } catch (error) {
      setShowPendingReason(false);
      console.log('error', error);
    }
  };


  useEffect(() => {

    if (workStatus === 'Pending') {
      fetchPendingReasons();
    } else {
      setShowPendingReason(false);
    }
  }, [workStatus]);


  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar />
      <ScrollView>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Engineer Complaint Details</Text>
          <View style={{ flexDirection: 'row' }}>
            <Pressable style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.complaintNoContainer}>
            <Text style={styles.complaintNo}>Complaint No. - {getParam('complaintNo')}</Text>
          </View>

          <View style={styles.infoSectionBox}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Complaint Name:</Text>
              <Text style={styles.value}>{getParam('clientName')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Assigin Date:</Text>
              <Text style={styles.value}>{getParam('S_assigndate')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>System Name:</Text>
              <Text style={styles.value}>{getParam('SYSTEM_NAME')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Task type:</Text>
              <Text style={styles.value}>{getParam('S_TASK_TYPE')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{getParam('location')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Remark:</Text>
              <Text style={styles.value}>{getParam('S_REMARK1')}</Text>
            </View>
          </View>

          <View style={styles.formSectionBox}>
            <Text style={styles.sectionTitle}>Update Status</Text>

            {/* Fault Reported */}
            <Text style={styles.formLabel}>Fault Reported:</Text>
            <View style={[styles.dateTimeInput, { backgroundColor: '#f0f0f0' }]}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={[styles.dateTimeText, { color: '#666' }]}>
                {getParam('S_SERVDT') || 'Not available'}
              </Text>
            </View>

            {/* Type of Call Dropdown */}
            <Text style={styles.formLabel}>Type of Call:</Text>
            <View style={[styles.dropdownButton, { backgroundColor: '#f0f0f0' }]}>
              <Text style={[styles.dropdownButtonText, { color: '#666' }]}>
                {getParam('S_TASK_TYPE') || 'Not available'}
              </Text>
            </View>

            {/* Call Attended Date and Time */}
            <View style={styles.dateTimeGroup}>
              <Text style={styles.formLabel}>Call Attended On:</Text>
              <View style={[styles.dateTimeInput, { backgroundColor: '#f0f0f0' }]}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={[styles.dateTimeText, { color: '#666' }]}>
                  {getParam('S_assigndate') || 'Not available'}
                </Text>
              </View>
            </View>

            {/* Call Completed Date and Time */}
            <View style={styles.dateTimeGroup}>
              <Text style={styles.formLabel}>Call Completed On:</Text>
              <View style={[styles.dateTimeInput, { backgroundColor: '#f0f0f0' }]}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={[styles.dateTimeText, { color: '#666' }]}>
                  {new Date().toISOString().slice(0, 19).replace('T', ' ')}
                </Text>
              </View>
            </View>


            {/* Cause of Problem */}
            <Text style={styles.formLabel}>Cause of Problem:</Text>
            <View style={[styles.textInput, { backgroundColor: '#f0f0f0', height: 40 }]}>
              <Text style={{ color: '#666' }}>
                {getParam('S_REMARK1') || 'Not available'}
              </Text>
            </View>

            {/* Part Replaced */}
            <Text style={styles.formLabel}>Part Replaced/Stand by (if any):</Text>
            <TextInput
              style={[styles.textInput, { height: 40 }]}
              placeholder="Enter parts replaced..."
              value={partReplaced}
              onChangeText={setPartReplaced}
              multiline={false}
            />

            {/* Diagnosis */}
            <Text style={styles.formLabel}>Diagnosis:</Text>
            <TextInput
              style={[styles.textInput, { height: 40 }]}
              placeholder="Enter diagnosis..."
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline={false}
            />

            {/* Material Taken Out */}
            <Text style={styles.formLabel}>Material Taken Out (if any):</Text>
            <TextInput
              style={[styles.textInput, { height: 40 }]}
              placeholder="Enter materials taken out..."
              value={materialTakenOut}
              onChangeText={setMaterialTakenOut}
              multiline={false}
            />

            {/* Customer Comment */}
            <Text style={styles.formLabel}>Customer Comment:</Text>
            <TextInput
              style={[styles.textInput, { height: 40 }]}
              placeholder="Enter customer's comment here..."
              value={customerComment}
              onChangeText={setCustomerComment}
              multiline={false}
            />

            {/* Engineer Comment */}
            <Text style={styles.formLabel}>Engineer Comment:</Text>
            <TextInput
              style={[styles.textInput, { height: 40 }]}
              placeholder="Enter engineer's comment here..."
              value={engineerComment}
              onChangeText={setEngineerComment}
              multiline={false}
            />

            {/* Customer Signature */}
            <Text style={styles.formLabel}>Customer Signature:</Text>
            <Pressable
              style={styles.signatureBox}
              onPress={openSignaturePad}
            >
              {customerSignature ? (
                <View style={styles.signaturePreviewContainer}>
                  <Image
                    source={{ uri: customerSignature }}
                    style={styles.signaturePreviewImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.signatureText}>Signature Saved ✓</Text>
                </View>
              ) : (
                <Text style={styles.signaturePlaceholder}>Tap to add signature</Text>
              )}
            </Pressable>

            {/* Status Dropdown */}
            <Text style={styles.formLabel}>Status:</Text>
            <Pressable
              style={[
                styles.dropdownButton,
                hasSubmitAttempt && !workStatus ? styles.inputError : null
              ]}
              onPress={() => setShowStatusModal(true)}
            >
              <Text style={styles.dropdownButtonText}>
                {workStatus || 'Select Work Status'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>
            {hasSubmitAttempt && !workStatus && (
              <Text style={styles.errorText}>Please select a work status</Text>
            )}

            <Modal
              visible={showStatusModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowStatusModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Work Status</Text>

                  {['Completed', 'Pending'].map((status) => (
                    <Pressable
                      key={status}
                      style={styles.modalItem}
                      onPress={() => {
                        setWorkStatus(status);
                        setShowStatusModal(false);

                        // If Pending is selected, load the pending reasons
                        if (status === 'Pending') {
                          fetchPendingReasons();
                        }
                      }}
                    >
                      <Text style={styles.modalItemText}>{status}</Text>
                    </Pressable>
                  ))}

                  <Pressable
                    style={styles.modalCloseButton}
                    onPress={() => setShowStatusModal(false)}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {workStatus === 'Pending' && (
              <>
                <Text style={styles.formLabel}>Pending Reason:</Text>
                <Pressable
                  style={[
                    styles.dropdownButton,
                    hasSubmitAttempt && workStatus === 'Pending' && !pendingReason ? styles.inputError : null
                  ]}
                  onPress={() => setShowPendingReasonModal(true)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {pendingReason || 'Select Pending Reason'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </Pressable>
                {hasSubmitAttempt && workStatus === 'Pending' && !pendingReason && (
                  <Text style={styles.errorText}>Please select a pending reason</Text>
                )}

                <Modal
                  visible={showPendingReasonModal}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowPendingReasonModal(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Pending Reason</Text>
                      {pendingReasons.length > 0 ? (
                        pendingReasons.map((reason) => (
                          <Pressable
                            key={reason}
                            style={styles.modalItem}
                            onPress={() => {
                              setPendingReason(reason);
                              setShowPendingReasonModal(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{reason}</Text>
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.modalNoDataText}>Loading pending reasons...</Text>
                      )}
                      <Pressable
                        style={styles.modalCloseButton}
                        onPress={() => setShowPendingReasonModal(false)}
                      >
                        <Text style={styles.modalCloseText}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            <Pressable
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator color="#fff" size="small" style={styles.submitButtonSpinner} />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Signature Pad Modal */}
        <Modal
          visible={showSignaturePad}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSignaturePad(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.signatureModalContent}>
              <ViewShot
                ref={signatureRef}
                style={styles.signaturePad}
                options={{ format: 'jpg', quality: 0.9, result: 'data-uri' }}
              >
                <View ref={signatureBgRef} style={styles.signatureBackground} onLayout={updatePadLayout}>
                  <Svg height={padLayout.height} width={padLayout.width} viewBox={`0 0 ${padLayout.width} ${padLayout.height}`}>
                    <G>
                      {/* Draw all saved paths */}
                      {paths.map((path, index) => (
                        <Path
                          key={`path-${index}`}
                          d={path}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ))}

                      {/* Draw current path */}
                      {currentPath ? (
                        <Path
                          d={currentPath}
                          stroke="black"
                          strokeWidth={2}
                          fill="none"
                        />
                      ) : null}
                    </G>
                  </Svg>
                </View>
              </ViewShot>

              {/* Touch handler overlay for signature pad */}
              <View
                style={[styles.signatureOverlay]}
                {...panResponder.panHandlers}
              />

              <View style={styles.signatureButtonsSmall}>
                <TouchableOpacity
                  style={styles.signatureButtonSmall}
                  onPress={clearSignature}
                >
                  <Text style={styles.signatureButtonTextSmall}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.signatureButtonSmall, styles.signatureButtonPrimarySmall]}
                  onPress={saveSignature}
                >
                  <Text style={[styles.signatureButtonTextSmall, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  complaintNoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  complaintNo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSectionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a73e8',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: '600',
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  formSectionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',

    backgroundColor: '#f9f9f9',
    color: '#333',
    height: 20, // set to whatever height you want
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownButtonText: {
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  submitButtonDisabled: {
    backgroundColor: '#1a73e8aa',
    opacity: 0.8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonSpinner: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    flex: 1,
    marginRight: 8,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginTop: -12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formatModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%',
    maxWidth: 400,
  },
  formatModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  formatOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  formatOptionSelected: {
    backgroundColor: '#e8eaf6',
    borderColor: '#3f51b5',
  },
  formatOptionText: {
    fontSize: 16,
    color: '#333',
  },
  formatOptionTextSelected: {
    fontWeight: 'bold',
    color: '#1a237e',
  },
  formatButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formatCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formatCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },
  formatSubmitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    alignItems: 'center',
  },
  formatSubmitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    height: 80, // fixed height
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  signatureText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  signaturePlaceholder: {
    color: '#666',
    fontSize: 14,
  },
  signatureModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  signaturePad: {
    height: 155,
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 20,
    overflow: 'hidden',
  },
  signatureBackground: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  signatureOverlay: {
    position: 'absolute',
    top: 20 + 20, // modalTitle height + marginVertical
    left: 20,
    right: 20,
    height: 200,
    backgroundColor: 'transparent',
  },
  signatureButtonsSmall: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signatureButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 8,
  },
  signatureButtonPrimarySmall: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  signatureButtonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  signaturePreviewContainer: {
    width: '100%',
    height: 60, // fixed preview height
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  signaturePreviewImage: {
    width: '100%',
    height: 50, // fixed image height
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'column',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerActionButton: {
    padding: 8,
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  picker: {
    flex: 1,
    height: 200,
  },
  pickerCancelText: {
    color: '#666',
    fontSize: 16,
  },
  pickerDoneText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalNoDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 15,
  },
  dateTimeGroup: {
    marginBottom: 16,
  },
  dateTimeInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  timeInput: {
    flex: 0.7,
  },
  dateTimeText: {
    marginLeft: 8,
    color: '#333',
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    height: 300,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timePickerScroll: {
    width: '100%',
  },
  timePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  timePickerItemSelected: {
    backgroundColor: '#e8eaf6',
    borderRadius: 8,
  },
  timePickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  timePickerItemTextSelected: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  ampmContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 10,
    gap: 10,
  },
  ampmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
  },
  ampmButtonSelected: {
    backgroundColor: '#1a73e8',
  },
  ampmButtonText: {
    fontSize: 16,
    color: '#333',
  },
  ampmButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarArrow: {
    padding: 8,
  },
  calendarMonthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  calendarDaySelected: {
    backgroundColor: 'rgba(26, 115, 232, 0.5)',
    borderRadius: 20,

  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 20,
  },
  calendarDayEmpty: {
    width: 40,
    height: 40,
    margin: 2,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
}); 