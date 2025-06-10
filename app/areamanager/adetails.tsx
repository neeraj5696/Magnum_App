import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function AreaManagerDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
}); 