import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AreaHeadList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const statusOptions = ['All', 'New', 'Assigned', 'Pending', 'Over'];
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const params = useLocalSearchParams();
  const username = params.username as string;
  const password = params.password as string;
  const areahd = params.areahd as string;
  
  const [ticketData, setTicketData] = useState<any[]>([]);
  
  useEffect(() => {
    // Initialize with data passed from login
    let initialData: any[] = [];
    try {
      if (params.data) {
        initialData = JSON.parse(params.data as string);
        setTicketData(initialData);
      } else {
        // If no data was passed, fetch it
        fetchData();
      }
    } catch (error) {
      console.error("Error parsing initial data:", error);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (!username || !password || !areahd) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('areahd', areahd);
      
      const response = await fetch('https://hma.magnum.org.in/appManagers.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      if (data?.status === 'success') {
        setTicketData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredData = statusFilter === 'All' 
    ? ticketData 
    : ticketData.filter(item => item.S_jobstatus === statusFilter);

  if (isLoading && ticketData.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (!ticketData || ticketData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No data found.</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchData}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Data List</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>{statusFilter}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  statusFilter === option && styles.selectedOption
                ]}
                onPress={() => {
                  setStatusFilter(option);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredData.length} of {ticketData.length} tickets
        </Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, idx) => item.S_SERVNO + idx}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.serviceNo}>{item.S_SERVNO}</Text>
              <View style={[styles.statusBadge, getStatusStyle(item.S_jobstatus)]}>
                <Text style={styles.statusText}>{item.S_jobstatus}</Text>
              </View>
            </View>

            {item.S_TASK_TYPE && (
              <>
                <Text style={styles.label}>Task Type:</Text>
                <Text style={styles.value}>{item.S_TASK_TYPE}</Text>
              </>
            )}

            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{item.S_SERVDT}</Text>
            
            <Text style={styles.label}>System:</Text>
            <Text style={styles.value} numberOfLines={2}>{item.SYSTEM_NAME}</Text>
            
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>{item.COMP_NAME}</Text>
            
            {item.COMP_ADD1 && (
              <>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{item.COMP_ADD1}</Text>
              </>
            )}
            
            {item.S_REMARK1 && (
              <>
                <Text style={styles.label}>Remarks:</Text>
                <Text style={styles.value}>{item.S_REMARK1}</Text>
              </>
            )}
            
            <View style={styles.assignmentSection}>
              <Text style={styles.sectionTitle}>Assignment Details</Text>
              <Text style={styles.label}>Assigned To:</Text>
              <Text style={styles.value}>{item.S_assignedengg || 'Not assigned'}</Text>
              
              {item.S_assigndate && (
                <>
                  <Text style={styles.label}>Assigned Date:</Text>
                  <Text style={styles.value}>{item.S_assigndate}</Text>
                </>
              )}
              
              {item.S_call_assigneddate && (
                <>
                  <Text style={styles.label}>Call Assigned Date:</Text>
                  <Text style={styles.value}>{item.S_call_assigneddate}</Text>
                </>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007bff"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const getStatusStyle = (status: string) => {
  switch(status) {
    case 'New':
      return styles.statusNew;
    case 'Assigned':
      return styles.statusAssigned;
    case 'Pending':
      return styles.statusPending;
    default:
      return styles.statusDefault;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff' 
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  serviceNo: { fontWeight: 'bold', fontSize: 15, color: '#007bff' },
  label: { fontWeight: 'bold', color: '#333', marginTop: 4 },
  value: { marginBottom: 6, color: '#444' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 18 },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 20,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#e6f2ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusNew: {
    backgroundColor: '#28a745',
  },
  statusAssigned: {
    backgroundColor: '#007bff',
  },
  statusPending: {
    backgroundColor: '#ffc107',
  },
  statusDefault: {
    backgroundColor: '#6c757d',
  },
  statsContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  assignmentSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
});
