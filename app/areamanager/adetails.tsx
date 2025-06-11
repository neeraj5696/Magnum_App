import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

type RouteParams = {
  complaintNo: string;
  clientName: string;
  SYSTEM_NAME: string;
  S_assigndate: string;
  location: string;
  S_TASK_TYPE: string;
  status: string;
  S_SERVDT: string;
  S_assignedengg: string;
  S_REMARK1: string;
  S_UPDT: string;
  COMP_ADD2: string;
  COMP_ADD3: string;
  COMP_TEL: string;
  S_REMAKR6: string;
  S_REMARK3: string;
  S_call_assigneddate: string;
  S_call_assigned: string;
  AreaHD: string;
  S_FA_CODE: string;
  username: string;
  password: string;
  role: string;
}

interface Engineer {
  ENG_NAME: string;
}

export default function AreaManagerDetails() {
  const params = useLocalSearchParams() as RouteParams;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<string>('');

  const fetchEngineers = useCallback(async () => {
    try {
      setIsLoading(true);
      const formData = new URLSearchParams();
      formData.append("username", params.username);
      formData.append("password", params.password);

      const response = await fetch(
        "https://hma.magnum.org.in/appEnggname.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      // console.log(data);
      if (data?.status === "success" && data?.data) {
        setEngineers(data.data);
      }
    } catch (error) {
      console.error("Error fetching engineers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.username, params.password]);

  const handleSubmit = useCallback(async () => {
    if (!selectedEngineer) {
      alert("Please select an engineer");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new URLSearchParams();
      
      formData.append("complainno", params.complaintNo);
      formData.append("engineername", selectedEngineer);
      formData.append("assigndate", new Date().toISOString().split('T')[0]);

      const response = await fetch(
        "https://hma.magnum.org.in/appEnggassigned.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      console.log("Submit response:", data);
      
      if (data?.status === "success") {
        alert("Engineer assigned successfully");
        router.back();
      } else {
        alert(data?.status || "Failed to assign engineer");
      }
    } catch (error) {
      console.error("Error submitting engineer:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [params.username, params.password, params.complaintNo, selectedEngineer, router]);

  const toggleEngineer = useCallback((engineer: string) => {
    setSelectedEngineers(prev => 
      prev.includes(engineer)
        ? prev.filter(e => e !== engineer)
        : [...prev, engineer]
    );
  }, []);

  const handleModalClose = useCallback(() => {
    setIsPickerVisible(false);
  }, []);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  const renderEngineerItem = useCallback(({ item }: { item: string }) => (
    <Pressable
      style={styles.engineerItem}
      onPress={() => toggleEngineer(item)}
    >
      <View style={styles.checkbox}>
        {selectedEngineers.includes(item) && (
          <Ionicons name="checkmark" size={20} color="#0066CC" />
        )}
      </View>
      <Text style={styles.engineerName}>{item}</Text>
    </Pressable>
  ), [selectedEngineers, toggleEngineer]);

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
          <Text style={styles.headerTitle}>Complaint Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.complaintNoContainer}>
            <Text style={styles.complaintNo}>Complaint No. - {params.complaintNo}</Text>
          </View>

          <View style={styles.infoSectionBox}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Client Name:</Text>
              <Text style={styles.value}>{params.clientName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Assign Date:</Text>
              <Text style={styles.value}>{params.S_assigndate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Product Name:</Text>
              <Text style={styles.value}>{params.SYSTEM_NAME}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{params.S_TASK_TYPE}</Text>
            </View>

           

            <View style={styles.infoRow}>
              <Text style={styles.label}>Remark:</Text>
              <Text style={styles.value}>{params.S_REMARK1}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{params.location}</Text>
            </View> 
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone No:</Text>
              <Text style={styles.value}>{params.COMP_TEL}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Final Remarks:</Text>
              <Text style={styles.value}>{params.S_REMARK3}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Updated on:</Text>
              <Text style={styles.value}>{params.S_UPDT}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address Line 2:</Text>
              <Text style={styles.value}>{params.COMP_ADD2}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address Line 3:</Text>
              <Text style={styles.value}>{params.COMP_ADD3}</Text>
            </View>

           

            <View style={styles.infoRow}>
              <Text style={styles.label}>Remark 6:</Text>
              <Text style={styles.value}>{params.S_REMAKR6}</Text>
            </View>

            

            <View style={styles.infoRow}>
              <Text style={styles.label}>Assigned Engineer:</Text>
              <Text style={styles.value}>{params.S_assignedengg}</Text>
            </View>

           
          </View>

          <View style={styles.engineerSection}>
           
            {isLoading ? (
              <ActivityIndicator size="small" color="#0066CC" />
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedEngineer}
                  onValueChange={(itemValue) => setSelectedEngineer(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Assign to" value="" />
                  {engineers.map((engineer, index) => (
                    <Picker.Item 
                      key={index} 
                      label={engineer.ENG_NAME} 
                      value={engineer.ENG_NAME} 
                    />
                  ))}
                </Picker>
              </View>
            )}
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </Pressable>
          </View>
        </View>
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
  engineerSection: {
    
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 60,
    width: '100%',
  },
  engineerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0066CC',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  engineerName: {
    fontSize: 16,
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 