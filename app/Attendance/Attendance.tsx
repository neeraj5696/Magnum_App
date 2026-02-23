import { Text, StyleSheet, View, FlatList, TextInput, Platform, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import { add } from 'date-fns';

interface DeviceInfo {
  deviceName: string,
  deviceId: string,
  uniqueId: string,
  systemName: string,
  systemVersion: string,
  brand: string,
  model: string,
}

interface AttendanceRecord {
  ENG_NAME: string;
  EMPCODE: string;
}



function Attendance() {
  const [list, setList] = useState<AttendanceRecord[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({} as DeviceInfo);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<{latitude: number, longitude: number, locationName: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      const androidId = await Application.getAndroidId();
      const info = {
        deviceName: Device.deviceName ?? 'Unknown',
        deviceId: androidId ?? 'Unknown',

        systemName: Device.osName ?? Platform.OS,
        systemVersion: Device.osVersion ?? 'Unknown',
        brand: Device.brand ?? 'Unknown',
        model: Device.modelName ?? 'Unknown',
      };

      setDeviceInfo(info);
      console.log('Device Info:', info);
      console.log('Android ID:', androidId);
    };

    loadDeviceInfo();
  }, []);



  const listofemployee = async () => {
    try {
      setLoadingList(true);
      const listresult = await axios.get(
        'https://hma.magnum.org.in/appEngnameandcode.php'
      );

      const data = listresult.data?.data;
      setList(data || []);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    listofemployee();
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;


      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = address[0]
        ? `${address[0].name ?? ''},${address[0].streetNumber ?? ''},${address[0].district ?? ''},  ${address[0].street ?? ''}, ${address[0].city ?? ''}, ${address[0].region ?? ''}, ${address[0].country ?? ''}, ${address[0].postalCode ?? ''}`.replace(/^, |, $/g, '')
        : `${latitude}, ${longitude}`;

      const data = { latitude, longitude, locationName };
      setLocation(locationName);
      setLocationData(data);

      return data;
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to get location');
      return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocation();
    setRefreshing(false);
  };

  const filteredList = list.filter(item =>
    item.ENG_NAME.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    console.log('⏱️ Submit started');
    
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    if (!locationData) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setLoading(true);
    
    const formData = new URLSearchParams();
    formData.append('EMPCODE', selectedEmployee); 
    formData.append('DeviceName', deviceInfo.deviceName);
    formData.append('deviceId', deviceInfo.deviceId);
    formData.append('OS', deviceInfo.systemName);
    formData.append('systemVersion', deviceInfo.systemVersion);
    formData.append('Brand', deviceInfo.brand);
    formData.append('model', deviceInfo.model);
    formData.append('Aattdatetime', new Date().toISOString());
    formData.append('latitude', locationData.latitude.toString());
    formData.append('longitude', locationData.longitude.toString());
    console.log('⏱️ Form data ready');

    try {
      console.log('⏱️ Sending API request...');
      const startAPI = Date.now();
      const result = await axios.post('https://hma.magnum.org.in/appAttendance.php', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log(`⏱️ API responded in ${Date.now() - startAPI}ms`);
      console.log('✅ Response:', result.data);
      
      Alert.alert('Success', 'Attendance submitted successfully');
      setSelectedEmployee('');
      setSearchQuery('');
    } catch (err) {
      console.log('❌ Error:', err);
      Alert.alert('Error', 'Failed to submit attendance');
    } finally {
      setLoading(false);
      console.log('⏱️ Submit completed');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {location ? (
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>📍 Current Location</Text>
          <Text style={styles.locationText}>{location}</Text>
        </View>
      ) : (
        <View style={[styles.locationCard, styles.locationCardEmpty]}>
          <Text style={styles.locationLabel}>📍 Fetching Location...</Text>
          <Text style={styles.locationTextEmpty}>Please wait</Text>
        </View>
      )}
      {/* 🔹 Collapsible Device Info */}
      <TouchableOpacity
        style={styles.deviceInfoToggle}
        onPress={() => setShowDeviceInfo(!showDeviceInfo)}
      >
        <Text style={styles.toggleText}>Device Info</Text>
        <Text style={styles.toggleIcon}>{showDeviceInfo ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {showDeviceInfo && (
        <View style={styles.card}>

          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{deviceInfo.brand}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Device Name</Text>
            <Text style={styles.value}>{deviceInfo.deviceName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Model</Text>
            <Text style={styles.value}>{deviceInfo.model}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>OS</Text>
            <Text style={styles.value}>{deviceInfo.systemName} {deviceInfo.systemVersion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={styles.value}>{deviceInfo.deviceId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Operating System</Text>
            <Text style={styles.value}>
              {deviceInfo.systemName} {deviceInfo.systemVersion}
            </Text>
          </View>
        </View>
      )}


      {/* 🔹 Employee Section */}


      <TextInput
        placeholder="Search employee name"
        style={styles.input}
        placeholderTextColor="#888"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />



      {loadingList ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No employees found</Text>
        </View>
      ) : (
        filteredList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.listItem, selectedEmployee === item.EMPCODE && styles.selectedItem]}
            onPress={() => {
              setSelectedEmployee(item.EMPCODE);
              setSearchQuery(item.ENG_NAME);
            }}
          >
            <View style={styles.listItemContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.ENG_NAME.charAt(0)}</Text>
              </View>
              <View style={styles.listItemDetails}>
                <Text style={styles.itemName}>{item.ENG_NAME}</Text>
                <Text style={styles.itemCode}>Code: {item.EMPCODE}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        style={[styles.submitButton, (!location || loading) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!location || loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'Submit Attendance'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  scrollContent: {
    padding: 16,
    paddingTop: 50,
  },



  deviceInfoToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },

  toggleIcon: {
    fontSize: 12,
    color: '#2196F3',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },

  label: {
    fontSize: 12,
    color: '#666',
  },

  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
  },

  /* ---------- Section ---------- */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },

  loadingText: {
    color: '#666',
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#999',
    fontSize: 14,
  },

  /* ---------- List ---------- */
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  listItemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },

  itemCode: {
    fontSize: 13,
    color: '#666',
  },

  itemText: {
    fontSize: 16,
    color: '#333',
  },

  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },

  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  locationCardEmpty: {
    borderLeftColor: '#FFA000',
  },

  locationLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  locationText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },

  locationTextEmpty: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },

  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',

  },

  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});


export default Attendance;
